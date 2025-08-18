# PRD Section 23: Analytics & Metrics Tracking

## 1. Executive Summary

This document specifies the comprehensive analytics and metrics tracking strategy for SyncWell. The purpose of collecting analytics is to gain a deep, quantitative understanding of the entire user lifecycle, from acquisition to revenue. This data-driven approach is essential for making informed product decisions, optimizing conversion funnels, and driving sustainable growth.

This strategy is built upon the **AARRR ("Pirate Metrics") framework** and a detailed Tracking Plan. For the **solo developer**, this provides a clear, structured, and privacy-conscious guide to what needs to be tracked and why, ensuring that development effort is focused on collecting actionable data.

## 2. Analytics Framework & Principles

*   **Framework:** We will use the AARRR framework (Acquisition, Activation, Retention, Referral, Revenue) to structure our metrics and ensure we are measuring the full user lifecycle.
*   **Privacy First:** We will **never** track any Personally Identifiable Information (PII) or sensitive health data. All events and properties will be anonymous and aggregated. User-level tracking will be tied to an anonymous ID provided by Firebase.
*   **Action-Oriented:** Every event tracked must be tied to a specific business question and a KPI.
*   **Centralized Implementation:** All analytics calls will be routed through a single, centralized `AnalyticsService` wrapper. This provides a single point of control for debugging, data scrubbing, and potentially adding other analytics providers in the future.
*   **Tooling:** **Firebase Analytics** will be our single source of truth for analytics data.

## 3. The AARRR Tracking Plan

### 3.1. Acquisition: How do users find us?

*(Note: Primarily tracked via App Store Connect and Google Play Console, not in-app analytics)*
*   **Key Metrics:** Downloads by Source (App Store Search, Ad, Referral), App Store Page Conversion Rate.

### 3.2. Activation: Are users having a great first experience?

| Business Question | User Action | Event Name | Parameters | KPI |
| :--- | :--- | :--- | :--- | :--- |
| How effective is our onboarding flow? | User completes a step in the onboarding carousel. | `onboarding_step_viewed` | `step_name: string` | Onboarding Funnel Conversion |
| Do users successfully connect their first app? | User successfully authorizes a source or destination app. | `first_app_connected` | `app_name: string`, `type: 'source'/'destination'` | Activation Rate |
| Do users get to the "aha!" moment? | User successfully creates their first sync configuration. | `first_sync_created` | `source_app: string`, `dest_app: string`, `data_type: string`| Activation Rate |

### 3.3. Retention: Are users coming back?

| Business Question | User Action | Event Name | Parameters | KPI |
| :--- | :--- | :--- | :--- | :--- |
| Are users actively using the core feature? | A background sync is successfully completed. | `sync_completed_background` | `source_app: string`, `dest_app: string`, `data_type: string` | Core Feature Adoption |
| Are users engaging with the app manually? | User opens the app and triggers a manual sync. | `sync_triggered_manual` | - | DAU/MAU Ratio |
| Are users exploring advanced features? | User opens a premium or power-user feature screen. | `feature_screen_viewed` | `screen_name: 'historical_sync'/'export_data'` | Feature Adoption Rate |

### 3.4. Referral: Do users like us enough to tell others?

| Business Question | User Action | Event Name | Parameters | KPI |
| :--- | :--- | :--- | :--- | :--- |
| Are users recommending the app? | User taps the "Share App" button (if implemented). | `share_app_tapped` | `share_medium: string` | Viral Coefficient (k-factor) |
| Are users leaving positive reviews? | User taps the "Leave a Review" button from the in-app rating prompt. | `leave_review_tapped` | `rating: number` | App Store Rating |

### 3.5. Revenue: Are we building a viable business?

| Business Question | User Action | Event Name | Parameters | KPI |
| :--- | :--- | :--- | :--- | :--- |
| Is the paywall effective? | User is presented with the paywall screen. | `paywall_viewed` | `trigger: 'trial_expired'/'feature_gate'` | Paywall Conversion Rate |
| Are users converting to paid? | User successfully completes a purchase. | `purchase_completed` | `product_id: string`, `value: number`, `currency: string`| Trial-to-Paid Conversion Rate |
| Which plan is more popular? | User initiates a purchase. | `purchase_initiated` | `product_id: string` | Sales Mix |

## 4. User Properties

The following anonymous properties will be set for each user to allow for powerful segmentation of the analytics data.

*   `app_version`: e.g., "1.1.0"
*   `platform`: "iOS" or "Android"
*   `os_version`: e.g., "16.1"
*   `entitlement_status`: `trialing`, `trial_expired`, `subscribed`, `lifetime`
*   `first_seen_date`: The date the user first opened the app.

## 5. Optional Visuals / Diagram Placeholders
*   **[Diagram] AARRR Funnel:** A visual representation of the AARRR funnel, showing the key metric for each stage.
*   **[Table] Tracking Plan:** A comprehensive version of the table in Section 3, covering all planned events.
*   **[Diagram] `AnalyticsService` Architecture:** A diagram showing how all events from the UI and business logic are routed through the central `AnalyticsService` before being sent to Firebase.
*   **[Mockup] Segmented Analysis:** A mockup of a chart in Firebase comparing the "Retention Rate" for users with `entitlement_status: lifetime` vs. `entitlement_status: subscribed`.
