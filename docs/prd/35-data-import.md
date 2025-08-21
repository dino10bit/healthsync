---
title: "PRD: Data Import"
migrated: true
---
## Dependencies

### Core Dependencies
- `../architecture/30-sync-mapping.md` - Source-Destination Sync Mapping
- `./34-data-export.md` - Data Export Feature
- `../architecture/05-data-sync.md` - Data Sync & Conflict Resolution

### Strategic / Indirect Dependencies
- `../qa/14-qa-testing.md` - QA & Testing Strategy
- `../ops/17-error-handling.md` - Error Handling, Logging & Monitoring
- `./32-platform-limitations.md` - Platform-Specific Limitations

---

# PRD: Data Import

## 1. Executive Summary

This document provides the detailed specification for the **Data Import** feature. This feature allows users to import activity files (e.g., from a `.fit`, `.tcx`, or `.gpx` file), enabling them to bring in data from devices or services that SyncWell does not natively support (e.g., Wahoo, Coros, Suunto).

To ensure reliability, the import process is built on an **asynchronous, backend-driven architecture** using AWS Step Functions. This specification details the process of uploading the file, having the backend parse and validate it, and then prompting the user for a final review before syncing.

*   **Priority:** Should-Have (S-2)
*   **Status:** Not Started

## 2. User Experience & Workflow

1.  **Initiation:** A user opens an activity file (e.g., from an email attachment) using the SyncWell mobile app.
2.  **Upload:** The app shows a status indicator: **"Uploading file..."**
3.  **Processing:** The status updates: **"Processing file... We'll notify you when it's ready for review."** The user can now safely close the app.
4.  **Review Notification (`N-08`):** The user receives a push notification: **"Your imported file is ready for review."**
5.  **Preview & Configure Screen:** Tapping the notification opens a screen showing a summary of the parsed activity (e.g., activity type, duration, distance). Here, the user can:
    *   Map any unrecognized activity types.
    *   Select the destination service(s) for the imported data.
    *   Resolve any potential duplicates that the backend has flagged. [NEEDS_CLARIFICATION: UI/UX mockups for the duplicate resolution flow are required.]
6.  **Confirmation:** The user taps "Confirm Import." The data is then queued for syncing, and a confirmation message is shown: **"Success! Your imported activity has been queued for syncing."**

## 3. Technical Architecture (Orchestrated by AWS Step Functions)

The data import process is a multi-step workflow that includes waiting for user input. To manage this complexity reliably, the feature will be orchestrated by a dedicated **AWS Step Functions state machine** (`DataImport`).

1.  **Initiation & Upload:** The mobile app uploads the user-selected file to a secure, private S3 bucket: `s3://syncwell-prod-data-imports/`.
2.  **Start Execution:** The app calls an API endpoint that triggers a new execution of the `DataImport` state machine, providing the S3 URL of the uploaded file.
3.  **State Machine Execution (Backend):**
    *   **a. Parse & Validate:** A Fargate task downloads the file from S3 and uses a `Parser` module (provider-specific logic within the worker codebase) to validate it and convert it into our `CanonicalActivity` model. The `CanonicalActivity` schema is defined in `../architecture/06-technical-architecture.md`. If the file is corrupt, the state machine transitions to a `FAILED` state.
    *   **b. Duplicate Check:** A second Fargate task queries destination APIs to check for potential duplicates.
    *   **c. Wait for User Review (Secure Token Swap):** The state machine saves the parsed data and enters a "wait" state using a **task token**. To avoid exposing this sensitive token, it calls a `CreateSecureCallbackToken` Lambda (a lightweight Node.js function). This function generates a new, opaque token (UUID), stores the mapping in the `OpaqueTokenMapping` table in DynamoDB with a 7-day TTL, and returns the opaque token. The state machine then triggers the `N-08` push notification, providing this opaque token to the client. If the user does not respond within 7 days, the workflow will automatically time out and fail.
    *   **d. User Confirmation:** The user confirms the import in the app. The app sends the confirmation and the opaque token to a backend API.
    *   **e. Resume Execution:** The backend API looks up the opaque token to retrieve the real task token, then calls the `SendTaskSuccess` Step Functions API action. After successfully resuming the workflow, it deletes the mapping item from the table.
    *   **f. Final Sync:** The final state in the machine places the approved sync job into the main `HotPathSyncQueue` for processing.

### 3.1. Duplicate Check Logic

1.  **Extract Identifiers:** The function extracts the `activityType`, `startTimestamp`, and `endTimestamp` from the parsed `CanonicalActivity`.
2.  **Query Destination Platforms:** For each potential destination, the function queries the `DataProvider`.
3.  **Time-based Query:** The `DataProvider` is queried for any existing activities of the same type within a specific time window: `[startTimestamp - 5 minutes, endTimestamp + 5 minutes]`. The 5-minute buffer accounts for potential clock drift between devices.
4.  **Flag Potential Duplicates:** Any activities found are flagged as potential duplicates and sent to the mobile client for user resolution.

### 3.2. DynamoDB Opaque Token Mapping Table

| Table Name | PK | TTL Attribute | Other Attributes |
| :--- | :--- | :--- | :--- |
| `OpaqueTokenMapping` | `opaque_token` (String) | `ttl` (Number) | `real_task_token` (String) |

## 4. Validation & Error Handling

*   **Backend Validation:** The `Parse & Validate` Fargate task is responsible for all validation.
*   **`FILE_CORRUPT`:** If the `Parser` fails, the job status is set to `FAILED`. The user is notified: **"Import failed: The file appears to be corrupt or in an unsupported format."**
*   **`MISSING_DATA`:** If the file is missing required data (e.g., a start time), the job status is set to `FAILED`. The user is notified: **"Import failed: The file is missing required data, such as a start time or duration."**
*   **Parser Unit Tests:** Each `Parser` module must have a comprehensive suite of unit tests.

## 5. Risk Analysis

| Risk ID | Risk Description | Probability | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **R-81** | A bug in a file `Parser` causes data to be imported incorrectly. | Medium | High | Implement a comprehensive suite of unit tests for each parser, including "golden file" validation in the CI/CD pipeline. |
| **R-82** | A malicious or malformed file exploits a vulnerability in a third-party parsing library. | Low | Critical | Keep all parsing libraries up-to-date and run automated dependency vulnerability scans (Snyk). Run the parsing logic in an isolated environment (Fargate). |
| **R-83** | The duplicate detection logic is too aggressive or not aggressive enough, leading to a poor user experience. | Medium | Medium | The "human-in-the-loop" design is the primary mitigation. Make the 5-minute time window for the duplicate check configurable in AppConfig to allow for tuning. |

## 6. Security of Uploaded Files

*   **Secure Transport:** All files are uploaded over HTTPS.
*   **Encryption at Rest:** All files are stored in the `s3://syncwell-prod-data-imports/` bucket with SSE-S3 encryption enabled.
*   **Strict Access Control:** The S3 bucket blocks all public access. Access is granted only via IAM roles to specific services.
*   **Automatic Deletion:** A lifecycle policy permanently deletes all uploaded files **24 hours** after creation.
