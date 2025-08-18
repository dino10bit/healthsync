## Dependencies

### Core Dependencies
- `29-notifications-alerts.md` - Notifications & Alerts
- `08-ux-onboarding.md` - UX Onboarding
- `57-app-analytics.md` - App Analytics (Deep Dive)

### Strategic / Indirect Dependencies
- `51-push-notifications.md` - Push Notifications (Deep Dive)
- `55-user-feedback-collection.md` - User Feedback Collection (Deep Dive)

---

# PRD Section 52: In-App Messaging (Deep Dive)

## 1. Introduction
In-app messaging (IAM) is a powerful tool for communicating with users while they are actively engaged with the app. This document provides a granular breakdown of the IAM strategy, covering everything from UI formats and campaign logic to specific use cases and A/B testing methodology.

## 2. Message Formats & UI
We will support three distinct message formats, each with a specific purpose.
-   **Modal:** A full-screen message that takes over the UI. Used for critical alerts or major feature announcements. It has a title, body, optional image, and one or two action buttons.
-   **Top Banner:** A less intrusive banner that appears at the top of the screen. Used for contextual tips or non-critical information. It can be dismissed by the user.
-   **Card:** A small, card-style message that appears within a specific part of the UI, like a feed. This is the least intrusive format.

## 3. Campaign Triggering & Targeting

### 3.1. Campaign Triggering Logic
Campaigns can be triggered by a variety of analytics events, including:
-   `app_open`: When the user opens the app.
-   `screen_view`: When the user navigates to a specific screen.
-   `user_property_change`: When a user's property changes (e.g., `subscription_status` becomes 'premium').
-   Custom events like `sync_completed_5_times`.

### 3.2. Targeting & Segmentation Rules
The Firebase IAM console allows for powerful segmentation. We will target users based on:
-   **Demographics:** Country, language, app version.
-   **Analytics Events:** Users who have (or have not) triggered a specific event.
-   **User Properties:** Custom properties we define, such as `has_connected_garmin` or `subscription_status`.

### 3.3. Frequency Capping & Prioritization
-   **Frequency Cap:** To prevent user annoyance, the Firebase SDK has a default frequency cap that prevents it from showing more than one message per day. We will adhere to this and can configure it to be even less frequent if needed.
-   **Prioritization:** Campaigns can be assigned a priority level in the Firebase console. If a user is eligible for multiple messages at a single trigger point, the one with the highest priority will be displayed.

## 4. Operational & Strategic Use

### 4.1. Content Management Workflow
1.  **Goal Definition:** The Product Manager or Marketer defines the goal of the campaign (e.g., "drive adoption of the new historical sync feature").
2.  **Campaign Creation:** In the Firebase console, they select the message format, write the copy, add an image, and define the CTA (e.g., a deep link to the historical sync screen).
3.  **Targeting:** They select the target audience (e.g., "all users on app version 1.3+ who have not yet used historical sync").
4.  **Scheduling:** They set the start and end dates for the campaign.
5.  **Launch & Monitor:** The campaign is launched, and its performance is monitored in the Firebase console.

### 4.2. Measuring Campaign Effectiveness
-   **Core Metrics:** The Firebase console provides out-of-the-box tracking for:
    -   **Impressions:** How many users were shown the message.
    -   **Click-Through Rate (CTR):** The percentage of users who tapped the message's action button.
-   **Conversion Tracking:** We can also tie a campaign to a specific analytics conversion event. For example, for a feature announcement, we can track how many users who saw the message went on to trigger the `feature_used` event.

### 4.3. A/B Testing In-App Messages
-   **Hypothesis:** We can optimize the performance of our messages through A/B testing.
-   **Process:** For a given campaign, we can create multiple variants in Firebase.
    -   **Example:** Test different CTA copy: "Try it now" vs. "Learn more".
-   **Analysis:** Firebase will automatically show the different variants to segments of our target audience and report on which variant had a higher CTR or conversion rate, allowing us to continuously improve our messaging.

## 5. Client-Side Implementation Details
-   **SDK Behavior:** The Firebase IAM SDK automatically fetches active campaigns from the server when the app starts. It caches them on the device.
-   **Message Display:** When a trigger event occurs (e.g., a `screen_view`), the SDK checks its cache to see if any campaigns match the trigger and targeting rules. If so, it displays the message automatically.
-   **Customization:** While the default behavior is sufficient for most cases, we can implement custom logic to suppress messages on certain sensitive screens (e.g., during a payment flow).

## 6. Detailed Use Cases

### 6.1. Use Case: Onboarding Tips Campaign
-   **Goal:** Guide new users through the core features in their first week.
-   **Campaign:** A sequence of 3 banner messages.
    1.  **Day 1:** Triggered by `app_open` for users with `days_since_install` < 2. "Tip: You can connect multiple accounts to sync between!"
    2.  **Day 3:** Triggered by `app_open` for users with `days_since_install` = 3. "Did you know? You can customize the sync direction for each data type."
    3.  **Day 7:** Triggered by `app_open` for users with `days_since_install` = 7. "You're a pro! Consider upgrading to Premium to unlock historical sync."

### 6.2. Use Case: Net Promoter Score (NPS) Survey
-   **Goal:** Measure user satisfaction.
-   **Campaign:** A modal message.
-   **Targeting:** Users with `total_sessions` > 10 and `has_active_subscription` = true.
-   **Trigger:** `app_open`.
-   **Content:** "How likely are you to recommend SyncWell to a friend?" with a 0-10 rating scale. Based on the score, we can ask for qualitative feedback or direct them to the App Store to leave a review.

## 7. Analysis & Calculations
### 7.1. Impact on Feature Adoption
-   **Hypothesis:** Using targeted in-app messages to announce new features will lead to a higher adoption rate for those features.
-   **Measurement:** We will conduct an A/B test for a new feature launch.
    -   **Group A (Control):** Receives no in-app message. Feature discovery is organic.
    -   **Group B (Variant):** Receives a targeted in-app message with a CTA that deep-links to the new feature.
-   **Calculation:**
    -   *Feature Adoption Rate* = (Number of users who use the new feature at least once) / (Total number of users in the group).
    -   **Goal:** We will aim for the adoption rate in Group B to be **at least 50% higher** than in Group A within the first 7 days of the feature's release.
-   **KPI:** This directly impacts the "Feature Adoption Rate" KPI from `01-context-vision.md`.

### 7.2. Cost Analysis
-   **Service Provider:** We will use Firebase In-App Messaging.
-   **Cost Calculation (Firebase In-App Messaging):**
    -   Similar to FCM for push notifications, Firebase In-App Messaging is a **free service**. There is no charge for displaying messages to users.
    -   The SDK is included in the main Firebase library, so there is no additional engineering overhead for the basic setup.
-   **Conclusion:** This is a high-impact, zero-cost feature from a service provider perspective, making it a very efficient tool for user communication. The only cost is the time taken by the product/marketing team to design and configure the messaging campaigns in the Firebase console.

## 8. Out of Scope
-   A persistent "inbox" for in-app messages. Messages are ephemeral and shown contextually.
