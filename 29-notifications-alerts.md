## Dependencies

### Core Dependencies
- `17-error-handling.md` - Error Handling, Logging & Monitoring
- `12-trial-subscription.md` - Trial, Subscription & Paywall
- `08-ux-onboarding.md` - UX, Onboarding & Support

### Strategic / Indirect Dependencies
- `05-data-sync.md` - Data Sync & Conflict Resolution
- `21-risks.md` - Risks, Constraints & Mitigation
- `42-customer-feedback.md` - Customer Feedback Loop

---

# PRD Section 29: Push Notifications & Alerts

## 1. Executive Summary

This document provides the detailed functional and technical specification for SyncWell's notification system. This system includes push notifications, in-app alerts, and banners. The guiding philosophy is that **notifications are a feature, not an interruption**. Every alert must provide clear, timely, and actionable value to the user. A well-executed notification strategy can significantly improve user engagement and trust, while a poor one is a primary driver of uninstalls.

This specification details the notification catalog, the user-facing controls, and the underlying technical architecture required to build a best-in-class notification experience.

## 2. Notification Philosophy

Every notification sent from SyncWell must adhere to three principles:
1.  **Timely:** The information is relevant to the user *right now*.
2.  **Personal:** The content is specific to the user's own data or configuration. Broadcast marketing messages will be used extremely sparingly.
3.  **Actionable:** The notification provides a clear next step, and tapping it takes the user directly to the relevant screen in the app.

## 3. Notification Technical Architecture

The notification architecture is designed to be robust, scalable, and decoupled from the core sync engine.

*   **Client-Side:** A centralized `NotificationService` in the mobile app is responsible for:
    *   Requesting user permission for push notifications.
    *   Receiving and handling incoming push notifications from the operating system.
    *   Handling deep link navigation when a notification is tapped.
    *   Registering the device token with our backend.
    *   Scheduling and canceling purely local notifications (e.g., for trial expiration).

*   **Backend (AWS):** The core backend (e.g., a `WorkerLambda`) is responsible for *initiating* a notification by publishing an event to a dedicated **Amazon SNS (Simple Notification Service) topic** called `PushNotificationEvents`. The event payload contains the recipient's `userId`, the notification type (e.g., `SYNC_ERROR`), and any necessary metadata (e.g., `source: "fitbit"`).

*   **Notification Dispatcher (Firebase Cloud Functions):** A dedicated serverless function, deployed in the Google Cloud ecosystem, subscribes to the AWS SNS topic. Its sole responsibility is to act as a dispatcher:
    1.  It receives the event from SNS.
    2.  It looks up the user's device token(s) based on the `userId`.
    3.  It constructs the localized, user-facing message.
    4.  It sends the final push notification via **Firebase Cloud Messaging (FCM)**.

This decoupled architecture ensures that the core AWS backend does not need to have direct credentials or knowledge of FCM, improving security and separation of concerns.

**Architectural Rationale & Trade-offs:**
This AWS -> Firebase cross-cloud architecture was chosen deliberately to leverage the strengths of each platform. Firebase Cloud Messaging (FCM) provides superior, best-in-class SDKs for client-side integration on iOS and Android, which simplifies development and improves reliability. While a simpler alternative would be to have an AWS Lambda function call the FCM API directly (keeping the entire backend in AWS), this would require managing FCM credentials within AWS and tightly coupling our core backend to the notification delivery mechanism. The chosen decoupled approach is preferred for its security posture and modularity, even though it introduces the complexity of a cross-cloud integration.

## 4. Detailed Notification Catalog

