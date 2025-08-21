# PRD Section 6: Technical Architecture, Security & Compliance

## 0. Document Management

### Version History
| Version | Date       | Author(s) | Summary of Changes |
| :--- | :--- | :--- | :--- |
| 1.0 | 2025-08-12 | J. Doe | Initial Draft |
| 1.1 | 2025-08-19 | J. Doe | Incorporated feedback from `f-20.md` review. Addressed over 150 points of ambiguity, inconsistency, and risk. |

### Consolidated Assumptions
A consolidated list of all key project assumptions is maintained in the root `README.md` file.

### Cross-Cutting Concerns
*   **Traceability to User Stories:** While this document is technically focused, key architectural decisions should trace back to user stories in `../prd/04-user-stories.md`. A formal Requirements Traceability Matrix is maintained in **`../../reports/rtm/repository_traceability_matrix.md`** to ensure all requirements are met and tested.
*   **Accessibility (A11y):** All user-facing components, including API error messages and push notifications, must adhere to WCAG 2.1 AA standards.
*   **Internationalization (i18n) & Localization (L10n):** All user-facing strings (error messages, notifications) must be stored in resource files and not hard-coded, to support future localization efforts.

## Dependencies

### Core Dependencies
- `./05-data-sync.md` - Data Synchronization & Reliability
- `./07-apis-integration.md` - APIs & Integration Requirements
- `../ops/17-error-handling.md` - Error Handling, Logging & Monitoring
- `../ops/18-backup-recovery.md` - Backup & Disaster Recovery
- `../ops/19-security-privacy.md` - Security & Privacy
- `./30-sync-mapping.md` - Sync Mapping
- `../prd/31-historical-data.md` - Historical Data Handling
- `./33-third-party-integration.md` - Third-Party Integration Considerations
- `../prd/34-data-export.md` - Data Export
- `../prd/35-data-import.md` - Data Import
- `../ops/39-performance-metrics.md` - Performance & Metrics
- `../costs/66-costs-model.md` - Costs Model

### Strategic / Indirect Dependencies
- `../prd/01-context-vision.md` - Context & Vision
- `../prd/02-product-scope.md` - Product Scope, Personas & MVP Definition
- `../ux/08-ux-onboarding.md` - UX Onboarding
- `../ux/09-ux-configuration.md` - UX Configuration
- `../qa/14-qa-testing.md` - QA & Testing
- `../qa/15-integration-testing.md` - Integration & End-to-End Testing
- `../prd/21-risks.md` - Risks & Mitigation
- `../ops/25-release-management.md` - Release Management & Versioning
- `../ops/44-contingency-planning.md` - Contingency & Rollback Plans
- `../prd/45-future-enhancements.md` - Future Enhancements & Roadmap Expansion

---

# PRD Section 6: Technical Architecture, Security & Compliance

## 1. Executive Summary

This document specifies the complete technical architecture for the SyncWell application. The architecture is designed for **high availability (defined as >99.9% uptime)**, **massive scalability (to support 1 million Daily Active Users and a peak load of 3,000 requests per second)**, and robust security. It adheres to modern cloud-native principles and is engineered for developer velocity and operational excellence.

> **[S-003] [ARCH-DECISION-01] KEY ARCHITECTURAL DECISION: FARGATE COMPUTE MODEL**
> A critical finding during the initial analysis was that a traditional Lambda-per-job model would introduce significant cost and concurrency risks at scale (projected at over 45,000 concurrent executions). To mitigate this project-threatening risk, the architecture specifies a container-based worker fleet on **AWS Fargate**. As detailed in Sections 3b and 4, this model provides a more cost-effective and predictable performance profile for the system's high-throughput workload, directly addressing the identified scaling challenges.

We will use the **C4 Model** as a framework to describe the architecture. The core architectural principles are **modularity**, **security by design**, and **privacy by default**. A key feature is its **hybrid sync model**, which is necessitated by platform constraints. It combines a serverless backend for cloud-to-cloud syncs with on-device processing for integrations that require native SDKs (e.g., Apple HealthKit), maximizing reliability and performance. Post-MVP, the architecture can be extended to include more advanced features like historical data backfills and an AI Insights Service. The design concepts for these are captured in `../prd/45-future-enhancements.md`. The initial focus for the MVP, however, will be on a **robust sync engine** for recent data, made reliable through a unified idempotency strategy and resilient error handling.

## 2. Architectural Model (C4)

### Level 1: System Context

This diagram shows the system in its environment, illustrating its relationship with users and external systems.

*(See Diagram 1 in the "Visual Diagrams" section below.)*

### Level 2: Containers

This level zooms into the system boundary to show the high-level technical containers for the MVP. The architecture is focused on a low-latency **"hot path"** for handling real-time syncs of recent data. While the system uses multiple serverless services like EventBridge, the core business logic resides in a **unified worker fleet**, promoting code reuse. A core technology used is **Kotlin Multiplatform (KMP)**, which allows for sharing this worker logic between the mobile application and the backend.

Designs for post-MVP features like the "cold path" for historical syncs have been deferred and are captured in `../prd/45-future-enhancements.md`.

**Note on Diagram Clarity:** The following diagram is a high-level overview for the MVP. It omits secondary components like the S3 bucket for archiving DLQ messages and post-MVP components like the AI Insights Service. The S3 bucket will be configured with a standard lifecycle policy to transition objects to Glacier after 90 days and delete them after 1 year.

*(See Diagram 2 in the "Visual Diagrams" section below.)*

1.  **Mobile Application (Kotlin Multiplatform & Native UI)**
    *   **Description:** The user-facing application that runs on iOS or Android. It handles all user interactions and is a key component of the hybrid sync model.
    *   **Technology:** Kotlin Multiplatform (KMP) for shared business logic, SwiftUI for iOS, Jetpack Compose for Android.
    *   **Responsibilities:** Provides the UI, integrates with the Firebase Authentication SDK to manage the user sign-up/sign-in flows, securely stores JWTs using the platform's **Keychain (iOS) or Keystore (Android)**, and handles on-device syncs (e.g., HealthKit).

2.  **Authentication Service (Firebase Authentication)**
    *   **Description:** A managed, third-party service that handles all aspects of user identity, including sign-up, sign-in, and social provider integration (Google/Apple).
    *   **Technology:** Firebase Authentication (Google Cloud).
    *   **Responsibilities:** Manages user credentials, issues short-lived JWTs with a **1-hour TTL** to the mobile client after a successful authentication event, and provides public keys for backend token verification.

3.  **Scalable Serverless Backend (AWS)**
    *   **Description:** A decoupled, event-driven backend on AWS that uses a unified AWS Lambda compute model for its core business logic to orchestrate all syncs. This serverless-first approach maximizes developer velocity and minimizes operational overhead.
    *   The backend **must not** persist any raw user health data; this critical security requirement will be enforced via a dedicated test case in the QA plan. Any temporary diagnostic metadata containing user identifiers is stored in a secure, audited, time-limited index, as detailed in `../ops/19-security-privacy.md`. Data is otherwise only processed ephemerally in memory during active sync jobs.
    *   **Technology:** AWS Lambda, API Gateway, **Amazon EventBridge**, **Amazon SQS**, DynamoDB.
    *   **Responsibilities:** The API Layer (**API Gateway**) is responsible for initial request validation (e.g., format), authorization via the `AuthorizerLambda`, and routing requests to the appropriate backend service. It does not handle business-level validation like idempotency checks. To ensure maximum performance and cost-effectiveness, it will leverage **API Gateway's built-in caching for the Lambda Authorizer**. The authorizer's response (the IAM policy) will be cached based on the user's identity token for a **5-minute TTL**. For subsequent requests within this TTL, API Gateway will use the cached policy and will not invoke the `AuthorizerLambda`, dramatically reducing latency and cost.
    *   **Risk:** This caching strategy introduces a known risk: if a user's permissions are revoked, they may retain access for up to the 5-minute TTL of the cached policy. This trade-off is accepted to achieve the required API performance.

4.  **Distributed Cache (Amazon ElastiCache for Redis)**
    *   **Description:** An in-memory caching layer to improve performance and reduce load on downstream services. The cluster must be **sized to handle 5,000 RPS with a P99 latency of < 10ms**, which is a significant safety threshold above the MVP's peak NFR of 3,000 RPS.
    *   **Technology:** Amazon ElastiCache for Redis.
    *   **Responsibilities:**
        *   Caches frequently accessed, non-sensitive data (e.g., user sync configurations).
        *   Powers the rate-limiting engine to manage calls to third-party APIs.

5.  **Monitoring & Observability (AWS CloudWatch)**
    *   **Description:** A centralized system for collecting logs, metrics, and traces from all backend services.
    *   **Technology:** AWS CloudWatch (Logs, Metrics, Alarms), AWS X-Ray.
    *   **Responsibilities:** Provides insights into system health, performance, and error rates. Triggers alarms for critical issues.

6.  **Data Governance & Schema Registry (AWS Glue Schema Registry)**
    *   **Description:** To manage the evolution of our canonical data models (e.g., `CanonicalWorkout`), we will use the AWS Glue Schema Registry. It acts as a central, versioned repository for our data schemas.
    *   **Technology:** AWS Glue Schema Registry.
    *   **Responsibilities:**
        *   Stores all versions of the canonical data model schemas.
        *   **Must** enforce schema evolution rules (e.g., backward compatibility) within the CI/CD pipeline, preventing the deployment of breaking changes.
        *   Provides schemas to the worker service (AWS Lambda) for serialization and deserialization tasks, ensuring data conforms to the expected structure.

7.  **Centralized Configuration Management (AWS AppConfig)**
    *   **Description:** To manage dynamic operational configurations and feature flags, we will adopt AWS AppConfig. This allows for safe, audited changes without requiring a full code deployment.
    *   **Technology:** AWS AppConfig.
    *   **Responsibilities:**
        *   Stores and serves feature flags (e.g., enabling a feature for Pro users).
        *   Manages operational parameters such as API timeouts, logging levels, and rate-limiting thresholds.
        *   **Manages critical resource identifiers (e.g., the DynamoDB table name). This is a crucial element of the disaster recovery strategy, allowing the application to be repointed to a restored database table without a code deployment.**
    *   **[R-001] Risk:** Storing critical configuration like the database table name in AppConfig creates a dependency. A failure to access AppConfig at application startup could prevent the service from running. This risk is mitigated by AppConfig's own high availability and our use of aggressive client-side caching within the Lambda functions. However, a prolonged, widespread AppConfig outage remains a **High** impact, low-probability risk.
    *   **[T-004] [U-004] Graceful Degradation Strategy:** In the event of a prolonged AppConfig outage where the client-side cache also fails, the application **must** enter a safe, degraded mode.
        *   **Behavior:** The system should operate with sensible, hard-coded default configurations that are bundled with the application. For example, it would use a default logging level and disable non-essential features that rely on feature flags.
        *   **Critical Failure:** If a critical value like the DynamoDB table name cannot be retrieved, the service must fail fast and explicitly, logging a critical error.

8.  **Static Asset Delivery (Amazon S3 & CloudFront)**
    *   **Description:** A global content delivery network (CDN) to ensure that all static assets are delivered to users with low latency and high transfer speeds.
    *   **Technology:** Amazon S3, Amazon CloudFront.
    *   **Responsibilities:** Hosts and serves all static assets for the mobile application, such as provider icons, marketing banners, and tutorial images. The mobile client will fetch these assets directly from the nearest CloudFront edge location, not from the backend service. This is a critical best practice for performance and cost-effectiveness.

9.  **Real-time WebSocket API (API Gateway)**
    *   **Description:** A persistent, stateful connection endpoint for foreground users to provide a near real-time sync experience and reduce load on the asynchronous backend.
    *   **Technology:** API Gateway (WebSocket API), AWS Lambda.
    *   **Responsibilities:** Manages the WebSocket lifecycle (`$connect`, `$disconnect`, `$default`). When a sync is requested over the WebSocket, it is routed to a lightweight `SyncOverSocketLambda` which can process the sync and return the result directly over the connection. This bypasses the entire SQS/Fargate flow for "hot users," providing lower latency and reducing costs.

### Level 3: Components (Inside the KMP Shared Module)

The KMP module contains the core, shareable business logic. The architectural strategy is to use **KMP for portable business logic** and **platform-native runtimes for performance-critical infrastructure code**.

For the backend, this means the general strategy is to compile the KMP module to a JAR and run it on a standard JVM-based AWS Lambda runtime. However, security-critical, latency-sensitive functions like the `AuthorizerLambda` **must** be implemented in a faster-starting runtime like TypeScript or Python. This is a deliberate, non-negotiable trade-off. The P99 latency SLO of <500ms for the entire API Gateway request cannot be reliably met if the authorizer suffers from a multi-second JVM cold start. This technology split is justified because the authorizer is a simple, self-contained function whose performance is critical to the entire user experience.

