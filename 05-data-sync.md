## Dependencies

### Core Dependencies
- `02-product-scope.md` - Product Scope, Personas & MVP Definition
- `06-technical-architecture.md` - Technical Architecture
- `07-apis-integration.md` - APIs & Integration Requirements
- `17-error-handling.md` - Error Handling, Logging & Monitoring
- `30-sync-mapping.md` - Source-Destination Sync Mapping

### Strategic / Indirect Dependencies
- `01-context-vision.md` - Context & Vision
- `16-performance-optimization.md` - Performance & Scalability
- `31-historical-data.md` - Historical Data Handling
- `40-error-recovery.md` - Error Recovery & Troubleshooting

---

# PRD Section 5: Data Synchronization & Reliability

## 1. Executive Summary

This document provides the detailed technical and functional specification for SyncWell's core data synchronization engine. The primary objective is to create a highly reliable, secure, and efficient system for transferring health data. The success of the entire application is fundamentally dependent on the robustness and integrity of this engine.

This document serves as a blueprint for the **solo developer**, detailing the specific architecture, algorithms, and policies required. A well-defined sync engine is the most critical and complex component of the project; this specification aims to de-risk its development by providing a clear and comprehensive plan.

## 2. Sync Engine Architecture

The data synchronization engine will be a modular system composed of several key components that run on the user's device:

*   **`SyncScheduler`:** Responsible for scheduling background sync tasks with the operating system (using `WorkManager` on Android and `BGAppRefreshTask` on iOS). It will schedule tasks to run periodically (e.g., every 15 minutes) while respecting the OS's battery optimization policies.
*   **`JobQueue`:** A persistent, on-device queue (using a local database like Realm or Hive) that stores all pending sync jobs. This ensures that sync requests are not lost if the app is closed or the device is restarted.
*   **`SyncProcessor`:** The heart of the engine. It runs during a scheduled task, pulls jobs from the `JobQueue`, and orchestrates the synchronization process.
*   **`DataProvider` (Interface):** A standardized interface that each third-party integration (Fitbit, Garmin, etc.) must implement. It defines the contract for methods like `fetchData(since:)` and `writeData()`.
*   **`ConflictResolver`:** A module that implements the defined policies for handling data conflicts.

## 3. The Synchronization Algorithm (Delta Sync)

The `SyncProcessor` will follow this algorithm to ensure efficient "delta" syncing (only fetching new data):

1.  **Job Dequeue:** The processor pulls the next sync job from the queue (e.g., "Sync Steps from Fitbit to Google Fit").
2.  **Get Last Sync Timestamp:** The processor retrieves the timestamp of the last successful sync for this specific job from local storage. Let's call this `lastSyncTime`. If it's the first sync, `lastSyncTime` is null.
3.  **Fetch New Data:** It calls the `fetchData(since: lastSyncTime)` method on the source provider (e.g., `FitbitProvider`).
4.  **Data Transformation:** The source provider returns data in the canonical format.
5.  **Conflict Resolution:** For each data point, the `SyncProcessor` checks if there is overlapping data in the destination. If so, it consults the `ConflictResolver`.
6.  **Write Data:** The `SyncProcessor` calls the `writeData()` method on the destination provider (e.g., `GoogleFitProvider`) with the processed, conflict-free data.
7.  **Update Timestamp:** Upon successful completion of the entire job, the processor updates `lastSyncTime` for this job to the current time (`now()`).
8.  **Job Complete:** The job is removed from the queue.

## 4. Data Conflict & Duplication Policy

Handling data conflicts is critical for user trust.

*   **Default Policy: "Source Priority"**
    *   By default, SyncWell will operate on a "Source Priority" basis. If data for the same time period exists in both the source and destination, the data from the source will be written, potentially overwriting the destination's data if the destination API allows it. This is the simplest and most predictable behavior.
*   **Duplicate Prevention:**
    *   Before writing any data point, the `SyncProcessor` will make a best effort to query the destination provider for data points with an identical start time, end time, and data type.
    *   If a seemingly identical data point is found, the write operation for that specific point will be skipped to prevent creating exact duplicates.
*   **User-Configurable Strategy (Post-MVP):**
    *   A future enhancement will be to allow users to choose their conflict resolution strategy on a per-sync basis:
        *   `Prioritize Source` (Default)
        *   `Prioritize Destination` (Never overwrite data in the destination)
        *   `Merge` (For data types like activities, attempt to merge them. This is highly complex and a low priority).

## 5. Data Integrity

*   **Transactional Queue:** The `JobQueue` will be transactional. A job will only be removed from the queue after the entire process, including updating the `lastSyncTime` timestamp, is successfully completed.
*   **Data Validation:** The `DataProvider` for each service will be responsible for basic validation of the data it receives from the API. If the data is malformed or missing key fields, it should be rejected and an error should be logged.
*   **Checksums (for critical data):** For highly sensitive data points, a simple checksum (e.g., an MD5 hash of the key data fields) can be computed before writing and stored with the sync log. This can help in debugging user-reported data discrepancy issues, but is likely out of scope for the MVP.

## 6. Functional & Non-Functional Requirements

### Functional Requirements

*   **Delta Syncing:** The system must only fetch data that has changed since the last successful sync for a given connection.
*   **Conflict Resolution:** The system must implement the "Source Priority" conflict resolution strategy.
*   **Manual & Automatic Triggers:** The sync process can be initiated either manually by the user or automatically by the `SyncScheduler`.
*   **Clear Status Feedback:** The UI must clearly show the `lastSyncTime` for each connection.

### Non-Functional Requirements

*   **Reliability:** Target a **>99.5%** sync success rate for all completed jobs.
*   **Data Integrity:** Zero data corruption. Data must be transferred losslessly where the source and destination platforms have matching capabilities.
*   **Performance:** P95 latency for a typical delta sync (e.g., one day's worth of steps) should be **under 30 seconds**.
*   **API Rate Limiting Compliance:** The engine must gracefully handle 429 "Too Many Requests" errors by implementing an exponential backoff retry mechanism.
*   **Security:** All data transfer must occur over HTTPS. Sensitive tokens must be stored in the Keychain/Keystore.

## 7. Risk Analysis & Mitigation

(This section remains largely the same but is included for completeness.)

| Risk ID | Risk Description | Probability | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **R-13** | A third-party API returns unexpected or malformed data, causing sync failures. | High | High | Implement robust error handling and data validation in each `DataProvider`. Use a "dead letter queue" for failed sync jobs to allow for manual inspection and reprocessing. |
| **R-14**| Frequent changes in platform background execution policies break automatic syncing. | High | Medium | Provide clear, user-friendly instructions on how to disable battery optimization. Implement a fallback mechanism where the app syncs upon being opened if a background sync fails. |
| **R-15**| The complexity of handling different data formats and API quirks is underestimated. | Medium | High | Start with a small number of well-documented APIs. Build a modular and extensible architecture. Write comprehensive unit tests for the data mapping logic in each provider. |

## 8. Optional Visuals / Diagram Placeholders

*   **[Diagram] Sync Engine Architecture:** A component diagram showing the `SyncScheduler`, `JobQueue`, `SyncProcessor`, and their interactions.
*   **[Diagram] Sequence Diagram for Delta Sync:** A detailed sequence diagram showing the step-by-step algorithm, including the calls to the source and destination providers.
*   **[Diagram] State Machine for a Sync Job:** A state diagram showing the lifecycle of a job as it moves through the queue (e.g., Queued, In Progress, Retrying, Succeeded, Failed).
