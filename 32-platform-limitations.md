# PRD Section 32: Platform-Specific Limitations

## 1. Executive Summary

This document serves as SyncWell's centralized, operational knowledge base for all known limitations, restrictions, and quirks of the third-party platforms we integrate with. The functionality and reliability of SyncWell are fundamentally constrained by the rules of these external APIs.

This is a living document that is critical for two core business functions. First, it is a technical guide for the **solo developer** that dictates the implementation details of each `DataProvider` module. Second, it is the single source of truth for all user-facing communications about platform-specific issues, enabling us to manage expectations proactively, reduce support tickets, and build user trust through transparency.

## 2. Proactive Limitation Detection

We will not wait for users to report problems. We will actively seek to identify limitations through the following channels:
*   **API Documentation Review:** Before starting a new integration, its API documentation and terms of service will be scoured for explicit limitations.
*   **Developer Forum Monitoring:** The developer will monitor the official developer forums for our key partners (Garmin, Fitbit, etc.) for discussions that reveal undocumented behaviors or upcoming changes.
*   **Targeted Exploratory Testing:** During the development of a new provider, testing will be done specifically to find the "edge cases" of the API.
*   **API Error Log Analysis:** Spikes in specific error codes from our monitoring dashboards will be investigated to see if they correlate with a new, unannounced platform limitation.

## 3. The Platform Limitation Database

This matrix serves as our formal, internal database of all known limitations.

| ID | Platform | Limitation / Quirk | Status | Discovered | Technical Implementation Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **L-01** | Garmin | **No Write Access:** The official API is read-only for almost all data types. | Confirmed | 2023-10-01 | In the `GarminProvider`, the `writeData()` method should immediately throw a `NotSupportedError`. The UI must disable Garmin as a destination option. |
| **L-02** | Garmin | **Historical Data Limits:** API provides last 2 years of daily data and 5 years of activities. | Confirmed | 2023-10-01 | The `GarminProvider.fetchData()` method must check the requested date range and return an empty array for dates beyond the limit. The UI must disable the date picker accordingly. |
| **L-03** | Garmin | **No 3rd-Party Activity Sync:** Does not expose activities synced *into* Garmin from other sources (e.g., Zwift). | Confirmed | 2023-10-01 | The `GarminProvider` cannot see this data. No technical action is possible, this must be handled via user communication. |
| **L-04** | Polar | **No Historical Data Access:** The API does not provide a mechanism to fetch data for a specified date range in the past. | Confirmed | 2023-10-05 | The `PolarProvider` will not implement the `fetchHistoricalData` method. The Historical Sync feature will be disabled in the UI when Polar is the selected source. |
| **L-05** | Huawei | **Limited Write Access:** API only allows writing a small subset of data types (e.g., weight). | Confirmed | 2023-10-08 | The `HuaweiProvider.writeData()` method must check the `dataType` and throw a `NotSupportedError` for unsupported types like activities. |
| **L-06** | Google Fit| **Native Tracking Conflicts:** If Google Fit's own tracking is enabled, it can lead to duplicated data. | Confirmed | 2023-09-15 | The app will use the Google Fit API to check if `com.google.android.gms` is a data source for steps. If so, a persistent warning will be shown on the dashboard. |

## 4. User Communication Matrix

This matrix defines where and how we communicate these limitations to the user.

| ID | Limitation | In Onboarding | In Sync Config UI | In Error Message | FAQ Article |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **L-01** | Garmin: No Write | No | Yes (Grayed out as destination, with tooltip) | Yes (If user somehow tries) | Yes (Dedicated Article) |
| **L-02** | Garmin: History Limit| No | Yes (Date picker disabled) | No | Yes (Mentioned in Hist. Sync article) |
| **L-03** | Garmin: 3rd Party | No | No | No | Yes (Dedicated Article) |
| **L-04** | Polar: No History| No | Yes (Historical Sync option disabled) | No | Yes (Mentioned in Hist. Sync article) |
| **L-06** | Google Fit: Conflicts| No | Yes (Persistent warning banner on dashboard) | No | Yes (Dedicated Article with video) |

## 5. Known Workarounds

This section documents workarounds that can be communicated to users in FAQ articles.

*   **Huawei Health in Unsupported Regions (L-05):**
    *   **Problem:** The Huawei Health Kit API is geo-restricted and not available in the USA.
    *   **Workaround:** Users can create a new Huawei ID, setting their region to a supported country (e.g., Mexico, UK). This allows the API to be enabled. This comes with the caveat that their old data will not be accessible. This process will be documented in detail in the Help Center.
*   **Syncing Zwift/TrainerRoad Data (related to L-03):**
    *   **Problem:** Users want to sync their Zwift data, but it doesn't show up if they sync it through Garmin.
    *   **Workaround:** The user should connect their Zwift account to a free Strava account, and then connect both their Garmin and Strava accounts to SyncWell as sources. SyncWell will automatically de-duplicate the activities.

## 6. Optional Visuals / Diagram Placeholders
*   **[Flowchart] Limitation Discovery Process:** A flowchart showing the process from "New API Error Pattern Detected" to "Limitation ID Created" and "User Communication Matrix Updated."
*   **[Mockup] Dynamic UI for Limitations:** A mockup showing the Sync Configuration screen with Garmin grayed out as a destination, with a clear tooltip explaining why.
*   **[Table] User Communication Matrix:** A full, detailed version of the table in Section 4.
