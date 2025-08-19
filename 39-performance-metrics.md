## Dependencies

### Core Dependencies
- `16-performance-optimization.md` - Performance Optimization Strategy
- `23-analytics.md` - Analytics & Metrics Tracking
- `22-maintenance.md` - Maintenance & Post-Launch Operations (SRE)

### Strategic / Indirect Dependencies
- `05-data-sync.md` - Data Sync & Conflict Resolution
- `25-release-management.md` - Release Management & Versioning
- `41-metrics-dashboards.md` - Analytics Dashboard Design

---

# PRD Section 39: Performance Monitoring & KPIs

## 1. Executive Summary

This document specifies the dashboards and Key Performance Indicators (KPIs) for SyncWell. While `16-performance-optimization.md` defined the strategy, this document specifies the *exact* metrics we will track across both the **mobile client and the backend**. The goal is to create a set of actionable dashboards that provide a comprehensive, at-a-glance view of the application's performance health.

These dashboards are an essential tool for the **engineering team** to efficiently monitor the production application, enabling the rapid detection and diagnosis of performance regressions.

## 2. Performance Monitoring Philosophy

*   **Dashboard-Driven:** We will build and maintain a small number of curated dashboards for both the client and backend.
*   **Focus on Percentiles, Not Averages:** We will focus on P90, P95, and P99 metrics to understand the experience of the users most affected by performance issues.
*   **Correlate with Releases:** All performance graphs will be annotated with releases (app versions for client, deployment dates for backend).
*   **User-Centric & System-Centric Metrics:** We will track both user-facing metrics (e.g., app start time) and core system metrics (e.g., queue depth).

## 3. The Mobile Performance Dashboard (Firebase)

This dashboard will be built in the Firebase Console and focuses on the health of the user-facing mobile application.

| Widget Title | Chart Type | Metric(s) | Data Source | SLO Target |
| :--- | :--- | :--- | :--- | :--- |
| **Crash-Free Users (24h)**| Gauge | `crashlytics.crash_free_users_rate` | Firebase Crashlytics | > 99.9% |
| **App Start Time (P90)**| Time Series | `performance.app_start_time` | Firebase Performance | < 2.0s |
| **Screen Transition Time (P90)**| Time Series | `performance.screen_render_time` | Firebase Performance | < 250ms |
| **Slow/Frozen Frames**| Bar Chart | `performance.slow_frames`, `performance.frozen_frames`| Firebase Performance | < 1% / < 0.1%|
| **Version Adoption**| Donut Chart | `analytics.users_by_app_version` | Firebase Analytics | > 90% on latest version within 14 days |

## 4. The Backend Health Dashboard (AWS CloudWatch)

This dashboard will be built in AWS CloudWatch and provides a real-time view of the health of our serverless backend infrastructure.

| Widget Title | Chart Type | Metric(s) | Data Source | SLO Target |
| :--- | :--- | :--- | :--- | :--- |
| **API Gateway Latency (P95)**| Time Series | `Latency` on our API Gateway resource | AWS CloudWatch | < 500ms |
| **API Gateway Errors (5xx)**| Time Series | `5xxError` count | AWS CloudWatch | < 0.1% |
| **Lambda Worker Duration (P90)**| Time Series | `Duration` for the worker Lambda functions | AWS CloudWatch | < 15s (Hot Path) |
| **Lambda Worker Errors**| Time Series | `Errors` count | AWS CloudWatch | < 0.5% |
| **Lambda Worker Throttles**| Time Series | `Throttles` count | AWS CloudWatch | 0 |
| **SQS Hot Path Queue Depth**| Big Number / Time Series | `ApproximateNumberOfMessagesVisible` for the "Hot" queue | AWS CloudWatch | < 100 (sustained) |
| **Step Functions (Cold Path) Failures**| Time Series | `ExecutionsFailed` for all historical sync state machines | AWS CloudWatch | 0 |
| **Step Functions (Cold Path) Timeouts**| Time Series | `ExecutionsTimedOut` for all historical sync state machines | AWS CloudWatch | 0 |
| **DynamoDB Throttled Requests**| Time Series | `ReadThrottleEvents`, `WriteThrottleEvents` | AWS CloudWatch | 0 |

## 5. The Sync Health Dashboard (Combined)

This dashboard provides a holistic view of the end-to-end sync process, combining backend and client data.

| Widget Title | Chart Type | Metric(s) | Data Source | SLO Target |
| :--- | :--- | :--- | :--- | :--- |
| **E2E Sync Success Rate (24h)**| Gauge | Count of `SyncSuccess` events / Count of `SyncStarted` events | Custom Metrics (CloudWatch) | > 99.5% |
| **Sync Failure Rate by Provider**| Bar Chart | Custom Metric: `SyncFailed` events grouped by `source_provider` dimension | AWS CloudWatch | N/A (Diagnostic) |
| **Sync Failure Rate by Error Code**| Table | `Errors` metric grouped by error type in Lambda logs | AWS CloudWatch Logs | N/A (Diagnostic) |
| **E2E Sync Job Latency (P90)**| Time Series | Lambda `Duration` metric | AWS CloudWatch | < 30s (for delta sync) |
| **Dead-Letter Queue Size** | Big Number | `ApproximateNumberOfMessagesVisible` for the DLQ | AWS CloudWatch | 0 |

## 6. Implementation & Tooling

*   **Firebase SDK:** The Performance Monitoring and Crashlytics SDKs will be integrated into the mobile app.
*   **AWS CloudWatch:** All AWS services (Lambda, SQS, DynamoDB, API Gateway) are automatically integrated with CloudWatch. We will build our dashboards and alerts here.
*   **Alerting:**
    *   **Firebase:** Alerts will be configured for client-side issues like a drop in crash-free rate.
    *   **CloudWatch:** Alerts will be configured for backend issues, such as a spike in Lambda errors, a growing SQS queue, or a breach of the API latency SLO. Alerts will be sent to a dedicated engineering Slack channel or PagerDuty.

## 7. Optional Visuals / Diagram Placeholders
*   **[Mockup] Backend Health Dashboard:** A high-fidelity mockup of the complete CloudWatch dashboard.
*   **[Flowchart] Alerting Logic:** A flowchart showing how a backend metric (e.g., SQS Queue Depth) breaching its SLO target triggers a CloudWatch Alarm that notifies the on-call engineer.
