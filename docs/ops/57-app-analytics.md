## Dependencies

### Core Dependencies
- `23-analytics.md` - Analytics
- `41-metrics-dashboards.md` - Metrics & Dashboards
- `56-ab-testing-framework.md` - A/B Testing Framework (Deep Dive)

### Strategic / Indirect Dependencies
- `11-monetization.md` - Monetization, Pricing & Business Model
- `48-data-deletion-policy.md` - Data Deletion Policy (Deep Dive)

---

# PRD Section 57: App Analytics (Deep Dive)

## 1. Introduction
This document provides a comprehensive guide to the app analytics strategy for SyncWell. It details our philosophy, taxonomy, tooling, and analysis methodologies, serving as the single source of truth for how we use data to make decisions.

## 2. Analytics Philosophy & Principles
-   **Measure to Learn:** Our primary goal is to learn how users interact with our product so we can improve it.
-   **Actionable over Vanity:** We focus on metrics that lead to decisions (e.g., funnel conversion rates) over metrics that look good but don't inform action (e.g., total number of sign-ups).
-   **Privacy First:** We collect the minimum data necessary and are transparent with users. We never track sensitive health data.
-   **Single Source of Truth:** The tracking plan in this document is the single source of truth. Any new event must be added here before implementation.

## 3. Taxonomy & Naming Conventions
To ensure data is clean and understandable, all events and properties must adhere to the following conventions.
-   **Events:** `object_verb` in `snake_case`. (e.g., `screen_viewed`, `subscription_started`).
-   **Properties:** `camelCase`. (e.g., `sourceProvider`, `errorCode`).
-   **Screens:** `ScreenName` in `PascalCase`. (e.g., `OnboardingWelcome`, `SubscriptionPaywall`).

## 4. Detailed Event & Property Specifications

### 4.1. Detailed Event Specification
| Event Name | Description | Parameters |
| :--- | :--- | :--- |
| `screen_viewed` | User views a screen. | `screenName` (string) |
| `user_signed_up` | User creates an account. | `method` (enum: 'email', 'google', 'apple') |
| `sync_completed` | A data sync finishes. | `sourceProvider` (string), `destinationProvider` (string), `dataTypes` (array of strings), `durationMs` (int), `status` (enum: 'success', 'fail'), `errorCode` (string, if status is fail) |
| `subscription_started`| User starts a subscription. | `productId` (string), `price` (float), `currency` (string) |
| `paywall_viewed` | User is shown the paywall screen. | `source` (string, e.g., 'onboarding', 'settings') |

### 4.2. Detailed User Property Specification
| Property Name | Data Type | Description |
| :--- | :--- | :--- |
| `subscriptionStatus` | String | User's subscription tier ('premium', 'trial', 'free'). Updated on app open and after purchase. |
| `connectedProviders` | Array[String] | List of connected third-party services. Updated on connect/disconnect. |
| `totalSuccessfulSyncs` | Integer | A counter for successful syncs. |
| `acquisitionSource` | String | How the user was acquired (e.g., 'organic', 'paid_search'). Set on first open. |

## 5. Analytics Architecture & Data Flow

### 5.1. Tooling Deep Dive
-   **Client-Side:** Google Analytics for Firebase SDK. Collects events and user properties.
-   **Backend:** Firebase Functions may be used to log server-side events to ensure key conversions (like subscriptions) are not missed.
-   **Data Warehouse:** Google BigQuery. Raw, unsampled event data from Firebase is automatically exported here daily. This is our primary tool for deep analysis.
-   **Visualization:** Google Data Studio. We will build dashboards in Data Studio that are connected to our BigQuery data.

### 5.2. Data Governance & Quality
-   **Ownership:** The Product Manager owns the analytics taxonomy and this document.
-   **Process for New Events:**
    1.  Propose the new event and its properties in a comment on this PRD.
    2.  Once approved, the PM adds it to the spec.
    3.  Engineering implements the tracking code.
-   **QA Checklist:** For every release, QA must verify that all new analytics events are firing correctly with the specified properties, using device logs or a debugging tool like Charles Proxy.

## 6. Analysis Methodologies

