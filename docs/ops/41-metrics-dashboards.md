## Dependencies

### Core Dependencies
- `23-analytics.md` - Analytics & Metrics Tracking
- `11-monetization.md` - Monetization, Pricing & Business Model
- `39-performance-metrics.md` - Performance Monitoring & KPIs
- `04-user-stories.md` - User Stories & Acceptance Criteria

### Strategic / Indirect Dependencies
- `13-roadmap.md` - Roadmap, Milestones & Timeline
- `42-customer-feedback.md` - Customer Feedback Loop

---

# PRD Section 41: Analytics Dashboard Design

## 1. Executive Summary

This document provides the visual and structural specification for SyncWell's primary analytics dashboards. The goal is to translate the raw data collected (as defined in `23-analytics.md`) into a set of curated, at-a-glance dashboards that provide actionable insights into the product's health and business performance. This specification is directly derived from the **Success Metrics (KPIs)** defined in each user story in `04-user-stories.md`.

This document will serve as the design blueprint for the **solo developer** when configuring the dashboards in Firebase Analytics. It specifies the key dashboards to be built, the widgets on each, and the questions they are designed to answer.

## 2. Dashboarding Philosophy

*   **One Question, One Dashboard:** Each dashboard will be designed to answer a specific, high-level question (e.g., "How is our user growth?", "Is the core sync feature reliable?").
*   **Top-Down Information:** Dashboards will be organized with the most critical, high-level KPIs at the top, with more granular, diagnostic charts below.
*   **Segmentation is Key:** Most widgets will be configured to allow for easy segmentation by key user properties like `platform` (iOS/Android) and `entitlement_status` (trial/paid).
*   **Weekly Review:** The developer will schedule a recurring time each week to review these dashboards, identify trends, and formulate hypotheses for product improvements or A/B tests.

## 3. Dashboard Specifications

### Dashboard 1: The "Activation & Core Reliability" Dashboard

*   **Purpose:** To provide a daily, 60-second check on new user activation and the reliability of the core sync engine.
*   **Layout:** 3x3 Grid of Scorecards and Charts.

| Widget 1: DAU / MAU | Widget 2: Crash-Free Users | Widget 3: Permission Grant Rate |
| :--- | :--- | :--- |
| **Type:** Time Series Line Chart<br>**Metrics:** Daily Active Users, Monthly Active Users<br>**Question:** "Are users coming back?" | **Type:** Big Number / Gauge<br>**Metric:** `crash_free_users_rate`<br>**Question:** "Is the app stable?"<br>**Target:** >99.5% | **Type:** Big Number / Gauge<br>**Metric:** `(permission_os_dialog_granted) / (permission_priming_shown)`<br>**Question:** "Are we effectively explaining permission needs?"<br>**Target:** >80% |
| **Widget 4: Detailed Onboarding Funnel** | Widget 5: Background Sync Reliability | Widget 6: Manual Sync Reliability |
| **Type:** Funnel Chart<br>**Steps:** `onboarding_started` -> `onboarding_completed` -> `source_app_auth_success` -> `destination_app_auth_success` -> `add_sync_completed`<br>**Question:** "Where are new users dropping off during setup?" | **Type:** Big Number / Gauge<br>**Metric:** `(background_sync_job_completed where status='success') / (total background_sync_job_started)`<br>**Question:** "Is our core 'set & forget' feature reliable?"<br>**Target:** >99.5% | **Type:** Big Number / Gauge<br>**Metric:** `(manual_sync_completed_success) / (total manual_sync_triggered)`<br>**Question:** "Does the on-demand sync work?"<br>**Target:** >99.9% |
| **Widget 7: Data Freshness (p50)** | Widget 8: User Base by Platform | Widget 9: Syncs Requiring Attention |
| **Type:** Scorecard<br>**Metric:** 50th percentile of `(sync_end_timestamp - sync_start_timestamp)` for background syncs.<br>**Question:** "How quickly is data getting synced?"<br>**Target:** < 1 hour | **Type:** Donut Chart<br>**Metric:** User count segmented by `platform`<br>**Question:** "What is the distribution of our user base?" | **Type:** Time Series Line Chart<br>**Metric:** Count of `sync_status_viewed` where `status` is `error_needs_auth`.<br>**Question:** "Are users encountering connection errors?" |

### Dashboard 2: The "Feature Engagement & Adoption" Dashboard

