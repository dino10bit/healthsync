## Dependencies

### Core Dependencies
- `05-data-sync.md` - Data Synchronization & Reliability
- `07-apis-integration.md` - APIs & Integration Requirements
- `16-performance-optimization.md` - Performance & Scalability
- `17-error-handling.md` - Error Handling, Logging & Monitoring
- `18-backup-recovery.md` - Backup & Disaster Recovery
- `19-security-privacy.md` - Data Security & Privacy Policies
- `29-notifications-alerts.md` - Push Notifications & Alerts

### Strategic / Indirect Dependencies
- `01-context-vision.md` - Context & Vision
- `02-product-scope.md` - Product Scope, Personas & MVP Definition
- `14-qa-testing.md` - QA, Testing & Release Strategy
- `21-risks.md` - Risks, Constraints & Mitigation
- `25-release-management.md` - Release Management & Versioning
- `44-contingency-planning.md` - Contingency & Rollback Plans

---

# PRD Section 6: Technical Architecture, Security & Compliance

## 1. Executive Summary

This document specifies the complete technical architecture for the SyncWell application. The architecture is designed for high availability, massive scalability, and robust security to support **1 million Daily Active Users (DAU)**. It adheres to modern cloud-native principles and is engineered for a high-performing product team.

We will use the **C4 Model** as a framework to describe the architecture. The core architectural principles are **modularity**, **security by design**, and **privacy by default**. A key feature is its **hybrid sync model**, which combines a serverless backend for cloud-to-cloud syncs with on-device processing for integrations requiring native SDKs (e.g., Apple HealthKit). This approach maximizes reliability and performance. To further enhance the user experience, the architecture includes an **AI Insights Service** to power intelligent features like smart conflict resolution and personalized summaries.

## 2. Architectural Model (C4)

### Level 1: System Context

This diagram shows the system in its environment, illustrating its relationship with users and external systems. It remains unchanged.

```mermaid
graph TD
    subgraph SyncWell Ecosystem
        A[Mobile App]
        B[Backend]
    end

    subgraph Users
        C[Health-Conscious User]
    end

    subgraph External Systems
        D["Third-Party Health Platforms (Cloud APIs)"]
        D2["On-Device Health Platforms (HealthKit)"]
        E[Platform App Stores]
        F[Platform Notification Services]
    end

    C -- Manages health data via --> A
    A -- Initiates syncs --> B
    A -- Reads/Writes data from/to --> D2
    A -- Distributes through --> E
    B -- Orchestrates syncs --> A
    B -- Fetches and pushes data to --> D
    B -- Sends push notifications via --> F
```

### Level 2: Containers

This level zooms into the system boundary to show the high-level technical containers. We introduce the **AI Insights Service** for intelligent features, a **Distributed Cache** for performance, and specify the multi-region and global nature of the core services.

```mermaid
graph TD
    subgraph "AWS Cloud (Multi-Region)"
        APIGateway[API Gateway]
        ElastiCache[ElastiCache for Caching & Rate Limiting]
        RequestLambda[Request Lambda]
        SQSQueue[SQS Queue]
        WorkerLambda[Worker Lambdas]
        DynamoDB[DynamoDB Global Table for Metadata]
        SecretsManager[Secrets Manager for Tokens]
        S3[S3 for DLQ]
        AI_Service[AI Insights Service]
        Observability["Monitoring & Observability (CloudWatch)"]
    end

    subgraph "User's Device"
        MobileApp[Mobile Application w/ KMP Module]
    end

    MobileApp -- HTTPS Request --> APIGateway
    APIGateway -- Invokes --> RequestLambda
    RequestLambda -- Puts job --> SQSQueue
    RequestLambda -- Reads/Writes --> ElastiCache
    WorkerLambda -- Polls for jobs --> SQSQueue
    WorkerLambda -- Reads/writes config --> DynamoDB
    WorkerLambda -- Gets credentials --> SecretsManager
    WorkerLambda -- Reads/Writes --> ElastiCache
    WorkerLambda -- Calls for intelligence --> AI_Service
    SQSQueue -- Sends failed messages --> S3

    RequestLambda -- Logs & Metrics --> Observability
    WorkerLambda -- Logs & Metrics --> Observability
    AI_Service -- Logs & Metrics --> Observability
```