*   **[T-001] Contradiction & Trade-off Acceptance:** This decision creates a deliberate contradiction with the project's goal of using a single cross-platform framework (KMP). The complexity of maintaining a hybrid runtime is a formally accepted technical trade-off, made to meet the non-functional requirement for API latency.

*   **`SyncManager`:** Orchestrates the sync process.
    *   **Inputs:** `SyncConfig` object, `DataProvider` instances for source and destination.
    *   **Outputs:** A `SyncResult` object (success or failure).
*   **`ConflictResolutionEngine`:** Detects and resolves data conflicts. For the MVP, this will be a simple, rules-based engine (e.g., "newest wins").
    *   **Inputs:** Two `CanonicalData` objects.
    *   **Outputs:** A single, merged `CanonicalData` object.
*   **`ProviderManager`:** Manages and provides instances of `DataProvider` modules.
    *   **Inputs:** A `providerId` string (e.g., "fitbit").
    *   **Outputs:** An initialized `DataProvider` instance.
*   **`DataProvider (Interface)`:** A standardized interface for all third-party integrations. Its method signatures are canonically defined in the `./07-apis-integration.md` document, creating a formal dependency.
*   **`ApiClient`:** Handles HTTP calls to backend and third-party services.
*   **`SecureStorageWrapper`:** Abstraction for Keychain/Keystore (on-device) and AWS Secrets Manager (on-backend).
    *   **Error Handling:** If the underlying secret store (e.g., Secrets Manager) is unavailable, this component **must** throw a specific, catchable `SecureStorageUnavailableException` to allow the caller to implement appropriate retry logic.
    *   **[T-002] System-Level Fallback:** If Secrets Manager is unavailable for an extended period, the system will enter a degraded mode. Syncs requiring new tokens will fail, but syncs for existing, cached connections may continue if the `WorkerFargateTask` has a warm container with the tokens already in memory. **[NEEDS_CLARIFICATION: Q-05]** The business must formally accept that a prolonged Secrets Manager outage will result in the failure of most data sync functionality.

### Level 3: Extensible Provider Integration Architecture

The core value of the application is its ability to connect with various third-party health services. To support rapid and reliable addition of new providers, the architecture defines a "plug-in" model. This model ensures that adding a new integration (e.g., for "Polar") is a predictable process that does not require changes to the core sync engine. This is achieved through a standardized interface, a factory for dynamic loading, and a secure configuration management strategy.

#### 1. The `DataProvider` Interface

All provider-specific logic is encapsulated in a class that implements the `DataProvider` interface. This interface, defined in the KMP shared module, creates a standardized contract for all integrations. The canonical definition of this critical interface, including its method signatures and the `capabilities` field, is maintained in `./07-apis-integration.md`.

#### 2. Dynamic Loading with a Factory Pattern

The `ProviderManager` component acts as a factory to dynamically instantiate and manage provider-specific logic based on user configuration. This decouples the core sync engine from the individual provider implementations.

*   **Process:**
    1.  **Initialization:** On startup, the `ProviderManager` is initialized with a registry mapping `providerId` strings to their corresponding `DataProvider` implementation classes.
    2.  **Request:** The `SyncWorker` receives a job (e.g., "sync steps from 'fitbit' to 'strava'").
    3.  **Lookup:** It requests the `DataProvider` for "fitbit" from the `ProviderManager`.
    4.  **Instantiation:** The `ProviderManager` consults its registry, finds the `FitbitProvider` class, instantiates it, and returns the object to the worker.
    5.  **Execution:** The worker then uses this object to perform the data fetch.

*(See Diagram 3 in the "Visual Diagrams" section below.)*

This design means that to add a new provider, a developer only needs to implement the `DataProvider` interface and register the new class with the `ProviderManager`'s registry.

#### 3. Secure Configuration and Secret Management

A secure and scalable strategy is essential for managing provider-specific configurations and API credentials.

*   **Provider-Specific Configuration:** Non-sensitive configuration, such as API endpoint URLs or supported data types, is stored in a configuration file **within the same source code module/package** as the provider's implementation.
*   **Application API Credentials:** The OAuth `client_id` and `client_secret` for each third-party service are highly sensitive. These are stored securely in **AWS Secrets Manager**. The backend services retrieve these credentials at runtime using a narrowly-scoped IAM role.
*   **User OAuth Tokens:** User-specific `access_token` and `refresh_token` are encrypted and stored in **AWS Secrets Manager**. To avoid storing a predictable secret ARN in the database, the `Connection` item in DynamoDB will store a randomly generated UUID as the pointer to the secret.
    *   **Secure ARN Mapping:** The mapping from this UUID to the full AWS Secrets Manager ARN **must** be stored securely. This mapping will be managed as a secure JSON object within **AWS AppConfig**. This approach provides a central, auditable, and securely managed location for this critical mapping data.
    *   **Dynamic IAM Policies for Least Privilege:** When a Worker Fargate Task processes a job, it must be granted permission to retrieve *only* the specific secret for the connection it is working on. This is a critical security control. This will be achieved by having the orchestrating service (e.g., Step Functions) generate a **dynamic, narrowly-scoped IAM session policy** that grants temporary access only to the specific secret ARN required for the job. This policy is then passed to the `WorkerFargateTask`, ensuring it operates under the principle of least privilege for every execution.

## 3. Sync Models: A Hybrid Architecture

To ensure reliability and accommodate platform constraints, SyncWell uses a hybrid architecture. This means some integrations are handled entirely in the cloud ("Cloud-to-Cloud"), while others require on-device processing using native SDKs.

The following table clarifies the integration model for each provider supported in the MVP:

| Provider | Integration Model | Rationale |
| :--- | :--- | :--- |
| **Apple Health** | Device-to-Cloud / Cloud-to-Device | **Platform Constraint:** HealthKit is a device-native framework with no cloud API. All processing **must** happen on the user's device. |
| **Google Fit** | Hybrid (Device & Cloud) | **User Benefit & Modernization:** While Google Fit has a REST API, the new Health Connect SDK provides access to richer, more real-time data directly on the user's device. The implementation will be device-first to provide the best user experience. The cloud API will only be used as a fallback under **specific, defined conditions**: 1) when a sync fails with an error indicating the on-device provider is unavailable (e.g., user has not installed Health Connect), or 2) for specific data types that are only available via the cloud API. |
| **Fitbit** | Cloud-to-Cloud | Fitbit provides a comprehensive REST API for all data types. No on-device component is needed. |
| **Garmin** | Cloud-to-Cloud | Garmin provides a cloud-based API. No on-device component is needed. |
| **Strava** | Cloud-to-Cloud | Strava provides a cloud-based API. No on-device component is needed. |

### Model 1: Cloud-to-Cloud Sync (MVP Focus)

For the MVP, cloud-to-cloud syncs are handled by a single, reliable architectural pattern: the **"Hot Path"**.

#### **Hot Path Sync**
*   **Use Case:** Handling frequent, automatic, and user-initiated manual syncs for recent data.
*   **Flow:**
    1.  The Mobile App sends a request to API Gateway to start a sync.
    2.  **API Gateway** uses a direct AWS service integration to validate the request and send the `HotPathSyncRequested` message directly to the **Amazon SQS FIFO queue** (`HotPathSyncQueue`). This is a critical cost optimization that bypasses the more expensive EventBridge service for this specific high-volume ingestion path.
    3.  The SQS FIFO queue, which now receives messages directly from API Gateway, acts as a buffer to protect the system from load spikes.
    4.  The SQS queue is polled by the `Worker Fargate Task`, which processes the job.
    5.  **Failure Handling:** The primary SQS queue is configured with a **Dead-Letter Queue (DLQ)**. On a **non-transient processing error** (e.g., an invalid credentials error `401`, a permanent API change `404`, or an internal code bug), the worker throws an exception. After a configured number of retries (`maxReceiveCount`), SQS automatically moves the failed message to the DLQ for out-of-band analysis.
        *   **`maxReceiveCount` Rationale:** This will be set to **5**. This value is chosen to balance allowing recovery from intermittent, transient network or third-party API errors against not waiting too long to detect a persistent failure. A message that fails 5 times over approximately 1-2 minutes indicates a persistent issue that requires manual intervention and aligns with our goal of identifying and fixing broken integrations quickly.
    6.  Upon successful completion, the `Worker Fargate Task` publishes a `SyncSucceeded` event back to the EventBridge bus. This event is consumed by other services, primarily to trigger a push notification to the user and for analytics.
*   **Advantage:** This is a highly reliable and extensible model. Leveraging the native SQS DLQ feature simplifies the worker logic, increases reliability, and improves observability.

*(See Diagram 4 in the "Visual Diagrams" section below.)*

#### **Post-MVP: Historical Sync (Cold Path)**
The ability for users to backfill months or years of historical data is a key feature planned for a post-MVP release. The detailed architecture for this "Cold Path," which will use AWS Step Functions to orchestrate the complex workflow, is captured in `../prd/45-future-enhancements.md`.

### Model 2: Device-to-Cloud Sync
This model is required for integrations where the source of data is a device-native framework with no cloud API, such as Apple HealthKit or Google's Health Connect SDK. The sync process is initiated and driven by the mobile client.

