---
title: "PRD: Data Export"
migrated: true
---
## Dependencies

### Core Dependencies
- `../architecture/06-technical-architecture.md` - **[Authoritative]** Technical Architecture
- `../qa/14-qa-testing.md` - QA & Testing Strategy

### Strategic / Indirect Dependencies
- `../security/19-security-privacy.md` - Data Security & Privacy Policies
- `../ux/36-user-privacy-settings.md` - User Privacy Controls & Settings

---

# PRD: Data Export

## 1. Executive Summary

This document provides the detailed specification for the **Data Export** feature. This feature empowers users with true ownership of their data by allowing them to export it into standard, open file formats. This is a critical feature for building user trust and ensuring compliance with data portability regulations like GDPR. This feature is restricted to **Pro Tier subscribers**, partly to cover the cloud computing costs associated with large export jobs.

To ensure reliability and performance, especially for large exports, this feature is built on an **asynchronous, backend-driven architecture**. This specification details the process of offloading export jobs to the backend, processing them reliably, and notifying the user when the export is ready for download.

*   **Priority:** **P2 (Should-Have)** for Post-MVP v1.2 Release
*   **Status:** Not Started

## 2. User Experience & Workflow

The user experience is designed to be simple and asynchronous.

1.  **Configuration:** The user navigates to "Settings > Export Data". The UI presents a multi-select list of available data types (Activities, Daily Steps, etc.) and a date range picker.
2.  **Initiation:** After tapping "Start Export," the UI updates to show a persistent status indicator: **"Your export is being prepared. We will notify you when it's ready to download."**
3.  **Wait:** The user can now safely close the app. The export is processed on the backend.
4.  **Completion Notification:** Once the export is complete, the user receives a push notification (`N-07`): **"Your data export is ready to download."**
5.  **Failure Notification:** If the export fails for an unrecoverable reason, the UI shows: **"Your data export from [Date] failed. Please contact support."**
6.  **Download:** Tapping the success notification opens the app to a screen where they can download the `.zip` file. The pre-signed download link will be valid for **24 hours**.

## 3. Technical Architecture (Orchestrated by AWS Step Functions)

To robustly handle a potentially long-running and multi-step process, the Data Export feature will be orchestrated by a dedicated **AWS Step Functions state machine** (`DataExportStateMachine`). This aligns with the "Cold Path" architecture, promoting architectural consistency, reliability, and observability. The workflow is as follows:

1.  **Initiation (API):** The mobile app calls `POST /v1/export-jobs`. The API Gateway validates the request and triggers a new execution of the `DataExportStateMachine`, passing in the user's parameters and a unique `Idempotency-Key`. The idempotency strategy for Step Functions executions is defined in `../architecture/06-technical-architecture.md`.

2.  **State Machine Execution (Backend):** The state machine manages the entire workflow:
    *   **a. Validate & Prepare:** A lightweight Lambda function validates the export parameters and creates the initial job record in the main `SyncWellMetadata` DynamoDB table.
    *   **b. Fetch Data in Chunks (Parallel):** A `Map` state processes the requested date range in parallel. It breaks the range into manageable **30-day chunks** and invokes a **Fargate task** for each chunk. This task fetches the relevant data and stores it in a temporary, format-specific location: `s3://syncwell-prod-data-exports-temp/{jobId}/{chunkId}/`. This S3 bucket has a strict **24-hour lifecycle policy** to manage costs and data retention.
    *   **c. Consolidate & Format (Sequential):** After the `Map` state completes successfully, a single, larger **Fargate task** is invoked. It consolidates all the temporary data chunks from S3. It then uses internal `Exporter` modules (internal, format-specific libraries implementing a common `IExporter` interface) to format the data into the final specified file formats.
    *   **d. Compress & Store (Sequential):** The same Fargate task then compresses the formatted files into a single `.zip` archive and uploads it to the final, secure S3 bucket (`s3://syncwell-prod-data-exports-final/`).
    *   **e. Finalize & Notify (Sequential):** A final lightweight Lambda function updates the `EXPORT` job item in DynamoDB with the `COMPLETED` status and the secure, time-limited S3 download URL. It then publishes an event to SNS to trigger the `N-07` push notification to the user.
    *   **f. Error Handling:** The state machine has a global `Catch` block that routes any terminal failure from any step to a dedicated error-handling Lambda. This Lambda updates the job's status to `FAILED` in DynamoDB and triggers the appropriate failure notification to the user.

### 3.1. DynamoDB Job Tracking

To adhere to the single-table design philosophy, the status of export jobs will be tracked as a new item type in the main `SyncWellMetadata` table.