1.  **Mobile Application (Kotlin Multiplatform & Native UI)**
    *   **Description:** The user-facing application that runs on iOS or Android. It handles all user interactions and is a key component of the hybrid sync model.
    *   **Technology:** Kotlin Multiplatform (KMP) for shared business logic, SwiftUI for iOS, Jetpack Compose for Android.
    *   **Responsibilities:** Provides the UI, manages the start of the auth flow, and handles on-device syncs (e.g., HealthKit).

2.  **Scalable Serverless Backend (AWS)**
    *   **Description:** An event-driven, serverless backend on AWS that orchestrates all syncs. It does not **persist** any raw user health data; data is only processed ephemerally in memory during active sync jobs.
    *   **Technology:** AWS Lambda, API Gateway, SQS, DynamoDB Global Tables.
    *   **Responsibilities:** Orchestrates sync jobs, executes cloud-to-cloud syncs, securely stores credentials, and stores user metadata.

3.  **Distributed Cache (Amazon ElastiCache for Redis)**
    *   **Description:** A new in-memory caching layer to improve performance and reduce load on downstream services.
    *   **Technology:** Amazon ElastiCache for Redis.
    *   **Responsibilities:**
        *   Caches frequently accessed, non-sensitive data (e.g., user sync configurations).
        *   Acts as a distributed lock manager to prevent concurrent sync job collisions for the same user.
        *   Powers the rate-limiting engine to manage calls to third-party APIs.

4.  **AI Insights Service (AWS)**
    *   **Description:** A new service dedicated to providing intelligence to the platform. It encapsulates machine learning models and LLM integrations, allowing the core sync engine to remain deterministic and focused.
    *   **Technology:** Amazon SageMaker, Amazon Bedrock / OpenAI APIs, AWS Lambda.
    *   **Responsibilities:**
        *   Provides intelligent conflict resolution suggestions.
        *   Powers an LLM-based interactive troubleshooter.
        *   Generates personalized weekly summaries for users.

5.  **Monitoring & Observability (AWS CloudWatch)**
    *   **Description:** A centralized system for collecting logs, metrics, and traces from all backend services.
    *   **Technology:** AWS CloudWatch (Logs, Metrics, Alarms), AWS X-Ray.
    *   **Responsibilities:** Provides insights into system health, performance, and error rates. Triggers alarms for critical issues.

### Level 3: Components (Inside the KMP Shared Module)

The KMP module contains the core business logic. This code can be executed **on the device** (for HealthKit syncs) or **on the backend** (if using a JVM-based Lambda), maximizing code reuse.

*   **`SyncManager`:** Orchestrates the sync process based on instructions from the backend.
*   **`ConflictResolutionEngine`:** Detects data conflicts. *Now enhanced to optionally call the AI Insights Service for merge suggestions.*
*   **`ProviderManager`:** Manages the different `DataProvider` modules.
*   **`DataProvider (Interface)`:** A standardized interface for all third-party integrations.
*   **`ApiClient`:** Handles HTTP calls to backend and third-party services.
*   **`SecureStorageWrapper`:** Abstraction for Keychain/Keystore (on-device) and AWS Secrets Manager (on-backend).

### Level 3: Components (Inside the AI Insights Service)

This diagram shows the components within the new `AI Insights Service`.

```mermaid
graph TD
    subgraph AI Insights Service
        A[API Gateway]
        B["Conflict Resolution Model (SageMaker)"]
        C["Troubleshooting LLM (Lambda -> Bedrock)"]
        D["Summary LLM (Lambda -> Bedrock)"]
    end

    A -- Invokes --> B
    A -- Invokes --> C
    A -- Invokes --> D
```

*   **`API Gateway`:** A secure entry point for the service.
*   **`Conflict Resolution Model`:** A custom-trained machine learning model hosted on a SageMaker endpoint. It takes two conflicting data entries and returns a suggested merged version.
*   **`Troubleshooting LLM`:** A sophisticated, stateful agent built using **LangGraph**. It guides users through a troubleshooting "graph," asking clarifying questions, running diagnostics, and providing step-by-step solutions. This is more powerful than a simple Q&A bot.
*   **`Summary LLM`:** A Lambda function that takes a user's weekly data and uses an LLM to generate a human-readable, insightful summary.

