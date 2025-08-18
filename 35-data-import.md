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

## 2. Data Import Architecture (Backend-Driven)

1.  **Initiation & Upload (Mobile):** A user selects a file (e.g., `.fit`) and uses "Open with SyncWell." The mobile app uploads this file to a secure, temporary folder in our **S3 bucket**.
2.  **Job Request (Mobile -> Backend):** The app sends a request to a new `/import` endpoint, providing the S3 URL of the uploaded file.
3.  **Queueing (Backend):** The backend creates an import job in a DynamoDB table and places a message in a dedicated **`import-queue` in SQS**.
4.  **Parsing & Validation (Backend):** An **`import-worker` (Lambda)** picks up the job. It downloads the file from S3 and uses a modular `Parser` to convert it into our `CanonicalActivity` model.
5.  **Duplicate Check (Backend):** The worker then queries the destination APIs to check for existing activities with a similar start time.
6.  **Ready for Review (Backend -> Mobile):** The worker saves the parsed data, along with any issues found (e.g., `duplicate_found`, `mapping_needed`), to the DynamoDB job table. It then sends a **push notification** to the user: *"Your imported file is ready for review."*
7.  **User Confirmation (Mobile):** The user taps the notification. The app fetches the preview data from the backend, and the user resolves any issues (e.g., chooses to "Import Anyway" on a duplicate).
8.  **Final Sync (Mobile -> Backend):** The user's confirmation is sent to the backend, which then places the final, approved sync job into the main `hot-queue` for processing.

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

### Backend-Driven Import Architecture
```mermaid
graph TD
    subgraph Mobile App
        A[Open File]
        B[Upload to S3]
        C[Send Job to Backend]
        F[Review & Confirm]
    end
    subgraph AWS Backend
        D[SQS Import Queue]
        E[Import Worker (Lambda)]
        G[SQS Hot Queue]
    end

    A --> B
    B --> C
    C --> D
    D -- Polls --> D
    E -- Parses, Validates, Checks Duplicates --> E
    E -- Sends 'Ready for Review' Push --> F
    F -- Sends Confirmation --> G
```
