## Dependencies

### Core Dependencies
- `29-notifications-alerts.md` - Notifications & Alerts
- `36-user-privacy-settings.md` - User Privacy Settings
- `57-app-analytics.md` - App Analytics (Deep Dive)

### Strategic / Indirect Dependencies
- `52-in-app-messaging.md` - In-App Messaging (Deep Dive)
- `53-gamification.md` - Gamification (Deep Dive)
- `08-ux-onboarding.md` - UX Onboarding

---

# PRD Section 51: Push Notifications (Deep Dive)

## 1. Introduction
Push notifications are a key channel for engaging with users, providing timely updates, and encouraging them to return to the app. This document outlines the strategy, goals, content, and technical implementation for push notifications in SyncWell.

## 2. Notification Strategy & Goals
Each notification type has a specific goal tied to a business KPI.

| ID | Notification Type | Business Goal | Primary KPI |
| :--- | :--- | :--- | :--- |
| PN-01 | Sync Success | Increase user confidence and satisfaction. | Sync Success Rate |
| PN-02 | Sync Error | Drive users to fix broken integrations, improving data quality. | Sync Success Rate |
| PN-03 | New Provider | Drive adoption of new features. | Feature Adoption Rate |
| PN-04 | Subscription Renewal | Reduce passive churn from payment failures. | Churn Rate |
| PN-05 | Trial Expiration | Convert trial users to paid subscribers. | Trial-to-Paid Conversion Rate |
| PN-06 | Gamification Milestone | Increase long-term user retention and engagement. | DAU/MAU Ratio |

## 3. User Opt-In/Opt-Out Flow
1.  **The "Pre-Permission" Prompt:** We will not show the native OS permission dialog on first launch. Instead, during onboarding, after the user has seen the value of the app, a custom UI screen will explain *why* we want to send notifications (e.g., "To alert you of important sync errors"). This screen will have a single "Enable Notifications" button.
2.  **Triggering the Native Dialog:** Tapping our custom "Enable" button will then trigger the official iOS/Android permission dialog. This two-step process significantly increases opt-in rates.
3.  **The Settings Screen:** The app's Settings screen will have a "Notifications" sub-menu.
4.  **Granular Controls:** Inside this menu, every user-controllable notification type (PN-01, PN-02, PN-03, PN-06) will have its own toggle switch, allowing users to customize their experience.

## 4. Notification Content & Copy
| ID | Title | Body |
| :--- | :--- | :--- |
| PN-01 | `Sync Complete` | `Your data from {Source} has been successfully synced.` |
| PN-02 | `SyncWell Action Required` | `Your connection to {Source} has an issue. Tap to fix.` |
| PN-03 | `New Integration Added!` | `You can now sync your data with {New Provider}. Tap to connect.` |
| PN-04 | `Subscription Renewal` | `Your SyncWell Premium subscription will renew in 3 days.` |
| PN-05 | `Trial Ending Soon` | `Your SyncWell Premium trial ends in 24 hours. Upgrade now to keep your premium features!` |
| PN-06 | `Achievement Unlocked!` | `You've earned the "{Badge Name}" badge. Keep it up!` |

## 5. Technical Implementation Details

### 5.1. Deep Linking Implementation
-   **Payload Structure:** The `data` payload of a push notification will contain a `deep_link` field, e.g., `{"deep_link": "syncwell://connection/garmin"}`.
-   **Client-Side Router:** The app will have a central router that parses these incoming URLs.
-   **Navigation:** Based on the parsed URL, the router will navigate the user to the appropriate screen (e.g., the settings page for the Garmin connection, the achievements screen, or the paywall).

### 5.2. Badge Count Logic
-   **Increment:** The app's icon badge count will be incremented by 1 for each new `Sync Error` that requires user attention.
-   **Decrement:** The count will be decremented when a user successfully resolves an error.
-   **Clearing:** The count is set to 0 when there are no active errors.
-   **Mechanism:** The badge count will be updated by a "silent" push notification sent to the client, which contains only the `badge` field and no user-visible alert.