## 3. Sync Models: A Hybrid Architecture

To ensure reliability and accommodate platform constraints, SyncWell uses a hybrid architecture.

### Model 1: Cloud-to-Cloud Sync

*   **Use Case:** Syncing between two cloud-based services (e.g., Fitbit to Strava).
*   **Flow:**
    1.  Mobile app initiates the sync via API Gateway.
    2.  The backend worker lambda handles the entire process: fetches data from the source API, **(optional) consults the AI Insights Service to resolve conflicts**, and writes data to the destination API.
    3.  **Advantage:** Highly reliable and does not depend on the user's device being online.

```mermaid
graph TD
    A[Mobile App] -- 1. Initiate --> B[Backend]
    B -- 2. Fetch --> C[Source Cloud API]
    C -- 3. Data --> B
    B -- "4. (Optional) Get Merge Suggestion" --> AI_Service[AI Insights Service]
    AI_Service -- 5. Suggestion --> B
    B -- 6. Write --> D[Destination Cloud API]
    D -- 7. Success --> B
```

### Model 2: Device-to-Cloud Sync
*(Unchanged)*

### Model 3: Cloud-to-Device Sync
*(Unchanged)*

## 3a. Architecture for 1M DAU

To reliably serve 1 million Daily Active Users, the architecture incorporates specific strategies for high availability, performance, and scalability.

### High Availability: Multi-Region Strategy

A single-region deployment introduces a significant risk of a complete service outage. To mitigate this, we will adopt an **Active-Active multi-region architecture**.

*   **Deployment:** The entire backend infrastructure will be deployed in at least two AWS regions (e.g., `us-east-1` and `us-west-2`).
*   **Request Routing:** **Amazon Route 53** will be used for DNS routing. It will use latency-based routing to direct users to the nearest healthy region and can automatically fail over if one region becomes unavailable.
*   **Data Replication:**
    *   **DynamoDB Global Tables:** User metadata and sync configurations will be stored in a DynamoDB Global Table. This provides built-in, fully managed, multi-master replication across regions with low latency.
    *   **SQS Queues:** A cross-region event-forwarding pattern will be used. For example, a Lambda in `us-east-1` can publish events to an SNS topic that has SQS subscriptions in both `us-east-1` and `us-west-2`, ensuring jobs are processed even if one region's workers are down. *(Note: This adds complexity and cost; a simpler active-passive model for SQS may be used initially)*.
*   **Credential Storage:** **AWS Secrets Manager** secrets can be replicated across regions, ensuring workers in any region can access the necessary credentials.

### Performance & Scalability: Caching & Load Projections

*   **Caching Strategy:** A distributed cache using **Amazon ElastiCache for Redis** is introduced to minimize latency and reduce load on backend services. It will be used for:
    1.  **Session/Configuration Caching:** Caching user sync configurations to reduce repeated reads from DynamoDB.
    2.  **Third-Party API Rate Limiting:** As a central counter/token bucket store to manage and enforce rate limits across the distributed worker fleet.
    3.  **Distributed Locking:** To prevent race conditions, such as two workers trying to perform the same sync job for the same user simultaneously.

*   **Load Projections & Resource Estimation:**
    *   **Assumptions:**
        *   1,000,000 DAU.
        *   Average user has 3 active sync configurations.
        *   Syncs run automatically every ~1 hour (24 syncs/day). Manual syncs add 25% overhead.
    *   **API Gateway & Request Lambdas:**
        *   Total daily requests: `1M users * 3 configs * 24 syncs/day * 1.25 = 90M requests/day`.
        *   Peak RPS: Assuming peak load is 3x average, this is `(90M / (24*3600)) * 3 = ~3,125 RPS`. API Gateway and Lambda scale automatically to handle this load.
    *   **Worker Lambdas & SQS:**
        *   Total daily jobs: `90M jobs/day`.
        *   SQS can handle virtually unlimited throughput. The key is Lambda concurrency.
        *   Assuming an average job takes 5 seconds, the required concurrency is `(90M jobs / 86400s) * 5s = ~5,200 concurrent executions`. The default AWS account limit (1,000) must be increased.
    *   **DynamoDB:**
        *   We will use **On-Demand Capacity Mode**. This is more cost-effective for spiky, unpredictable workloads than provisioned throughput. It automatically scales to handle the required read/write operations, although we must monitor for throttling if traffic patterns become extreme.

