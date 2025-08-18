# PRD Section 41: Analytics Dashboard Design

## 1. Executive Summary

This document provides the visual and structural specification for SyncWell's primary analytics dashboards. The goal is to translate the raw data collected (as defined in `23-analytics.md`) into a set of curated, at-a-glance dashboards that provide actionable insights into the product's health and business performance. A well-designed dashboard surfaces problems and opportunities without requiring the developer to dig through raw data.

This document will serve as the design blueprint for the **solo developer** when configuring the dashboards in Firebase Analytics. It specifies the key dashboards to be built, the widgets on each, and the questions they are designed to answer.

## 2. Dashboarding Philosophy

*   **One Question, One Dashboard:** Each dashboard will be designed to answer a specific, high-level question (e.g., "How is our user growth?", "Is the core sync feature reliable?").
*   **Top-Down Information:** Dashboards will be organized with the most critical, high-level KPIs at the top, with more granular, diagnostic charts below.
*   **Segmentation is Key:** Most widgets will be configured to allow for easy segmentation by key user properties like `platform` (iOS/Android) and `entitlement_status` (trial/paid).
*   **Weekly Review:** The developer will schedule a recurring time each week to review these dashboards, identify trends, and formulate hypotheses for product improvements or A/B tests.

## 3. Dashboard Specifications

### Dashboard 1: The "Product Health" Dashboard (High-Level Overview)

*   **Purpose:** To provide a daily, 60-second check on the overall health of the application.
*   **Layout:** 2x3 Grid of Scorecards and Charts.

| Widget 1: DAU / MAU | Widget 2: Crash-Free Users |
| :--- | :--- |
| **Type:** Time Series Line Chart<br>**Metrics:** Daily Active Users, Monthly Active Users<br>**Question:** "Are users coming back?" | **Type:** Big Number / Gauge<br>**Metric:** `crash_free_users_rate`<br>**Question:** "Is the app stable?" |
| **Widget 3: Onboarding Funnel** | **Widget 4: Sync Success Rate** |
| **Type:** Funnel Chart<br>**Steps:** `onboarding_started` -> `first_app_connected` -> `first_sync_created`<br>**Question:** "Are new users being activated successfully?" | **Type:** Big Number / Gauge<br>**Metric:** `(sync_completed_success) / (total_syncs)`<br>**Question:** "Is our core feature reliable?" |
| **Widget 5: Trial Conversion Rate (Last 14d)**| **Widget 6: User Base by Platform** |
| **Type:** Big Number / Gauge<br>**Metric:** `(purchase_completed) / (trial_expired)`<br>**Question:** "Are we converting users to paid?" | **Type:** Donut Chart<br>**Metric:** User count segmented by `platform`<br>**Question:** "What is the distribution of our user base?" |

### Dashboard 2: The "Feature Engagement" Dashboard

*   **Purpose:** To understand which features and integrations users are actually using.
*   **Layout:** A series of tables and bar charts.

| Widget 1: Top Sync Configurations | Widget 2: Power-User Feature Adoption |
| :--- | :--- |
| **Type:** Table<br>**Metrics:** Count of `sync_configured` events, grouped by `source_app`, `destination_app`, and `data_type`.<br>**Question:** "What are the most popular sync combinations?" | **Type:** Time Series Line Chart<br>**Metrics:** Count of `feature_screen_viewed` for `historical_sync` and `export_data`.<br>**Question:** "Are users discovering and using our advanced features?" |
| **Widget 3: Top Help Center Articles** | **Widget 4: Notification Engagement** |
| **Type:** Table<br>**Metric:** Count of `help_center_article_viewed` events, grouped by `article_id`.<br>**Question:** "What problems are users trying to solve themselves?" | **Type:** Table<br>**Metrics:** Count of `notification_tapped` events, grouped by `notification_id`.<br>**Question:** "Which of our notifications are most effective?" |

### Dashboard 3: The "Monetization" Dashboard

*   **Purpose:** To provide a detailed view of the app's financial performance.
*   **Layout:** A mix of scorecards and time series charts.

| Widget 1: Estimated Daily Revenue | Widget 2: Revenue by Product |
| :--- | :--- |
| **Type:** Time Series Bar Chart<br>**Metric:** Sum of `value` from `purchase_completed` events.<br>**Question:** "What is our daily revenue trend?" | **Type:** Donut Chart<br>**Metric:** Sum of `value` from `purchase_completed` events, grouped by `product_id`.<br>**Question:** "Are users preferring the Lifetime or Subscription plan?" |
| **Widget 3: Paywall Conversion Funnel** | **Widget 4: LTV vs. Churn** |
| **Type:** Funnel Chart<br>**Steps:** `paywall_viewed` -> `purchase_initiated` -> `purchase_completed`<br>**Question:** "How effective is our paywall screen?" | **Type:** Scorecards<br>**Metrics:** Calculated LTV and Churn Rate (may require exporting data to Google Sheets for calculation).<br>**Question:** "Are we building a sustainable business model?" |

## 4. Implementation Notes
*   All dashboards will be built using the standard dashboarding features within the Firebase Analytics console.
*   For more complex calculations that Firebase cannot handle natively (e.g., LTV), the raw event data can be linked and exported to Google BigQuery for analysis in tools like Google Data Studio or Google Sheets.
*   Each dashboard will have its date range filter set to "Last 28 days" by default, to show recent trends.

## 5. Optional Visuals / Diagram Placeholders
*   **[Mockup] Product Health Dashboard:** A high-fidelity mockup of the complete Firebase dashboard as specified in Section 3.1.
*   **[Mockup] Feature Engagement Dashboard:** A mockup of the dashboard specified in Section 3.2.
*   **[Flowchart] Data-to-Dashboard:** A flowchart illustrating how a single user action in the app becomes an event, gets sent to Firebase, and then appears as an aggregated data point on one of the dashboards.
