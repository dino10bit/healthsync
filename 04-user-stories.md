## Dependencies

### Core Dependencies
- `02-product-scope.md` - Product Scope, Personas & MVP Definition

### Strategic / Indirect Dependencies
- `01-context-vision.md` - Context & Vision
- `05-data-sync.md` - Data Synchronization & Reliability
- `06-technical-architecture.md` - Technical Architecture
- `08-ux-onboarding.md` - UX, Onboarding & Support
- `09-ux-configuration.md` - User Configuration Options
- `12-trial-subscription.md` - Free Trial & Subscription Flow
- `13-roadmap.md` - Roadmap, Milestones & Timeline
- `14-qa-testing.md` - QA, Testing & Release Strategy

---

# PRD Section 4: User Stories & Acceptance Criteria

## 1. Executive Summary

This document translates the product scope into a backlog of actionable user stories for the SyncWell MVP. Each story is crafted from the perspective of our user personas and is accompanied by detailed, testable acceptance criteria. This structured approach ensures that development efforts are directly tied to user needs and business value.

For the **solo developer**, this document serves as the primary "to-do list" for building the MVP. The detailed acceptance criteria provide a clear definition of "done" for each task, reducing ambiguity and ensuring the final product aligns with the strategic vision. The stories are prioritized according to the MoSCoW framework defined in `02-product-scope.md`.

## 2. MVP User Story Backlog

### Epic 1: First-Time User Experience & Onboarding

---

#### **US-01:** See a brief, clear overview of the app's value proposition.
*   **User Story:** As a new user (Alex), I want to see a brief, clear overview of what the app does so that I can understand its value proposition immediately.
*   **Persona:** Alex, Sarah
*   **Priority:** Must-Have (M-4)
*   **Story Pts:** 2

*   **Business Goal:** **Activation.** The primary goal is to clearly and quickly communicate the app's core value to new users, maximizing the likelihood they will understand the product's purpose and proceed with the setup process.
*   **Success Metrics (KPIs):**
    *   **Onboarding Funnel Conversion:** >95% of users who see the first screen of the carousel proceed to tap the "Begin Setup" button.
    *   **Time on Screen:** Average time spent on the carousel is < 15 seconds, indicating the messaging is clear, concise, and requires minimal cognitive load.

*   **Acceptance Criteria (AC):**
    *   **Given** I am a new user launching the app for the very first time.
    *   **When** the app opens, I am presented with a welcome carousel.
    *   **Then** the carousel should consist of exactly three screens.
    *   **And** the first screen clearly states the main value proposition: "All Your Health Data, in Sync."
    *   **And** the second screen clearly states the privacy policy: "Your Data is Yours. We never see, store, or sell your personal health information." and provides a tappable link to the full Privacy Policy.
    *   **And** the third screen contains a single, prominent "Begin Setup" button.
    *   **And** I can swipe left/right to navigate between the screens, and corresponding page indicators (dots) are displayed.

*   **Technical Notes:**
    *   The welcome carousel will be implemented using a native `ViewPager` (Android) or `UIPageViewController` (iOS).
    *   The completion of the onboarding carousel should be stored in `SharedPreferences` / `UserDefaults` so it is not shown on subsequent app launches.
    *   The Privacy Policy link should open in an in-app browser (`SFSafariViewController` or Chrome Custom Tabs).
*   **Non-Functional Requirements (NFRs):**
    *   **Performance:** The carousel must load instantly (<200ms) on first launch to provide a fluid, high-quality first impression.
    *   **Usability:** Swiping must be smooth and responsive. The privacy policy link must have a large enough tap target to be easily accessible.
*   **Stakeholder & Team Impact:**
    *   **Marketing:** The value proposition and privacy statements must be 100% aligned with all external marketing messaging and app store descriptions.
    *   **Legal:** The specific wording of the privacy statement and the linked policy must be reviewed and approved.

*   **UI/UX Considerations:**
    *   The design should be clean, with minimal text and engaging graphics or icons.
    *   The "Begin Setup" button must be the most prominent element on the final screen.
    *   Refer to: `08-ux-onboarding.md`, Section 3, Step 1.
    *   Required Diagram: `38-ux-flow-diagrams.md` - "New User Onboarding Flow".

*   **Analytics Hooks:**
    *   `event: onboarding_started` - Fired when the user sees the first screen of the carousel.
    *   `event: onboarding_privacy_policy_viewed` - Fired when the user taps the privacy policy link.
    *   `event: onboarding_completed` - Fired when the user taps the "Begin Setup" button.

*   **Associated Risks:**
    *   **R-22:** "The onboarding flow is confusing or too long, causing a high drop-off rate." - Mitigation: The flow is intentionally brief and focused on value. Analytics will track the funnel conversion rate.

---

#### **US-02:** Be guided through connecting the first two health apps.
*   **User Story:** As a new user (Sarah), I want a simple, guided process to connect my first two health apps so that I can get set up with minimal friction.
*   **Persona:** Sarah
*   **Priority:** Must-Have (M-4)
*   **Story Pts:** 5

*   **Business Goal:** **Activation.** This is the critical "aha!" moment where the user experiences the app's core functionality. A smooth, successful connection process is vital for converting an installed user into an active, engaged user.
*   **Success Metrics (KPIs):**
    *   **Connection Success Rate:** >90% of users who select a source app successfully authenticate and connect it.
    *   **Funnel Completion Rate:** >85% of users who start this flow successfully connect both a source and a destination app.
    *   **Time to Connect:** Median time from seeing the "Choose Source App" screen to having two apps connected is < 90 seconds.

*   **Acceptance Criteria (AC):**
    *   **Given** I have completed the welcome carousel (US-01).
    *   **When** I am on the "Choose Source App" screen.
    *   **Then** I see a grid of logos for supported source apps.
    *   **And** when I select a source app (e.g., Fitbit), the official OAuth 2.0 login flow for that app is presented in a secure `WebView`.
    *   **And** upon successful authorization, I am returned to the app.
    *   **And** the app transitions me to the "Choose Destination App" screen.
    *   **And** I see a grid of logos for supported destination apps.
    *   **And** when I select a destination app (e.g., Google Fit), I am prompted for the necessary Health Platform permissions (see US-03).
    *   **And** upon granting permissions, the app shows both apps as "Connected" and proceeds to the first sync configuration (US-04).
    *   **Scenario: OAuth Login Fails**
        *   **Given** I am in the OAuth `WebView`.
        *   **When** I enter incorrect credentials or cancel the login.
        *   **Then** I am returned to the "Choose Source App" screen and a non-blocking toast/snackbar message appears, saying "Authorization failed. Please try again."

*   **Technical Notes:**
    *   OAuth 2.0 logic must securely handle the authorization code flow, storing tokens in the platform's secure storage (`Keystore` / `Keychain`).
    *   The list of source/destination apps should be remotely configurable (e.g., via Firebase Remote Config) to allow for future additions without an app update.
    *   A state machine should manage the onboarding flow state (`AWAITING_SOURCE_AUTH`, `AWAITING_DESTINATION_AUTH`, etc.).