## 4. Technology Stack & Rationale

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Cross-Platform Framework** | **Kotlin Multiplatform (KMP)** | **Code Reuse & Performance.** KMP allows sharing the complex business logic (sync engine, data providers) across the mobile app and a potential JVM backend, while maintaining native UI performance. |
| **On-Device Database** | **SQLDelight** | **Cross-Platform & Type-Safe.** Generates type-safe Kotlin APIs from SQL, ensuring data consistency across iOS and Android. |
| **Serverless Backend** | **AWS (Lambda, SQS, DynamoDB)** | **Massive Scalability & Reliability.** Event-driven architecture to meet our 1M DAU target with pay-per-use cost efficiency. |
| **Distributed Cache** | **Amazon ElastiCache for Redis** | **Performance & Scalability.** Provides a high-throughput, low-latency in-memory cache for reducing database load and implementing distributed rate limiting. |
| **AI & Machine Learning** | **Amazon SageMaker, Amazon Bedrock** | **Managed & Scalable AI.** Provides managed services for training/hosting ML models and accessing foundational LLMs, reducing operational overhead and allowing focus on feature development. |
| **Secure Credential Storage** | **AWS Secrets Manager** | **Security & Manageability.** Provides a secure, managed service for storing, rotating, and retrieving the OAuth tokens required by our backend workers. Replicated across regions for high availability. |
| **Infrastructure as Code** | **Terraform** | **Reproducibility & Control.** Manages all cloud infrastructure as code, ensuring our setup is version-controlled and easily reproducible. |
| **CI/CD**| **GitHub Actions** | **Automation & Quality.** Automates the build, test, and deployment of the mobile app and backend services, including security checks. |
| **Monitoring & Observability** | **AWS CloudWatch, AWS X-Ray** | **Operational Excellence.** Provides a comprehensive suite for logging, metrics, tracing, and alerting, enabling proactive issue detection and performance analysis. |

## 5. Cost-Effectiveness at Scale (1M DAU)

The architecture is explicitly designed to be cost-effective while scaling to 1 million Daily Active Users.

1.  **Serverless First:** The core backend is built on AWS Lambda, SQS, and DynamoDB. This is a pay-per-use model. If there are no syncs, we pay virtually nothing. As usage scales to 1M DAU, costs scale linearly with it. This avoids the high fixed costs of provisioning and managing a large fleet of servers.
2.  **Efficient Data Handling:** The backend processes data ephemerally and does not store raw health data, which dramatically reduces storage costs and security liabilities. Metadata is stored in DynamoDB, which is highly cost-effective for key-value lookups at scale.
3.  **Kotlin Multiplatform (KMP):** While primarily a development velocity benefit, KMP reduces costs by minimizing the need for separate, specialized engineering teams for each platform. A single team can manage the core logic across iOS, Android, and potentially a JVM backend.
4.  **Managed AI Services:** Using Amazon SageMaker and Bedrock abstracts away the complexity and cost of managing GPU clusters for model training and inference. We pay for the API calls and endpoint hosting, which is more cost-effective than building and maintaining this infrastructure from scratch.
5.  **Right-Sized Resources:** Infrastructure as Code (Terraform) allows us to define and manage resource allocation precisely. Lambda memory, DynamoDB capacity, and other resources can be fine-tuned based on real-world usage data from our monitoring systems, preventing over-provisioning.

## 6. Security, Compliance & Observability

### Security Measures

*   **Data Encryption in Transit:** All network traffic will use TLS 1.2+. Certificate Pinning will be implemented for API calls to our own backend.
*   **Data Encryption at Rest:**
    *   **Backend:** User OAuth tokens are encrypted and stored in AWS Secrets Manager. DynamoDB tables are encrypted at rest.
    *   **On-Device:** Any sensitive data is stored in the native Keychain (iOS) and Keystore (Android).
*   **Code & Pipeline Security:** Production builds will be obfuscated. Dependency scanning (Snyk) and static application security testing (SAST) will be integrated into the CI/CD pipeline, failing the build if critical vulnerabilities are found.

