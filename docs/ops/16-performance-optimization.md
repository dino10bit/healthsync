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

| Metric | Target | Tool for Measurement |
| :--- | :--- | :--- |
| **Cold App Start Time (P90)** | < 2.0 seconds | Firebase Performance |
| **Dashboard Load Time (Online, P90)**| < 1.0 second | Firebase Performance |
| **Dashboard Load Time (Offline, P90)**| < 500 ms | Firebase Performance |
| **Slow Frames Rate** | < 1% | Firebase Performance |
| **Crash-Free Session Rate** | > 99.9% | Firebase Crashlytics |
| **App Binary Size (iOS / Android)**| < 50 MB / < 20 MB | App Store Connect / Google Play Console |
| **Memory Usage (Heap)** | < 150 MB | Android Studio / Xcode |
| **Energy Impact (24h)** | < 5% | Xcode / Battery Historian|

### 2.2. Backend Performance Budget (SLOs)

| Metric | Target | Tool for Measurement |
| :--- | :--- | :--- |
| **API Gateway Latency (P95)** | < 500 ms | AWS CloudWatch |
| **API Gateway Error Rate (5xx)**| < 0.1% | AWS CloudWatch |
| **Fargate Worker CPU Utilization (P90)**| < 80% | AWS CloudWatch |
| **Fargate Worker Memory Utilization (P90)**| < 80% | AWS CloudWatch |
| **SQS Message Age (P99, Hot Path)**| < 10 minutes | AWS CloudWatch |
| **Cache Hit Rate (API Gateway Authorizer)** | > 95% | AWS CloudWatch |
| **Cache Hit Rate (ElastiCache User Config)** | > 90% | AWS CloudWatch |

## 3. Architecture for Performance at Scale (1M DAU)

The architecture, as defined in `06-technical-architecture.md`, is explicitly designed to be highly performant and scalable.

### 3.1. Caching Strategy with Amazon ElastiCache

A distributed, in-memory cache using **Amazon ElastiCache for Redis** is a cornerstone of our performance strategy. It serves multiple critical functions to reduce latency and database load.

*   **Configuration Caching:** User-specific sync configurations and settings are cached, dramatically reducing read operations on DynamoDB for every sync job. This lowers latency and cost.
*   **Rate Limit Enforcement:** The cache acts as a high-speed, centralized counter for our global rate-limiting engine, enabling us to manage third-party API call frequency across the highly concurrent Fargate worker fleet.
*   **Note on Idempotency:** The critical end-to-end idempotency mechanism for the primary "Hot Path" sync is handled by **Amazon SQS FIFO queues** using a `MessageDeduplicationId`. This is the authoritative strategy defined in `../architecture/06-technical-architecture.md` as it is simpler and more cost-effective than an application-level locking mechanism.

### 3.2. Load Projections & Resource Planning

To ensure the system can handle the load from 1M DAU, we have projected the required capacity based on the definitive NFR of **3,000 RPS**, as defined in the main architecture document.

*   **Total Daily Jobs:** ~90 million jobs per day (real-time and historical).
*   **Peak Throughput:** The system is designed to handle a peak of **3,000 requests per second (RPS)**.
*   **Compute Model:** The worker fleet is architected on **AWS Fargate** to provide a cost-effective and scalable foundation for this high-throughput workload.
*   **Resource Planning:**
    *   **Container Sizing:** Each Fargate task will be provisioned with a specific amount of vCPU and memory. Initial estimates will be based on performance testing, but a starting point could be **1 vCPU and 2GB RAM** per task.
    *   **Auto-Scaling:** The Fargate service will be configured to auto-scale based on the `ApproximateNumberOfMessagesVisible` metric in the SQS queue. A target value (e.g., 10 messages per running task) will be set to ensure the fleet scales out proactively to handle incoming load and scales in to reduce costs during idle periods.
    *   **Cost Analysis:** The Fargate model is significantly more cost-effective at sustained scale than a Lambda-per-job model. For example, a single Fargate task running for an hour can process thousands of jobs, whereas a Lambda model would incur a separate invocation cost for each job. This leads to an estimated **90-95% reduction in compute cost** compared to the initial Lambda-based projection.

### 3.3. Post-MVP: Historical Sync Performance

The performance and reliability of the post-MVP "Historical Sync" feature (User Story **US-10**) will require a dedicated architecture. The current design, captured in `45-future-enhancements.md`, specifies a job chunking and orchestration strategy using AWS Step Functions to ensure resilience and performance for long-running backfill operations. This is out of scope for the MVP.

## 4. Key Optimization Techniques

### 4.1. Client-Side Optimizations
*(Unchanged)*

### 4.2. Backend Optimizations

*   **Compute Performance:**
    *   **Fargate Task Sizing:** Continuously monitor the CPU and Memory utilization of the worker tasks and right-size them to balance cost and performance.
    *   **API Layer & Authorizer Caching:** The API layer has been optimized by removing the initial request handler Lambda in favor of direct API Gateway integrations. To further minimize latency, the architecture will leverage **API Gateway's native caching for the Lambda Authorizer**. The generated IAM policy from a successful authorization is cached for a configurable TTL (e.g., 5 minutes), which completely avoids invoking the `AuthorizerLambda` for most requests, significantly reducing both latency and cost.
