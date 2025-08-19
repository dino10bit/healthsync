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
| **Worker Lambda Duration (P90)**| < 15 seconds | AWS CloudWatch |
| **Worker Lambda Error Rate** | < 0.5% | AWS CloudWatch |
| **SQS Message Age (P99, Hot Path)**| < 10 minutes | AWS CloudWatch |
| **Cache Hit Rate (API Gateway Authorizer)** | > 95% | AWS CloudWatch |
| **Cache Hit Rate (ElastiCache User Config)** | > 90% | AWS CloudWatch |

## 3. Architecture for Performance at Scale (1M DAU)

The architecture, as defined in `06-technical-architecture.md`, is explicitly designed to be highly performant and scalable.

### 3.1. Caching Strategy with Amazon ElastiCache

A distributed, in-memory cache using **Amazon ElastiCache for Redis** is a cornerstone of our performance strategy. It serves multiple critical functions to reduce latency and database load.

*   **Configuration Caching:** User-specific sync configurations and settings are cached, dramatically reducing read operations on DynamoDB for every sync job. This lowers latency and cost.
*   **Distributed Locking:** ElastiCache provides a mechanism for distributed locks, preventing race conditions where multiple workers might attempt to process the same sync job for the same user simultaneously. This ensures data integrity without relying on slower database locks.
*   **Rate Limit Enforcement:** The cache acts as a high-speed, centralized counter for our global rate-limiting engine, enabling us to manage third-party API call frequency across tens of thousands of concurrent Lambda executions.

### 3.2. Load Projections & Resource Planning

To ensure the system can handle the load from 1M DAU, we have projected the required capacity based on the definitive NFR of **3,000 RPS**, as defined in the main architecture document.

*   **Total Daily Jobs:** ~90 million jobs per day (real-time and historical).
*   **Peak Throughput:** The system is designed to handle a peak of **3,000 requests per second (RPS)**.
*   **Required Lambda Concurrency:** The concurrency calculation must be based on the **P90 SLO**, not an optimistic average, to ensure the system can meet its performance targets under realistic conditions.
    *   **Calculation:** `3,000 jobs/s * 15s/job (P90 SLO) = 45,000 concurrent Lambda executions`.
    *   **Implication:** This projection of **~45,000 concurrent executions** is a worst-case scenario that the system must be able to withstand. This number has catastrophic implications for cost and technical feasibility, and it dramatically increases the project's risk profile. The feasibility actions below are therefore not recommendations; they are critical, project-blocking prerequisites.

**Mandatory Feasibility Actions:**
The projection of up to 45,000 concurrent executions is a critical threat to the project's viability. To ensure the system is financially viable and operationally stable at this scale, the following actions are **mandatory, blocking prerequisites** before any significant implementation work proceeds:
1.  **Create Detailed Cost Model:** A full cost analysis for **45,000** provisioned concurrency Lambda instances must be completed and approved.
2.  **Conduct Downstream Load Tests:** A proof-of-concept load test must be performed, specifically targeting the validation of downstream dependencies (third-party APIs, ElastiCache, etc.) under the projected parallel load.
3.  **Secure Service Limit Increases:** The AWS account limits for Lambda concurrency and other relevant services must be formally increased.
4.  **Architectural Assessment:** Alternatives that could lower concurrency for the same throughput (e.g., batching jobs in a single Lambda, exploring Fargate) should be assessed for future cost optimization.
5.  **Provisioning:** Based on the results of the above, DynamoDB will be configured in a hybrid capacity model, and Lambda Provisioned Concurrency will be enabled for the worker fleet.

### 3.3. Resilient Historical Syncs with Job Chunking

Syncing years of historical data (User Story **US-10**) is a performance and reliability challenge. A single, long-running process is brittle. As defined in `05-data-sync.md`, we will implement a **job chunking and orchestration strategy**.

1.  **Chunking:** A request for a multi-year sync is broken down into smaller, discrete jobs (e.g., one-month chunks).
2.  **Independent Execution:** Each chunk is processed independently by a **worker Lambda function**. The failure of one chunk does not affect others.
3.  **Performance Benefit:** This approach allows for massive parallelization of historical syncs, significantly reducing the total time to completion for the user. It also isolates failures and prevents a single problematic data point from halting the entire sync.

## 4. Key Optimization Techniques

### 4.1. Client-Side Optimizations
*(Unchanged)*

### 4.2. Backend Optimizations

