---
title: "Platform-Specific Limitations Knowledge Base"
---
## Dependencies

### Core Dependencies
- `07-apis-integration.md` - APIs & Integration Requirements
- `30-sync-mapping.md` - Source-Destination Sync Mapping
- `../ops/24-user-support.md` - Help Center, Support & Feedback

### Strategic / Indirect Dependencies
- `../ux/09-ux-configuration.md` - UX, Configuration & Settings
- `../ops/17-error-handling.md` - Error Handling, Logging & Monitoring
- `../prd/31-historical-data.md` - Historical Data Handling

---

# Platform-Specific Limitations Knowledge Base

## 1. Executive Summary

This document serves as SyncWell's centralized, operational knowledge base for all known limitations, restrictions, and quirks of the third-party platforms we integrate with. The functionality and reliability of SyncWell are fundamentally constrained by the rules of these external APIs.

This is a living document that is critical for two core business functions. First, it is a technical guide for the **engineering team** that dictates the implementation details of each `DataProvider` module. Second, it is the single source of truth for all user-facing communications about platform-specific issues, enabling us to manage expectations proactively, reduce support tickets, and build user trust through transparency.

## 2. Proactive Limitation Detection

We will not wait for users to report problems. The **Core Backend team** is responsible for actively seeking to identify limitations through the following channels:
*   **API Documentation Review:** Before starting a new integration, its API documentation and terms of service will be scoured for explicit limitations.
*   **Developer Forum Monitoring:** The developer will monitor the official developer forums for our key partners (Garmin, Fitbit, etc.) for discussions that reveal undocumented behaviors or upcoming changes.
*   **Targeted Exploratory Testing:** During the development of a new provider, testing will be done specifically to find the "edge cases" of the API.
*   **API Error Log Analysis:** Spikes in specific error codes from our monitoring dashboards will be investigated to see if they correlate with a new, unannounced platform limitation.

## 3. The Platform Limitation Database

This matrix serves as our formal, internal database of all known limitations.

| ID | Platform | Limitation / Quirk | Status | Discovered | Technical Implementation Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **L-01** | Garmin | **No Write Access:** The official API is read-only for almost all data types. | **Post-MVP** | 2023-10-01 | In the `GarminProvider`, the `writeData()` method should immediately throw a `NotSupportedError`. The UI must disable Garmin as a destination option. |
| **L-02** | Garmin | **Historical Data Limits:** API provides last 2 years of daily data and 5 years of activities. | **Post-MVP** | 2023-10-01 | The `GarminProvider.fetchData()` method must check the requested date range and return an empty array for dates beyond the limit. The UI must disable the date picker accordingly. |
| **L-03** | Garmin | **No 3rd-Party Activity Sync:** Does not expose activities synced *into* Garmin from other sources (e.g., Zwift). | **Post-MVP** | 2023-10-01 | The `GarminProvider` cannot see this data. No technical action is possible, this must be handled via user communication. |
| **L-04** | Polar | **No Historical Data Access:** The API does not provide a mechanism to fetch data for a specified date range in the past. | **Post-MVP** | 2023-10-05 | The `PolarProvider` will not implement the `fetchHistoricalData` method. The Historical Sync feature will be disabled in the UI when Polar is the selected source. |
| **L-05** | Huawei | **Limited Write Access:** API only allows writing a small subset of data types (e.g., weight). | **Post-MVP** | 2023-10-08 | The `HuaweiProvider.writeData()` method must check the `dataType` and throw a `NotSupportedError` for unsupported types like activities. |
| **L-06** | Google Fit| **Native Tracking Conflicts:** If Google Fit's own tracking is enabled, it can lead to duplicated data. | **Confirmed** | 2023-09-15 | The app will use the Google Fit API to check if `com.google.android.gms` is a data source for steps. If so, a persistent warning will be shown on the dashboard. |
| **L-07** | Fitbit | **Read-Only Activities:** The API supports writing activities, but our MVP implementation is read-only. | **Confirmed** | 2023-08-22 | The `FitbitProvider.writeData()` method should throw a `NotSupportedError` for activity types. |
| **L-08** | Strava | **No Daily Step Data:** The API is activity-focused and does not provide daily step count totals. | **Confirmed** | 2023-08-22 | The `StravaProvider` will not claim the `READ_STEPS` or `WRITE_STEPS` capabilities. |

### 3a. API Rate Limits

As our user base scales to 1M DAU, we will make millions of API calls per day. Proactively managing third-party rate limits is a core architectural requirement. The **distributed rate-limiting engine**, defined in `07-apis-integration.md`, relies on the limits documented here as its configuration.

**This table is a critical input for the rate-limiting engine.** The values here must be kept in sync with the provider's documentation. The configuration for the rate-limiting engine in AWS AppConfig is automatically validated against this table in the CI/CD pipeline to prevent drift.