*   **Database Performance:**
    *   **Smart Key Design:** Use appropriate partition and sort keys in DynamoDB to ensure efficient queries.
    *   **Caching:** Utilize **Amazon ElastiCache for Redis** as the primary caching layer, as described above. This is preferred over DynamoDB Accelerator (DAX) because it provides more flexibility for our varied caching needs (e.g., counters for rate limiting, distributed locks).
    *   **Hot Partition Mitigation:** To handle the "viral user" scenario, the primary strategy will be to isolate the user's data into a dedicated DynamoDB table. This "hot table" approach is preferred over more complex solutions like write-sharding because it avoids significant read-side complexity and provides complete performance isolation.
        *   **[C-021] Trigger:** A user will be automatically migrated to a dedicated "hot table" when their sync frequency consistently exceeds a defined threshold. This will be monitored by a CloudWatch alarm on a custom metric. The threshold is **> 100 sync jobs per hour for a sustained period of 6 hours**.
*   **VPC Networking Optimization:** To improve security and reduce costs, all communication from the `WorkerFargateTask` functions (which run in a VPC to access ElastiCache) to other AWS services now uses **VPC Endpoints**. This keeps traffic on the private AWS network instead of routing through a NAT Gateway. This not only enhances security but also provides a performance boost by reducing network latency for calls to services like DynamoDB, SQS, and EventBridge.

## 5. Scalability

The SyncWell architecture is designed from the ground up for massive, automatic scalability to support 1M+ DAU. This is achieved through a **container-based compute strategy** and a focus on decoupled, elastic components.

*   **Containerized Compute for Automatic Scaling:** The core of our backend worker fleet is built on **AWS Fargate**.
    *   This container-based model provides maximum operational simplicity and automatic scaling to handle the projected 3,000 RPS peak load.
    *   The number of concurrent Fargate tasks will automatically scale based on the number of messages in the SQS queue, ensuring that throughput matches the incoming job volume.

*   **Resilient Decoupling with SQS:** The use of **Amazon SQS queues** as a buffer between the API layer and the Fargate worker service is a critical component of our scalability and reliability strategy. The queue acts as a shock absorber, smoothing out unpredictable traffic spikes. If 100,000 users all trigger a sync simultaneously, the jobs are safely persisted in the queue. The Fargate service can then scale out its concurrent tasks to process this backlog at a sustainable pace without being overwhelmed.

*   **Elastic Database with DynamoDB:** Our primary database is **Amazon DynamoDB**, chosen for its ability to deliver consistent, single-digit millisecond performance at any scale. We will use a **hybrid capacity model** (Provisioned + On-Demand) to balance cost and performance, preventing throttling during peak traffic while remaining cost-efficient.

*   **Scalable Analytics Ingestion:** For backend-generated analytics events, the architecture uses **Amazon Kinesis Data Firehose**. This provides a fully managed, scalable ingestion pipeline that automatically handles buffering, batching, and compression of data. This is far more performant and resilient at scale than sending individual events to an analytics endpoint.

## 6. Visual Diagrams
*   **Caching Architecture:**
    *   The following diagram illustrates the **cache-aside pattern** used by the worker fleet. Before accessing the primary data store (DynamoDB), a worker first checks the ElastiCache for Redis cluster. This significantly reduces read load on the database and improves latency.

    ```mermaid
    sequenceDiagram
        participant Worker as Worker Fargate Task
        participant Cache as ElastiCache for Redis
        participant DB as DynamoDB
    
        Worker->>Cache: GET config#{userId}
        alt Cache hit
            Cache-->>Worker: Return cached config
        else Cache miss
            Cache-->>Worker: nil
            Worker->>DB: Query for user config
            DB-->>Worker: Return user config
            Worker->>Cache: SET config#{userId} (with TTL)
            Cache-->>Worker: OK
        end
    
        Worker->>Worker: Continue processing with config...

    ```
*   **[C-022] Job Chunking Flow:**
    *   The following diagram illustrates the orchestration flow for a large historical sync request, as described in Section 3.3. An AWS Step Function state machine is triggered to break the request (e.g., "sync last 2 years") into smaller, manageable jobs (e.g., one job per month). These individual jobs are then dispatched to the main SQS queue to be processed by the existing worker fleet, ensuring resilience and controlled concurrency for long-running backfills.

    ```mermaid
    graph TD
        subgraph "User Request"
            A[Client App] -->|1. POST /sync/historical| B(API Gateway)
        end

        subgraph "AWS Step Functions: Historical Sync Orchestrator"
            B --> C{Start Execution};
            C --> D[State: Calculate Chunks Lambda];
            D -->|Outputs array of date ranges| E{Map State: For Each Chunk};
            E --> F[State: Dispatch Job to SQS];
            F --> G([SQS Queue for Sync Jobs]);
            E --> H{End Map};
            H --> I{Execution Complete};
        end

        subgraph "Async Worker Fleet (Existing Infrastructure)"
            G -->|Jobs processed in parallel| J(Worker Fargate Tasks);
            J -->|Store historical data| K[(DynamoDB)];
        end

        style C fill:#D5A6BD,stroke:#333,stroke-width:2px
        style I fill:#D5A6BD,stroke:#333,stroke-width:2px
        style D fill:#A9D18E,stroke:#333,stroke-width:2px
        style F fill:#A9D18E,stroke:#333,stroke-width:2px
        style E fill:#F4B183,stroke:#333,stroke-width:2px
    ```