### 5.3. Push Notification Service Integration (FCM)
-   **Token Registration:** On app startup, the client initializes the FCM SDK. If the user has granted permission, the client requests a device token.
-   **Token Storage:** The device token is sent to our backend (`POST /v1/devices`) and stored in a `devices` table, linked to the `userId`. A user can have multiple device tokens (e.g., for their phone and tablet).
-   **Token Refresh:** The FCM SDK may refresh the token periodically. The client must listen for these updates and send the new token to our backend to replace the old one.

### 5.4. Backend Trigger Architecture
-   **Event-Driven:** For notifications like `Sync Error` or `Achievement Unlocked`, the corresponding backend service will publish an event (e.g., `sync.failed`, `achievement.unlocked`) to a message queue (e.g., AWS SQS).
-   **Notification Service:** A dedicated microservice will consume events from this queue. It will be responsible for looking up the user's notification settings and device tokens, constructing the correct payload and copy, and sending the request to FCM.
-   **Time-Based:** For scheduled notifications like `Trial Expiration`, a nightly cron job (e.g., AWS EventBridge Scheduler) will query for users whose trial ends in 24 hours and queue the appropriate notification events.

## 6. Operational Considerations

### 6.1. Measuring Notification Effectiveness
-   **Analytics:** We will log two key events: `notification_sent` (from the backend) and `notification_opened` (from the client, when a user taps the notification).
-   **CTR Calculation:** The Click-Through Rate (CTR) for each notification type (ID) can be calculated as: `(COUNT(notification_opened WHERE id=X) / COUNT(notification_sent WHERE id=X)) * 100`.
-   **Goal:** We will aim for a >15% CTR for actionable notifications like `Sync Error` and >5% for engagement notifications like `New Provider`.

### 6.2. Localization
-   **Process:** The notification copy strings will be stored in a localization file on the backend.
-   **Implementation:** When the Notification Service constructs a notification, it will look up the user's preferred language (from their profile) and pull the corresponding translated copy from the appropriate localization file before sending it to FCM.

### 6.3. Do Not Disturb & Quiet Hours
-   **Policy:** We will not send any non-transactional, non-critical notifications (e.g., PN-03, PN-06) between the hours of 10:00 PM and 9:00 AM in the user's local timezone.
-   **Implementation:** The backend will need to store the user's timezone. The nightly cron job for marketing notifications will be timezone-aware and will only queue notifications for users for whom it is currently an appropriate time. Transactional alerts (`Sync Error`) will be sent immediately regardless of time.

## 7. Analysis & Calculations
### 7.1. Engagement vs. Annoyance Analysis
-   **Hypothesis:** Well-timed, relevant push notifications can increase user engagement and retention. However, excessive or irrelevant notifications are a primary driver of app uninstalls.
-   **Strategy:**
    -   **Default Off:** The "Sync Success" notification (PN-01) will be **default off**. This is a high-frequency event, and enabling it by default would be intrusive. Users who want this level of detail can opt-in.
    -   **Actionable Alerts:** The "Sync Error" notification (PN-02) is critical and actionable, justifying its "default on" status. It directly helps the user solve a problem.
    -   **User Control:** Providing granular control over notification categories is essential to balancing engagement and annoyance.
-   **Measurement:** We will track the push notification opt-in rate in our analytics. We will also monitor the uninstall rate and correlate it with any new notification campaigns we launch.

### 7.2. Cost Analysis
-   **Service Provider:** We will use Firebase Cloud Messaging (FCM).
-   **Cost Calculation (FCM):**
    -   FCM is a **free service**. There is no charge for sending notifications, regardless of volume.
    -   The only associated cost is the backend infrastructure required to trigger the notifications (e.g., AWS Lambda invocations).
-   **Lambda Cost Estimation:**
    -   *Assumptions:*
        -   100,000 active users.
        -   On average, 2 error notifications (PN-02) and 1 marketing notification (PN-03) are sent per user per month.
        -   Total notifications per month = 100,000 users * 3 notifications/user = 300,000.
        -   Each notification trigger is one AWS invocation (e.g., from a Fargate task or Lambda).
    -   *Calculation:* The cost of the triggering compute is considered negligible, as it is part of a larger task's execution.
    -   *Conclusion:* The cost of the infrastructure to send push notifications is expected to be **$0**, as it will fall entirely within the AWS free tier at our projected scale.

## 8. Out of Scope
-   Rich push notifications with images or interactive buttons (V1 will use text-only notifications).
-   Location-based notifications.
