# PRD Section 39: Performance Monitoring & KPIs

## 1. Executive Summary

This document provides the detailed specification for the performance monitoring dashboards and Key Performance Indicators (KPIs) for SyncWell. While `16-performance-optimization.md` defined the strategy, this document specifies the *exact* metrics we will track, their data sources, and how they will be visualized. The goal is to create a set of actionable dashboards that provide an at-a-glance view of the application's performance health.

For the **solo developer**, these pre-defined dashboards are an essential tool for efficiently monitoring the production application, enabling the rapid detection and diagnosis of performance regressions.

## 2. Performance Monitoring Philosophy

*   **Dashboard-Driven:** We will build and maintain a small number of curated dashboards. We will not rely on digging through raw logs to find performance issues.
*   **Focus on Percentiles, Not Averages:** Averages can hide problems. We will focus on P90, P95, and P99 metrics to understand the experience of the users most affected by performance issues.
*   **Correlate with Releases:** All performance graphs will be annotated with app version releases. This allows for the immediate identification of a performance regression introduced by a specific update.
*   **User-Centric Metrics:** The primary metrics are those that directly impact the user's experience (e.g., app start time, crash rate), not just system-level metrics (e.g., CPU usage).

## 3. The Primary Performance Dashboard (Firebase)

This dashboard will be built in the Firebase Console and will be the developer's first destination for checking app health.

| Widget Title | Chart Type | Metric(s) | Data Source | SLO Target |
| :--- | :--- | :--- | :--- | :--- |
| **Crash-Free Users (24h)**| Big Number / Gauge | `crashlytics.crash_free_users_rate` | Firebase Crashlytics | > 99.9% |
| **App Start Time (P90)**| Time Series Line | `performance.app_start_time` | Firebase Performance | < 2.0s |
| **Screen Transition Time (P90)**| Time Series Line | `performance.screen_render_time` (by screen name) | Firebase Performance | < 250ms |
| **API Call Latency (P95)** | Time Series Line | `performance.network_request_time` (by host) | Firebase Performance | < 1.5s |
| **Slow Frames / Frozen Frames**| Stacked Bar Chart | `performance.slow_frames`, `performance.frozen_frames`| Firebase Performance | < 1% / < 0.1%|
| **Version Adoption**| Donut Chart | `analytics.users_by_app_version` | Firebase Analytics | > 90% on latest version within 14 days |

## 4. The Sync Health Dashboard (Custom/Firebase)

This dashboard focuses specifically on the health of the core sync engine.

| Widget Title | Chart Type | Metric(s) | Data Source | SLO Target |
| :--- | :--- | :--- | :--- | :--- |
| **Sync Success Rate (24h)**| Big Number / Gauge | Custom Logged Event: `sync_job_completed` with `status: 'success'/'failure'` | Firebase Analytics | > 99.5% |
| **Sync Failure Rate by Provider**| Stacked Bar Chart | `sync_job_completed` events where `status=='failure'`, grouped by `source_provider` | Firebase Analytics | N/A (Diagnostic) |
| **Sync Failure Rate by Error Code**| Table | `sync_job_completed` events where `status=='failure'`, grouped by `error_code` | Firebase Analytics | N/A (Diagnostic) |
| **Sync Job Latency (P90)**| Time Series Line | Custom Logged Metric on `sync_job_completed` event: `duration_ms` | Firebase Analytics | < 30s (for delta sync) |
| **Historical Sync Jobs (Active)**| Big Number | Custom Metric: Count of jobs in `P1_HISTORICAL_QUEUE` with `status=='RUNNING'` | Firebase Analytics | N/A (Informational)|

## 5. Implementation & Tooling

*   **Firebase Performance Monitoring:** The Firebase Performance SDK will be integrated into the app. Custom traces will be created to monitor key user flows, such as the `full_onboarding_flow` and `historical_sync_job`.
*   **Custom Event Logging:** The app will log specific analytics events (as defined in `23-analytics.md` and above) to Firebase Analytics. These events are crucial for building the Sync Health Dashboard.
*   **Alerting:** Alerts will be configured in Firebase to automatically notify the developer via email if any of the core SLOs are breached for a significant period (e.g., if the Crash-Free User Rate drops below 99.5% for more than 1 hour).

## 6. Optional Visuals / Diagram Placeholders
*   **[Mockup] Primary Performance Dashboard:** A high-fidelity mockup of the complete Firebase dashboard, showing the layout of the widgets defined in Section 3.
*   **[Mockup] Sync Health Dashboard:** A high-fidelity mockup of the sync-specific dashboard, showing the failure rate breakdowns.
*   **[Code Snippet] Custom Trace:** A sample code snippet showing how a custom Firebase Performance trace is started and stopped around a specific function.
*   **[Flowchart] Alerting Logic:** A flowchart showing how a performance metric dipping below its SLO target triggers an alert that is sent to the developer.