| Entity | PK (Partition Key) | SK (Sort Key) | Key Attributes & Defined Values |
| :--- | :--- | :--- | :--- |
| **Data Export Job** | `USER#{userId}` | `EXPORT##{jobId}` | `ExecutionArn`, `Status`: `PENDING`, `RUNNING`, `SUCCEEDED`, `FAILED`, `DownloadUrl` |

## 4. File Format Specifications

| Data Type | Supported Formats | Schema Details |
| :--- | :--- | :--- |
| **Activities** | **FIT, TCX, GPX, CSV**| **FIT:** Conforms to the 'Flexible and Interoperable Data Transfer' Protocol **Version 2.0**. <br> **CSV:** Must be RFC 4180 compliant, UTF-8 encoded, and include a header row. |
| **Daily Steps**| **CSV** | `date,step_count`. RFC 4180 compliant, UTF-8 encoded, with header. |
| **Weight** | **CSV** | `timestamp,weight_kg,body_fat_percentage`. RFC 4180 compliant, UTF-8 encoded, with header. |
| **Sleep** | **CSV** | `start_time,end_time,duration_asleep_seconds,...`. RFC 4180 compliant, UTF-8 encoded, with header. |

## 5. Export Validation Suite (QA)

To ensure the integrity of our exported files, a validation process will be implemented in the **backend's CI/CD pipeline**.

*   **Golden Files:** A "golden set" of sample `.fit`, `.tcx`, etc., files will be stored in `/qa/resources/golden-exports/`.
*   **CI/CD Validation Job:** On every deployment, a job named `validate-export-files` in the GitHub Actions pipeline will run an official command-line tool to validate that the files generated by the backend `Exporter` modules are compliant. The specific tool for FIT files is **FitCSVTool.jar** from the official FIT SDK.

## 6. Risk Analysis & Mitigation

| Risk ID | Risk Description | Probability | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **R-91** | The generated export files are corrupt or non-compliant. | **Low** | **High** | The formal "Export Validation Suite" in the backend CI/CD pipeline is the primary mitigation. |
| **R-92** | An export job for a very large date range is slow or costly. | **Medium** | **Medium** | **Mitigated by Design.** The use of AWS Fargate is specifically chosen for long-running jobs and is not subject to the short timeouts of services like AWS Lambda. Costs will be monitored via AWS Budgets. |
| **R-93** | The temporary S3 bucket for downloads is misconfigured, allowing public access. | **Low** | **Critical**| All S3 bucket policies will be defined in Terraform and will be set to private by default. Download links will be pre-signed, time-limited URLs, which provide secure, temporary access. |
| **R-94** | A user frequently initiating very large exports leads to high, unexpected cloud costs. | **Low** | **Medium** | Implement cost monitoring and alerts via AWS Budgets. Consider adding a rate-limit or a "fair use" policy for the export feature if abuse is detected. |
| **R-95** | A bug in an `Exporter` module causes the exported data to be incomplete or inaccurate. | **Medium**| **High** | The "Golden Files" validation suite provides some mitigation. Additional automated checks (e.g., record counts) should be added to the Step Functions workflow. |

## 7. Visual Diagrams

### Export Architecture (Orchestrated by Step Functions)
```mermaid
graph TD
    subgraph Mobile App
        A[Initiate Export]
        I[Download File]
    end
    subgraph AWS Backend
        B[API Gateway]
        C[Step Functions<br>DataExport State Machine]
        D[Fetch Data Chunks (Fargate)]
        E[Consolidate & Format (Fargate)]
        G[Finalize & Notify (Lambda)]
        H[S3 for Exports]
        J[SNS]
    end

    A -- Triggers --> B
    B -- Starts Execution --> C
    C -- Invokes --> D
    D -- After All Complete --> E
    E -- On Success --> G
    E -- Uploads .zip to --> H
    G -- Publishes event to --> J
    J -- via FCM/APNS --> I
    I -- Uses Pre-signed URL --> H
```

<details>
<summary>Diagram Source Code</summary>

```mermaid
graph TD
    subgraph Mobile App
        A[Initiate Export]
        I[Download File]
    end
    subgraph AWS Backend
        B[API Gateway]
        C[Step Functions<br>DataExport State Machine]
        D[Fetch Data Chunks (Fargate)]
        E[Consolidate & Format (Fargate)]
        G[Finalize & Notify (Lambda)]
        H[S3 for Exports]
        J[SNS]
    end

    A -- Triggers --> B
    B -- Starts Execution --> C
    C -- Invokes --> D
    D -- After All Complete --> E
    E -- On Success --> G
    E -- Uploads .zip to --> H
    G -- Publishes event to --> J
    J -- via FCM/APNS --> I
    I -- Uses Pre-signed URL --> H
```
</details>