### Compliance
*   User health data is only ever processed **ephemerally in memory** on our backend servers during an active sync job. It is **never persisted** on our systems.
*   For integrations requiring native SDKs (like Apple Health), data processing occurs on the user's device, further enhancing privacy. This hybrid model is designed to be compliant with GDPR, CCPA, and other privacy regulations.
*   The AI Insights Service will be designed to not store any Personal Health Information (PHI). Data sent for inference will be processed ephemerally.

### Monitoring, Logging, and Alerting
A robust observability strategy is critical for operating a reliable service at scale. This is not just about error detection, but about proactively ensuring the system is delivering on the user stories.

*   **Logging:** All Lambda functions will use structured logging (JSON format). Logs will be shipped to AWS CloudWatch Logs. **All logs must be scrubbed of any PHI or user-identifiable information before being written.**
*   **Tracing:** AWS X-Ray will be enabled for all services (API Gateway, Lambda) to provide end-to-end tracing of requests. This is invaluable for debugging performance bottlenecks in the sync pipeline.
*   **Alerting:** AWS CloudWatch Alarms will be configured to automatically notify the on-call team via PagerDuty for critical issues, such as:
    *   A significant spike in the `SyncJobFailureRate`.
    *   High P99 latency in a core service.
    *   Dead-Letter Queue (DLQ) message count above zero.
    *   A sudden drop in `ActiveUsers`.
    *   High cache eviction rate in ElastiCache.
*   **Dashboards:** Pre-configured dashboards in CloudWatch will provide an at-a-glance view of system health, organized by service and by user-facing feature.

#### Key Performance Indicators (KPIs)

In addition to generic system metrics, we will track a set of specific KPIs that are directly tied to business goals and user stories.

| KPI Metric Name | User Story | Business Goal | Description | Threshold / Alert |
| :--- | :--- | :--- | :--- | :--- |
| `SyncSuccessRate` | US-05 | Trust & Reliability | Percentage of sync jobs that complete successfully. | Alert if < 99.9% over 15 mins. |
| `P95_ManualSyncLatency` | US-06 | Engagement & Control | 95th percentile latency for a user-initiated manual sync to complete. | Alert if > 15 seconds. |
| `HistoricalSyncThroughput` | US-10 | Conversion & Retention | Number of days/records processed per minute during a historical sync. | Alert on significant drops. |
| `ConflictResolutionRate` | US-15 | Differentiation | Percentage of detected conflicts that are successfully resolved (manually or automatically). | N/A (for tracking). |
| `AI_Service_Availability` | US-15 | Differentiation | Uptime of the AI Insights Service endpoints. | Alert if < 99.9%. |
| `ReAuthRate` | US-13 | Trust & Privacy | Rate at which syncs fail due to invalid tokens, requiring user re-authentication. | Alert on unusual spikes. |
| `NewUser_TimeToFirstSync` | US-02 | Activation | Time from user signup to the first successful data sync. | Track median time. |

## 7. Open-Source Tools and Packages

| Category | Tool/Package | Description |
| :--- | :--- | :--- |
| **Mobile Development** | **Kotlin Multiplatform** | Core framework for sharing code. |
| | **SwiftUI / Jetpack Compose** | Modern UI frameworks for iOS and Android. |
| | **SQLDelight** | KMP library for type-safe SQL. |
| | **Ktor** | KMP HTTP client. |
| **Backend Development** | **AWS Lambda, SQS, DynamoDB** | Core AWS services for the serverless backend. |
| | **Terraform** | Infrastructure as Code tool. |
| **AI/ML** | **Hugging Face Transformers** | For sourcing pre-trained models or fine-tuning. |
| | **scikit-learn** | For building the initial conflict resolution model. |
| | **LangChain / LangGraph** | Frameworks for orchestrating LLM interactions. LangChain is used for simpler LLM calls (e.g., summaries), while LangGraph is used to build the complex, stateful graph for the AI Troubleshooter. |
| **Testing** | **JUnit, XCTest, Turbine, MockK** | Standard libraries for testing Kotlin and Swift code. |
| **CI/CD** | **GitHub Actions, Fastlane** | CI/CD platform and mobile release automation. |
| **Monitoring** | **OpenTelemetry** | Vendor-neutral standard for instrumentation. |
| | **Prometheus / Grafana** | Alternative/complement to CloudWatch for advanced metrics and dashboards. |
| **Static Analysis** | **Detekt, SwiftLint** | Static analysis tools for Kotlin and Swift. |
| **Dependency Scanning** | **Snyk, Dependabot** | Vulnerability scanning for dependencies. |

