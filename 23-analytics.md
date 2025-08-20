## Dependencies

### Core Dependencies
- `01-context-vision.md` - Context & Vision
- `11-monetization.md` - Monetization, Pricing & Business Model

### Strategic / Indirect Dependencies
- `13-roadmap.md` - Roadmap, Milestones & Timeline
- `19-security-privacy.md` - Data Security & Privacy Policies
- `41-metrics-dashboards.md` - Analytics Dashboard Design

---

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
| Are users actively using the core feature? | A sync is successfully completed. | `sync_completed` | `source: string`, `destination: string`, `trigger: 'manual'/'scheduled'/'webhook'` | Core Feature Adoption |
| How performant is our backend worker fleet? | A Fargate worker task completes a sync job. | `worker_job_processed` | `duration_ms: number`, `cpu_utilized_pct: number`, `memory_utilized_pct: number`, `is_arm64: boolean` | P90 Job Duration |
| How effective is our webhook ingestion? | A webhook is received from a third-party provider. | `webhook_ingested` | `provider: string`, `is_signature_valid: boolean` | Webhook Validation Rate |
| How is our adaptive polling system behaving? | The system schedules a poll for a non-webhook user. | `adaptive_poll_scheduled`| `provider: string`, `poll_frequency_hours: number` | Average Poll Frequency |
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
## 6. Backend Analytics Ingestion Architecture

While Firebase Analytics is the primary tool for client-side events, some critical events (like `sync_completed`) are generated by our backend services. To handle these events at scale and in a cost-effective manner, we use a dedicated ingestion pipeline.

The architecture, as defined in `06-technical-architecture.md`, uses **Amazon Kinesis Data Firehose** to decouple and batch events.

*   **Flow:**
    1.  A backend service (e.g., a `WorkerFargateTask`) publishes an event to the main EventBridge bus.
    2.  A rule on the bus filters for analytics events and forwards them to a Kinesis Data Firehose delivery stream.
    3.  Firehose buffers these events (e.g., for 60 seconds or until 5MB of data is collected).
    4.  Before delivery, Firehose can invoke a transformation Lambda to scrub the data for PII and format it as needed.
    5.  Finally, Firehose delivers a single, compressed batch of data to its destination (e.g., an S3 data lake, which can then be queried by analytics tools).

*   **Benefits:**
    *   **Scalability & Resilience:** This pipeline protects downstream services from traffic spikes.
    *   **Cost-Effectiveness:** Batching and compressing data is significantly more cost-effective than processing millions of individual API calls.
    *   **Flexibility:** This architecture allows us to easily change the final destination for our backend analytics data without re-instrumenting our services.
*   **[Mockup] Segmented Analysis:** A mockup of a chart in Firebase comparing the "Retention Rate" for users with `entitlement_status: lifetime` vs. `entitlement_status: subscribed`.