### 6.1. Key Funnel Definitions
-   **Onboarding Funnel:** `screen_viewed (screenName: OnboardingWelcome)` -> `user_signed_up` -> `provider_connected` -> `sync_completed`.
-   **Subscription Funnel:** `paywall_viewed` -> `subscription_started`.
-   **Integration Setup Funnel:** `screen_viewed (screenName: ProviderList)` -> `provider_connected`.

### 6.2. Cohort Analysis
-   **Purpose:** To understand user retention and behavior over time.
-   **Primary Cohort:** Users grouped by their `signup_date` (week).
-   **Primary Metric:** Day 1, Day 7, and Day 30 retention (percentage of users in the cohort who opened the app on that day).
-   **Analysis:** We will monitor the retention curves of new cohorts to see if product changes are improving long-term engagement.

### 6.3. Dashboarding & Reporting
-   **Daily Health Dashboard:** A high-level dashboard showing DAU, new users, successful syncs, and key funnel conversion rates for the last 24 hours.
-   **Feature Launch Dashboard:** A specific dashboard created for each new feature to track its adoption rate and impact on secondary metrics.
-   **Quarterly Business Review Dashboard:** A dashboard tracking long-term trends in MRR, LTV, Churn, and user retention.

### 6.4. Privacy & Data Deletion Integration
-   **User Consent:** We will respect the platform's app tracking transparency settings.
-   **Data Deletion:** When a user requests account deletion via the process in `48-data-deletion-policy.md`, the backend will make an API call to the Google Analytics User Deletion API. This API removes all analytics data associated with the user's `user_id` from the system, ensuring compliance with GDPR's "Right to Erasure."

## 7. Analysis & Calculations
### 7.1. Data Volume & Cost Calculation (BigQuery Export)
-   **Hypothesis:** While the standard Firebase Analytics dashboard is powerful, exporting raw event data to BigQuery will allow for much deeper, custom analysis. This export has an associated cost.
-   **Assumptions:**
    -   100,000 Monthly Active Users (MAU).
    -   Average of 50 events tracked per user per day.
    -   Average size of a single event payload: 1 KB.
-   **Data Volume Calculation:**
    -   *Events per month* = 100,000 users * 50 events/day * 30 days = 150,000,000 events.
    -   *Estimated data size per month* = 150,000,000 events * 1 KB/event = 150,000,000 KB = 150 GB.
-   **Cost Calculation (Google BigQuery):**
    -   *Streaming Inserts*: Firebase to BigQuery streaming is free.
    -   *Storage Cost*: BigQuery offers 10 GB of active storage free per month. The remaining 140 GB would cost $0.02 per GB/month = 140 * $0.02 = **$2.80 per month**.
    -   *Querying Cost*: BigQuery offers 1 TB of querying free per month. Our 150 GB dataset is well within this free tier. We would need to run over 6 full scans of our monthly data to incur costs.
-   **Conclusion:** The cost of exporting our analytics data to BigQuery for advanced analysis is negligible at our projected scale, costing less than $5 per month. The value of being able to run custom SQL queries on our raw event data far outweighs this minor cost.

### 7.2. Funnel Analysis Example: Onboarding
-   **Hypothesis:** We can use our tracked events to build a funnel that visualizes where users drop off during the onboarding process.
-   **Funnel Steps (Events):**
    1.  `screen_view` where `screen_name` is 'Welcome'
    2.  `signup_success`
    3.  `screen_view` where `screen_name` is 'ConnectProvider_First'
    4.  `provider_connected`
    5.  `screen_view` where `screen_name` is 'SyncConfiguration'
    6.  `sync_completed` where `status` is 'success'
-   **Analysis:** By visualizing this funnel (e.g., in Google Analytics or a tool like Amplitude/Mixpanel), we can calculate the drop-off rate between each step. For example, if we see a large drop-off between step 2 and 3, it might indicate that users are confused after signing up. This quantitative data provides a starting point for qualitative investigation (e.g., user interviews) and A/B testing to improve the flow.

## 8. Out of Scope
-   Use of third-party attribution tools like AppsFlyer or Adjust (V1 will rely on Firebase's built-in attribution).
-   Complex predictive modeling or machine learning on analytics data.
