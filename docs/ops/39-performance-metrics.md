---
title: "Performance Monitoring & KPIs Specification"
migrated: true
---
## Dependencies

### Core Dependencies
- `./16-performance-optimization.md` - Performance Optimization Strategy
- `./41-metrics-dashboards.md` - **[Authoritative]** Analytics Dashboard Design
- `./22-maintenance.md` - Maintenance & Post-Launch Operations (SRE)

### Strategic / Indirect Dependencies
- `../architecture/05-data-sync.md` - Data Sync & Conflict Resolution
- `./25-release-management.md` - Release Management & Versioning

---

# Performance Monitoring & KPIs Specification

## 1. Executive Summary

This document specifies the dashboards and Key Performance Indicators (KPIs) for SyncWell. While `16-performance-optimization.md` defined the strategy, this document specifies the *exact* metrics we will track. The goal is to create actionable dashboards that provide a comprehensive, at-a-glance view of the application's performance health for the **engineering and product teams**. The visual design and layout of these dashboards are maintained in [`./41-metrics-dashboards.md`](./41-metrics-dashboards.md).

## 2. Dashboards

The following dashboards will be created and maintained in Grafana and Firebase. Release events will be automatically added as annotations to all Grafana dashboards via a **GitHub Action (`.github/workflows/annotate-grafana.yml`) that calls the Grafana API** on every production deployment. The URLs below must be kept up-to-date.