*   **Purpose:** To understand which features, especially premium ones, users are actually using.
*   **Layout:** A series of funnels and tables.

| Widget 1: Top Sync Configurations | Widget 2: Pro Feature Adoption: Historical Sync |
| :--- | :--- |
| **Type:** Table<br>**Metrics:** Count of `add_sync_completed` events, grouped by `source_app`, `destination_app`, and `data_type` count.<br>**Question:** "What are the most popular sync combinations?" | **Type:** Scorecard<br>**Metric:** `(unique users who triggered historical_sync_started) / (total Pro users)`<br>**Question:** "Are Pro users adopting our key historical sync feature?"<br>**Target:** >30% |
| **Widget 3: Pro Feature Engagement: Conflict Resolution** | Widget 4: Help Center Engagement |
| **Type:** Funnel Chart<br>**Steps:** `conflict_detected` -> `conflict_resolution_started` -> `conflict_resolution_completed`<br>**Sub-chart:** Donut chart of `resolution` property from `conflict_resolution_completed` ('merge' vs. 'keep').<br>**Question:** "Are users successfully using the conflict resolution feature?" | **Type:** Table<br>**Metric:** Count of `help_center_faq_opened` events, grouped by `question`.<br>**Question:** "What problems are users trying to solve themselves?" |
| **Widget 5: Sync Management Actions**| Widget 6: App De-authorization Rate|
| **Type:** Time Series Bar Chart<br>**Metrics:** Count of `sync_delete_confirmed`, `add_sync_completed`.<br>**Question:** "How actively are users managing their configurations?" | **Type:** Time Series Line Chart<br>**Metric:** Count of `app_disconnect_confirmed` events.<br>**Question:** "Are users disconnecting services? Is there a trend?" |

### Dashboard 3: The "Monetization" Dashboard

*   **Purpose:** To provide a detailed view of the app's financial performance and paywall effectiveness.
*   **Layout:** A mix of scorecards and funnels.

| Widget 1: Estimated Daily Revenue | Widget 2: Trial-to-Paid Conversion Rate (14d) |
| :--- | :--- |
| **Type:** Time Series Bar Chart<br>**Metric:** Sum of `value` from `purchase_completed` events.<br>**Question:** "What is our daily revenue trend?" | **Type:** Big Number / Gauge<br>**Metric:** `(purchase_completed) / (trial_expired)`<br>**Question:** "Are we converting trial users effectively?"<br>**Target:** >10% |
| **Widget 3: Detailed Paywall Conversion Funnel** | Widget 4: Restore vs. New Purchase |
| **Type:** Funnel Chart<br>**Steps:** `paywall_shown` OR `feature_gate_shown` -> `purchase_initiated` -> `purchase_completed`<br>**Question:** "How effective are our various paywalls at driving purchases?" | **Type:** Donut Chart<br>**Metrics:** Count of `purchase_completed` vs. `restore_purchase_success`.<br>**Question:** "What percentage of 'purchases' are actually restores?" |
| **Widget 5: Revenue by Product** | Widget 6: LTV vs. Churn |
| **Type:** Donut Chart<br>**Metric:** Sum of `value` from `purchase_completed` events, grouped by `product_id` (e.g., 'lifetime_one_time', 'family_plan_monthly').<br>**Question:** "Which products are driving the most revenue?" | **Type:** Scorecards<br>**Metrics:** Calculated LTV and Churn Rate (may require exporting data to Google Sheets for calculation).<br>**Question:** "Are we building a sustainable business model?" |

## 4. Implementation Notes
*   All dashboards will be built using the standard dashboarding features within the Firebase Analytics console.
*   For more complex calculations that Firebase cannot handle natively (e.g., LTV), the raw event data can be linked and exported to Google BigQuery for analysis in tools like Google Data Studio or Google Sheets.
*   Each dashboard will have its date range filter set to "Last 28 days" by default, to show recent trends.

## 5. Optional Visuals / Diagram Placeholders
*   **[Mockup] Activation & Core Reliability Dashboard:** A high-fidelity mockup of the complete Firebase dashboard as specified in Section 3.1.
*   **[Mockup] Feature Engagement & Adoption Dashboard:** A mockup of the dashboard specified in Section 3.2.
*   **[Flowchart] Data-to-Dashboard:** A flowchart illustrating how a single user action in the app becomes an event, gets sent to Firebase, and then appears as an aggregated data point on one of the dashboards.