*   **Use Case:** Syncing data *from* Apple Health *to* a cloud provider like Strava.
*   **Flow:**
    1.  **Trigger:** The sync is triggered on the device, either by a background schedule (e.g., an iOS `BGAppRefreshTask`) or a user-initiated manual sync.
    2.  **On-Device Fetch:** The KMP module running on the device calls the appropriate native API (e.g., HealthKit's `HKSampleQuery`) to fetch new data since the last successful sync timestamp, which is stored locally.
    3.  **Canonical Transformation:** The fetched data is transformed into the `CanonicalData` format by the shared KMP logic.
    4.  **Data Push to Backend:** The mobile app makes a secure API call to a dedicated backend endpoint (e.g., `POST /v1/device-upload`). The request body contains the batch of canonical data.
    5.  **Backend Processing:** The backend receives this pre-fetched data. It then initiates a sync process that is very similar to the "Hot Path" model, with one key difference: it skips the "fetch from source" step.
    6.  **Conflict Resolution & Destination Write:** The backend fetches overlapping data from the destination cloud provider (e.g., Strava) to perform conflict resolution. It then pushes the final, conflict-free data to the destination.
    7.  **State Update:** The backend updates its state in DynamoDB. Upon receiving a successful response from the backend, the mobile app updates its local `lastSyncTime` to ensure it doesn't fetch the same data again.
*   **Advantage:** This model allows SyncWell to integrate with device-only data sources, which is a key product differentiator.
*   **Limitation:** Syncs can only occur when the user's device is on, has battery, and has a network connection. This is an unavoidable constraint of the underlying platforms.

*(See Diagram 7 in the "Visual Diagrams" section below.)*

### Model 3: Cloud-to-Device Sync
This model handles the reverse of Model 2, where the destination for the data is a device-native framework like Apple HealthKit. Because the backend cannot directly initiate a connection to write data onto a user's device, it must use a push notification to signal the mobile client to pull the data down.

*   **Use Case:** Syncing data *from* a cloud provider like Garmin *to* Apple Health.
*   **Flow:**
    1.  **Standard Cloud Sync:** A regular "Hot Path" sync is initiated on the backend (e.g., triggered by a webhook from Garmin).
    2.  **Difference in "Fetch from Destination":** To perform conflict resolution, the backend must get data from the destination (Apple Health). It does this by sending a "read request" via a silent push notification to the device. The mobile app wakes up, fetches the requested data from HealthKit, and sends it back to the waiting backend process.
    3.  **Temporary Data Staging:** After the conflict resolution engine produces the final, conflict-free data, the backend stages this data in a temporary, secure location (e.g., a dedicated S3 bucket with a short, 24-hour lifecycle policy).
    4.  **Silent Push Notification:** The backend sends another silent push notification (e.g., an APNs push with the `content-available` flag set to 1) to the user's device. The notification payload contains a `jobId` that points to the staged data.
    5.  **Client-Side Pull & Write:** The mobile app, upon receiving the silent push, wakes up in the background. It makes a secure API call to the backend, providing the `jobId` to fetch the staged canonical data.
    6.  **On-Device Write:** The KMP module receives the data and uses the appropriate native APIs (e.g., HealthKit's `save` method) to write the data into the local health store.
    7.  **Confirmation:** After successfully writing the data, the mobile app makes a final API call to the backend to confirm the completion of the job. The backend then deletes the temporary staged data.
*   **Advantage:** This architecture enables writing data to device-only platforms, completing the loop for a truly hybrid sync model.
*   **Resilience:** If the user's device is offline or unreachable, the silent push notification will not be delivered immediately. The staged data will remain on the backend for a reasonable period (e.g., 24 hours), and the sync will be attempted the next time the device comes online and the app is launched.

*(See Diagram 8 in the "Visual Diagrams" section below.)*

### Model 4: Webhook-Driven Sync with Event Coalescing

To provide a near real-time user experience and dramatically reduce costs, the architecture uses a webhook-first strategy. However, to prevent "event chatter"—where multiple rapid-fire webhooks for the same user trigger numerous, expensive, individual sync jobs—this model is enhanced with an **Event Coalescing** layer. This strategy significantly reduces the volume of events processed by EventBridge and SQS, which are key drivers of variable costs.

*   **Use Case:** Receiving notifications that new data is available, buffering them briefly to merge related events, and then triggering a single, consolidated sync job.
*   **New AWS Resources:**
    *   **SQS FIFO Queue:** `CoalescingBufferQueue`
    *   **AWS Lambda Function:** `CoalescingTriggerLambda`
    *   **IAM Role:** An IAM role for the `CoalescingTriggerLambda` with permissions to publish events to EventBridge.
*   **Flow:**
    1.  **Ingestion:** The API Gateway endpoint that receives incoming webhooks will no longer publish events directly to the main EventBridge bus. Instead, it will send a message to a new **SQS FIFO (First-In, First-Out) queue** named `CoalescingBufferQueue`.
    2.  **Buffering & Deduplication:** The `CoalescingBufferQueue` will have a `deliveryDelay` of approximately 60 seconds. This creates a short-term buffer, allowing multiple events for the same user to accumulate. The `userId` will be used as the `MessageDeduplicationId` to ensure that messages for the same user are processed in order.
    3.  **Triggering:** A new, lightweight Lambda function, `CoalescingTriggerLambda`, will be configured with the `CoalescingBufferQueue` as its event source.
    4.  **Coalescing Logic:**
        *   When the `CoalescingTriggerLambda` is invoked, it will receive a batch of messages from the SQS queue.
        *   It will iterate through the messages, extracting the `userId` from each.
        *   Using a local `Set` to track unique user IDs within the batch, it will publish a single, consolidated `SyncRequest` event to the primary EventBridge bus for each unique user.
        *   This ensures that even if 10 webhook events for a single user were received in the 60-second window, only one `SyncRequest` event is published.
    5.  **Execution:** The consolidated event is routed to the SQS queue (`HotPathSyncQueue`) and processed by the standard "Hot Path" architecture.
*   **Advantage:** This model directly attacks the "event chatter" identified as a key cost driver in the financial model. By relying on native SQS FIFO features for buffering and deduplication, it provides a simpler, more robust, and more cost-effective solution compared to a custom implementation using Redis. It significantly reduces the volume of downstream EventBridge events and SQS messages.

## 3a. Unified End-to-End Idempotency Strategy

In a distributed, event-driven system, operations can be retried, making a robust idempotency strategy critical for data integrity. We will implement a unified strategy based on a client-generated idempotency key.

*   **[C-004] Header Specification:** The key **must** be passed in an `Idempotency-Key` HTTP header. The API Gateway will reject any request missing this header with a `400 Bad Request`.

*   **Key Generation:** The mobile client is responsible for generating a unique `Idempotency-Key` (e.g., a UUID) for each new state-changing operation. This same key **must** be used for any client-side retries of that same operation.

*   **Locking Mechanism:** Before starting any processing, the asynchronous worker (Fargate task) will attempt to acquire an exclusive lock using an atomic **`SET-if-not-exists`** operation against the central cache (Redis). This ensures that a job is processed at most once and handles race conditions where multiple workers attempt to process the same job simultaneously.

#### Post-MVP: Idempotency for Historical Syncs (Step Functions)
For long-running historical syncs, an additional layer of idempotency will be required at the orchestration level. The design for this is captured alongside the Historical Sync architecture in `45-future-enhancements.md`.

#### Idempotency via SQS FIFO Deduplication

To ensure jobs are processed exactly once while minimizing cost and complexity, the system will leverage the native deduplication feature of **Amazon SQS FIFO queues**. This is a more cost-effective and simpler approach than maintaining a separate locking mechanism in DynamoDB.

*   **Queue Type:** The `HotPathSyncQueue` will be converted from a Standard SQS queue to a FIFO queue.
*   **Deduplication ID:** The client-generated `Idempotency-Key` (passed in the API header) will be used as the `MessageDeduplicationId` when the message is sent to the SQS FIFO queue.
*   **Mechanism:** SQS FIFO queues automatically prevent messages with the same `MessageDeduplicationId` from being delivered more than once within the 5-minute deduplication interval. This guarantees that a retried API call from the client will not result in a duplicate job being processed.
*   **Benefit:** This approach eliminates an entire class of database operations (one write and potentially one read per job for locking), significantly reducing DynamoDB costs and simplifying the worker logic, as it no longer needs to manage a distributed lock. The trade-off is a lower maximum throughput for FIFO queues compared to Standard queues, but the 3,000 transactions per second (with batching) supported by FIFO is well above the system's NFRs.

## 3b. Architecture for 1M DAU

To reliably serve 1 million Daily Active Users, the architecture incorporates specific strategies for high availability, performance, and scalability. The title of this section reflects the ultimate goal, but the strategies described are phased, beginning with a pragmatic MVP.

### High Availability Strategy

#### MVP: Single-Region Architecture
To balance cost, complexity, and time-to-market for the MVP, the SyncWell backend will be deployed to a **single AWS region** (e.g., `us-east-1`).

*   **Intra-Region High Availability:** High availability will be achieved *within* the single region by deploying services across multiple Availability Zones (AZs).
    *   **Stateless Services:** API Gateway and AWS Lambda are inherently highly available across AZs.
    *   **Stateful Services:** The DynamoDB table and ElastiCache for Redis cluster will be configured for Multi-AZ deployment. This ensures that the failure of a single AZ does not result in a service outage.

#### Future: Multi-Region Architecture
The architecture is designed with a future multi-region deployment in mind. Key considerations for this evolution include:
*   **Data Replication:** Migrating from a single-region DynamoDB table to a Global Table.
*   **Request Routing:** Implementing latency-based routing with Amazon Route 53.
*   **Data Residency & Compliance (GDPR):** The future multi-region strategy **must** include a comprehensive plan for data residency, likely involving region-specific infrastructure silos or fine-grained data routing policies to ensure compliance. This will be a primary workstream when the multi-region expansion is prioritized.

### Resilience Testing (Chaos Engineering)

The practice of chaos engineering is critical. We will use the **AWS Fault Injection Simulator (FIS)** to validate our high availability.

*   **Ownership and Frequency:** Experiments will be owned by the Core Backend team and executed on a **bi-weekly basis** in the `staging` environment as part of the standard release cycle.
*   **MVP Experiment Catalog:**
    *   **Worker Failure:** Terminate a random percentage (10-50%) of Fargate tasks to ensure SQS retries and the remaining fleet can handle the load.
    *   **API Latency:** Inject a 500ms latency into calls from a worker Fargate task to a third-party API endpoint.
    *   **DynamoDB Latency:** Inject latency on DynamoDB reads/writes to test application-level timeouts.
    *   **Secrets Manager Unavailability:** Block access to AWS Secrets Manager to verify graceful failure and retry.
    *   **Availability Zone Failure:** Simulate the failure of a single AZ to validate Multi-AZ configurations.
    *   **Cache Cluster Failure:** Simulate a full failure of the ElastiCache cluster to verify that the system enters a safe, degraded mode.
*   **Results & Action:** The results of each experiment (e.g., observed impact on latency, error rates) **must** be documented in a central location (e.g., a Confluence page). Any discovered regressions or unexpected failures must be logged as high-priority bugs in the issue tracker and addressed before the next release.

### Performance & Scalability

#### Caching Strategy
A distributed cache using **Amazon ElastiCache for Redis** is a critical component. The system will employ a **cache-aside** pattern. If a cache write fails after a database read, the error will be logged, and the application will return the data to the client. The next read for that data will simply be another cache miss, ensuring resilience.

The following table details the specific items to be cached:

| Item Type | Key Structure | Value | TTL | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **API Gateway Authorizer (L1 Cache)** | User's Identity Token | The generated IAM policy document | 5 minutes | The primary, most critical cache. Caches the final authorization policy at the API Gateway level. |
| **JWT Public Keys (L2 Cache)**| `jwks##{providerUrl}` | The JSON Web Key Set (JWKS) document | 1 hour | An in-memory cache inside the authorizer Lambda to reduce latency on the first request for a user. **[R-002] Risk:** Caching keys creates a risk where a compromised and revoked key could be considered valid for up to 1 hour. **Mitigation:** The authorizer must include a mechanism to force-invalidate a specific cached key via an administrative action. |
| **User Sync Config** | `config##{userId}` | Serialized user sync configurations | 15 minutes | Reduces DynamoDB reads for frequently accessed user settings. |
| **Rate Limit Token Bucket** | `ratelimit##{...}` | A hash containing tokens and timestamp | 60 seconds | Powers the distributed rate limiter for third-party APIs. |
| **Negative Lookups** | e.g., `nosub##{userId}` | A special "not-found" value | 1 minute | Prevents repeated, fruitless queries for non-existent data (e.g., checking if a user has a Pro subscription). |
| **Sync Confidence** | `sync:confidence:{userId}:{destProvider}` | An integer counter for consecutive empty results. | 7 days | **Algorithmic Optimization:** Caches metadata about sync patterns to intelligently skip redundant API calls to destination providers, reducing latency, cost, and third-party API pressure. |

**Algorithmic Sync Optimization via "Sync Confidence"**

To improve the efficiency of the core sync algorithm, the system will employ a "Sync Confidence" caching strategy. The default sync behavior (as defined in `./05-data-sync.md`) fetches data from the destination provider to perform conflict resolution. However, this destination fetch is often unnecessary, and this optimization avoids that fetch under specific conditions.

*   **Implementation Details:**
    *   **Redis Cache:** The `WorkerFargateTask` will use Redis to store a simple integer counter.
    *   **Cache Key:** The key will follow the format `sync:confidence:{userId}:{destinationProvider}`.
    *   **Logic:**
        1.  **Strategy-Based Elimination:** Before a sync job, the worker will check the user's conflict resolution strategy. If it is `Prioritize Source`, the destination API call will be skipped entirely.
        2.  **Pattern-Based Elimination:** If the strategy requires a destination check, the worker will check the value of the Redis key. If the counter exceeds a configured threshold (e.g., 10 consecutive polls that returned no data), the destination API call will be skipped.
        3.  **Counter Management:** If the destination API is called and returns data, the counter is reset to 0. If it returns no data, the counter is incremented. If a `pushData` operation later fails due to a conflict (indicating the cache was wrong), the counter is also reset to zero, forcing a re-fetch on the next attempt.
    *   **Configuration:** The threshold for consecutive empty polls will be managed as an environment variable in the `WorkerFargateTask` to allow for tuning without code redeployment.

This strategy makes the sync algorithm adaptive, reducing redundant API calls for the majority of routine background syncs.

#### Rate-Limiting Backoff Mechanism
The following diagram shows how a worker interacts with the distributed rate limiter. If the rate limit is exceeded, the worker **must not** fail the job. Instead, it will use the SQS `ChangeMessageVisibility` API to return the job to the queue with a calculated delay, using an **exponential backoff with jitter** algorithm to avoid thundering-herd problems.

*   **[R-003] Failure Handling:** The `ChangeMessageVisibility` API call can itself fail. The worker **must** implement a retry-with-backoff loop for this specific API call. If it repeatedly fails to return the message to the queue, it must exit with a critical error to force a redrive to the DLQ, preventing an infinite loop and ensuring the job is not lost.

```mermaid
sequenceDiagram
    participant Worker as "Worker Fargate Task"
    participant Redis as "ElastiCache for Redis\n(Rate Limiter)"
    participant SQS as "SQS Queue"
    participant ThirdParty as "Third-Party API"
    Worker->>+Redis: Atomically check & decrement token
    alt Token Available
        Redis-->>-Worker: OK
        Worker->>+ThirdParty: GET /v1/data
        ThirdParty-->>-Worker: 200 OK
    else Token Not Available
        Redis-->>-Worker: FAIL
        Worker->>SQS: ChangeMessageVisibility(calculated_delay)
        note right of Worker: Return job to queue with<br>exponential backoff + jitter
    end
```

#### Load Projections & Scalability Model

*   **Governing NFR:** The system must be designed and load-tested to handle a peak load of **3,000 requests per second (RPS)**.
*   **Compute Model:** The sync engine's worker fleet will be implemented using **AWS Fargate**. This container-based approach is better suited for the constant, high-throughput nature of the workload compared to a Lambda-per-job model.
*   **Scalability Strategy:** An auto-scaling fleet of Fargate tasks will continuously poll the `HotPathSyncQueue` and process jobs in a loop. The fleet will scale based on the number of messages in the SQS queue, ensuring that we have enough capacity to handle peak load while scaling down to minimize costs during idle periods. This model provides a more cost-effective and predictable performance profile at scale, mitigating the risks associated with extreme Lambda concurrency.

#### Intelligent Worker Batching
To improve throughput and further reduce costs across compute, database, and networking, the `WorkerFargateTask` will be optimized to process jobs in batches.

*   **SQS Batch Polling:** Instead of receiving a single message, the worker will be configured to receive a batch of up to 10 messages from the `HotPathSyncQueue` in a single poll.
*   **Grouped Execution:** The worker will group the jobs from the batch by the third-party provider (e.g., all Fitbit jobs together). This enables more efficient execution by, for example, reusing a single authenticated HTTP client for multiple requests to the same provider.
*   **Batch and Conditional Database Writes:** When persisting metadata updates, the worker **must** use DynamoDB's `BatchWriteItem` operation to write multiple items in a single API call. Critically, to avoid costs from "empty" polls that find no new data, the worker **must not** perform a write operation for any sync job that results in zero new records being processed. This "write-avoidance" strategy significantly reduces the number of database writes at scale.
*   **Cascading Benefits:** This strategy reduces the per-job overhead, leading to lower Fargate compute times, fewer total API calls to DynamoDB, and potentially reduced data transfer.

#### Just-in-Time (JIT) Credential Caching

To further enhance performance and resilience, the `WorkerFargateTask` will implement a local, in-memory cache for user credentials (OAuth tokens). This is particularly effective in a high-throughput environment where the same "hot" users are processed by the same warm container multiple times.

*   **Problem:** Without a local cache, the worker must fetch credentials from AWS Secrets Manager for every user it processes. This adds latency to jobs and increases costs from Secrets Manager API calls.
*   **Mechanism:**
    *   **Cache Scope:** The cache will be implemented as a static, in-memory map within the worker's Java runtime, living for the lifetime of the warm container.
    *   **Cache Library:** A lightweight, well-tested library like **Google's Guava Cache** will be used to implement a size-limited (e.g., 1,000 entries), time-based LRU (Least Recently Used) cache.
    *   **Logic:** When a job is received, the worker will first attempt to retrieve credentials from the local cache. On a **cache miss**, it will fetch them from AWS Secrets Manager and populate the cache with a short TTL (e.g., 5 minutes) before proceeding. On a **cache hit**, the network call is avoided.
*   **Benefits:** This pattern significantly reduces API calls to Secrets Manager, which lowers direct costs, decreases job latency, and makes the worker fleet more resilient to transient issues with the Secrets Manager service.

#### Fargate "Warm Pool" for Improved Scale-Out Performance
To enable more aggressive scale-to-zero settings for the Fargate fleet (especially during off-peak hours) without sacrificing performance during traffic spikes, the architecture will include a "warm pool" strategy.

*   **Mechanism:** A low-priority SQS queue, named `WarmPoolQueue`, will be populated with a small, constant number of "dummy" or "no-op" jobs. The Fargate auto-scaling configuration will be set to target this queue in addition to the main `HotPathSyncQueue`.
*   **Behavior:** When the main queue is empty, workers will pull from the `WarmPoolQueue`. This ensures that a minimum number of Fargate tasks (and their underlying ENIs and container images) are always warm and ready to handle a sudden burst of real jobs.
*   **Benefit:** This trades a very small amount of "busy work" compute for significantly improved scale-out latency. It allows the main fleet to scale down to a lower baseline "desired count" and rely more heavily on cheaper Spot instances, knowing that replacements can be brought online and begin processing jobs much more quickly.

#### Intelligent Data Hydration (Metadata-First Fetch)
To minimize data transfer and processing costs, the sync algorithm will employ an "intelligent hydration" or "metadata-first" fetching strategy. This is particularly effective for data types with large, heavy payloads (e.g., GPX track for a workout, detailed heart rate time series).

*   **Problem:** A naive sync algorithm fetches the entire data payload from the source at the beginning of a job. If conflict resolution later determines the data is not needed (e.g., it already exists at the destination), the bandwidth (NAT Gateway cost) and compute (Fargate memory/CPU) used to download and process the heavy payload are wasted.
*   **Mechanism:** The sync process is split into a two-step fetch, as illustrated in the diagram below.
    1.  **Fetch Metadata:** The worker first calls the `DataProvider` to retrieve only the lightweight metadata for new activities (e.g., timestamps, IDs, type, duration).
    2.  **Conflict Resolution on Metadata:** The Conflict Resolution Engine runs using only this metadata to determine which activities definitively need to be written to the destination.
    3.  **Hydrate on Demand:** The worker then makes a second, targeted call to the `DataProvider` to fetch the full, heavy payloads *only* for the specific activities that it needs to write.
*   **Benefit:** This "lazy loading" of data payloads significantly reduces outbound data transfer through the NAT Gateway and lowers the memory and CPU requirements for the Fargate worker fleet. This is a crucial application-level optimization that reduces costs across multiple services. This requires a modification to the `DataProvider` interface to support a metadata-only fetch mode.
*   **Flow Diagram:**
    ```mermaid
    sequenceDiagram
        participant Worker as WorkerFargateTask
        participant Provider as DataProvider
        participant Engine as ConflictResolutionEngine

        Worker->>+Provider: fetchData(mode='metadata')
        Provider-->>-Worker: return List<ActivityMetadata>

        Worker->>+Engine: resolveConflicts(metadata)
        Engine-->>-Worker: return List<activityIdToHydrate>

        alt Has Data to Hydrate
            Worker->>+Provider: fetchPayloads(ids=...)
            Provider-->>-Worker: return List<FullActivity>
        end

        Worker->>Worker: Proceed to write hydrated data...
    ```

#### DynamoDB Capacity Model
We will use a **hybrid capacity model**. A baseline of **Provisioned Capacity** will be purchased (e.g., via a Savings Plan) to handle the predictable average load, with an initial estimate of covering **70% of expected peak usage**. **On-Demand Capacity** will handle any traffic that exceeds this provisioned throughput. This ratio will be tuned based on production traffic patterns.

#### Networking Optimization with VPC Endpoints
To enhance security and reduce costs, the architecture will use **VPC Endpoints**. This allows Lambda functions in the VPC to communicate with other AWS services using private IP addresses.
*   **Benefit:** This improves security by keeping traffic off the public internet and provides direct cost savings by minimizing billable traffic through the NAT Gateway. While interface endpoints have a small hourly cost, this is significantly cheaper than NAT Gateway data processing charges at scale, which can easily amount to thousands of dollars per month for a high-traffic application.

## 3c. DynamoDB Data Modeling & Access Patterns

To support the application's data storage needs efficiently and scalably, we will use a **single-table design** in DynamoDB. This modern approach to NoSQL data modeling minimizes operational overhead, reduces costs by optimizing read/write operations, and allows for complex access patterns with a single table.

Our primary data table will be named **`SyncWellMetadata`**. It will use a composite primary key and multiple Global Secondary Indexes (GSIs) to serve all required access patterns.

### Table Definition: `SyncWellMetadata`

*   **Primary Key:**
    *   **Partition Key (PK):** `USER#{userId}` - All data for a given user is co-located in the same partition.
    *   **Sort Key (SK):** A hierarchical string that defines the type of data and its relationships.
*   **Capacity Model:** The table will use a **hybrid capacity model**, consistent with the strategy in section 3b. A baseline of Provisioned Capacity will handle the average load, while On-Demand capacity will handle unpredictable spikes.
*   **Global Tables:** For the MVP, the table will exist in a single region.

### Item Types & Schema

| Entity | PK (Partition Key) | SK (Sort Key) | Key Attributes & Defined Values |
| :--- | :--- | :--- | :--- |
| **User Profile** | `USER#{userId}` | `PROFILE` | `SubscriptionLevel`: `FREE`, `PRO`<br>`CreatedAt`, `version` |
| **Connection** | `USER#{userId}` | `CONN#{connectionId}` | `Status`: `active`, `needs_reauth`, `revoked`<br>`CredentialArn`<br>**[C-007]** `ReAuthStatus`: `ok`, `pending_user_action`, `failed` |
| **Sync Config** | `USER#{userId}` | `SYNCCONFIG#{sourceId}##{dataType}` | `ConflictStrategy`: `source_wins`, `dest_wins`, `newest_wins`<br>`IsEnabled`, `version` |
| **Idempotency Lock** | `IDEM##{key}` | `IDEM##{key}` | `status`: `INPROGRESS`, `COMPLETED`<br>`ttl` |

**Note on Idempotency Lock:** For the primary "Hot Path" sync, idempotency is handled by the SQS FIFO queue's native content-based deduplication. The `Idempotency Lock` item defined here is reserved for other processes that may not use a FIFO queue, such as the post-MVP "Cold Path" historical sync workflow, which will require an explicit application-level locking mechanism.

**Note on Historical Sync Job Items:** Storing a potentially large number of `HISTORICAL` items for a post-MVP feature can degrade performance of core user profile lookups. The design for this is deferred to `45-future-enhancements.md`.

### Supporting Operational Access Patterns

Finding all connections that need re-authentication is a key operational requirement. A full table scan is inefficient and costly at scale. A GSI on a low-cardinality attribute like `Status` is also an anti-pattern.
*   **Optimized Strategy (Sparse GSI):** The best practice is to create a **sparse Global Secondary Index (GSI)**. We will add a `ReAuthStatus` attribute to `Connection` items only when `Status` becomes `needs_reauth`. The GSI will be keyed on this sparse `ReAuthStatus` attribute, making the query to find all affected users extremely fast and cost-effective.
*   **Fallback Strategy (Throttled Scan):** A scheduled, weekly background process will perform a low-priority, throttled `Scan` as a fallback mechanism to ensure no records are missed.
    *   **[T-003] Implementation:** The scan will be throttled by setting a small page size (e.g., 100 items) and introducing a fixed delay (e.g., 1 second) between each page request to consume minimal read capacity.

### Data Consistency and Conflict Resolution

*   **Distributed Locking for Idempotency:** As defined in Section 3a, all state-changing operations are protected by a distributed lock implemented using DynamoDB's conditional `PutItem` calls on an `IDEM#` item. This is the **single, authoritative** locking mechanism for the system.
*   **Optimistic Locking with Versioning:** To prevent lost updates during concurrent writes, optimistic locking **must** be used for all updates to `PROFILE` and `SYNCCONFIG` items. This will be implemented by adding a `version` number attribute and using a condition expression on update to ensure the `version` has not changed since the item was read.

### Mitigating "Viral User" Hot Partitions

A "hot partition" for a viral user is a significant risk. This is considered a post-MVP concern, but the high-level strategy is to automate the migration of that user to a dedicated table. The design is captured in `../prd/45-future-enhancements.md`.

### Degraded Mode and Cache Resilience
The strategy for handling a full failure of the ElastiCache cluster is detailed in section 3b. The key impacts on DynamoDB are:
*   **Increased Read Load:** All reads will miss the cache and hit DynamoDB directly. The hybrid capacity model is designed to absorb this, but latency will increase.
*   **Disabled Rate Limiting:** The most critical function of the cache is rate limiting. As noted in 3b, if the cache is down, workers will not call third-party APIs. This introduces a risk: if distributed locking were also Redis-based, multiple workers could make concurrent calls for the same job when the cache comes back online, violating API rate limits. By consolidating locking in DynamoDB, we mitigate this specific risk.

## 3d. Core API Contracts

To ensure clear communication between the mobile client and the backend, we define the following core API endpoints. **API Versioning Strategy:** The API will be versioned via the URL path (e.g., `/v1/...`). This approach was chosen over header-based versioning for its simplicity and ease of browsing. A full OpenAPI 3.0 specification will be maintained as the single source of truth.

### GET /v1/connections

Retrieves a list of all third-party applications the user has connected.

*   **Success Response (200 OK):**
    ```json
    {
      "connections": [
        {
          "connectionId": "conn_12345_providerA",
          "provider": "strava",
          "displayName": "Strava",
          "providerIconUrl": "https://.../strava_icon.png",
          "status": "active"
        }
      ]
    }
    ```

### POST /v1/sync-jobs

Initiates a new synchronization job for a user.

*   **Headers:** `Idempotency-Key: <UUID>` (Required)
*   **Request Body:**
    ```json
    {
      "sourceConnectionId": "conn_12345_providerA",
      "destinationConnectionId": "conn_67890_providerB",
      "dataType": "workout",
      "mode": "manual",
      "priority": "high",
      "dateRange": { "startDate": "2023-01-01", "endDate": "2023-12-31" }
    }
    ```
    *   **`dataType` (enum):** `workout`, `sleep_session`, `steps`, `weight`. Must align with `CanonicalData` models.
    *   **`mode` (enum):** `manual` (hot path), `historical` (cold path).
    *   **`priority` (enum):** `high`, `medium`, `low`. This field is used by the distributed rate-limiter to prioritize jobs when the API budget is low. Defaults to `medium` if not provided.
    *   **`dateRange` (object):** Required if and only if `mode` is `historical`.

*   **Success Response (202 Accepted):** Returns the `jobId` for tracking.
    ```json
    {
      "jobId": "job_abc123",
      "status": "QUEUED"
    }
    ```
    *   **[C-008] `jobId` Format:** The `jobId` **must** be a UUIDv4 prefixed with `job_`.

### GET /v1/sync-jobs/{jobId}

This endpoint **must** be implemented to allow clients to poll for the status of a historical sync job.

*   **Success Response (200 OK):**
    ```json
    {
      "jobId": "job_abc123",
      "status": "SUCCEEDED",
      "progress": {
        "totalChunks": 52,
        "processedChunks": 52,
        "failedChunks": 0
      }
    }
    ```

### PUT /v1/users/me/settings

*   **Request Body:** A flexible object containing key-value pairs for user settings.
    ```json
    {
      "settings": {
        "conflictResolutionStrategy": "AI_POWERED_MERGE",
        "notificationsEnabled": true
      }
    }
    ```

### POST /v1/export-jobs

Initiates an asynchronous job to export all user-related data. Notification will be delivered via **push notification**.

*   **Success Response (202 Accepted):**
    ```json
    {
      "jobId": "export-job-abc123",
      "status": "PENDING"
    }
    ```

### GET /v1/export-jobs/{jobId}

Checks the status of a data export job.
*   **Export Format:** A **ZIP archive** containing a set of JSON files, one for each canonical data type.
*   **URL TTL:** The pre-signed download URL will have a TTL of **1 hour**.

*   **Success Response (200 OK):**
    ```json
    {
      "jobId": "export-job-abc123",
      "status": "SUCCEEDED",
      "downloadUrl": "https://s3-presigned-url/...",
      "expiresAt": "2023-10-27T15:00:00Z"
    }
    ```

### DELETE /v1/connections/{connectionId}

**[C-009]** De-authorizes a specific third-party connection. This action is irreversible. It will revoke the stored credentials and delete all sync configurations that depend on this connection.

*   **Success Response (204 No Content):** Returns an empty body on successful de-authorization.

### DELETE /v1/users/me

Permanently deletes a user's account and all associated data. This is an irreversible, asynchronous action. For the MVP, there is no callback mechanism to confirm completion; the client should treat the account as deleted upon receiving the `202 Accepted` response.

## 3e. Canonical Data Models

To handle data from various third-party sources, we must first transform it into a standardized, canonical format. This allows our sync engine and conflict resolution logic to operate on a consistent data structure, regardless of the source. The definitive schemas are implemented as Kotlin `data class`es in the KMP shared module and versioned in the AWS Glue Schema Registry.

### `CanonicalWorkout`

```kotlin
@Serializable
data class CanonicalWorkout(
    // ...
// The IANA timezone identifier (e.g., "America/New_York"). If null, the system will process the event assuming UTC. It will also publish a custom CloudWatch metric (`InvalidTimezoneData_Omitted`) with the provider's name as a dimension. This allows for automated monitoring and alerting on data quality issues from specific sources.
    val timezone: String? = null,
    // ...
    // Optional free-text notes. High-risk for PII. This field MUST be scrubbed by the AnonymizerProxy before being sent to any AI service.
    val notes: String? = null
) : CanonicalData
```

### `ProviderTokens`

```kotlin
// CRITICAL SECURITY NOTE: This data class holds sensitive credentials.
// It MUST NOT be annotated with @Serializable.
// Its toString() method MUST be overridden to redact token values.
// [C-010] A custom static analysis rule (linter) using Detekt MUST be implemented to enforce this.
data class ProviderTokens(
    val accessToken: String,
    val refreshToken: String? = null,
    val expiresInSeconds: Long,
    // The time the token was issued, in epoch seconds.
    // [R-004] MUST be generated using a reliable, centralized time source (e.g., NTP) to mitigate the risk of clock skew/drift between distributed components.
    val issuedAtEpochSeconds: Long,
    val scope: String? = null
)
```
*Note: Other canonical models, like `CanonicalSleepSession`, have been moved to Appendix C to reduce clutter in the main PRD.*

### 3f. Automatic Sync Scheduling Architecture

To align infrastructure costs with revenue and provide a premium experience for paying users, a **tiered sync frequency** model will be implemented. This will be achieved using a scalable fan-out pattern for both `PRO` and `FREE` user tiers, with different scheduling intervals.

*   **Core Components:**
    *   **Master Schedulers (EventBridge Rules):** Two separate EventBridge Rules will be created:
        *   **Pro Tier Scheduler:** Runs on a fixed **15-minute schedule** (`cron(0/15 * * * ? *)`).
        *   **Free Tier Scheduler:** Runs **once per day** (`cron(0 12 * * ? *)`).
    *   **Scheduler State Machine (AWS Step Functions):** A single, reusable state machine will orchestrate the process of finding and enqueuing sync jobs. It will be triggered by both schedulers.

*   **Workflow:**
    1.  **Trigger:** The appropriate Master Scheduler (Pro or Free) triggers the state machine, passing in the `tier` (`PRO` or `FREE`) as a parameter.
    2.  **Fan-Out:** The state machine calculates the number of shards to process based on configuration in AWS AppConfig.
    3.  **Process Shards in Parallel (`Map` State):** The state machine uses a `Map` state to invoke a `ShardProcessorLambda` for each shard in parallel, passing the `tier` along. A shard is a logical segment of the user base, calculated as `shard = hash(userId) % total_shards`.
        *   **[C-011] Hashing Algorithm:** The hashing algorithm **must** be a high-quality, deterministic, non-cryptographic algorithm. **Murmur3** is the recommended choice.
    4.  **Shard Processor Lambda:** Each invocation is responsible for a single shard and a single tier.
        a. **Query for Eligible Users:** It queries a dedicated GSI on the `SyncWellMetadata` table to find all users in its shard and tier who are eligible for a sync. The GSI must be defined to support this query efficiently:
            *   **GSI Partition Key:** `SyncTierShardId` (e.g., `PRO#5`, `FREE#12`)
            *   **GSI Sort Key:** `NextSyncTimestamp`
        b. **Enqueue Jobs:** For each eligible user, it publishes a `HotPathSyncRequested` event to the EventBridge Event Bus.
    5.  **Job Processing:** The events are routed to the SQS queue and consumed by the Fargate worker fleet.

*   **Scalability and Resilience:** This architecture is highly scalable by increasing the number of shards. The use of Step Functions provides built-in retries and error handling for the scheduling process itself. This design also significantly reduces the workload generated by free users, lowering overall system load and cost.

The following diagram illustrates this scalable, tiered fan-out architecture.

#### Tiered Polling with Pre-flight Checks

For providers that do not support webhooks, a simple polling approach is inefficient. To solve this, the architecture uses a highly cost-effective, two-tiered polling strategy that combines adaptive scheduling with "pre-flight checks" to avoid triggering expensive compute for unnecessary work.

*   **Tier 1: Adaptive Scheduling with SQS Delay Queues:** The system avoids using expensive, fixed-schedule services. Instead, after a sync job completes, it analyzes the user's "sync velocity" and dynamically enqueues the *next* poll job for that user back into an SQS queue with a calculated `DelaySeconds`. An active user might be re-queued with a 15-minute delay, while an inactive user might be re-queued with a 24-hour delay. This adaptive model dramatically reduces the number of polls for inactive users.

*   **Tier 2: Pre-flight Check Lambda:** The SQS message from Tier 1 does not trigger the main Fargate worker fleet directly. Instead, it triggers a new, ultra-lightweight, and low-cost Lambda function: the `PollingPreflightChecker`.
    *   **Purpose:** This Lambda's sole responsibility is to perform a cheap "pre-flight check" to see if there is any new data at the source provider *before* initiating a full sync.
    *   **Mechanism:** It invokes a new, minimal method on the relevant `DataProvider` (e.g., `hasNewData()`) which makes a single, lightweight API call to the source (e.g., a `HEAD` request or a query for `count > 0`).
    *   **Conditional Invocation:**
        *   If new data **exists**, the pre-flight checker publishes a `HotPathSyncRequested` event to the main SQS queue, which is processed by the powerful `Worker Fargate Task` as usual.
        *   If no new data **exists**, the Lambda does nothing and terminates. The cost of this check is a tiny fraction of a full Fargate task invocation.

*   **Benefit:** This two-tiered model is exceptionally cost-effective. Tier 1 (adaptive SQS delays) reduces the total number of polls. Tier 2 (pre-flight checks) ensures that the polls that *do* run only trigger the expensive compute and database resources when there is actual work to be done. This eliminates the vast majority of "empty" sync jobs, saving significant costs on Fargate, DynamoDB, and CloudWatch.
*   **Flow Diagram:** The following sequence diagram illustrates this two-tiered polling flow.
    ```mermaid
    sequenceDiagram
        participant Scheduler as Adaptive Scheduler (SQS Delay)
        participant Checker as PollingPreflightChecker (Lambda)
        participant SourceAPI as Source Provider API
        participant MainQueue as Main SQS Queue
        participant Worker as WorkerFargateTask

        Scheduler->>+Checker: Invoke with user context
        Checker->>+SourceAPI: hasNewData(since=...)?
        SourceAPI-->>-Checker: true / false

        alt New Data Exists
            Checker->>MainQueue: Enqueue HotPathSyncRequested job
            MainQueue-->>+Worker: Invoke worker
            Worker-->>-MainQueue: Process and complete
        else No New Data
            Checker-->>Scheduler: End (do nothing)
        end
    ```

*(See Diagram 6 in the "Visual Diagrams" section below.)*

### 3g. Client-Side Persistence and Offline Support Strategy

To provide a responsive user experience and basic functionality when the user's device is offline, the mobile application will employ a client-side persistence strategy using the **SQLDelight** database.

*   **Purpose of the Local Database:**
    *   **Configuration Cache:** The local database will act as a cache for the user's connections and sync configurations. This allows the UI to load instantly without waiting for a network call to the backend. The backend remains the single source of truth.
    *   **Offline Action Queue (Write-Ahead Log):** When a user performs a state-changing action while offline (e.g., creating a new sync configuration, disabling an existing one), the action will be saved to a dedicated "actions" table in the local database. This table acts as a write-ahead log of commands to be sent to the backend.
    *   **[C-012] Table Schema (`OfflineAction`):**
        ```sql
        CREATE TABLE OfflineAction (
            id TEXT NOT NULL PRIMARY KEY, -- A client-generated UUID
            endpoint TEXT NOT NULL,       -- e.g., "POST /v1/sync-configs"
            payload TEXT NOT NULL,        -- JSON-serialized request body
            idempotencyKey TEXT NOT NULL, -- The Idempotency-Key for the request
            createdAt INTEGER NOT NULL    -- Unix timestamp
        );
        ```

*   **Offline Support Workflow:**
    1.  The user opens the app while offline. The UI is populated from the local SQLDelight cache, showing the last known state.
    2.  The user creates a new sync configuration. The app immediately updates the local UI to reflect this change and writes a `CREATE_SYNC_CONFIG` command to the local "actions" table.
    3.  The user can continue to queue up actions (create, update, delete) while offline.

*   **Data Reconciliation on Reconnection:**
    1.  When the application detects that network connectivity has been restored, it will initiate a reconciliation process.
    2.  It will read the queued commands from the "actions" table in the order they were created.
    3.  For each command, it will make the corresponding API call to the backend (e.g., `POST /v1/sync-configs`). The client will use the `Idempotency-Key` it generated and stored offline for each action.
    4.  **Conflict Handling:** If an API call fails due to a state conflict (e.g., a 409 Conflict or 404 Not Found), the client will not retry the command. It will discard the local action, log the conflict for diagnostic purposes, and rely on the final fetch of the latest state (Step 6) to resolve the UI. This "backend wins" strategy is the simplest and most robust approach for handling configuration data.
    5.  Once the backend confirms the action was successful, the command is removed from the local "actions" table.
    6.  After all queued actions are processed, the client will fetch the latest state from the backend to ensure it is fully in sync with the source of truth.

This strategy ensures that the app remains responsive and that user actions are not lost during periods of no connectivity.

## 4. Technology Stack & Rationale

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Authentication Service** | **Firebase Authentication** | **Rationale vs. Amazon Cognito:** While Amazon Cognito is a native AWS service, Firebase Authentication has been chosen for the MVP due to its superior developer experience, higher-quality client-side SDKs (especially for social logins on iOS and Android), and more generous free tier. This choice prioritizes rapid development and a smooth user onboarding experience. The cross-cloud dependency is an acceptable trade-off for the MVP, but a migration to Cognito could be considered in the future if the benefits of a single-cloud solution outweigh the advantages of Firebase's SDKs. **Dependency Risk:** This introduces a hard dependency on Google Cloud. An outage in Firebase Authentication would prevent all users from logging in, even if the AWS backend is healthy. This risk is formally accepted by the product owner. |
| **Cross-Platform Framework** | **Kotlin Multiplatform (KMP)** | **Code Reuse & Performance.** KMP allows sharing the complex business logic (sync engine, data providers) between the mobile clients and the backend. The KMP/JVM runtime will be packaged in a container for the asynchronous `WorkerFargateTask`. For latency-sensitive functions that are not part of the worker fleet (e.g., the `AuthorizerLambda`), a faster-starting runtime like TypeScript or Python must be used to meet strict latency SLOs. **[NEEDS_CLARIFICATION: Q-04]** The engineering team must formally confirm their acceptance of the added complexity of maintaining a separate runtime and toolchain for these specific functions. |
| **On-Device Database** | **SQLDelight** | **Cross-Platform & Type-Safe.** Generates type-safe Kotlin APIs from SQL, ensuring data consistency across iOS and Android. |
| **Primary Database** | **Amazon DynamoDB with Global Tables** | **Chosen for its virtually unlimited scalability and single-digit millisecond performance required to support 1M DAU. The single-table design enables efficient, complex access patterns. We use On-Demand capacity mode, which is the most cost-effective choice for our unpredictable, spiky workload, as it automatically scales to meet traffic demands without the need for manual capacity planning. Global Tables provide the multi-region, active-active replication needed for high availability and low-latency access for our global user base.** |
| **Backend Compute** | **AWS Fargate on Graviton (ARM64)** | **Container-based Compute for High Throughput.** The asynchronous worker fleet will be run as a container-based service on **AWS Fargate**, standardized on the **`arm64` (AWS Graviton) architecture**. For a constant, high-throughput workload like our sync engine, Fargate is significantly more cost-effective than a Lambda-per-job model. It avoids the high costs associated with massive Lambda concurrency and provides more predictable performance for long-running tasks. To further optimize costs, the fleet will use a mix of capacity providers: primarily **Fargate Spot** (e.g., 90% of tasks) for maximum savings, with a small baseline of **Fargate On-Demand** tasks (e.g., 10%) to guarantee capacity. The architecture's use of SQS for buffering makes the workload inherently fault-tolerant and ideally suited for interruptible Spot instances. The worker application will be packaged into a Docker image and run as an auto-scaling fleet of Fargate tasks that continuously poll the SQS queue. |
| **Schema Governance** | **AWS Glue Schema Registry** | **Data Integrity & Evolution.** Provides a managed, centralized registry for our canonical data schemas. Enforces backward-compatibility checks in the CI/CD pipeline, preventing breaking changes and ensuring system stability as new data sources are added. |
| **Distributed Cache** | **Amazon ElastiCache for Redis** | **Performance & Scalability.** Provides a high-throughput, low-latency in-memory cache for reducing database load and implementing distributed rate limiting. |
| **AI & Machine Learning (Future)** | **Amazon SageMaker, Amazon Bedrock** | **Rationale for Future Use:** When we implement AI features, these managed services will allow us to scale without managing underlying infrastructure, reducing operational overhead and allowing focus on feature development. |
| **Secure Credential Storage** | **AWS Secrets Manager** | **Security & Manageability.** Provides a secure, managed service for storing, rotating, and retrieving the OAuth tokens required by our backend workers. Replicated across regions for high availability. |
| **Configuration Management & Feature Flagging** | **AWS AppConfig** | **Operational Agility & Safety.** We will adopt AWS AppConfig for managing dynamic operational configurations (like log levels or API timeouts) and feature flags. This allows for safe, audited changes without requiring a full code deployment, significantly improving operational agility and reducing release risk. |
| **Infrastructure as Code** | **Terraform** | **Reproducibility & Control.** Manages all cloud infrastructure as code, ensuring our setup is version-controlled and easily reproducible. |
| **Web Application Firewall** | **AWS WAF** | **Protection Against Common Exploits.** A foundational security layer that sits in front of API Gateway to protect against common web exploits like SQL injection, cross-site scripting, and bot traffic. |
| **CI/CD**| **GitHub Actions** | **Automation & Quality.** Automates the build, test, and deployment of the mobile app and backend services, including security checks. |
| **Monitoring & Observability** | **AWS CloudWatch, AWS X-Ray** | **Operational Excellence.** Provides a comprehensive suite for logging, metrics, tracing, and alerting, enabling proactive issue detection and performance analysis. |
| **Local Development** | **LocalStack** | **High-Fidelity Local Testing.** Allows engineers to run and test the entire AWS serverless backend on their local machine, drastically improving the development and debugging feedback loop. |
| **Load Testing** | **k6 (by Grafana Labs)** | **Validate Scalability Assumptions.** A modern, scriptable load testing tool to simulate traffic at scale, identify performance bottlenecks, and validate that the system can meet its 1M DAU target. |

## 5. Cost-Effectiveness and Financial Modeling

A detailed financial model is a mandatory prerequisite before implementation.

**Primary Cost Drivers:**
1.  **AWS Fargate:** As the primary compute service for the worker fleet, Fargate will be a major cost driver. Costs are based on vCPU and memory consumption over time. This model is more cost-effective than Lambda for our high-throughput workload.
2.  **Cross-Region Data Transfer:** The multi-region architecture incurs data transfer costs for every write operation across all replicated services:
    *   **DynamoDB Global Tables:** Every write, update, or delete is replicated and billed.
    *   **AWS Secrets Manager:** Replicating secrets incurs costs.
3.  **CloudWatch:** At scale, the volume of logs, metrics, and traces generated will be massive and will be a major operational expense.
4.  **NAT Gateway:** Outbound traffic from Lambda functions in a VPC to **third-party APIs** will incur data processing charges. (Note: Traffic to internal AWS services will use VPC Endpoints to minimize this cost).

**Cost Management Strategy:**
*   **Mandatory Financial Modeling:** Develop a detailed cost model using the AWS Pricing Calculator for the 3,000 RPS Fargate-based, multi-region architecture.
*   **Aggressive Log Management:** Implement dynamic log levels via AppConfig, set short retention periods in CloudWatch, and automate archiving to S3/Glacier.
*   **Explore Savings Plans:** As usage becomes more predictable, a Compute Savings Plan can significantly reduce Fargate and Lambda costs.
*   **Cost Anomaly Detection:** Configure AWS Cost Anomaly Detection to automatically alert the team to unexpected spending.
*   **Optimize VPC Networking:** Implement VPC Endpoints for all internal AWS service communication to minimize data transfer costs through the NAT Gateway.

## 6. Security, Privacy, and Compliance

### Security Measures

*   **Data Encryption in Transit:** All network traffic will use TLS 1.2+. Certificate Pinning will be implemented for API calls to our own backend. The operational risk of this will be managed via a documented, automated rotation plan with a 90-day cycle.
*   **Data Encryption at Rest:** All data at rest in AWS is encrypted by default using AWS-managed keys (KMS). This includes DynamoDB tables, S3 buckets, and ElastiCache snapshots. On-device, sensitive data is stored in the native Keychain (iOS) or Keystore (Android).
*   **Access Control and Least Privilege:**
    *   **Secure Authorizer Implementation:** The `AuthorizerLambda` **must** use **AWS Lambda Powertools** to handle the complexities of JWT validation, including fetching the JWKS, validating the signature, and checking standard claims.
    *   **Granular IAM Roles:** Each compute component has its own unique IAM role with a narrowly scoped policy.
    *   **Resource-Based Policies:** Where applicable, resource-based policies are used as an additional layer of defense.
*   **Egress Traffic Control (Hybrid Firewall Model):** To balance cost and security, outbound traffic from the VPC is routed through a hybrid firewall model. This model uses separate egress paths depending on the destination's trust level and traffic volume.
    *   **High-Security Path (AWS Network Firewall):** All outbound traffic to unknown, lower-volume, or security-sensitive endpoints is routed through an **AWS Network Firewall**. This provides advanced features like intrusion prevention and deep packet inspection, ensuring the highest level of security.
    *   **Cost-Optimized Path (AWS NAT Gateway):** High-volume, trusted traffic to the primary, well-known API endpoints of major partners (e.g., Fitbit, Strava, Garmin) is routed through a separate, standard **AWS NAT Gateway**. This path is secured via VPC route tables and network ACLs.
    *   **Justification:** This hybrid approach provides significant cost savings by routing the bulk of the data through the much cheaper NAT Gateway, while preserving the advanced security features of the Network Firewall for traffic that requires it. This is a pragmatic trade-off between cost and risk.
*   **Code & Pipeline Security:** Production builds will be obfuscated. Dependency scanning (Snyk) and SAST will be integrated into the CI/CD pipeline, failing the build on critical vulnerabilities. Any new AI frameworks must undergo a formal security review, which includes threat modeling and a review by the security team, before being integrated.

### Compliance
*   **Data Handling and Ephemeral Processing:** User health data is only ever processed **ephemerally in memory**. The maximum lifetime for data in-flight is guaranteed to be **under 5 minutes** by enforcing this as the maximum task duration for Fargate tasks.
*   **HIPAA Alignment:** While not formally HIPAA certified, the architecture is designed to align with HIPAA's technical safeguards. This claim **must be validated by a third-party compliance expert** before any public statements are made.
*   **GDPR & CCPA:** The architecture is designed to be compliant by enforcing data minimization and user control.
*   **Audit Trails:** All administrative actions are logged via **AWS CloudTrail**. Critical alerts **must** be configured for suspicious administrative actions (e.g., disabling CloudTrail, modifying critical IAM policies).

### Data Anonymization for Analytics and AI

A dual-pronged data anonymization strategy will be implemented.

#### Real-Time Anonymization for Operational AI
A dedicated **Anonymizer Proxy Lambda** will be used for real-time operational features.
*   **Testability and Observability:** The Anonymizer Proxy is a critical component and **must** have its own suite of unit and integration tests. Its latency and error rate will be monitored with dedicated CloudWatch Alarms.
*   **Latency SLO:** The P99 latency for the proxy itself is an SLO that **must be under 50ms** and will be tracked on a dashboard.
*   **PII Stripping Strategy:** The following table defines the PII stripping strategy. **[C-006]** This list represents the comprehensive set of rules to be applied across all canonical models before any user data is processed by an AI service. This process is a critical security control.

| Field (from any Canonical Model)                | Action      | Rationale                                                                                                                              |
| :---------------------------------------------- | :---------- | :------------------------------------------------------------------------------------------------------------------------------------- |
| `userId`                                        | **Remove**  | The internal user ID is a direct identifier and must be removed. The AI service should operate on data from a single user at a time, without needing to know their ID. |
| `sourceId`                                      | **Hash**    | Hashed with a per-user salt to prevent reverse-engineering while maintaining referential integrity for a given user's data.              |
| `recordId`                                      | **Remove**  | The unique ID for a specific data record (e.g., a single workout) is an unnecessary tracking vector and must be removed.                 |
| `title`                                         | **Remove**  | High-risk for free-text PII (e.g., "Run with Jane Doe").                                                                                 |
| `notes`                                         | **Remove**  | High-risk for free-text PII.                                                                                                           |
| `latitude`, `longitude` (and all other location data) | **Generalize**| Convert specific GPS coordinates to a general region (e.g., "San Francisco, CA") or remove entirely. Start and end points of a workout are especially sensitive. |
| `startTime`, `endTime`                          | **Generalize**| Round timestamps to the nearest 15 minutes to obscure precise start/end times of activities, which can reveal sensitive user patterns. |
| `heartRateSamples`                              | **Aggregate** | Replace detailed timeseries data with summary statistics (e.g., `avg`, `min`, `max`). The raw series could potentially be used to identify a user.                    |
| `stepsTimeseries`                               | **Aggregate** | Replace detailed intra-day step counts with hourly or daily totals to obscure fine-grained activity patterns.                            |
| `sleepStages`                                   | **Aggregate** | Replace detailed sleep stage data (e.g., timestamps of REM, deep, light) with total durations for each stage.                            |
| `calories`                                      | **Keep**    | Generally not considered PII in isolation.                                                                                             |
| `steps` (daily total)                           | **Keep**    | Generally not considered PII in isolation.                                                                                             |
| `distance`                                      | **Keep**    | Generally not considered PII in isolation.                                                                                             |
| `weightKg`                                      | **Keep**    | A user's weight is not considered PII in isolation.                                                                                    |
| `bodyFatPercentage`                             | **Keep**    | A user's body fat percentage is not considered PII in isolation.                                                                       |
| `bmi`                                           | **Keep**    | A user's BMI is not considered PII in isolation.                                                                                       |
| `deviceName`                                    | **Remove**  | Can contain user's name (e.g., "John's iPhone").                                                                                       |
| `weatherInfo`                                   | **Generalize**| Keep general weather (e.g., "Cloudy"), but remove specific temperature or location details that could narrow down the user's location. |
| `sourcePayload`                                 | **Remove**  | The original, raw payload from the third-party provider must be removed as it may contain unexpected PII not mapped to the canonical model. |
*   **Privacy Guarantee:** This proxy-based architecture provides a strong guarantee that no raw user PII is ever processed by the AI models.

#### Batch Anonymization for Analytics
For analytics, **Amazon Kinesis Data Firehose** will be used.
*   **Buffering and Batching:** Firehose will be configured with a **buffer interval of 60 seconds** and a **buffer size of 5MB**.
*   **On-the-fly Transformation:** Before delivery, Firehose will invoke an Anonymization Lambda to strip PII from each record.

### Comprehensive Monitoring, Logging, and Alerting Framework

*   **Logging Strategy:**
    *   A standardized, **structured JSON logging** format will be enforced using **AWS Lambda Powertools**.
    *   **Log Schema:** The core JSON schema will include: `timestamp`, `level` (e.g., INFO, ERROR), `service` (e.g., "worker-lambda"), `correlationId`, `message`, and a `payload` object for contextual data.
    *   **Scrubbing:** The process for scrubbing PII from logs **must be tested and audited** as part of the QA cycle for any feature that introduces new log statements.

*   **Tiered & Sampled Log Ingestion:** To manage the significant cost of log ingestion at scale, the system will implement a context-aware, tiered sampling strategy. This approach directly links observability costs to revenue by providing different levels of logging fidelity for different user tiers, while ensuring full diagnostic data is always available for failures.
    *   **Baseline Strategy (Head/Tail Sampling):** The core of the strategy is "head/tail" sampling. Logs for each job are buffered in memory within the worker. If the job fails at any point, all buffered logs for that specific execution are ingested into CloudWatch. This guarantees 100% diagnostic visibility for all errors, for all users.
    *   **Tiered Sampling for Success Cases:** For jobs that complete successfully, the decision to ingest the buffered logs is based on the user's subscription tier. This aligns infrastructure costs with business value.
        *   **`PRO` Tier:** Paying users receive a high-fidelity experience. The sampling rate is generous (e.g., 1 in 100 successful jobs are logged) to support premium customer service.
        *   **`FREE` Tier:** Non-paying users receive a lower-fidelity experience. The sampling rate is aggressive (e.g., 1 in 10,000 successful jobs are logged) to minimize costs.
    *   **Dynamic Configuration:** The specific sampling rates for each tier (`pro`, `free`) **must** be managed via AWS AppConfig, allowing for dynamic tuning without a code deployment.
    *   **Benefit:** This tiered approach provides the greatest cost reduction by targeting the highest volume of events (successful jobs from free users) while retaining full observability for failures and for paying customers. It treats observability as a feature with distinct service levels, not just a fixed operational cost.
    *   **Logic Flow:** The following diagram illustrates the decision-making process within a worker for each completed job.
        ```mermaid
        graph TD
            A[Sync Job Completes] --> B{Job Succeeded?};
            B -- No --> C[Ingest 100% of<br>Buffered Logs to CloudWatch];
            B -- Yes --> D{User is PRO Tier?};
            D -- Yes --> E[Get PRO Sampling Rate<br>e.g., 1/100];
            D -- No --> F[Get FREE Sampling Rate<br>e.g., 1/10,000];
            E --> G{Apply Sampling Logic<br>hash(jobId) % rate == 0?};
            F --> G;
            G -- Yes --> H[Ingest Buffered Logs<br>to CloudWatch];
            G -- No --> I[Discard Logs];
        ```
*   **Dynamic X-Ray Trace Sampling:** By default, AWS X-Ray traces every request, which can be costly at scale. To manage this, the system will implement dynamic sampling. A low default sampling rate (e.g., 1 request per second and 5% of all requests) will be configured for the main API Gateway stage. This captures a baseline for performance monitoring. Additionally, specific, higher-volume sampling rules will be applied to critical user flows (e.g., new user sign-up, payment processing) to ensure full visibility into key interactions. This approach significantly reduces cost while retaining deep observability where it is most needed.
*   **Key Metrics & Alerting:**
    *   **Idempotency Key Collisions:** This will be tracked via a custom CloudWatch metric published using the **Embedded Metric Format (EMF)** from the worker Fargate task. An alarm will trigger on any anomalous spike.
    *   **KPIs:** In addition to system metrics, we will track business and product KPIs. The following table provides a more complete view.

| KPI Metric Name | User Story | Business Goal | Description | Threshold / Alert |
| :--- | :--- | :--- | :--- | :--- |
| `ActivationRate` | US-01 | Growth | % of new users who complete onboarding and connect one provider. | Track weekly cohort data. |
| `ProTierConversionRate`| US-20 | Monetization | % of free users who convert to the Pro tier within 30 days. | Track monthly cohort data. |
| `SyncSuccessRate` | US-05 | Trust & Reliability | % of sync jobs that complete successfully. | Alert if < 99.9% over 15 mins. |
| `P95_ManualSyncLatency` | US-06 | Engagement | 95th percentile latency for a manual sync. | Alert if > 15 seconds. |
| `HistoricalSyncThroughput`| US-10 | Retention | Days of data processed per minute during historical sync. | Alert if drops by >25% WoW. |
| `ChurnRate` | - | Retention | % of users who uninstall or delete their account. | Track monthly. |

## 7. Open-Source Tools and Packages

| Category | Tool/Package | Description |
| :--- | :--- | :--- |
| **Mobile Development** | **Kotlin Multiplatform** | Core framework for sharing code. |
| | **SwiftUI / Jetpack Compose** | Modern UI frameworks for iOS and Android. |
| | **SQLDelight** | KMP library for type-safe SQL. |
| | **Ktor** | KMP HTTP client. |
| **Backend Development** | **AWS Fargate, SQS, DynamoDB** | Core AWS services for the serverless backend. |
| | **Terraform** | Infrastructure as Code tool. |
| **Testing** | **JUnit, XCTest, Espresso, MockK, Turbine** | Standard libraries for unit, UI, and integration testing. |
| | **k6** | Modern, scriptable load testing tool. |
| **CI/CD** | **GitHub Actions, Fastlane** | CI/CD platform and mobile release automation. |
| **Monitoring** | **OpenTelemetry** | Vendor-neutral standard for instrumentation. |
| | **Prometheus / Grafana** | Alternative/complement to CloudWatch for advanced metrics and dashboards. |
| **Local Development** | **LocalStack** | High-fidelity emulator for local AWS development. |
| **Static Analysis** | **Detekt, SwiftLint** | Static analysis tools for Kotlin and Swift. |
| **Dependency Scanning** | **Snyk, Dependabot** | Vulnerability scanning for dependencies. |

## 8. Non-Functional Requirements (NFRs)

This section defines the key non-functional requirements for the SyncWell platform. These are critical quality attributes that the system must satisfy.

| Category | Requirement | Metric | Target | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Availability** | Core Service Uptime | Monthly Uptime % | > 99.9% | Measured for core API endpoints and sync processing. Excludes scheduled maintenance. |
| | Disaster Recovery RTO | Recovery Time Objective | < 4 hours | In a DR event, users will be notified via a status page and social media. |
| | Disaster Recovery RPO | Recovery Point Objective | < 15 minutes | Max acceptable data loss. Governed by DynamoDB PITR backup frequency. |
| **Performance** | Manual Sync Latency | P95 Latency | < 15 seconds | End-to-end latency, highly dependent on third-party API performance. |
| | API Gateway Latency | P99 Latency | < 500ms | For all synchronous API endpoints, measured at the gateway. |
| | Concurrent Users | Peak RPS | 3,000 RPS | The system must handle a peak load of 3,000 requests per second. The worst-case projection of ~45,000 concurrent workers is a risk to be mitigated per Section 3b. |
| **Security** | Vulnerability Patching | Time to Patch Critical CVE | < 72 hours | This policy applies 24/7, including weekends and holidays, and is managed by the on-call security team. |
| | Secure Data Handling | `ProviderTokens` must not be serializable | Pass/Fail | The `ProviderTokens` data class must not be serializable and must redact secrets in its `toString()` method. A custom linter rule must enforce this at build time. |
| **Scalability** | User Capacity | Daily Active Users (DAU) | 1,000,000 | The architecture must be able to support 1 million daily active users. |
| **Usability** | App Onboarding | Time to First Sync | < 3 minutes | This is a key product KPI, tracked via our analytics pipeline by measuring the median time from the `UserSignedUp` event to the first `SyncSucceeded` event for that user. |

## 9. Developer Experience

To ensure high development velocity and code quality, we will establish a streamlined and automated developer experience.

*   **Local Development:** Engineers must be able to run and test the entire application stack locally using LocalStack and Docker Compose.
*   **Test Data Management:**
    *   A pool of permanent test accounts will be created in Firebase Authentication.
    *   The **E2E test reset script** for DynamoDB will be an idempotent script managed in the backend repository, owned by the core backend team.
*   **Testing Strategy:** We will employ a multi-layered testing strategy.
    *   **Contract Tests (Pact):** A failure in the Pact verification step in a provider's (e.g., backend) CI pipeline **must** block the build from proceeding.
    *   **Load Tests (`k6`):** To validate performance and scalability against a dedicated staging environment.
*   **Continuous Integration & Delivery (CI/CD):** Our CI/CD pipeline, managed with **GitHub Actions**, automates quality checks and deployments.
    *   **CI/CD for KMP Shared Module:** A dedicated pipeline will manage the shared KMP module. A breaking change in the shared module (i.e., a major version bump) **must** be communicated to consumer teams (mobile, backend) via a dedicated Slack channel and a formal announcement.
*   **Deployment Strategy (Canary Releases):** Backend services will be deployed to production using a **canary release strategy**.
    *   **Process:** A new version is deployed, and **10%** of production traffic is routed to it.
    *   **Monitoring & Rollout:** The canary is monitored for **30 minutes**. The key metrics for evaluating the canary are **API P99 latency, error rate, and sync success rate**. If these metrics remain stable relative to the baseline, traffic is gradually shifted until it serves 100% of requests.
    *   **[C-005] Automatic Rollback Triggers:** An automatic rollback **must** be triggered if any of the following deviations are observed in the canary group compared to the baseline group for a sustained period of 5 minutes:
        *   A **>10% increase** in the P99 API Gateway latency.
        *   A **>1% absolute increase** in the overall API error rate (4xx or 5xx).
        *   A **>2% absolute decrease** in the `SyncSuccessRate` business metric.

## 10. Known Limitations & Architectural Trade-offs

This section documents known limitations of the architecture and explicit trade-offs that have been made.

*   **Feature Tiering:** The current architecture does not explicitly support feature tiering (e.g., higher rate limits for Pro users). This is a known gap that will be addressed in a future iteration. The high-level strategy will be to have the `AuthorizerLambda` attach the user's subscription tier (`FREE` or `PRO`) to the request context. Downstream services, like the rate-limiting engine, can then inspect this context and apply the appropriate limits.
*   **Account Merging:** The data model does not support account merging. **User-facing consequence:** Users who create multiple accounts will have siloed data and must contact support for a manual, best-effort resolution. This is a known product issue.
*   **Firebase Authentication Dependency:** The use of Firebase Authentication creates a hard dependency on a non-AWS service for a critical function. This is a **High** strategic risk.
    *   **Risk:** An outage in Firebase Auth would render the application unusable for all users.
    *   **[RISK-HIGH-03] Mitigation:** While accepted for the MVP to prioritize launch speed, a high-level exit strategy has been drafted. See **[`./33a-firebase-exit-strategy.md`](./33a-firebase-exit-strategy.md)** for the detailed technical plan. **[NEEDS_CLARIFICATION: Q-05]** The business must formally accept the risk that the entire application will be unavailable during a Firebase Authentication outage.

## Appendix A: Technology Radar

To provide context on our technology choices and guide future evolution, we maintain a technology radar. This helps us track technologies we are adopting, exploring, or have decided to put on hold. It is a living document, expected to change as we learn and the technology landscape evolves.

**[NEEDS_CLARIFICATION: Q-03]** The process for updating this radar (e.g., who has authority to move items between rings) needs to be formally defined.

### Adopt

These are technologies we have chosen as the foundation for the SyncWell platform. They are the standard choice for their respective domains.

| Technology | Domain | Justification |
| :--- | :--- | :--- |
| **Kotlin Multiplatform** | Cross-Platform Logic | Core strategy for code reuse between mobile clients. |
| **AWS Fargate, SQS, DynamoDB** | Backend Platform | Core of our scalable, event-driven architecture. Fargate provides the most cost-effective compute for our high-throughput worker fleet. |
| **Terraform** | Infrastructure as Code | Standard for provisioning and managing our cloud infrastructure. |
| **LocalStack** | Local Development | Essential for providing a high-fidelity local development loop. |
| **Pact** | Contract Testing | Critical for ensuring API stability between the client and backend. |

### Trial

These are technologies we believe have high potential and should be actively prototyped on non-critical projects or features to evaluate their fit.

| Technology | Domain | Justification |
| :--- | :--- | :--- |
| **Metabase / Superset** | Business Intelligence | To empower product and business teams with self-service analytics without engineering effort. A trial is needed to select the best fit for our needs. |
| **Docusaurus** | Documentation | As our API and developer ecosystem grows, a dedicated documentation portal will be invaluable. Docusaurus is a leading candidate to trial. |

### Assess

These are technologies that could be game-changers in the longer term. We should invest time to research and understand them, but we are not yet committed to using them.

| Technology | Domain | Justification |
| :--- | :--- | :--- |
| **MLflow** | MLOps | When we begin developing the AI Insights features, MLflow is a tool we must assess for managing the end-to-end machine learning lifecycle. It is compatible with our choice of Amazon SageMaker. |

### Hold

These are technologies that we have considered but have decided not to use at this time. They may be revisited later if our architectural needs change significantly.

| Technology | Domain | Justification |
| :--- | :--- | :--- |
| **Kubernetes (EKS / Self-Managed)** | Container Orchestration | We are holding on Kubernetes due to its significant operational overhead. Our serverless-first approach is a better fit for the event-driven nature of the application and aligns with our goal of minimizing infrastructure management. |
| **ScyllaDB / Cassandra** | NoSQL Database | DynamoDB meets all of our current and projected needs for metadata storage. We will not consider alternative NoSQL databases unless we hit a specific, insurmountable limitation with DynamoDB. |
| **Service Mesh (Linkerd, etc.)**| Service-to-Service | A service mesh is a solution for managing a large and complex microservices architecture. Our current architecture is too simple to justify this complexity. We will put this on hold indefinitely. |

## Appendix B: Operational Policies & Procedures

This appendix details critical operational policies that must be implemented.

*   **Third-Party API Versioning:** If a partner API introduces a breaking change, a new, separate `DataProvider` implementation must be created. A gradual migration will be managed using a feature flag to control which user cohorts use the new provider.
*   **DataProvider Retirement:** If an integration is no longer supported, users will be notified **via in-app messaging and email** at least 60 days in advance.
*   **API Quota Management:** The system **must** use Redis to track usage against long-term (e.g., monthly) API quotas to prevent service cut-offs.
*   **Schema Migration:** For breaking changes to canonical models, a two-phase deployment will be used. A background data migration job, implemented as a Step Functions workflow, will be used to update existing records.
*   **LocalStack in CI/CD:** The CI/CD pipeline **must** include a stage where backend integration tests are run against LocalStack. A failure in this stage **must** block the build.
*   **Feature Flag Lifecycle:** To prevent technical debt, a quarterly review process, owned by the **Principal Engineer**, will be held to identify and remove obsolete flags.
*   **AppConfig Validators:** To prevent outages from configuration typos, **critical** configurations in AWS AppConfig **must** be deployed with a corresponding validator. Critical configurations include the DynamoDB table name, any third-party API endpoints, and the JWT issuer URL.

## 11. Glossary

A project-wide glossary of all business and technical terms is maintained in the root `GLOSSARY.md` file to ensure a single source of truth for terminology.

## 12. Visual Diagrams

This section contains all the architectural diagrams referenced in this document.

### Diagram 1: System Context

```mermaid
---
title: "System Context Diagram for SyncWell (v1.1 as of 2025-08-19)"
---
graph TD
    subgraph SyncWell Ecosystem
        A[Mobile App]
        B[Backend]
    end

    subgraph Users
        C[Health-Conscious User]
    end

    subgraph External Systems
        D["Third-Party Health Platforms<br>(Cloud APIs)"]
        D2["On-Device Health Platforms<br>(e.g., HealthKit)"]
        E[Platform App Stores]
        F[Platform Notification Services]
        G[Firebase Authentication]
    end

    C -- "Views, configures, and<br>initiates syncs via" --> A
    A -- "Authenticates user with" --> G
    A -- "Initiates cloud sync jobs via API" --> B
    A -- "Reads/writes local health data from/to" --> D2
    A -- "Is distributed through" --> E
    B -- "Fetches and pushes data to" --> D
    B -- "Sends push notifications via" --> F
    B -- "Validates user tokens using" --> G
```

### Diagram 2: Container Diagram (MVP)

```mermaid
---
title: "Container Diagram for SyncWell (MVP)"
---
graph TD
    subgraph "User's Device"
        MobileApp[Mobile Application w/ KMP Module]
    end

    subgraph "Google Cloud"
        FirebaseAuth["Firebase Authentication<br>(provides Google Public Keys)"]
    end

    subgraph "External Services"
        ThirdPartyAPIs["Third-Party Health APIs"]
    end

    subgraph "AWS Cloud"
        CloudFront[CloudFront CDN]
        S3Assets[S3 Bucket for Static Assets]
        WAF[AWS WAF]
        RestApi[REST API Gateway]
        WebSocketApi[WebSocket API Gateway]
        SyncOverSocketLambda[Sync-over-Socket Lambda]
        WebhookIngressLambda[Webhook Ingress Lambda]
        AuthorizerLambda[Authorizer Lambda]
        HotPathEventBus[EventBridge Event Bus]
        DynamoDB[DynamoDB Table]
        SecretsManager[Secrets Manager]
        Observability["CloudWatch Suite"]
        AppConfig[AWS AppConfig]

        subgraph "VPC"
            style VPC fill:#f5f5f5,stroke:#333
            NetworkFirewall[AWS Network Firewall]
            subgraph "Private Subnets"
                WorkerFargateTask["Worker Fargate Task"]
                ElastiCache[ElastiCache for Redis]
            end
        end

        subgraph "SQS Queues"
            HotPathSyncQueue[SQS: HotPathSyncQueue]
            HotPathSyncDLQ[SQS: HotPathSyncDLQ]
        end
    end

    CloudFront -- "Serves content from" --> S3Assets
    MobileApp -- "Fetches static assets from" --> CloudFront
    MobileApp -- "Signs up / signs in with" --> FirebaseAuth
    MobileApp -- "Establishes connection with" --> WebSocketApi
    WebSocketApi -- "Routes sync requests to" --> SyncOverSocketLambda
    MobileApp -- "HTTPS Request (with Firebase JWT)" --> WAF
    WAF -- "Filters traffic to" --> RestApi

    RestApi -- "Validates JWT with" --> AuthorizerLambda
    AuthorizerLambda -- "Fetches public keys from" --> FirebaseAuth
    RestApi -- "Publishes 'HotPathSyncRequested' event" --> HotPathEventBus
    ThirdPartyAPIs -- "Sends Webhook -->" --> RestApi
    RestApi -- "Routes to" --> WebhookIngressLambda
    WebhookIngressLambda -- "Publishes 'HotPathSyncRequested' event" --> HotPathEventBus


    HotPathEventBus -- "Rule routes to" --> HotPathSyncQueue
    HotPathSyncQueue -- "drives" --> WorkerFargateTask
    HotPathSyncQueue -- "On failure, redrives to" --> HotPathSyncDLQ

    WorkerFargateTask -- "Reads/writes user state" --> DynamoDB
    WorkerFargateTask -- "Gets credentials" --> SecretsManager
    WorkerFargateTask -- "Reads/Writes cache" --> ElastiCache
    WorkerFargateTask -- "Logs & Metrics" --> Observability
    WorkerFargateTask -- "Fetches runtime config from" --> AppConfig
    WorkerFargateTask -- "Makes outbound API calls via" --> NetworkFirewall
    NetworkFirewall -- "Allow-listed traffic to" --> ThirdPartyAPIs
```

### Diagram 3: ProviderManager Factory Pattern

```mermaid
graph TD
    A[SyncWorker]
    B[ProviderManager]
    C((Registry))

    subgraph Initialization
        direction LR
        C -- "Registers 'fitbit' -> FitbitProvider.class" --> B
    end

    subgraph "Runtime"
        A -- "Requests provider for 'fitbit'" --> B
        B -- "Looks up 'fitbit' in registry" --> C
        C -- "Returns FitbitProvider class" --> B
        B -- "Instantiates and returns instance" --> A
    end
```

### Diagram 4: Hot Path Sync Flow

```mermaid
graph TD
    subgraph "Hot Path Sync Flow"
        A[Mobile App] -- 1. Initiate --> B[API Gateway]
        B -- 2. Publishes 'HotPathSyncRequested' event --> C[EventBridge]
        C -- 3. Forwards to --> SQS[HotPathSyncQueue]
        SQS -- 4. Triggers --> D[Worker Fargate Task]
        D -- 5. Fetch/Write data --> E[Third-Party APIs]
        D -- 6. Publishes 'SyncSucceeded' event --> C
    end
```

### Diagram 6: Scheduling Infrastructure

```mermaid
graph TD
    subgraph "Scheduling Infrastructure"
        A["EventBridge Rule<br>cron(0/15 * * * ? *)"] --> B{"Scheduler State Machine"};
        B --> C[Fan-Out Lambda<br>Calculates N shards];
        C --> D{Map State<br>Processes N shards in parallel};
    end

    subgraph "Shard Processing (Parallel)"
        style E1 fill:#f5f5f5,stroke:#333
        D -- "Shard #1" --> E1[Shard Processor Lambda];
    end

    subgraph "Data & Execution"
        DynamoDB[DynamoDB GSI]
        F["Main Event Bus<br>(EventBridge)"];
        G[SQS Queue];
        H["Worker Fleet<br>(AWS Fargate)"];
    end

    E1 -- "1. Queries for users to sync" --> DynamoDB;
    E1 -- "2. Publishes 'SyncRequested' events" --> F;
    F -- "3. Routes events to" --> G;
    G -- "4. Drives" --> H;
```

### Diagram 7: Device-to-Cloud Sync Flow

```mermaid
sequenceDiagram
    participant MobileApp as "Mobile App"
    participant Backend as "SyncWell Backend"
    participant DestinationAPI as "Destination Cloud API"
    participant DeviceDB as "On-Device DB"

    activate MobileApp
    MobileApp->>DeviceDB: Get lastSyncTime
    DeviceDB-->>MobileApp: Return timestamp
    MobileApp->>MobileApp: Fetch new data from HealthKit/Health Connect
    MobileApp->>MobileApp: Transform data to CanonicalWorkout
    deactivate MobileApp

    MobileApp->>+Backend: POST /v1/device-upload (sends canonical data)
    activate Backend
    Backend->>+DestinationAPI: Fetch overlapping data for conflict resolution
    DestinationAPI-->>-Backend: Return destination data
    Backend->>Backend: Run conflict resolution engine
    Backend->>+DestinationAPI: POST /v1/data (write final data)
    DestinationAPI-->>-Backend: Success
    Backend-->>-MobileApp: 200 OK
    deactivate Backend

    activate MobileApp
    MobileApp->>DeviceDB: Update lastSyncTime
    deactivate MobileApp
```

### Diagram 8: Cloud-to-Device Sync Flow

```mermaid
sequenceDiagram
    participant SourceAPI as "Source Cloud API"
    participant Backend as "SyncWell Backend"
    participant PushService as "APNs/FCM"
    participant MobileApp as "Mobile App (Background)"
    participant DeviceHealth as "HealthKit/Health Connect"

    %% --- Part 1: Backend fetches data and requests destination data ---
    activate Backend
    Backend->>+SourceAPI: Fetch new data
    SourceAPI-->>-Backend: Return source data
    Backend->>+PushService: Send 'read request' silent push
    PushService-->>MobileApp: Silent Push Notification
    deactivate Backend

    %% --- Part 2: Mobile app provides destination data ---
    activate MobileApp
    MobileApp->>+DeviceHealth: Fetch overlapping data
    DeviceHealth-->>-MobileApp: Return local health data
    MobileApp->>+Backend: POST /v1/device-read-response (sends data)
    deactivate MobileApp

    %% --- Part 3: Backend processes and stages data for write ---
    activate Backend
    Backend->>Backend: Run conflict resolution
    Backend->>Backend: Stage final data in S3/DynamoDB
    Backend-->>-MobileApp: 200 OK (ack for read response)

    %% --- Part 4: Backend signals mobile app to write data ---
    Backend->>+PushService: Send 'write request' silent push with jobId
    PushService-->>MobileApp: Silent Push Notification
    deactivate Backend

    %% --- Part 5: Mobile app writes data to device ---
    activate MobileApp
    MobileApp->>+Backend: GET /v1/staged-data/{jobId}
    Backend-->>-MobileApp: Return staged data
    MobileApp->>+DeviceHealth: Save final data
    DeviceHealth-->>-MobileApp: Success
    MobileApp->>+Backend: POST /v1/confirm-write/{jobId}
    Backend-->>-MobileApp: 200 OK
    deactivate MobileApp

    activate Backend
    Backend->>Backend: Delete staged data
    deactivate Backend
```