*   **Non-Functional Requirements (NFRs):**
    *   **Security:** OAuth tokens must be stored using platform-best-practice encryption (`Keystore`/`Keychain`). The `WebView` must be secure and prevent any script injection or credential snooping.
    *   **Reliability:** The app must gracefully handle and parse common OAuth API errors (e.g., rate limiting, server errors, invalid scope) and present a user-friendly error message.
*   **Stakeholder & Team Impact:**
    *   **Support Team:** Needs a detailed troubleshooting guide for common OAuth failures for each supported platform (e.g., "What to do if Fitbit login fails with a 'redirect_uri_mismatch' error?").
    *   **Developer:** The remote configuration schema for apps must be versioned to avoid breaking older clients when new platforms are added.

*   **UI/UX Considerations:**
    *   The currently selected source/destination should be visually highlighted.
    *   Loading indicators should be displayed during the OAuth process.
    *   Refer to: `08-ux-onboarding.md`, Section 3, Steps 3-6.
    *   Required Diagram: `38-ux-flow-diagrams.md` - "New User Onboarding Flow".

*   **Analytics Hooks:**
    *   `event: source_app_selected`, `property: app_name` (e.g., 'Fitbit')
    *   `event: source_app_auth_success`
    *   `event: source_app_auth_failed`
    *   `event: destination_app_selected`, `property: app_name` (e.g., 'Google Fit')
    *   `event: destination_app_auth_success`
    *   `event: destination_app_auth_failed`

*   **Associated Risks:**
    *   **R-22:** High drop-off rate. Mitigation: Analytics will pinpoint the failing step.
    *   **R-104:** Implementation deviates from the flow. Mitigation: The clickable prototype is the source of truth.

---

#### **US-03:** Be clearly informed about permission requests.
*   **User Story:** As a new user (Alex), I want the app to clearly request necessary permissions (e.g., for HealthKit) and explain why they are needed so that I feel secure.
*   **Persona:** Alex
*   **Priority:** Must-Have (M-4)
*   **Story Pts:** 2

*   **Business Goal:** **Trust & Activation.** Proactively explaining the need for permissions builds trust and significantly increases the permission grant rate, which is critical for the app to function. This directly impacts the user's ability to complete the setup.
*   **Success Metrics (KPIs):**
    *   **Permission Grant Rate:** The percentage of users who grant the native OS permission after seeing the pre-permission dialog should be > 80%.
    *   **Priming Dialog Interaction:** >95% of users should interact with the positive action on the priming dialog ("Yes, Notify Me").

*   **Acceptance Criteria (AC):**
    *   **Given** I am about to be shown a system-level permission dialog (e.g., Notifications, HealthKit/Google Fit).
    *   **When** the action that requires the permission is triggered.
    *   **Then** the app first displays a friendly, in-app "pre-permission" dialog.
    *   **And** this dialog clearly explains *what* permission is needed and *why* it's needed (e.g., "Allow notifications so we can alert you if a sync fails.").
    *   **And** the pre-permission dialog has two buttons: a positive action ("Yes, Notify Me") and a negative action ("Not Now").
    *   **And** if I tap the positive action, the native OS permission dialog is triggered immediately.
    *   **And** if I tap the negative action, the dialog is dismissed, and the native dialog is *not* shown.

*   **Technical Notes:**
    *   Create a reusable "Permission Priming" component that can be configured for different permission types (Notifications, Health data).
    *   The app must correctly handle the case where a user has previously denied a permission and guide them to the system settings if they want to enable it later.
*   **Non-Functional Requirements (NFRs):**
    *   **Usability:** The language used in the priming dialog must be simple, direct, and benefit-oriented. Avoid technical jargon.
    *   **Consistency:** The design and interaction of the priming dialog must be consistent for all permission types requested by the app.