## 8. Recommendations for Open-Source Adoption

To further enhance the architecture, reduce vendor lock-in, and improve development velocity, we recommend the adoption of the following high-quality open-source solutions. These tools are complementary to the existing stack and can be integrated strategically to provide significant value.

| Category | Recommended Tool | Strategic Benefit & Rationale |
| :--- | :--- | :--- |
| **Workflow Orchestration** | **Temporal.io** | **For Historical Syncs & Complex Workflows.** The current architecture uses a "Lambda orchestrating Lambdas" pattern for historical syncs. While functional, this can become brittle. Temporal provides a highly reliable, stateful workflow platform that is purpose-built for long-running, fault-tolerant processes. It would make historical syncs more robust, observable, and easier to maintain. |
| **Local Development** | **LocalStack** | **For High-Fidelity Local Testing.** A serverless architecture can be challenging to test locally. LocalStack provides a powerful emulator for the full suite of AWS services (Lambda, SQS, DynamoDB, etc.). This allows engineers to run and test the entire backend on their local machine, drastically improving the development and debugging feedback loop. |
| **API Gateway** | **Kong** | **For Advanced API Management & Flexibility.** While AWS API Gateway is excellent, an open-source gateway like Kong offers greater flexibility, more advanced plugins (e.g., for authentication, traffic shaping), and the ability to run in any environment. This reduces vendor lock-in and provides a richer feature set for managing APIs as the ecosystem grows. |
| **MLOps** | **MLflow** | **For End-to-End ML Lifecycle Management.** The AI Insights Service will involve experimentation and model iteration. MLflow is an open-source platform for managing the entire machine learning lifecycle. It would allow the team to track experiments, package models for reproducibility, and streamline the deployment process, bringing more rigor to the MLOps pipeline than using SageMaker alone. |
| **Distributed Tracing** | **Jaeger or Zipkin** | **For Vendor-Neutral Observability.** The architecture currently specifies AWS X-Ray. By instrumenting the code with OpenTelemetry (already listed), the project can send tracing data to any compatible backend. Adopting an open-source solution like Jaeger or Zipkin provides a powerful, self-hostable alternative to X-Ray, avoiding vendor lock-in and offering deep insights into request flows. |
| **Security Scanning** | **Trivy** | **For Comprehensive Vulnerability Detection.** To complement Snyk and Dependabot, Trivy offers a fast and comprehensive open-source scanner for vulnerabilities in container images, file systems, and Git repositories. Integrating Trivy into the CI/CD pipeline provides an additional layer of security assurance. |
| **NoSQL Database** | **ScyllaDB or Cassandra** | **For Extreme Performance & Query Flexibility.** While DynamoDB is a great starting point, a wide-column store like ScyllaDB (a high-performance Cassandra alternative) could be considered if future requirements demand more complex query patterns or lower-latency performance at extreme scale. This is a strategic option to keep in mind as the product evolves. |
| **GitOps** | **Argo CD** | **For Declarative, Git-Centric Continuous Delivery.** As the infrastructure and application configurations grow, managing them can become complex. Argo CD is a declarative, GitOps continuous delivery tool that uses Git repositories as the source of truth for defining the desired application state. This would be a natural fit with the Infrastructure as Code approach using Terraform. |
| **Caching** | **Redis** | **For Flexibility and Control.** The architecture uses Amazon ElastiCache for Redis. By depending on the open-source Redis API, the team retains the flexibility to switch to a different managed provider or even self-host Redis in the future without changing the application code, ensuring long-term architectural agility. |
| **Event Streaming** | **Apache Kafka or Redpanda** | **For Advanced Event-Driven Architectures.** SQS is excellent for job queuing. If the system evolves to require more complex event streaming, real-time analytics, or event sourcing patterns, a platform like Kafka (or its simpler, compatible alternative, Redpanda) would be the natural next step, providing a durable, scalable event backbone. |
