## Dependencies

### Core Dependencies
- `06-technical-architecture.md` - Technical Architecture, Security & Compliance
- `39-performance-metrics.md` - Performance Monitoring & KPIs
- `05-data-sync.md` - Data Synchronization & Reliability

### Strategic / Indirect Dependencies
- `01-context-vision.md` - Context & Vision
- `22-maintenance.md` - Maintenance & Post-Launch Operations (SRE)
- `31-historical-data.md` - Historical Data Handling
- `41-metrics-dashboards.md` - Analytics Dashboard Design

---

# PRD Section 16: Performance, Scalability & Reliability

## 1. Executive Summary

This document defines the performance, scalability, and reliability requirements for the entire SyncWell system, designed to support **1 million Daily Active Users (DAU)**. These are not secondary concerns; they are primary features critical to user trust and retention. This document establishes a proactive strategy for engineering a system that is fast, resilient, and capable of handling massive scale. It details specific architectural choices, performance targets, and optimization techniques that will be implemented.

## 2. Performance & Reliability Budget (SLOs)

### 2.1. Client-Side Performance Budget
*(Unchanged)*

| Metric | Target (P90) | Tool for Measurement |
| :--- | :--- | :--- |
| **Cold App Start Time** | < 2.0 seconds | Firebase Performance |
| **Dashboard Load Time** | < 1.0 second | Firebase Performance |
| **Slow Frames Rate** | < 1% | Firebase Performance |
| **Memory Usage (Heap)** | < 150 MB | Android Studio / Xcode |
| **Energy Impact (24h)** | < 5% | Xcode / Battery Historian|

### 2.2. Backend Performance Budget (SLOs)

| Metric | Target | Tool for Measurement |
| :--- | :--- | :--- |
| **API Gateway Latency (P95)** | < 500 ms | AWS CloudWatch |
| **API Gateway Error Rate (5xx)**| < 0.1% | AWS CloudWatch |
| **Fargate Task Duration (P90)**| < 15 seconds | AWS CloudWatch |
| **Fargate Service Error Rate** | < 0.5% | AWS CloudWatch |
| **SQS Message Age (P99, Hot Path)**| < 10 minutes | AWS CloudWatch |
| **Cache Hit Rate (ElastiCache)** | > 90% | AWS CloudWatch |

## 3. Architecture for Performance at Scale (1M DAU)

The architecture, as defined in `06-technical-architecture.md`, is explicitly designed to be highly performant and scalable using a hybrid compute model.

### 3.1. Caching Strategy with Amazon ElastiCache

A distributed, in-memory cache using **Amazon ElastiCache for Redis** is a cornerstone of our performance strategy. It serves multiple critical functions to reduce latency and database load.

*   **Configuration Caching:** User-specific sync configurations and settings are cached, dramatically reducing read operations on DynamoDB for every sync job. This lowers latency and cost.
*   **Distributed Locking:** ElastiCache provides a mechanism for distributed locks, preventing race conditions where multiple workers might attempt to process the same sync job for the same user simultaneously. This ensures data integrity without relying on slower database locks.
*   **Rate Limit Enforcement:** The cache acts as a high-speed, centralized counter for our global rate-limiting engine, enabling us to manage third-party API call frequency across tens of thousands of concurrent Fargate tasks.

### 3.2. Load Projections & Resource Planning

To ensure the system can handle the load from 1M DAU, we have projected the required capacity based on the definitive NFR of **10,000 RPS**.

*   **Total Daily Jobs:** ~90 million jobs per day (real-time and historical).
*   **Peak Throughput:** The system is designed to handle a peak of **10,000 requests per second (RPS)**.
*   **Required Fargate Concurrency:** Based on the 10,000 RPS target and an average job duration of 5 seconds, the projected peak concurrency is **~50,000 concurrent tasks**.

**Actions:**
1.  The AWS Fargate service for the worker fleet must be configured with an aggressive auto-scaling policy to handle scaling to 50,000 concurrent tasks. The underlying cluster capacity and VPC networking must be provisioned accordingly.
2.  DynamoDB will be configured in a **hybrid capacity model** (Provisioned + On-Demand) to balance cost and elasticity.
3.  API Gateway and SQS scale automatically and require no specific pre-provisioning for this load.

### 3.3. Resilient Historical Syncs with Job Chunking

Syncing years of historical data (User Story **US-10**) is a performance and reliability challenge. A single, long-running process is brittle. As defined in `05-data-sync.md`, we will implement a **job chunking and orchestration strategy**.

1.  **Chunking:** A request for a multi-year sync is broken down into smaller, discrete jobs (e.g., one-month chunks).
2.  **Independent Execution:** Each chunk is processed independently by a worker task running on Fargate. The failure of one chunk does not affect others.
3.  **Performance Benefit:** This approach allows for massive parallelization of historical syncs, significantly reducing the total time to completion for the user. It also isolates failures and prevents a single problematic data point from halting the entire sync.

## 4. Key Optimization Techniques

### 4.1. Client-Side Optimizations
*(Unchanged)*

### 4.2. Backend Optimizations

*   **Compute Performance:**
    *   **Fargate Tasks:** Right-size the CPU and memory allocation for the worker container to balance cost and performance.
    *   **API Layer Lambdas:** For latency-sensitive functions like the initial request handler, use provisioned concurrency to eliminate cold starts.
*   **Database Performance:**
    *   **Smart Key Design:** Use appropriate partition and sort keys in DynamoDB to ensure efficient queries.
    *   **Caching:** Utilize **Amazon ElastiCache for Redis** as the primary caching layer, as described above. This is preferred over DynamoDB Accelerator (DAX) because it provides more flexibility for our varied caching needs (e.g., counters for rate limiting, distributed locks).

## 5. Scalability

The SyncWell architecture is designed from the ground up for massive, automatic scalability to support 1M+ DAU. This is achieved through a **hybrid compute strategy** and a focus on decoupled, elastic components.

*   **Hybrid Compute for Automatic Scaling:** The core of our backend is built on a hybrid of **AWS Fargate** and **AWS Lambda**.
    *   **Fargate** was chosen for the worker fleet because it provides a more cost-effective and performant solution for high-throughput, sustained workloads compared to Lambda at the 10,000 RPS scale. The Fargate service will automatically scale the number of running tasks based on the depth of the SQS queue.
    *   **Lambda** is used for the API layer (request validation, etc.) where its per-request model and fast invocation are ideal for handling intermittent, spiky web traffic.

*   **Resilient Decoupling with SQS:** The use of **Amazon SQS queues** as a buffer between the API layer and the Fargate worker service is a critical component of our scalability and reliability strategy. The queue acts as a shock absorber, smoothing out unpredictable traffic spikes. If 100,000 users all trigger a sync simultaneously, the jobs are safely persisted in the queue. The Fargate service can then scale out its task count to process this backlog at a sustainable pace without being overwhelmed.

*   **Elastic Database with DynamoDB:** Our primary database is **Amazon DynamoDB**, chosen for its ability to deliver consistent, single-digit millisecond performance at any scale. We will use a **hybrid capacity model** (Provisioned + On-Demand) to balance cost and performance, preventing throttling during peak traffic while remaining cost-efficient.

## 6. Visual Diagrams
*   **[Diagram] Caching Architecture:** A diagram showing how Fargate worker tasks interact with ElastiCache for config caching, distributed locking, and rate limiting before accessing DynamoDB or third-party APIs.
*   **[Diagram] Job Chunking Flow:** A visual representation of how a large historical sync request is broken into multiple jobs that are placed on the SQS queue for processing by the Fargate service.