| ID | Name | Type | Trigger | Default | Content (Title / Body) | Deep Link | User Control Setting |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **N-01**| Sync Error | Push | The `DLQAnalyzer` service determines that a sync job has failed persistently due to a non-auth-related issue. This is for persistent, non-recoverable errors. | On | **Sync Error** / Could not sync {{dataType}} from {{source}}. Please tap for details. | A sync history/status screen. | Sync Alerts |
| **N-02**| Trial Ending | Push | **Client-Side Only.** Scheduled locally on the client to fire 24 hours before the trial ends. The complex and unreliable backend fallback mechanism has been removed to simplify the logic. | On | **Trial Ending Soon** / Your SyncWell free trial ends tomorrow. Don't lose your syncs! | The Paywall screen. | App Reminders |
| **N-03**| New Feature | Push | Manually triggered by developer via backend. | On | **New Integration!** / SyncWell now supports {{newPlatform}}! Tap to connect. | The "Connected Apps" screen. | News & Updates |
| **N-04**| Sync Success| Push | A background sync completes successfully. | **Off**| **Sync Complete** / Your {{dataType}} data was successfully synced. | The app's main dashboard. | Sync Alerts |
| **A-01**| Needs Re-auth| In-App Banner | App launch detects an invalid refresh token for a connected app. | N/A | "Your connection to {{appName}} has expired. Tap here to sign in again." | The "Connected Apps" screen. | N/A |
| **A-02**| Offline | In-App Banner | App launch or foreground detects no network connectivity. | N/A | "You are currently offline. Syncing is paused." | N/A | N/A |
| **N-05**| Hist. Sync Complete | Push | A historical sync job (Step Functions) completes successfully. | On | **Historical Sync Complete** / Your historical data from {{source}} has been synced. | The app's main dashboard. | Sync Alerts |
| **N-06**| Hist. Sync Failed | Push | A historical sync job (Step Functions) fails. | On | **Historical Sync Failed** / There was a problem syncing your historical data from {{source}}. Please tap to review. | A sync history/status screen. | Sync Alerts |
| **N-07**| Export Ready | Push | A data export job completes and the file is ready. | On | **Export Ready** / Your data export is ready to download. | The download screen in the app. | App Reminders |
| **N-08**| Import Ready for Review | Push | An imported file has been processed and is ready for the user's review. | On | **Import Ready** / Your imported file is ready for review. Tap to continue. | The import confirmation screen. | App Reminders |
| **N-09**| Re-auth Needed| Push | A worker receives a 401/403 error and publishes an immediate `ReAuthenticationNeeded` event. | On | **Action Required** / Your connection to {{source}} has expired. Please tap to sign in again. | The specific sync configuration screen that has the error. | Sync Alerts |

## 5. User-Facing Notification Settings

The "Notification Settings" screen within the app will provide users with granular control.

### Settings UI

*   **Sync Alerts** (Toggle Switch, On by default)
    *   *Description:* "Receive alerts about the status of your syncs, such as critical errors."
    *   *Controls:* N-01, N-04
*   **App Reminders** (Toggle Switch, On by default)
    *   *Description:* "Get helpful reminders about your account, like when your trial is ending."
    *   *Controls:* N-02
*   **News & Updates** (Toggle Switch, On by default)
    *   *Description:* "Be the first to know about major new features and integrations."
    *   *Controls:* N-03
*   **Android Notification Channels:** On Android, each of these categories will be mapped to a separate Notification Channel, allowing users to further customize the sound and vibration for each type in the OS settings.

## 6. Risk Analysis & Mitigation

(This section remains largely the same but is included for completeness.)

| Risk ID | Risk Description | Probability | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **R-79** | Users find the notifications annoying ("notification fatigue") and disable them globally. | Medium | High | The granular settings are the key mitigation. We will also be extremely conservative with "News & Updates" messages, sending them no more than once a month. "Sync Success" is off by default because it provides low value for high noise. |
| **R-80** | A bug causes notifications to be sent repeatedly or at the wrong time. | Low | High | The `Notification Dispatcher` function will implement rate-limiting using the main **ElastiCache for Redis** cluster. Before sending a notification, it will check a key like `notif-rate-limit##{userId}##{notificationType}`. If a notification of the same type has been sent recently (e.g., within the last hour), the new notification will be suppressed. This prevents notification storms. |
| **R-81** | Deep links from notifications are broken or lead to the wrong screen. | Medium | Medium | A centralized navigation and deep linking service must be implemented. A test plan must include manually tapping every type of notification to verify its destination. |

## 7. Optional Visuals / Diagram Placeholders
*   **Notification Data Flow:**
    *   *A sequence diagram showing the flow for both a client-scheduled notification (Trial Ending) and a server-triggered notification (Sync Error). [Note: To be created in the Design Specification document.]*
*   **Notification Settings Screen:**
    *   *A high-fidelity mockup of the settings screen described in Section 5. [Note: To be created in the Design Specification document.]*
*   **Notification Banner Styles:**
    *   *Mockups of the different in-app banners (e.g., Offline, Needs Re-auth). [Note: To be created in the Design Specification document.]*