*   **Stakeholder & Team Impact:**
    *   **UX/Copywriter:** The copy for each permission primer is critical and must be carefully crafted to maximize the grant rate.
    *   **QA Team:** Needs to test the full lifecycle of permissions: grant, deny, and "deny permanently" (don't ask again) states.

*   **UI/UX Considerations:**
    *   The language used in the priming dialog should be user-friendly and benefit-oriented, not technical.
    *   Refer to: `08-ux-onboarding.md`, Section 3, Step 2.
    *   Required Diagram: `38-ux-flow-diagrams.md` - The "Error State & Recovery Flow" should include the path for re-requesting permissions.

*   **Analytics Hooks:**
    *   `event: permission_priming_shown`, `property: permission_type` (e.g., 'notifications')
    *   `event: permission_priming_accepted`
    *   `event: permission_priming_declined`
    *   `event: permission_os_dialog_granted`
    *   `event: permission_os_dialog_denied`

*   **Associated Risks:**
    *   Users may still deny permissions. Mitigation: The priming dialog is the best practice for increasing the grant rate. The app must function gracefully (with reduced capability) if permissions are denied.

---

### Epic 2: Core Sync Configuration & Management

---

#### **US-04:** Configure a new data sync with full control.
*   **User Story:** As a user (Alex), I want to configure a sync from a source app to a destination app for a specific data type so that I have full control over my data flow.
*   **Persona:** Alex
*   **Priority:** Must-Have (M-5)
*   **Story Pts:** 5

*   **Business Goal:** **Engagement & Retention.** This is the core "job to be done" for the user. Providing a clear, powerful, and flexible configuration experience empowers users to solve their specific data sync problems, making the app indispensable.
*   **Success Metrics (KPIs):**
    *   **Task Success Rate:** >98% of users who start the "Add Sync" flow successfully save a new configuration.
    *   **Adoption of Multiple Data Types:** >40% of sync configurations include more than one data type, indicating users understand and use the feature's flexibility.
    *   **Error Rate:** <1% of attempts to save a sync result in a validation error.

*   **Acceptance Criteria (AC):**
    *   **Given** I am on the Main Dashboard and have at least one source and one destination app connected.
    *   **When** I tap the "+" Floating Action Button.
    *   **Then** I am taken to the "Sync Configuration" screen.
    *   **And** the flow consists of four steps: Choose Data Type, Choose Source, Choose Destination, Review & Save.
    *   **And** in Step 1, I can select one or more data types (e.g., "Steps", "Sleep").
    *   **And** in Step 2, I can select a connected source app.
    *   **And** in Step 3, I can select a connected destination app. Invalid destinations (like the selected source app) are grayed out.
    *   **And** in Step 4, I see a summary of my choices (e.g., "Sync Steps, Sleep from Fitbit to Google Fit").
    *   **And** when I tap "Save Sync," the new configuration is saved, and I am returned to the dashboard.
    *   **And** a new "Sync Card" representing this configuration appears on the dashboard.

*   **Technical Notes:**
    *   The sync configuration should be stored locally in a structured database (e.g., SQLite/Room, Core Data).
    *   The configuration model must support multiple data types per sync connection.
    *   The logic for graying out invalid destinations must be robust and consider platform limitations (e.g., Garmin as write-only). See `32-platform-limitations.md`.
*   **Non-Functional Requirements (NFRs):**
    *   **Performance:** The transition between steps in the configuration flow must feel instant (<250ms).
    *   **Data Integrity:** The configuration saved in the database must exactly match the user's selections. No data should be lost or misinterpreted.
*   **Stakeholder & Team Impact:**
    *   **Developer:** The data mapping logic between platforms for each data type needs to be clearly defined and documented.
    *   **QA Team:** Needs a matrix of all possible source/destination/data type combinations to test for edge cases and invalid configurations.

*   **UI/UX Considerations:**
    *   The multi-step process should have clear progress indicators.
    *   The selection of data types should be a multi-select list, while source/destination selection should be single-select.
    *   Refer to: `09-ux-configuration.md`, Section 3.2.
    *   Required Diagram: `38-ux-flow-diagrams.md` - "Add New Sync Configuration Flow".

*   **Analytics Hooks:**
    *   `event: add_sync_started`
    *   `event: add_sync_datatypes_selected`, `property: count`
    *   `event: add_sync_source_selected`, `property: app_name`
    *   `event: add_sync_destination_selected`, `property: app_name`
    *   `event: add_sync_completed`

*   **Associated Risks:**
    *   **R-26:** "Users misunderstand the configuration options." - Mitigation: The step-by-step flow and visual cues (grayed-out options) are designed to prevent user error.

---

#### **US-05:** Have data sync automatically in the background.
*   **User Story:** As a user (Sarah), I want my data to sync automatically in the background so that my data is always up-to-date without any manual effort.
*   **Persona:** Sarah
*   **Priority:** Must-Have (M-1)
*   **Story Pts:** 8

*   **Business Goal:** **Retention & Trust.** This is the core promise of the app. A reliable, invisible background sync makes the app a "set it and forget it" utility that users can trust, which is the single most important driver of long-term retention.
*   **Success Metrics (KPIs):**
    *   **Sync Reliability:** >99.5% of scheduled background syncs complete successfully.
    *   **Data Freshness:** The median time between data appearing in a source app and it being written to a destination app is < 1 hour.
    *   **Zero-Touch Syncs:** >90% of active users should have at least one successful background sync per day without opening the app.

*   **Acceptance Criteria (AC):**
    *   **Given** I have at least one active sync configuration.
    *   **When** new data is generated in the source application.
    *   **Then** a background sync job is triggered by the operating system.
    *   **And** the job fetches new data from the source app's API.
    *   **And** the job transforms the data into the destination app's format.
    *   **And** the job writes the transformed data to the destination app's API.
    *   **And** this entire process happens without me needing to open the app.
    *   **And** the "Last Synced" timestamp on the dashboard is updated upon successful completion.

*   **Technical Notes:**
    *   This is the core feature. Implementation will use `WorkManager` on Android and `BGAppRefreshTask` on iOS.
    *   The background task must be efficient and respect OS-imposed time limits.
    *   It needs robust error handling and retry logic (e.g., exponential backoff for network errors). See `17-error-handling.md`.
    *   The sync logic must be idempotent to prevent duplicate data entries on retries.
*   **Non-Functional Requirements (NFRs):**
    *   **Resource Efficiency:** A full background sync cycle must consume a negligible amount of battery (<1% of total capacity). Data usage should be minimized by fetching only new data.
    *   **Resilience:** The sync job must be able to recover from network loss and resume when connectivity is restored.
    *   **Idempotency:** The sync logic must be designed to prevent duplicate data entries in the destination, even if a job is run multiple times.
*   **Stakeholder & Team Impact:**
    *   **Developer:** This is the most complex piece of engineering. It requires deep knowledge of OS-specific background processing limitations.
    *   **Support Team:** Will need clear dashboards to see sync success/failure rates at an aggregate level to identify systemic platform issues.

*   **UI/UX Considerations:**
    *   The user needs to be notified if background sync fails repeatedly and requires their intervention (e.g., re-authentication). This is a critical feedback loop.
    *   Refer to: `05-data-sync.md`.

*   **Analytics Hooks:**
    *   `event: background_sync_job_started`, `property: trigger` (e.g., 'periodic', 'os_push')
    *   `event: background_sync_job_completed`, `property: status` (e.g., 'success', 'failure'), `property: items_synced`
    *   `event: background_sync_job_failed`, `property: error_code`

*   **Associated Risks:**
    *   Platform-specific restrictions on background tasks can make syncing unreliable. Mitigation: Thoroughly test on various OS versions and devices. Clearly communicate limitations to the user.

---

#### **US-06:** Manually trigger a sync from the main dashboard.
*   **User Story:** As a user (Alex), I want to be able to manually trigger a sync from the main dashboard so that I can see my latest data on demand.
*   **Persona:** Alex
*   **Priority:** Must-Have (M-5)
*   **Story Pts:** 3

*   **Business Goal:** **Trust & Engagement.** Giving users manual control provides peace of mind and accommodates the "Data-Driven Athlete" (Alex) persona who wants to see results immediately after a workout. This builds trust that the system works.
*   **Success Metrics (KPIs):**
    *   **Manual Sync Success Rate:** >99.9% of manually triggered syncs complete successfully.
    *   **Latency:** The time from pull-to-refresh to the UI showing "Synced just now" is < 10 seconds for a typical delta sync.
    *   **Feature Usage:** >50% of monthly active users use the manual sync feature at least once.

*   **Acceptance Criteria (AC):**
    *   **Given** I am on the Main Dashboard with an active Sync Card.
    *   **When** I perform a "pull-to-refresh" gesture on the list of syncs.
    *   **Then** a refresh indicator appears.
    *   **And** the status text on all Sync Cards changes to "Syncing...".
    *   **And** a foreground sync process is initiated for all active configurations.
    *   **And** upon completion, a status text updates to the latest sync time (e.g., "Synced just now") or an error state.
    *   **And** the refresh indicator disappears.

*   **Technical Notes:**
    *   The manual sync should reuse the same core sync logic as the background task but run in a foreground service to ensure it completes.
    *   The UI must be updated in real-time to reflect the state of the sync (syncing, success, failure).
*   **Non-Functional Requirements (NFRs):**
    *   **Responsiveness:** The UI must remain responsive during a manual sync; the process must not block the main thread.
    *   **Feedback:** The user must receive immediate visual feedback (<200ms) after initiating the pull-to-refresh gesture.
*   **Stakeholder & Team Impact:**
    *   **N/A:** This feature is largely self-contained and has minimal impact on other teams.

*   **UI/UX Considerations:**
    *   The pull-to-refresh gesture is an industry standard and provides a good user experience for this action.
    *   Each Sync Card should individually update its status, not wait for all syncs to complete.
    *   Refer to: `09-ux-configuration.md`, Section 3.1.

*   **Analytics Hooks:**
    *   `event: manual_sync_triggered`

*   **Associated Risks:**
    *   N/A - This is a straightforward feature with low risk.

---

#### **US-07:** Easily view the status of sync connections.
*   **User Story:** As a user (Sarah), I want to be able to easily view the status of my sync connections (e.g., "Last synced 5 mins ago", "Error") so that I can trust the app is working.
*   **Persona:** Sarah
*   **Priority:** Must-Have (M-5)
*   **Story Pts:** 3

*   **Business Goal:** **Trust & Retention.** Transparent, at-a-glance status is fundamental to building user trust. If users (especially Sarah) can see the app is working without effort, they will trust it and keep it installed. It also reduces the need for support requests.
*   **Success Metrics (KPIs):**
    *   **Error Interaction Rate:** >80% of users who see a "Needs attention" error state tap on the card to resolve it within 24 hours.
    *   **Support Ticket Reduction:** A <5% rate of support tickets related to "Is my sync working?".

*   **Acceptance Criteria (AC):**
    *   **Given** I am on the Main Dashboard.
    *   **When** a sync has recently completed successfully.
    *   **Then** the corresponding Sync Card displays status text like "Synced 5 minutes ago" in a default/green color.
    *   **When** a sync is currently in progress.
    *   **Then** the Sync Card displays "Syncing..." and an animated progress indicator.
    *   **When** a sync has failed and requires user action (e.g., re-authentication).
    *   **Then** the Sync Card displays "Needs attention" in a warning/red color, and the card itself may have a colored border.
    *   **When** a sync has failed with a temporary error.
    *   **Then** the Sync Card displays "Sync failed. Will retry."

*   **Technical Notes:**
    *   The state of each sync (idle, syncing, success, error) must be persisted in the local database.
    *   A `StateFlow` or `LiveData` object should expose the list of sync configurations and their states to the UI, so it updates automatically.
*   **Non-Functional Requirements (NFRs):**
    *   **Accessibility:** Color must not be the only way to convey status. The text must be clear and descriptive.
    *   **Real-time Updates:** The UI must update to reflect the new status within 1 second of the state changing in the backend.
*   **Stakeholder & Team Impact:**
    *   **Support Team:** The error messages shown to the user must be documented so support can guide users effectively.
    *   **UX/UI:** The design language (colors, icons) for different states must be consistent across the entire application.

*   **UI/UX Considerations:**
    *   Color should be used to draw attention to error states, but it must be accompanied by clear text for accessibility.
    *   Tapping on a card in an error state should navigate the user to a screen with more details and a path to resolution. See `40-error-recovery.md`.
    *   Refer to: `09-ux-configuration.md`, Section 3.1, "Sync Card".

*   **Analytics Hooks:**
    *   `event: sync_status_viewed`, `property: status` (e.g., 'success', 'error_needs_auth')

*   **Associated Risks:**
    *   **R-27:** "The app fails to properly save or reflect the user's configuration changes." - Mitigation: Use a robust reactive state management library to ensure the UI is always a direct reflection of the database state.

---

#### **US-08:** Delete a sync configuration that is no longer needed.
*   **User Story:** As a user (Alex), I want to be able to delete a sync configuration that I no longer need so that I can keep my dashboard tidy.
*   **Persona:** Alex
*   **Priority:** Must-Have (M-5)
*   **Story Pts:** 2

*   **Business Goal:** **Engagement & Control.** Allowing users to easily manage and clean up their configurations is a basic "hygiene" feature that gives them a sense of control, which is important for the Alex persona.
*   **Success Metrics (KPIs):**
    *   **Task Completion Rate:** >99% of users who initiate a deletion successfully complete it.
    *   **Accidental Deletion Rate:** <0.1% of deletions result in a support ticket asking for recovery, validating the effectiveness of the confirmation dialog.

*   **Acceptance Criteria (AC):**
    *   **Given** I am on the Main Dashboard with an existing Sync Card.
    *   **When** I tap the "three-dots" context menu on the Sync Card.
    *   **Then** a menu appears with a "Delete" option.
    *   **And** when I tap "Delete," a confirmation dialog appears with the title "Delete Sync?" and message "Are you sure you want to delete this sync? This cannot be undone."
    *   **And** the dialog has "Cancel" and "Delete" buttons.
    *   **And** if I tap "Delete," the Sync Card is removed from the dashboard, and the underlying configuration is deleted from the database.
    *   **And** if I tap "Cancel," the dialog is dismissed, and no change is made.

*   **Technical Notes:**
    *   The deletion should cascade, removing the configuration from the local database and cancelling any pending background jobs associated with it.
*   **Non-Functional Requirements (NFRs):**
    *   **Data Integrity:** When a sync is deleted, all associated data and pending jobs must be irrevocably removed from the app's storage.
    *   **Performance:** The UI should update immediately (<500ms) after the user confirms the deletion.
*   **Stakeholder & Team Impact:**
    *   **N/A:** This is a self-contained feature with minimal external impact.

*   **UI/UX Considerations:**
    *   A confirmation dialog is crucial to prevent accidental deletion.
    *   The animation of the card being removed from the list should be smooth.
    *   Refer to: `09-ux-configuration.md`, Section 3.1, "Sync Card".

*   **Analytics Hooks:**
    *   `event: sync_delete_initiated`
    *   `event: sync_delete_confirmed`
    *   `event: sync_delete_cancelled`

*   **Associated Risks:**
    *   Accidental deletion. Mitigation: The confirmation dialog is the standard and effective mitigation for this.

---

### Epic 3: Monetization & Premium Features

---

#### **US-09:** Purchase the lifetime license to unlock the full app.
*   **User Story:** As a trial user (Sarah), I want a clear and simple way to purchase the lifetime license so that I can continue using the app after my trial ends.
*   **Persona:** Sarah
*   **Priority:** Must-Have (M-7)
*   **Story Pts:** 5

*   **Business Goal:** **Revenue.** This is the primary story for converting engaged trial users into paying customers, directly generating revenue for the business.
*   **Success Metrics (KPIs):**
    *   **Trial-to-Paid Conversion Rate:** >10% of users who see the paywall at the end of their trial make a purchase.
    *   **Purchase Funnel Completion:** >95% of users who tap "Unlock Pro" successfully complete the purchase flow.
    *   **Payment Error Rate:** <2% of purchase attempts fail due to technical errors.

*   **Acceptance Criteria (AC):**
    *   **Given** my 7-day free trial has expired.
    *   **When** I open the app.
    *   **Then** I am presented with a blocking paywall screen.
    *   **And** the paywall screen clearly states the benefits of the Pro license and the one-time purchase price.
    *   **And** when I tap the "Unlock Pro" button, the native iOS/Android purchase flow is initiated.
    *   **And** upon successful payment, the paywall is dismissed, and the app becomes fully functional.
    *   **Scenario: Purchase Fails**
        *   **Given** I am in the native purchase flow.
        *   **When** the purchase fails (e.g., payment declined, network error).
        *   **Then** I am returned to the paywall screen, and a non-blocking error message is displayed (e.g., "Purchase failed. Please try again.").

*   **Technical Notes:**
    *   Integrate with the native In-App Purchase APIs (StoreKit for iOS, Google Play Billing for Android).
    *   The purchase state (entitlement) must be securely stored and verified.
    *   Server-side receipt validation is recommended to prevent spoofing.
*   **Non-Functional Requirements (NFRs):**
    *   **Security:** The app must not handle any payment information directly. All processing must be done by the native store APIs.
    *   **Reliability:** The app must correctly handle all purchase states, including pending transactions, failures, and interruptions.
*   **Stakeholder & Team Impact:**
    *   **Marketing/Finance:** The pricing and listed benefits must be correct and approved. Revenue tracking must be in place.
    *   **Support:** Needs a guide for handling common purchase issues, such as "I paid but the app is still locked."

*   **UI/UX Considerations:**
    *   The paywall should be visually appealing and clearly communicate the value proposition of upgrading.
    *   It should include a link to the terms of service and privacy policy.
    *   Refer to: `12-trial-subscription.md`.
    *   Required Diagram: `38-ux-flow-diagrams.md` - "Monetization & Purchase Flow".

*   **Analytics Hooks:**
    *   `event: paywall_shown`, `property: trigger` (e.g., 'trial_expired', 'feature_gate')
    *   `event: purchase_initiated`
    *   `event: purchase_completed`, `property: revenue`
    *   `event: purchase_failed`, `property: error_code`

*   **Associated Risks:**
    *   **R-24:** "The value proposition of the Pro tier is not clearly communicated." - Mitigation: The paywall must list the key benefits (e.g., "Unlimited Syncs", "Historical Sync", "Conflict Resolution").

---

#### **US-10:** Sync historical data to get a complete health history.
*   **User Story:** As a premium user (Alex), I want to sync my past health data by selecting a date range so that I can have a complete, unified history of my activities.
*   **Persona:** Alex
*   **Priority:** Should-Have (S-1)
*   **Story Pts:** 8

*   **Business Goal:** **Conversion & Retention.** This is a powerful premium feature that serves as a primary driver for converting free users to paid, and a key retention tool for power users like Alex who value a complete data history.
*   **Success Metrics (KPIs):**
    *   **Feature Adoption:** >30% of Pro users use the historical sync feature within the first month of upgrading.
    *   **Job Completion Rate:** >95% of initiated historical syncs run to completion (either success or user cancellation).
    *   **Paywall Conversion:** The contextual paywall for this feature has a conversion rate of >5%.

*   **Acceptance Criteria (AC):**
    *   **Given** I am a premium user.
    *   **When** I navigate to the "Historical Sync" feature from the settings screen.
    *   **Then** I am presented with a screen where I can select a start date and an end date for the sync.
    *   **And** when I initiate the sync, a confirmation dialog appears, warning me that the process may take a long time and consume significant battery.
    *   **And** after confirming, the app begins fetching and syncing data for the selected date range in the background.
    *   **And** the UI provides clear, persistent feedback on the progress (e.g., "Syncing 3 of 90 days...").
    *   **Scenario: Free user attempts access**
        *   **Given** I am a free user.
        *   **When** I attempt to access the "Historical Sync" feature.
        *   **Then** I am shown a paywall screen explaining the feature and prompting me to upgrade (see US-17).

*   **Technical Notes:**
    *   This task must be run in a long-running foreground service to prevent the OS from killing it.
    *   The process must be pausable and resumable. State (e.g., the last successfully synced day) must be persisted.
    *   The process should fetch data in small chunks (e.g., one day at a time) to manage memory and network usage.
    *   Rate limiting for third-party APIs must be respected.
*   **Non-Functional Requirements (NFRs):**
    *   **Resilience:** The sync must be able to be paused and resumed, and automatically recover from network failures.
    *   **Resource Management:** The process should have an optional "run only while charging" setting to minimize battery impact.
    *   **Transparency:** The UI must provide clear, non-jargon progress updates (e.g., "Synced 150 activities from May 2023").
*   **Stakeholder & Team Impact:**
    *   **Marketing:** This is a key feature to highlight in "Pro" marketing materials and app store screenshots.
    *   **Support:** Will need documentation on API rate limits and how to advise users syncing very large histories (e.g., "Sync one year at a time").

*   **UI/UX Considerations:**
    *   The progress indicator is critical for user trust. It must not block the rest of the UI.
    *   A notification should be posted to inform the user when the long-running task is complete.
    *   Refer to: `02-product-scope.md`, S1.

*   **Analytics Hooks:**
    *   `event: historical_sync_gate_shown` (for free users)
    *   `event: historical_sync_started`, `property: date_range_days`
    *   `event: historical_sync_completed`
    *   `event: historical_sync_paused`

*   **Associated Risks:**
    *   High battery and data consumption. Mitigation: The warning dialog is essential. The process should also be configured to run only when the device is charging, if possible.

---

#### **US-11:** Restore a previous purchase on a new device.
*   **User Story:** As a user (Sarah), I want a "Restore Purchases" button so that I can easily activate my license on a new phone.
*   **Persona:** Sarah
*   **Priority:** Must-Have (M-7)
*   **Story Pts:** 3

*   **Business Goal:** **Retention & Support Reduction.** A seamless restore process is critical for user retention when switching devices. It builds trust and directly prevents a significant volume of negative reviews and support tickets.
*   **Success Metrics (KPIs):**
    *   **Restore Success Rate:** >99% of users with a valid purchase who tap "Restore" successfully unlock the app.
    *   **Support Ticket Reduction:** A <1% rate of support tickets related to "I can't restore my purchase on my new phone."

*   **Acceptance Criteria (AC):**
    *   **Given** I have previously purchased the lifetime license.
    *   **When** I install the app on a new device using the same App Store / Play Store account.
    *   **Then** I see a "Restore Purchases" button on the paywall screen and in the Settings menu.
    *   **And** when I tap the button, the app communicates with the store API to check for existing purchases.
    *   **And** my previous lifetime license is detected and applied to the new installation.
    *   **And** the app is fully unlocked.
    *   **Scenario: No Purchase to Restore**
        *   **When** I tap "Restore Purchases" but have no previous purchase.
        *   **Then** a message is displayed: "No previous purchase found."

*   **Technical Notes:**
    *   This uses the standard `restorePurchases` functionality of the StoreKit and Google Play Billing libraries.
    *   The app must be able to handle the case where the user is logged into a different store account than the one used for the original purchase.
*   **Non-Functional Requirements (NFRs):**
    *   **Speed:** The restore process should complete within 5 seconds under normal network conditions.
    *   **Clarity:** The success or failure message must be unambiguous.
*   **Stakeholder & Team Impact:**
    *   **Support Team:** This feature is a primary tool for the support team. They need to understand how it works to guide users.
    *   **QA Team:** Must test this flow with multiple store accounts on both physical devices and simulators.

*   **UI/UX Considerations:**
    *   The "Restore Purchases" button must be clearly visible on the paywall so users don't accidentally re-purchase.
    *   Refer to: `12-trial-subscription.md`.
    *   Required Diagram: `38-ux-flow-diagrams.md` - "Monetization & Purchase Flow".

*   **Analytics Hooks:**
    *   `event: restore_purchase_initiated`
    *   `event: restore_purchase_success`
    *   `event: restore_purchase_failed_no_purchase`

*   **Associated Risks:**
    *   Users being unable to restore their purchase is a major point of frustration. Mitigation: This is a standard, well-documented flow. Thorough testing is key.

---

### Epic 4: Support & Settings

---

#### **US-12:** Find answers to common questions in an in-app Help Center.
*   **User Story:** As a user (Sarah), I want to find answers to common questions in an in-app Help Center so that I can solve problems myself without contacting support.
*   **Persona:** Sarah
*   **Priority:** Must-Have (M-7)
*   **Story Pts:** 3

*   **Business Goal:** **Support Deflection & User Satisfaction.** A comprehensive and easy-to-use Help Center empowers users to solve their own problems, improving their satisfaction and significantly reducing the operational cost of manual support.
*   **Success Metrics (KPIs):**
    *   **Support Ticket Deflection Rate:** For every 100 views of the Help Center, the number of support tickets created in the next hour is < 5.
    *   **FAQ Usefulness:** >70% of FAQ articles viewed are not immediately followed by a "Contact Support" tap, indicating the answer was likely sufficient.
    *   **Self-Service Rate:** The ratio of Help Center views to created support tickets should be at least 20:1.

*   **Acceptance Criteria (AC):**
    *   **Given** I am in the app.
    *   **When** I navigate to the "Settings" screen and tap "Help Center."
    *   **Then** I am presented with a list of frequently asked questions (FAQs).
    *   **And** each FAQ can be tapped to expand and view the answer.
    *   **And** the Help Center contains a link to the public feature request portal (Canny.io).
    *   **And** the Help Center contains a "Contact Support" button that opens the user's default email client with a pre-filled "To" address and subject line.

*   **Technical Notes:**
    *   The FAQ content should be remotely configurable (e.g., fetched from a JSON file on a server) so it can be updated without an app release.
    *   The link to the feature request portal should open in an embedded `WebView`.
*   **Non-Functional Requirements (NFRs):**
    *   **Performance:** The Help Center content must load in < 2 seconds on a standard cellular connection.
    *   **Up-to-date Content:** The remote configuration allows the content to be updated in near real-time in response to emerging issues.
*   **Stakeholder & Team Impact:**
    *   **Support Team:** They are the primary owners of the Help Center content and must be able to update it easily without a developer.
    *   **Product Team:** Feedback from the feature request portal is a critical input for future roadmap planning.

*   **UI/UX Considerations:**
    *   The Help Center should be searchable if the number of FAQs grows beyond 10-15.
    *   The UI should be a simple, clean, expandable list.
    *   Refer to: `10-ux-feedback.md`, `24-user-support.md`.

*   **Analytics Hooks:**
    *   `event: help_center_viewed`
    *   `event: help_center_faq_opened`, `property: question`
    *   `event: help_center_contact_support_tapped`
    *   `event: help_center_feature_requests_tapped`

*   **Associated Risks:**
    *   **R-28:** "The volume of feedback becomes too high." - Mitigation: The Help Center and FAQ serve as the first line of defense, deflecting common queries from becoming support tickets.

---

#### **US-13:** De-authorize a connected app and delete credentials.
*   **User Story:** As a user (Alex), I want to be able to de-authorize a connected app and have all my credentials for it securely deleted so that I have full control over my privacy.
*   **Persona:** Alex
*   **Priority:** Must-Have (M-5)
*   **Story Pts:** 3

*   **Business Goal:** **Trust & Privacy.** This feature is non-negotiable for user trust. It provides users with full control over their data connections and fulfills the app's core privacy promise. It is critical for the "Alex" persona's sense of security.
*   **Success Metrics (KPIs):**
    *   **Task Success Rate:** >99.9% of de-authorization attempts complete successfully.
    *   **Orphaned Tokens:** 0 orphaned tokens should be left on the device after de-authorization.
    *   **Security Incidents:** Zero security incidents related to improper credential handling.

*   **Acceptance Criteria (AC):**
    *   **Given** I have at least one app connected.
    *   **When** I navigate to "Settings" -> "Connected Apps."
    *   **Then** I see a list of my connected applications.
    *   **And** each application in the list has a "Disconnect" button.
    *   **When** I tap "Disconnect" for a specific app (e.g., Fitbit).
    *   **Then** a confirmation dialog appears, warning me that this will delete the connection and all associated sync configurations.
    *   **And** if I confirm, the app makes an API call to revoke the OAuth token on the service provider's side.
    *   **And** all stored credentials (access token, refresh token) for that app are permanently deleted from the device's secure storage.
    *   **And** all sync configurations using that app are deleted from the dashboard.
    *   **And** the app is removed from the "Connected Apps" list.

*   **Technical Notes:**
    *   The de-authorization process must call the `revoke` endpoint of the respective service's API, if available.
    *   Credentials must be deleted from `Keystore` / `Keychain`.
    *   The deletion of sync configurations must cascade correctly in the local database.
*   **Non-Functional Requirements (NFRs):**
    *   **Security:** The token revocation call must be implemented correctly. All local copies of credentials MUST be securely wiped.
    *   **Irreversibility:** The action must be final and complete. No trace of the connection or its credentials should remain within the app.
*   **Stakeholder & Team Impact:**
    *   **Legal/Privacy Officer:** This feature is a key part of complying with privacy regulations like GDPR's "right to be forgotten."
    *   **Developer:** Must verify the correct revocation endpoint and procedure for each integrated service.

*   **UI/UX Considerations:**
    *   The confirmation dialog is critical to prevent accidental disconnection.
    *   A loading indicator should be shown while the de-authorization is in progress.
    *   Refer to: `09-ux-configuration.md`, Section 3.3; `36-user-privacy-settings.md`.

*   **Analytics Hooks:**
    *   `event: app_disconnect_initiated`, `property: app_name`
    *   `event: app_disconnect_confirmed`
    *   `event: app_disconnect_cancelled`

*   **Associated Risks:**
    *   Failing to properly revoke the token on the server-side could leave a security hole. Mitigation: Ensure the API calls are implemented correctly and test that the token is actually invalidated.

---

### Epic 5: Strategic Differentiators & Pro Features

---

#### **US-14:** Sync data between Apple Health and Google Fit.
*   **User Story:** As a user (Alex) with both an iPhone and an Android tablet, I want to sync my Apple Health data to Google Fit so I can see my complete health picture on both devices.
*   **Persona:** Alex
*   **Priority:** Must-Have (M-2)
*   **Story Pts:** 13

*   **Business Goal:** **Market Differentiation & Acquisition.** This is a cornerstone feature and a primary Unique Selling Proposition (USP). It directly addresses a major pain point for users in a multi-platform ecosystem and is a powerful driver of user acquisition.
*   **Success Metrics (KPIs):**
    *   **Data Accuracy:** <0.1% discrepancy in values between the source and destination platforms for key data types like Steps and Weight.
    *   **Feature Adoption:** >60% of all sync configurations involve either Apple Health or Google Fit.
    *   **App Store Keyword Ranking:** Achieve top-5 ranking for keywords like "sync Apple Health to Google Fit".

*   **Acceptance Criteria (AC):**
    *   **Given** I have connected Apple Health as a source on my iPhone.
    *   **And** I have connected Google Fit as a destination on the same phone.
    *   **When** a sync is configured and runs.
    *   **Then** data from Apple Health (e.g., Steps, Weight) is successfully written to my Google Fit account.
    *   **And** the same is true for the reverse (Google Fit to Apple Health).

*   **Technical Notes:**
    *   This is a cornerstone feature. It requires deep integration with both HealthKit (iOS) and Health Connect (Android).
    *   The data models for Apple Health and Google Fit are different and require a robust mapping layer. This mapping logic should be well-documented and tested.
    *   This feature is the primary reason for the Event-Driven Architecture mentioned in `02-product-scope.md`.
*   **Non-Functional Requirements (NFRs):**
    *   **Data Fidelity:** The mapping layer must handle unit conversions (e.g., lbs to kg, miles to km) flawlessly. No data should be lost or corrupted during transformation.
    *   **Scalability:** The mapping architecture must be easily extensible to support new data types in the future without a full rewrite.
*   **Stakeholder & Team Impact:**
    *   **Marketing:** The "Apple Health <-> Google Fit bridge" should be the headline feature in all marketing campaigns and app store listings.
    *   **QA Team:** Requires extensive end-to-end testing on both iOS and Android devices with real health data.

*   **UI/UX Considerations:**
    *   The user must be clearly informed about which data types are supported for this cross-platform sync, as there may not be 1:1 parity.
    *   Refer to: `02-product-scope.md`, M2.

*   **Analytics Hooks:**
    *   `event: cross_platform_sync_completed`, `property: source` ('apple'), `property: destination` ('google')

*   **Associated Risks:**
    *   Complexity of mapping data between the two ecosystems. Mitigation: Start with a limited set of the most common data types (Steps, Weight, Heart Rate) and expand from there.

---

#### **US-15:** Automatically detect and merge duplicate activities.
*   **User Story:** As a user (Alex) who records a run on both their Garmin watch and Peloton bike, I want the app to automatically detect the duplicate and offer to merge them into one activity so my stats aren't counted twice.
*   **Persona:** Alex
*   **Priority:** Should-Have (S-2)
*   **Story Pts:** 13

*   **Business Goal:** **Differentiation & Retention.** This is a "killer feature" for power users like Alex. It solves a complex problem that few competitors address well, creating a powerful moat and a strong reason for users to upgrade to and retain the Pro version.
*   **Success Metrics (KPIs):**
    *   **Detection Accuracy:** >95% of overlapping activities are correctly identified as conflicts.
    *   **User Choice:** The "Merge" option is chosen in >50% of conflict resolutions, indicating it provides real value.
    *   **Time to Resolution:** The median time a user spends on the conflict resolution screen is < 30 seconds.

*   **Acceptance Criteria (AC):**
    *   **Given** I am a Pro user.
    *   **And** I have recorded the same activity in two different source apps (e.g., a run in Garmin and Peloton).
    *   **When** the next sync runs.
    *   **Then** the app identifies that the two activities are duplicates based on time overlap and activity type.
    *   **And** the Sync Card on the dashboard shows a "1 Conflict Detected" status.
    *   **When** I tap on the card.
    *   **Then** I am taken to a Conflict Resolution screen showing the two activities side-by-side.
    *   **And** I am presented with three options: "Keep Garmin", "Keep Peloton", or "Merge".
    *   **And** if I choose "Merge," a single, enriched activity is created in the destination app, combining data from both sources (e.g., GPS track from Garmin, power data from Peloton).

*   **Technical Notes:**
    *   The core of this feature is the "duplicate detection" algorithm. It should be configurable (e.g., time tolerance, required data overlap).
    *   The "merge" logic will be complex and specific to each activity type. It needs a strategy for combining fields (e.g., take the max value, sum values, prefer one source over another).
*   **Non-Functional Requirements (NFRs):**
    *   **Algorithmic Performance:** The duplicate detection algorithm must run efficiently and not significantly slow down the overall sync process.
    *   **Configurability:** Power users should eventually be able to set their own merging rules (e.g., "Always prefer GPS from Garmin").
*   **Stakeholder & Team Impact:**
    *   **Product & UX:** The design of the conflict resolution UI is critical. It must be incredibly clear and simple to prevent user confusion with a complex task.
    *   **Marketing:** This is a major selling point for the "Pro" tier.

*   **UI/UX Considerations:**
    *   The side-by-side comparison UI must be extremely clear, highlighting the differences between the two source activities.
    *   This is a key Pro feature and a major selling point.
    *   Refer to: `02-product-scope.md`, S2.

*   **Analytics Hooks:**
    *   `event: conflict_detected`
    *   `event: conflict_resolution_started`
    *   `event: conflict_resolution_completed`, `property: resolution` (e.g., 'merge', 'keep_source_a')

*   **Associated Risks:**
    *   The merging logic could be flawed, leading to incorrect data. Mitigation: Extensive testing with real-world data is required. Allow the user to "undo" a merge for a short period.

---

#### **US-16:** See a single dashboard with the status of all connections.
*   **User Story:** As a user (Sarah), I want a single dashboard that shows me the status of all my connections and when they last synced so I can feel confident that everything is working correctly.
*   **Persona:** Sarah
*   **Priority:** Must-Have (M-5)
*   **Story Pts:** 5

*   **Business Goal:** **Trust & Engagement.** This is the main "home base" for the user. Its purpose is to provide immediate, at-a-glance reassurance that the app is doing its job, which is paramount for the "set it and forget it" Sarah persona.
*   **Success Metrics (KPIs):**
    *   **Dashboard Load Time:** The dashboard loads and displays all sync cards in < 1 second.
    *   **User Engagement:** >80% of app sessions are confined to the dashboard screen, indicating it provides all necessary information without requiring deep navigation.
    *   **"Healthy" Dashboard Rate:** >95% of monthly active users have a dashboard with all syncs in a "green" or successful state.

*   **Acceptance Criteria (AC):**
    *   This story is a high-level "Epic-like" story whose requirements are fulfilled by the implementation of other, more granular stories. Its acceptance is demonstrated by the successful implementation of:
        *   **US-07 (View Sync Status):** Each card shows its individual status.
        *   **US-08 (Delete Sync):** The dashboard correctly reflects the removal of a sync.
        *   **US-04 (Configure Sync):** The dashboard correctly reflects the addition of a new sync.
        *   The main screen of the app is this dashboard.

*   **Technical Notes:**
    *   This story is primarily a UI/container story. It will be built using a `RecyclerView` on Android or `UICollectionView` / `List` on iOS.
    *   It will be backed by a reactive data stream from the local database that provides the list of `SyncCard` view models.
*   **Non-Functional Requirements (NFRs):**
    *   **Scalability:** The dashboard must perform well with 1 sync card or 20 sync cards.
    *   **Information Density:** The design must be clean and avoid clutter, even as more features are added to the sync cards.
*   **Stakeholder & Team Impact:**
    *   **All Teams:** As the main screen of the app, any changes to the dashboard have a wide impact and must be considered carefully.

*   **UI/UX Considerations:**
    *   The dashboard is the main home screen of the app. It must be clean, readable, and provide at-a-glance information.
    *   Refer to: `09-ux-configuration.md`, Section 3.1.
    *   Required Diagram: `09-ux-configuration.md` - "[Mockup] High-Fidelity Main Dashboard".

*   **Analytics Hooks:**
    *   `event: dashboard_viewed`, `property: sync_count`

*   **Associated Risks:**
    *   **R-25:** "The configuration UI is too complex." - Mitigation: The dashboard itself is simple. The complexity is in the configuration screens it leads to, which is mitigated by the step-by-step flow.

---

#### **US-17:** Be shown the value of Pro features contextually.
*   **User Story:** As a free user (Sarah), I want to be clearly shown the value of upgrading to 'Pro' when I encounter a pro feature (like Conflict Resolution) so I understand what I'm paying for.
*   **Persona:** Sarah
*   **Priority:** Should-Have (S-3)
*   **Story Pts:** 3

*   **Business Goal:** **Conversion.** This is a core part of the revenue strategy. By showing the value of a Pro feature at the exact moment the user needs it, we maximize the likelihood of conversion.
*   **Success Metrics (KPIs):**
    *   **Contextual Paywall Conversion Rate:** >5% of users who see a contextual paywall for a specific feature proceed to purchase.
    *   **Click-Through Rate:** >20% of users who see the upsell bottom sheet tap the "Unlock Pro" button.

*   **Acceptance Criteria (AC):**
    *   **Given** I am a free user.
    *   **When** I attempt to use a Pro-only feature (e.g., tap on a "Conflict Detected" card, or try to access "Historical Sync").
    *   **Then** I am shown a non-blocking bottom sheet or a full-screen paywall.
    *   **And** the sheet clearly explains the feature I am trying to access and lists the other benefits of upgrading to Pro.
    *   **And** the sheet has a prominent "Unlock Pro" button that initiates the purchase flow (US-09).
    *   **And** there is a clear "Dismiss" or "Not Now" button.

*   **Technical Notes:**
    *   Create a reusable "Feature Gate" component that takes a feature name as input and shows the appropriate upsell content.
    *   The list of Pro features should be remotely configurable to allow for future changes.
*   **Non-Functional Requirements (NFRs):**
    *   **Performance:** The feature gate/paywall must appear instantly (<200ms) when triggered.
    *   **Consistency:** The look and feel of the contextual upsell must be consistent for all Pro features.
*   **Stakeholder & Team Impact:**
    *   **Marketing & Product:** The copy and feature list on the upsell are critical for conversion and must be carefully A/B tested.
    *   **Developer:** The feature gating logic must be robust to prevent free users from accessing Pro features through any loopholes.

*   **UI/UX Considerations:**
    *   The upsell must be contextual and value-driven, not feel like a nag. It should answer the user's question ("What is this?") and then offer a solution.
    *   Refer to: `08-ux-onboarding.md`, Section 4, "Contextual Feature Prompts".

*   **Analytics Hooks:**
    *   `event: feature_gate_shown`, `property: feature_name` (e.g., 'conflict_resolution')
    *   `event: feature_gate_accepted` (user proceeds to purchase)
    *   `event: feature_gate_dismissed`

*   **Associated Risks:**
    *   **R-24:** Poorly communicated value. Mitigation: A/B testing different messaging for the upsell prompts is key to maximizing conversion.

---

#### **US-18:** Purchase a Family Plan for multiple users.
*   **User Story:** As a user (Alex), I want to purchase a single 'Family Plan' that my partner and I can use so we can both manage our health data without buying two separate licenses.
*   **Persona:** Alex
*   **Priority:** Could-Have (C-2)
*   **Story Pts:** 8

*   **Business Goal:** **Revenue Growth & Expansion.** Introduce a new, higher-tier revenue stream via subscriptions and expand the user base through shared plans. This moves the business from one-time revenue to recurring revenue.
*   **Success Metrics (KPIs):**
    *   **Attach Rate:** >5% of new paying customers choose the Family Plan over the individual license.
    *   **Invite Acceptance Rate:** >80% of sent family invitations are accepted.
    *   **Subscription Churn Rate:** Monthly churn for the Family Plan is < 3%.

*   **Acceptance Criteria (AC):**
    *   **Given** I am a user on the paywall screen.
    *   **When** I select the "Family Plan" option.
    *   **Then** the native purchase flow for a subscription is initiated.
    *   **And** upon successful purchase, my account is converted to a Family Plan owner.
    *   **And** I am presented with a screen where I can generate an invitation link or code.
    *   **When** my partner installs the app and enters the code.
    *   **Then** their app is also upgraded to Pro features.

*   **Technical Notes:**
    *   This requires a backend system to manage family plan memberships and invitation codes. This is a significant increase in complexity over the simple lifetime license.
    *   It will likely require a user account system (e.g., Sign in with Apple/Google) to associate users with a family plan.
    *   This would be a subscription product, not a one-time purchase, requiring handling of subscription lifecycle events (renewals, cancellations).
*   **Non-Functional Requirements (NFRs):**
    *   **Security:** The backend system for managing accounts and invitations must be secure.
    *   **Scalability:** The backend must be able to handle a large number of user accounts and plan associations.
*   **Stakeholder & Team Impact:**
    *   **ALL:** This feature fundamentally changes the app from a client-only utility to a client-server service. It has major implications for privacy, security, infrastructure costs, and support. This is a major strategic decision.
    *   **Legal:** A new privacy policy and terms of service will be required to handle user accounts.

*   **UI/UX Considerations:**
    *   The UI for managing family members (inviting, removing) needs to be simple and intuitive.
    *   Refer to: `02-product-scope.md`, C2.

*   **Analytics Hooks:**
    *   `event: family_plan_purchase_initiated`
    *   `event: family_plan_invite_sent`
    *   `event: family_plan_invite_accepted`

*   **Associated Risks:**
    *   The introduction of user accounts and a backend significantly increases the security and privacy surface area of the app. This is a major architectural decision and is out of scope for the MVP.


## 4. MVP Sprint Plan

This is a potential sprint plan for the **Must-Have** user stories to build the MVP.

*   **Sprint 1: Foundation & Onboarding (Stories: US-01, US-03)**
    *   Goal: Set up project, CI/CD, and build the basic onboarding shell.
*   **Sprint 2: Core Connections (Story: US-02)**
    *   Goal: Implement the OAuth flows for the first 2-3 key platforms.
*   **Sprint 3: Sync Configuration (Stories: US-04, US-07, US-08)**
    *   Goal: Build the main dashboard and the UI for creating/managing syncs.
*   **Sprint 4: Background Engine (Story: US-05)**
    *   Goal: Implement the core background processing and sync engine.
*   **Sprint 5: Monetization & Support (Stories: US-06, US-09, US-11, US-12, US-13)**
    *   Goal: Implement the IAP flow, restore purchases, and build the settings/help center screens.
*   **Sprint 6: Integration & Bug Bash**
    *   Goal: End-to-end testing, bug fixing, and preparation for app store submission.

## 5. References & Resources
*   [Agile Product Management with User Stories](https://www.atlassian.com/agile/project-management/user-stories)
*   [Gherkin Syntax for BDD](https://cucumber.io/docs/gherkin/reference/)
*   [Mountain Goat Software: Story Points](https://www.mountaingoatsoftware.com/agile/story-points)

## 6. Optional Visuals / Diagram Placeholders
*   **[Diagram] User Story Map:** A complete story map showing the user's journey through all epics and stories.
*   **[Diagram] Sprint Backlog:** A visual representation of the MVP sprint plan (e.g., a Kanban or Scrum board).
*   **[Diagram] Burndown Chart:** A chart showing the planned vs. actual progress through the MVP sprints.