*   **Compute Performance:**
    *   **Worker Lambdas:** Right-size the memory allocation for the worker functions to balance cost and performance.
    *   **Provisioned Concurrency for Hot Path Workers:** To eliminate cold start latency for the latency-sensitive `WorkerLambda` fleet, **Provisioned Concurrency** will be enabled. Given the KMP/JVM runtime, cold starts can be significant and would jeopardize the performance SLOs. By keeping a pre-warmed pool of Lambda environments ready, this strategy ensures that sync jobs on the "hot path" can be processed instantly, providing a consistent and fast user experience.
    *   **API Layer & Authorizer Caching:** The API layer has been optimized by removing the initial request handler Lambda in favor of direct API Gateway integrations. To further minimize latency, the architecture will leverage **API Gateway's native caching for the Lambda Authorizer**. The generated IAM policy from a successful authorization is cached for a configurable TTL (e.g., 5 minutes), which completely avoids invoking the `AuthorizerLambda` for most requests, significantly reducing both latency and cost.
*   **Database Performance:**
    *   **Smart Key Design:** Use appropriate partition and sort keys in DynamoDB to ensure efficient queries.
    *   **Caching:** Utilize **Amazon ElastiCache for Redis** as the primary caching layer, as described above. This is preferred over DynamoDB Accelerator (DAX) because it provides more flexibility for our varied caching needs (e.g., counters for rate limiting, distributed locks).
    *   **Hot Partition Mitigation:** To handle the "viral user" scenario, the primary strategy will be to isolate the user's data into a dedicated DynamoDB table. This "hot table" approach is preferred over more complex solutions like write-sharding because it avoids significant read-side complexity and provides complete performance isolation.
*   **VPC Networking Optimization:** To improve security and reduce costs, all communication from the `WorkerLambda` functions (which run in a VPC to access ElastiCache) to other AWS services now uses **VPC Endpoints**. This keeps traffic on the private AWS network instead of routing through a NAT Gateway. This not only enhances security but also provides a performance boost by reducing network latency for calls to services like DynamoDB, SQS, and EventBridge.

## 5. Scalability

The SyncWell architecture is designed from the ground up for massive, automatic scalability to support 1M+ DAU. This is achieved through a **unified serverless compute strategy** and a focus on decoupled, elastic components.

*   **Unified Compute for Automatic Scaling:** The core of our backend is built on a unified **AWS Lambda** compute model.
    *   **Lambda** is used for all backend compute, including the API layer (via direct integrations), the authorizer, and the asynchronous worker fleet. This serverless model provides maximum operational simplicity and automatic scaling to handle the projected 3,000 RPS peak load.
    *   The number of concurrent Lambda workers will automatically scale based on the number of messages in the SQS queue, ensuring that throughput matches the incoming job volume.

*   **Resilient Decoupling with SQS:** The use of **Amazon SQS queues** as a buffer between the API layer and the Lambda worker service is a critical component of our scalability and reliability strategy. The queue acts as a shock absorber, smoothing out unpredictable traffic spikes. If 100,000 users all trigger a sync simultaneously, the jobs are safely persisted in the queue. The Lambda service can then scale out its concurrent executions to process this backlog at a sustainable pace without being overwhelmed.

*   **Elastic Database with DynamoDB:** Our primary database is **Amazon DynamoDB**, chosen for its ability to deliver consistent, single-digit millisecond performance at any scale. We will use a **hybrid capacity model** (Provisioned + On-Demand) to balance cost and performance, preventing throttling during peak traffic while remaining cost-efficient.

*   **Scalable Analytics Ingestion:** For backend-generated analytics events, the architecture uses **Amazon Kinesis Data Firehose**. This provides a fully managed, scalable ingestion pipeline that automatically handles buffering, batching, and compression of data. This is far more performant and resilient at scale than sending individual events to an analytics endpoint.

## 6. Visual Diagrams
*   **Caching Architecture:**
    *   The following diagram illustrates the **cache-aside pattern** used by worker Lambdas. Before accessing the primary data store (DynamoDB), the worker first checks the ElastiCache for Redis cluster. This significantly reduces read load on the database and improves latency.

    ```mermaid
    sequenceDiagram
        participant Worker as Worker Lambda
        participant Cache as ElastiCache for Redis
        participant DB as DynamoDB

        Worker->>+Cache: GET config##{userId}
        alt Cache Hit
            Cache-->>-Worker: Return cached config
        else Cache Miss
            Cache-->>-Worker: nil
            Worker->>+DB: Query for user config
            DB-->>-Worker: Return user config
            Worker->>+Cache: SET config##{userId} (with TTL)
            Cache-->>-Worker: OK
        end
        Worker->>Worker: Continue processing with config...
    ```
*   **Job Chunking Flow:**
    *   *A visual representation of how a large historical sync request is broken into multiple jobs that are placed on the SQS queue for processing by the Lambda service. [Placeholder - Diagram to be created]*
