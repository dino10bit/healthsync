# PRD Section 31: Historical Data Handling

## 1. Executive Summary

This document provides the detailed technical and functional specification for the **Historical Data Sync** feature, a core premium offering for SyncWell. This feature allows paying users to backfill their health data, providing a powerful incentive to upgrade and a key tool for users migrating from other ecosystems.

Given its complexity and potential for high API usage, this feature must be implemented with extreme care. This specification details the job queue architecture, the state management, the "circuit breaker" safety pattern, and the user experience required to deliver this feature reliably and safely.

## 2. Historical Sync Architecture

The historical sync feature will be built on top of the core sync engine but will use a separate, dedicated job queue to ensure operational priority.

*   **Job Queues:** The app will maintain two sync job queues in its local database:
    1.  **`P0_REALTIME_QUEUE`:** The default queue for normal, forward-looking delta syncs.
    2.  **`P1_HISTORICAL_QUEUE`:** A lower-priority queue used exclusively for historical backfill jobs.
*   **Processing Logic:** The `SyncProcessor` will always fully drain the `P0_REALTIME_QUEUE` before it begins processing any jobs from the `P1_HISTORICAL_QUEUE`. This ensures that the user's most recent data is always prioritized.
*   **Job Data Model:** Each job in the `P1_HISTORICAL_QUEUE` will have the following structure:
    ```typescript
    interface HistoricalJob {
      jobId: string;
      sourceProvider: string;
      destinationProvider: string;
      dataType: string;
      startDate: string; // The start of the user's selected range
      endDate: string;   // The end of the user's selected range
      cursorDate: string; // The specific day currently being processed
      status: 'PENDING' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'FAILED';
      errorCount: number;
      lastAttempt: string;
    }
    ```

## 3. Job State Machine & "Circuit Breaker"

Each historical sync job will operate as a formal state machine.

*   **`PENDING`**: The initial state when a job is created.
*   **`RUNNING`**: The `SyncProcessor` is actively fetching and writing data for the `cursorDate`.
    *   *Transition:* On success, the `cursorDate` is decremented by one day, and the state remains `RUNNING`. If `cursorDate` < `startDate`, the job transitions to `COMPLETED`.
    *   *Transition:* On a recoverable API error (e.g., 503), the `errorCount` is incremented. The job remains `RUNNING` for the next attempt.
*   **`PAUSED` (Circuit Breaker):** If the `errorCount` for a job exceeds **5** within a **1-hour** window, the job transitions to `PAUSED`. The `SyncProcessor` will not attempt to run this job again for at least **4 hours**. This prevents our app from hammering a third-party API that is having issues.
*   **`FAILED`**: If a non-recoverable error occurs (e.g., invalid credentials, 401 error), or if a job fails more than 20 times in total, it transitions to `FAILED`. It will not be retried automatically.
*   **`COMPLETED`**: The job has successfully processed all data from `endDate` back to `startDate`.

## 4. Dynamic UI & User Experience

The UI must be intelligent and transparent to manage user expectations.

*   **Dynamic Configuration:** The date pickers on the configuration screen must be dynamically constrained based on the selected source platform's known limitations.
    *   **Example:** If the user selects "Garmin" as the source and "Steps" as the data type, the `startDate` picker will be disabled for any date more than 2 years in the past. A small message will appear: "Garmin only provides access to the last 2 years of step data."
*   **Progress Visualization:** The progress screen will provide rich, real-time feedback:
    *   A progress bar showing `(endDate - cursorDate) / (endDate - startDate)`.
    *   Text status: "Syncing data for October 26, 2023..."
    *   If `status` is `PAUSED`: "Syncing is temporarily paused because the {{sourceProvider}} servers are busy. We will automatically resume in a few hours."
    *   If `status` is `FAILED`: "Syncing has failed due to an error: {{error_message}}. Please try again or contact support."
*   **User Controls:** For any job in the `PAUSED` or `FAILED` state, "Retry Now" and "Cancel Job" buttons will become visible, giving the user control over the process.

## 5. Optional Visuals / Diagram Placeholders
*   **[Diagram] Dual Queue Architecture:** A diagram showing the P0 (Realtime) and P1 (Historical) queues feeding into the `SyncProcessor`, illustrating the priority system.
*   **[Diagram] Historical Job State Machine:** A formal state machine diagram illustrating the states and transitions described in Section 3.
*   **[Mockup] Dynamic UI:** A mockup of the configuration screen showing the `startDate` picker being disabled and the explanatory message appearing when Garmin is selected.
*   **[Mockup] Progress Screen States:** A set of mockups showing the progress screen in its different states: `RUNNING`, `PAUSED`, and `FAILED`, including the relevant user controls.
