## Dependencies

### Core Dependencies
- `30-sync-mapping.md` - Source-Destination Sync Mapping
- `34-data-export.md` - Data Export Feature
- `05-data-sync.md` - Data Sync & Conflict Resolution

### Strategic / Indirect Dependencies
- `14-qa-testing.md` - QA & Testing Strategy
- `17-error-handling.md` - Error Handling, Logging & Monitoring
- `32-platform-limitations.md` - Platform-Specific Limitations

---

# PRD Section 35: Data Import Feature

## 1. Executive Summary

This document provides the detailed specification for the **Data Import** feature. This feature allows users to import activity files (FIT, TCX, GPX), enabling them to bring in data from unsupported devices.

To ensure reliability and consistency with the rest of our ecosystem, the import process is built on an **asynchronous, backend-driven architecture**. This specification details the process of uploading the file, having the backend parse and validate it, and then prompting the user for a final review before syncing.

## 2. Data Import Architecture (Orchestrated by AWS Step Functions)

The data import process is a multi-step workflow that includes waiting for user input. To manage this complexity reliably, the feature will be orchestrated by a dedicated **AWS Step Functions state machine**. This provides superior state management, error handling, and observability compared to an ad-hoc SQS-based approach.

1.  **Initiation & Upload (Mobile):** A user selects a file, and the mobile app uploads it to a secure S3 bucket.
2.  **Start Execution (Mobile -> Backend):** The app calls an API endpoint that triggers a new execution of the `DataImport` state machine, providing the S3 URL of the uploaded file.
3.  **State Machine Execution (Backend):**
    *   **a. Parse & Validate:** A Lambda function downloads the file from S3 and uses a `Parser` to validate it and convert it into our `CanonicalActivity` model. If the file is corrupt, the state machine transitions to a `FAILED` state.
    *   **b. Duplicate Check:** A second Lambda queries destination APIs to check for potential duplicates. See section 2.1 for details on the logic.
    *   **c. Wait for User Review:** The state machine saves the parsed data and enters a "wait" state using a **task token**. This token represents the paused workflow. The machine then publishes an event to SNS to trigger the `N-08` "Ready for Review" push notification.
    *   **d. User Confirmation (Mobile):** The user reviews the import in the app. When they confirm, the app sends the confirmation choices and the **task token** to a backend API.
    *   **e. Resume Execution:** The backend API calls the `SendTaskSuccess` Step Functions API action with the task token and the user's choices as output. This resumes the state machine execution.
    *   **f. Final Sync:** The final state in the machine places the approved sync job into the main `hot-queue` for processing by the standard sync workers.

### 2.1. Duplicate Check Logic

A key step in the import workflow is checking for potential duplicates to avoid corrupting the user's data. The `Check Duplicates` Lambda function will implement the following logic:

1.  **Extract Key Identifiers:** The function will first extract the key identifiers from the parsed `CanonicalActivity` that was uploaded:
    *   `activityType` (e.g., "RUNNING", "CYCLING")
    *   `startTimestamp`
    *   `endTimestamp`
2.  **Query Destination Platforms:** For each potential destination platform the user might sync to, the function will call that platform's `DataProvider`.
3.  **Time-based Query:** The `DataProvider` will be queried for any existing activities of the same `activityType` within a specific time window. The query range will be `[startTimestamp - 5 minutes, endTimestamp + 5 minutes]`. This 5-minute buffer accounts for small discrepancies in how different devices record start and end times.
4.  **Flag Potential Duplicates:** If the `DataProvider` returns any activities within this time window, they will be flagged as potential duplicates.
5.  **Pass to UI for Resolution:** The list of potential duplicates will be passed back to the Step Functions workflow and ultimately to the mobile client. The "Preview & Configure" screen will then display these potential duplicates to the user, allowing them to decide whether to skip the import or proceed. This "human-in-the-loop" approach is the safest way to handle potential data conflicts.

This architecture provides a robust way to handle the human-in-the-loop part of the workflow, with built-in support for timeouts (e.g., after 7 days) if the user never confirms the import.

## 3. User Experience & Workflow

1.  **Initiation:** User opens a file with SyncWell.
2.  **Upload:** The app shows a status: *"Uploading file..."*
3.  **Processing:** The status updates: *"We're processing your file. We will notify you when it's ready for review."* The user can safely close the app.
4.  **Review Notification:** The user receives a push notification.
5.  **Preview & Configure Screen:** Tapping the notification opens a screen showing a summary of the parsed activity. Here, the user can:
    *   Map any unrecognized activity types.
    *   Select the destination(s).
    *   Resolve any potential duplicates that the backend has flagged.
6.  **Confirmation:** The user taps "Confirm Import." The data is then queued for syncing, and a confirmation message is shown.

## 4. Import Limitations & User Communication

*   **Activities Only:** The feature is exclusively for activity files (FIT, TCX, GPX).
*   **Data Completeness:** The Preview screen must clearly indicate what data was found in the file.
*   **Destination Limitations:** The destination selection UI will disable read-only platforms like Garmin.

## 5. Validation & Error Handling

*   **Backend Validation:** The `import-worker` is responsible for all validation.
*   **File Corrupt:** If the `Parser` fails, the worker sets the job status to `FAILED` in DynamoDB with the error `FILE_CORRUPT`. The user is notified.
*   **Missing Key Data:** If the file is missing required data (e.g., a start time), the job status is set to `FAILED` with the error `MISSING_DATA`.
*   **Parser Unit Tests:** Each `Parser` module on the backend must have a comprehensive suite of unit tests in the CI/CD pipeline to prevent parsing regressions.

## 6. Visual Diagrams

### Import Architecture (Orchestrated by Step Functions)
```mermaid
graph TD
    subgraph Mobile App
        A[Upload File to S3]
        B[Trigger State Machine]
        G[Review & Confirm Import]
    end
    subgraph AWS Backend
        C[Step Functions<br>Import State Machine]
        D[Parse & Validate (Lambda)]
        E[Check Duplicates (Lambda)]
        F[Wait for User Review<br>(with Task Token)]
        H[Queue Final Sync Job (Lambda)]
        I[SQS Hot Queue]
    end

    A --> B
    B --> C
    C -- Invokes --> D
    D -- Success --> E
    E -- Success --> F
    F -- Sends Notification --> G
    G -- Send Confirmation w/ Task Token --> C
    C -- Resumes --> H
    H --> I
```

## 7. Security of Uploaded Files

To ensure the confidentiality and integrity of user-uploaded data, all files handled by the import feature are subject to the following security policies:

*   **Secure Transport:** All files are uploaded from the mobile client to S3 over HTTPS (TLS 1.2+).
*   **Encryption at Rest:** All files are stored in a dedicated, private S3 bucket. Server-Side Encryption with Amazon S3-Managed Keys (SSE-S3) is enabled on this bucket, so all objects are automatically encrypted at rest.
*   **Strict Access Control:** The S3 bucket is configured to block all public access. Access is granted only to specific, authorized principals via IAM policies. The `Parse & Validate` Lambda function has a narrowly-scoped IAM role that grants it temporary, read-only access to the specific object it needs to process. No other services have access to the bucket.
*   **Automatic Deletion (Lifecycle Policy):** A short-lived S3 lifecycle policy is configured on the bucket. This policy will automatically and permanently delete all uploaded files **24 hours** after they are created. This ensures that user data is not stored any longer than is absolutely necessary to complete the import process, adhering to the principle of data minimization.
