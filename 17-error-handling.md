# PRD Section 17: Error Handling, Logging & Monitoring

## 1. Executive Summary

This document specifies the comprehensive strategy for error handling, logging, and monitoring within the SyncWell application. The goal is to build a highly resilient and observable system that can gracefully handle unexpected issues, provide clear feedback to the user, and give the developer powerful tools to diagnose and resolve problems quickly.

This enterprise-grade approach moves beyond simple `try/catch` blocks to a structured system with a centralized error handler, structured JSON logging, and actionable monitoring dashboards. For the **solo developer**, this investment in observability is critical for maintaining a high-quality service efficiently.

## 2. Error Handling Architecture

A centralized `ErrorHandler` service will be the single point through which all application errors flow. This ensures that handling policies are applied consistently.

1.  **Error Occurs:** A caught exception or API failure occurs somewhere in the app.
2.  **`ErrorHandler.handle(error, context)` is called:** The raw error object is passed to the central handler, along with contextual information (e.g., the name of the operation that failed).
3.  **Triage & Classification:** The `ErrorHandler` inspects the error type and uses the **Error Code Dictionary** (see Section 3) to classify it as `USER_FACING`, `RECOVERABLE`, or `CRITICAL`.
4.  **Action Dispatch:** Based on the classification, the handler dispatches the appropriate actions:
    *   Show a user-facing message via a `NotificationService`.
    *   Log the error to the local device log via a `LoggingService`.
    *   Report the error to the remote monitoring service (Firebase Crashlytics).

## 3. Error Code Dictionary

An internal, version-controlled dictionary (e.g., a JSON or TypeScript file) will map internal error types to handling policies. This creates a single source of truth.

**Example Entry:**
```json
{
  "FITBIT_TOKEN_EXPIRED": {
    "logLevel": "WARN",
    "isCritical": false,
    "userMessage": "Your connection to Fitbit has expired. Please tap here to sign in again.",
    "userAction": "NAVIGATE_TO_REAUTH_FITBIT"
  },
  "DATABASE_CORRUPTION": {
    "logLevel": "ERROR",
    "isCritical": true,
    "userMessage": "SyncWell has encountered a problem with its local database. Please try restarting the app or contact support.",
    "userAction": "SHOW_SUPPORT_CONTACT"
  }
}
```

## 4. Structured Logging Strategy

All local logs will be written as structured JSON objects to enable easier parsing and analysis.

*   **Log Format:** Each log entry will be a JSON object with the following schema:
    ```json
    {
      "timestamp": "2023-10-27T14:30:00.123Z", // ISO 8601
      "level": "INFO", // DEBUG, INFO, WARN, ERROR
      "message": "Sync job completed",
      "context": {
        "jobId": "xyz-123",
        "source": "fitbit",
        "destination": "googlefit",
        "durationMs": 15234
      },
      "error": { // Optional, only for ERROR level
        "name": "FitbitApiError",
        "statusCode": 429
      }
    }
    ```
*   **PII Scrubbing:** A utility will be used to automatically scrub all log objects for anything that resembles an email address, user ID, or other PII before it is written to the log file.
*   **Log Rotation:** The on-device `LoggingService` will manage log files, keeping a maximum of 5 files of 5MB each, automatically deleting the oldest file.

## 5. Monitoring & Alerting Dashboards

The developer will configure specific dashboards in Firebase to provide at-a-glance system observability.

### Primary Firebase Dashboard Widgets:

*   **Crash-Free Users (Last 24h):** The main KPI.
*   **Top 5 Crashes by Occurrence:** Shows where to focus debugging efforts.
*   **App Version Adoption:** Tracks the rollout of new releases.
*   **API Error Rate by Provider:** A custom chart tracking logged errors (non-crashes) for each third-party API (e.g., `FitbitApiError`, `GarminApiError`). This is a critical early warning system for partner outages.
*   **Payment Failure Rate:** Tracks errors related to IAP processing.

### Alerting Rules:

Alerts will be configured in Firebase to trigger emails to the developer:
*   **High Priority:**
    *   When any new type of crash is detected.
    *   When the crash-free user rate drops below 99.5% for an hour.
*   **Medium Priority:**
    *   When there is a significant spike (>200%) in a specific, non-fatal logged error (e.g., `FITBIT_TOKEN_EXPIRED`).

## 6. Risk Analysis & Mitigation

(This section remains largely the same but is included for completeness.)

| Risk ID | Risk Description | Probability | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **R-49** | Logs contain sensitive user data, leading to a privacy violation. | Low | High | The structured logging format and the PII scrubbing utility provide a strong defense. This must be a key item in the pre-launch security audit. |
| **R-50** | Excessive logging impacts application performance. | Medium | Medium | Use an asynchronous logging library. The `LoggingService` will batch writes to the file system instead of writing on every single log call. |
| **R-51** | The developer is overwhelmed by the volume of error alerts ("alert fatigue"). | Medium | Medium | The alerting rules are designed to be specific. Fine-tuning these rules based on real-world noise levels will be an ongoing task. |

## 7. Optional Visuals / Diagram Placeholders
*   **[Diagram] Error Handling Architecture:** A flowchart showing how an error is passed to the central `ErrorHandler` and then dispatched to the logging, notification, and monitoring services.
*   **[Code Snippet] Structured Log Example:** A formatted JSON snippet showing a real-world example of a log entry.
*   **[Mockup] Monitoring Dashboard:** A mockup of the proposed Firebase dashboard, showing the layout of the key charts and metrics defined in Section 5.
*   **[Table] Error Code Dictionary:** A sample of the error code dictionary, showing several error types and their associated handling policies.
