---
title: "PRD Section 39: Performance Monitoring & KPIs"
migrated: true
---
## Dependencies

### Core Dependencies
- `./16-performance-optimization.md` - Performance Optimization Strategy
- `./23-analytics.md` - Analytics & Metrics Tracking
- `./22-maintenance.md` - Maintenance & Post-Launch Operations (SRE)

### Strategic / Indirect Dependencies
- `../architecture/05-data-sync.md` - Data Sync & Conflict Resolution
- `./25-release-management.md` - Release Management & Versioning
- `./41-metrics-dashboards.md` - Analytics Dashboard Design

---

# PRD Section 39: Performance Monitoring & KPIs

## 1. Executive Summary

This document specifies the dashboards and Key Performance Indicators (KPIs) for SyncWell. While `16-performance-optimization.md` defined the strategy, this document specifies the *exact* metrics we will track across both the **mobile client and the backend**. The goal is to create a set of actionable dashboards that provide a comprehensive, at-a-glance view of the application's performance health.

These dashboards are an essential tool for the **engineering team** to efficiently monitor the production application.

## 2. Performance Monitoring Philosophy

*   **Dashboard-Driven:** We will build and maintain a small number of curated dashboards. [NEEDS_CLARIFICATION: Links to the live dashboards in Firebase and CloudWatch/Grafana should be added here.]
*   **Focus on Percentiles:** We will focus on P90, P95, and P99 metrics.
*   **Correlate with Releases:** All performance graphs will be annotated with releases. This will be automated via a script in the CI/CD pipeline that calls the respective monitoring service's API after a successful deployment.
*   **User-Centric & System-Centric Metrics:** We will track both user-facing and core system metrics.

## 3. Custom Metrics Namespace & Dimensions

To ensure consistency, all custom backend metrics published to CloudWatch will use the following structure:
*   **Namespace:** `SyncWell`
*   **Common Dimensions:**
    *   `Provider`: (e.g., `fitbit`, `strava`) To isolate issues to a specific integration.
    *   `SyncType`: (e.g., `hot_path`, `cold_path`, `data_import`) To distinguish between different workloads.

## 4. The Mobile Performance Dashboard (Firebase)

This dashboard will be built in the Firebase Console and focuses on the health of the user-facing mobile application.

| Widget Title | Chart Type | Metric(s) | Data Source | SLO Target |
| :--- | :--- | :--- | :--- | :--- |
| **Crash-Free Users (24h)**| Gauge | `crashlytics.crash_free_users_rate` | Firebase Crashlytics | > 99.9% |
| **App Start Time (P90)**| Time Series | `performance.app_start_time` | Firebase Performance | < 2.0s |
| **Version Adoption**| Donut Chart | `analytics.users_by_app_version` | Firebase Analytics | > 90% on latest version within 14 days |

## 5. The Backend Health Dashboard (AWS CloudWatch)

This dashboard will be built in AWS CloudWatch and provides a real-time view of the health of our backend infrastructure.

| Widget Title | Chart Type | Metric(s) | Data Source | SLO Target |
| :--- | :--- | :--- | :--- | :--- |
| **API Gateway Latency (P99)**| Time Series | `Latency` on our API Gateway resource | AWS CloudWatch | < 500ms |
| **API Gateway Errors (5xx)**| Time Series | `5xxError` count | AWS CloudWatch | < 0.1% |
| **Fargate Worker CPU/Memory**| Time Series | `CPUUtilization`, `MemoryUtilization` for the Fargate service | AWS CloudWatch | < 80% (sustained) |
| **Fargate Worker Task Count**| Time Series | `RunningTaskCount` for the Fargate service | AWS CloudWatch | N/A (Diagnostic) |
| **Webhook Ingestion Rate**| Time Series | `WebhookReceived` count, grouped by `Provider` | Custom (`SyncWell`) | N/A (Diagnostic) |
| **Time Since Last Webhook**| Big Number | `TimeSinceLastWebhook`, per `Provider` | Custom (`SyncWell`) | < 6 hours |
| **SQS Hot Path Queue Depth**| Big Number / Time Series | `ApproximateNumberOfMessagesVisible` | AWS CloudWatch | < 100 (sustained) |
| **Step Functions Failures**| Time Series | `ExecutionsFailed` for historical sync & data import state machines | AWS CloudWatch | 0 |
| **DynamoDB Throttled Requests**| Time Series | `ReadThrottleEvents`, `WriteThrottleEvents` | AWS CloudWatch | 0 |

## 6. The Sync Health Dashboard (Combined)

This dashboard provides a holistic view of the end-to-end sync process.

| Widget Title | Chart Type | Metric(s) | Data Source | SLO Target |
| :--- | :--- | :--- | :--- | :--- |
| **Sync Success Rate (24h)**| Gauge | `SyncJobCompleted` where `status='SUCCESS'` / `SyncJobRequested` | Custom (`SyncWell`) | > 99.9% |
| **Sync Failure Rate by Provider**| Bar Chart | `SyncJobCompleted` where `status='FAILURE'`, grouped by `Provider` | Custom (`SyncWell`) | N/A (Diagnostic) |
| **Manual Sync Latency (P95)**| Time Series | Time delta between `SyncJobCompleted` and `SyncJobRequested` events | Custom (`SyncWell`) | < 15s |
| **Dead-Letter Queue Size** | Big Number | `ApproximateNumberOfMessagesVisible` for the DLQ | AWS CloudWatch | 0 |

## 7. Implementation & Tooling

*   **Firebase SDK:** Integrated into the mobile app for client-side metrics.
*   **AWS CloudWatch:** Used for backend metrics, dashboards, and alerting.
*   **Alerting:**
    *   **Firebase:** Alerts configured for client-side issues (e.g., crash rate).
    *   **CloudWatch:** Alerts configured for backend issues (e.g., API latency, queue depth). Alerts are routed via SNS to PagerDuty. [NEEDS_CLARIFICATION: The specific thresholds for each alarm and the PagerDuty service integration key must be defined in our Terraform configuration.]