| ID | Platform | Limit Type | Limit | Window | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RL-01**| Fitbit | User-Specific | 150 calls | 1 hour | This is a well-documented, per-user limit. Our engine must track usage for each user individually. |
| **RL-02**| Strava | Application-Wide| 600 calls | 15 minutes | This is a global limit for our entire application. The rate-limiting engine must enforce this across all worker instances. |
| **RL-03**| Strava | Application-Wide| 30,000 calls | 1 day | A secondary, daily limit that also needs to be managed globally. |

## 4. User Communication Matrix

This matrix defines where and how we communicate these limitations to the user.

| ID | Limitation | In Onboarding | In Sync Config UI | In Error Message | FAQ Article |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **L-06** | Google Fit: Conflicts| No | Yes (Persistent warning banner on dashboard) | No | Yes (Dedicated Article with video) |
| **L-07** | Fitbit: Read-Only Activities| No | Yes (Fitbit disabled as a destination for activities) | No | Yes (Mentioned in Fitbit article) |
| **L-08** | Strava: No Steps | No | Yes (Steps data type disabled for Strava) | No | Yes (Mentioned in Strava article) |

## 5. Known Workarounds

This section documents workarounds that can be communicated to users in FAQ articles.

*   **Huawei Health in Unsupported Regions (L-05):**
    *   **Problem:** The Huawei Health Kit API is geo-restricted and not available in the USA.
    *   **Workaround:** Users can create a new Huawei ID, setting their region to a supported country (e.g., Mexico, UK). This allows the API to be enabled. This comes with the caveat that their old data will not be accessible. This process will be documented in detail in the Help Center by the **User Support team**.
*   **Syncing Zwift/TrainerRoad Data (related to L-03, Post-MVP):**
    *   **Problem:** Users want to sync their Zwift data, but it doesn't show up if they sync it through a provider like Garmin that doesn't expose third-party activities.
    *   **Workaround:** The user should connect their Zwift account to a free Strava account, and then connect both their primary device (e.g., Garmin) and Strava accounts to SyncWell as sources. SyncWell will automatically de-duplicate the activities.

## 6. SyncWell Internal Platform Limitations

In addition to the limitations imposed by third-party APIs, our own architectural choices involve trade-offs. This section documents the known limitations of the SyncWell backend platform itself.

### 6.1. Compute Platform
The architecture uses a hybrid compute model to optimize for cost and performance.
*   **Hot Path (AWS Lambda):** Used for frequent, real-time syncs.
*   **Cold Path (AWS Fargate):** Used for long-running, asynchronous jobs like historical backfills.

*   **Limitation: Lambda Concurrency Limits.** While Lambda scales massively, it is subject to account-level concurrency limits.
*   **Impact:** A massive, system-wide spike in traffic could theoretically hit the concurrency limit, causing throttling. The SQS queue is designed to absorb this load, but it means that during extreme spikes, the time to process a job may temporarily increase.

### 6.2. Webhook Ingestion Model
For providers that support it, our webhook-first ingestion model provides near real-time data updates. However, this introduces a direct dependency on the reliability of the third-party provider's notification system.

*   **Limitation: Dependency on External Reliability.** We can only process data that providers send to our webhook endpoint. If a provider's webhook delivery system experiences an outage or significant delays, we will not receive user data in real-time.
*   **Impact:** Users may notice a delay in their data syncing, which is outside of SyncWell's direct control.
*   **Mitigation:** A periodic reconciliation job (`WebhookReconciliationLambda`) will run to scan for and retrieve any data that may have been missed due to a webhook delivery failure. This ensures eventual consistency, but does not solve the real-time delay.
    *   **Technical Specifications:**
        *   **Name:** `WebhookReconciliationLambda`
        *   **Language/Runtime:** Python 3.11
        *   **Memory:** 256MB
        *   **Schedule:** Runs once every 24 hours.

### 6.3. Adaptive Polling Model
For providers like Garmin that do not support webhooks, the adaptive polling system intelligently schedules syncs based on user activity. This model has inherent trade-offs between efficiency and immediacy.

*   **Limitation: Reactive, Not Pre-cognitive.** The polling algorithm is reactive; it adjusts a user's polling frequency based on their *past* activity. It cannot predict a sudden change in behavior.
*   **Impact:** If a user who is typically inactive suddenly performs a new activity, there will be a lag before the system polls for that new data. For example, if a user's polling interval has been relaxed to once every 12 hours due to inactivity, a new workout will not appear in SyncWell for up to 12 hours. The system will then detect this new activity and tighten the polling interval automatically, but the initial delay is unavoidable.
*   **Mitigation:** Users can always trigger a manual sync from the app to fetch their latest data immediately.