| Priority | Dashboard Name | Primary Audience | Location |
| :--- | :--- | :--- | :--- |
| **P0** | **Hot Path Health (Lambda)** | On-call Engineers, SRE | [Grafana Link](https://grafana.syncwell.com/d/hotpath-health) |
| **P0** | **Sync Health & KPIs** | Product & Engineering Leads | [Grafana Link](https://grafana.syncwell.com/d/sync-health) |
| **P1** | **Cold Path Health (Fargate)** | Core Backend Team | [Grafana Link](https://grafana.syncwell.com/d/coldpath-health) |
| **P1** | **Mobile Performance** | Mobile Engineers | [Firebase Console](https://console.firebase.google.com/u/0/project/syncwell/performance/dashboard) |

## 3. Custom Metric Definitions

To ensure consistency, all custom backend metrics will be published to the **`SyncWell/Backend`** CloudWatch namespace using the **Embedded Metric Format (EMF)**. The `aws-embedded-metrics` library will be used for this purpose.

| Metric Name | Dimensions | Unit | Description |
| :--- | :--- | :--- | :--- |
| `WebhookReceived` | `Provider` | Count | Emitted by the webhook ingress Lambda each time a webhook is successfully received and authenticated. |
| `SyncJobRequested` | `Source` (e.g., `manual`, `webhook`, `scheduled`) | Count | Emitted when a sync job is placed into the SQS queue. |
| `SyncJobCompleted` | `Provider`, `Status` (`SUCCESS` or `FAILURE`) | Count | Emitted by the `WorkerLambda` when a sync job is completed. |
| `ManualSyncLatency`| `Provider` | Milliseconds | The time delta between a `SyncJobRequested` and `SyncJobCompleted` event for a manual sync. |
| `AdaptivePollingCadence`| `Provider` | Seconds | The calculated delay for the next poll for a given provider. Published by the adaptive polling scheduler. |
| `TimeSinceLastWebhook`| `Provider` | Seconds | A gauge metric published by a scheduled Lambda (`WebhookHealthCheckLambda`) that checks the timestamp of the last received webhook for each provider. |

**`WebhookHealthCheckLambda` Specifications:**
*   **Language/Runtime:** Python 3.11
*   **Memory:** 128MB
*   **Schedule:** Runs every 15 minutes.

## 4. The Dashboards

### 4.1. P0: Hot Path Health Dashboard (Grafana)
This dashboard is for real-time, critical infrastructure monitoring of the primary Lambda-based sync pathway.

| Widget Title | Chart Type | Metric(s) | Data Source |
| :--- | :--- | :--- | :--- |
| **API Gateway Latency (P99)**| Time Series | `Latency` | AWS CloudWatch |
| **API Gateway Errors (5xx)**| Time Series | `5xxError` count | AWS CloudWatch |
| **Worker Lambda Invocations/Errors**| Time Series | `Invocations`, `Errors` | AWS CloudWatch |
| **Worker Lambda Duration (P95)**| Time Series | `Duration` | AWS CloudWatch |
| **SQS Hot Path Queue Depth**| Time Series | `ApproximateNumberOfMessagesVisible` | AWS CloudWatch |
| **DynamoDB Throttled Requests**| Time Series | `ReadThrottleEvents`, `WriteThrottleEvents` | AWS CloudWatch |

### 4.2. P0: Sync Health & KPIs Dashboard (Grafana)
This dashboard provides a holistic view of the end-to-end sync process and product KPIs.

| Widget Title | Chart Type | Metric(s) | Data Source |
| :--- | :--- | :--- | :--- |
| **Sync Success Rate (24h)**| Gauge | `SyncJobCompleted` where `status='SUCCESS'` / `SyncJobRequested` | Custom Metrics |
| **Sync Failure Rate by Provider**| Bar Chart | `SyncJobCompleted` where `status='FAILURE'`, grouped by `Provider` | Custom Metrics |
| **Manual Sync Latency (P95)**| Time Series | `ManualSyncLatency` | Custom Metrics |
| **Dead-Letter Queue Size** | Big Number | `ApproximateNumberOfMessagesVisible` for the DLQ | AWS CloudWatch |
| **Time Since Last Webhook**| Big Number | `TimeSinceLastWebhook` | Custom Metrics |

### 4.3. P1: Cold Path Health Dashboard (Grafana)
This dashboard monitors the health of asynchronous, heavy-duty Fargate jobs (e.g., Historical Sync, Data Export).

| Widget Title | Chart Type | Metric(s) | Data Source |
| :--- | :--- | :--- | :--- |
| **Active Fargate Tasks** | Time Series | `RunningTaskCount` | AWS CloudWatch |
| **Fargate Worker CPU/Memory**| Time Series | `CPUUtilization`, `MemoryUtilization` | AWS CloudWatch |
| **Step Functions Executions**| Time Series | `ExecutionsStarted`, `ExecutionsSucceeded`, `ExecutionsFailed` | AWS CloudWatch |

### 4.4. P1: Mobile Performance Dashboard (Firebase)
This dashboard focuses on the health of the user-facing mobile application. Metrics are generated by the **Firebase Performance Monitoring SDK** integrated into the KMP module.

| Widget Title | Chart Type | Metric(s) | SLO Target | Rationale & Response Plan |
| :--- | :--- | :--- | :--- | :--- |
| **Crash-Free Users (24h)**| Gauge | `crashlytics.crash_free_users_rate` | > 99.8% | A core indicator of app stability and user trust. |
| **App Start Time (P90)**| Time Series | `performance.app_start_time` | < 2.0s | A slow app start is a major source of user frustration. |
| **Version Adoption**| Donut Chart | `analytics.users_by_app_version` | > 90% on latest version within 14 days | This ensures that we can deprecate older API versions and client builds in a timely manner, reducing maintenance overhead. If the target is not met, the mobile team lead must investigate potential causes (e.g., release issues, user resistance) and present a remediation plan. |

## 5. Alerting Configuration

Alerts are routed from CloudWatch via SNS to the **`#eng-alerts-p1`** Slack channel and the **`SyncWell-Backend-P1`** PagerDuty service.

| Alert Name | Metric | Threshold | Statistic | Period | Eval Periods | Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **High API Gateway P99 Latency**| `Latency` (API Gateway) | > 500ms | p99 | 5 min | 2 | Indicates a widespread backend performance issue. |
| **API Gateway 5xx Error Spike**| `5xxError` | > 1% | Sum | 5 min | 1 | A sudden spike in server errors indicates a critical failure. |
| **Lambda Error Rate High**| `Errors` / `Invocations` | > 2% | Average | 5 min | 2 | High error rate in the worker fleet points to a bug in the core sync logic. |
| **SQS Queue Depth High** | `ApproximateNumberOfMessagesVisible` | > 1000 | Maximum | 10 min | 3 | A threshold of 1000 indicates that the worker fleet is unable to keep up with the incoming job volume for a sustained period. |
| **DLQ Has Messages** | `ApproximateNumberOfMessagesVisible` (DLQ) | > 0 | Sum | 1 min | 1 | Any message in the DLQ represents a permanently failed job that requires manual intervention. |
| **DynamoDB Throttling** | `ReadThrottleEvents` or `WriteThrottleEvents` | > 10 | Sum | 5 min | 1 | Indicates that our DynamoDB capacity is insufficient for the current load. |
| **Sync Success Rate Low** | `SyncSuccessRate` (custom) | < 99.9% | Average | 1 hour | 1 | A drop in this key business metric indicates a widespread problem affecting users, even if system-level metrics appear healthy. |

## 6. Risk Analysis

| Risk ID | Risk Description | Probability | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **R-101** | A bug in our instrumentation leads to inaccurate metrics, causing us to make bad product or technical decisions. | Medium | High | Key business metrics (e.g., SyncSuccessRate) must be validated with automated end-to-end tests that confirm the metric is emitted correctly. |
| **R-102** | Poorly configured or overly sensitive alerts create "alert fatigue," causing engineers to ignore real issues. | High | Medium | A quarterly review of all P1 alerts will be conducted by the **SRE team lead** to ensure they are still relevant and have a low false-positive rate. Any alert that fires more than 3 times a week without a corresponding incident is a candidate for re-evaluation. |
