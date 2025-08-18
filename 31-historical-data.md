## Dependencies

### Core Dependencies
- `05-data-sync.md` - Data Synchronization & Reliability
- `06-technical-architecture.md` - Technical Architecture
- `12-trial-subscription.md` - Trial, Subscription & Paywall

### Strategic / Indirect Dependencies
- `09-ux-configuration.md` - UX, Configuration & Settings
- `16-performance-optimization.md` - Performance & Scalability
- `17-error-handling.md` - Error Handling, Logging & Monitoring

---

# PRD Section 31: Historical Data Handling

## 1. Executive Summary

This document provides the detailed technical specification for the **Historical Data Sync** feature, a core premium offering. This feature allows paying users to backfill their health data, providing a powerful incentive to upgrade.

A naive implementation of this feature (a single, long-running job) is brittle and prone to failure. To ensure maximum reliability and a transparent user experience, we will use **AWS Step Functions** to orchestrate the complex workflow, as defined in the core technical architecture.

## 2. Historical Sync Architecture: AWS Step Functions

The historical sync feature is orchestrated using a dedicated **AWS Step Functions state machine**. This managed service is purpose-built for coordinating multi-step, long-running, and potentially error-prone workflows, making it the ideal choice for this feature.

When a user requests a historical sync, the mobile app calls an API endpoint that triggers a new execution of this state machine. The state machine, not a custom application-level orchestrator, is responsible for managing the entire lifecycle of the sync.

## 3. Benefits of the AWS Step Functions Strategy

Using a managed orchestrator like AWS Step Functions provides significant advantages over a custom-built solution:

*   **Reliability & State Management:** Step Functions persists the state of every execution, meaning workflows are durable and can be resumed automatically. The service guarantees at-least-once execution of each step.
*   **Built-in Error Handling:** The state machine has robust, declarative error handling and retry logic. We can configure it to automatically retry failed API calls with exponential backoff, or route specific errors to custom cleanup logic, all without complex application code.
*   **Observability:** Every Step Functions execution is fully auditable and visualized in the AWS console. This provides immediate, detailed insight into where a workflow failed, why it failed, and what the inputs/outputs were for each step, dramatically reducing debugging time.
*   **Parallelism:** The state machine will use a `Map` state to process data chunks (e.g., one month of data) in parallel. This allows for massive scaling of `Cold-Path Worker Lambdas` to complete a multi-year sync much faster than a sequential process.

## 4. State Machine Execution Flow

The high-level logic of the state machine is defined in `06-technical-architecture.md`. The flow is as follows:

1.  **Initiate Sync & Calculate Chunks:** The workflow is triggered with the user's request details. The first state is a Lambda function that calculates the total date range and breaks it into an array of smaller, logical chunks (e.g., `[{start: "2022-01-01", end: "2022-01-31"}, ...]`).
2.  **Execute in Parallel (`Map` State):** The state machine's `Map` state iterates over the array of chunks. For each chunk, it invokes a `Cold-Path Worker Lambda`, passing the chunk's date range as input. This allows for dozens or hundreds of chunks to be processed in parallel, up to a configurable concurrency limit.
3.  **Process a Single Chunk:** The `Cold-Path Worker Lambda` is responsible for fetching data for its assigned chunk, performing the transformation, and writing it to the destination.
4.  **Handle Errors:** If a worker Lambda fails with a transient error, the state machine's retry policy will automatically re-invoke it. If it fails permanently, the `Map` state's error handling configuration will catch the failure, log it, and potentially allow the rest of the workflow to continue.
5.  **Finalize & Notify:** Once all chunks in the `Map` state have completed successfully, a final Lambda function is invoked to mark the overall job as complete and send a push notification to the user.

## 5. Visual Diagrams

### Historical Sync State Machine
```mermaid
graph TD
    A[Start] --> B{Initiate Sync &<br>Calculate Chunks};
    B --> C{Process Chunks in Parallel<br>(Map State)};
    C -- For Each Chunk --> D[Process One Chunk<br>(Lambda)];
    D -- Success --> E{Did All Chunks Succeed?};
    C -- All Chunks Complete --> E;
    E -- Yes --> F[Finalize Sync<br>(Lambda)];
    F --> G[End];
    D -- Failure --> H{Retry?};
    H -- Yes --> D;
    H -- No --> I[Log Error &<br>Continue/Fail];
    I --> E;
```

### UI Status Polling
The mobile app can get the status of the sync by calling a backend API. This API will use the AWS SDK and the specific execution's ARN (`executionArn`) to call the `DescribeExecution` API action. This returns the current status (`RUNNING`, `SUCCEEDED`, `FAILED`) and other metadata that can be used to render a progress bar.

```mermaid
sequenceDiagram
    participant User
    participant MobileApp as Mobile App
    participant Backend as SyncWell Backend
    participant StepFunctions as AWS Step Functions

    User->>MobileApp: Views Progress Screen
    loop Every 10 seconds
        MobileApp->>Backend: GET /historical-syncs/{executionArn}/status
        Backend->>StepFunctions: DescribeExecution(executionArn)
        StepFunctions-->>Backend: Return Execution Status & Metadata
        Backend-->>MobileApp: Return {status: "RUNNING", progress: 0.45}
        MobileApp->>User: Update Progress Bar (45%)
    end
```
