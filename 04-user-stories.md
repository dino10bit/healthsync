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

For the **engineering team**, this document serves as the primary "to-do list" for building the MVP. The detailed acceptance criteria provide a clear definition of "done" for each task, reducing ambiguity and ensuring the final product aligns with the strategic vision. The stories are prioritized according to the MoSCoW framework defined in `02-product-scope.md`.

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

*   **Dependencies:**
    *   None. This is the entry point for a new user.

*   **Strategic Alignment:**
    *   **Achieve Product-Market Fit:** By clearly articulating the value proposition, this story directly contributes to user activation and helps new users understand if the product meets their needs.
    *   **Establish a Loyal User Base:** A clear and honest first impression is the first step toward building trust with the user.

*   **Test Scenarios:**
    *   **Positive:**
        *   Verify that a user launching the app for the very first time is shown the three-screen carousel.
        *   Verify that the user can swipe left and right to navigate between all three screens.
        *   Verify that the page indicators (dots) update correctly upon swiping.
        *   Verify that tapping the "Begin Setup" button on the third screen dismisses the carousel and proceeds to the next step.
        *   Verify that after completing the carousel, closing and reopening the app does *not* show the carousel again.
    *   **Negative:**
        *   Verify that tapping the Privacy Policy link opens the policy in an in-app browser and that the user can successfully close it and return to the carousel.
    *   **Edge Cases:**
        *   Verify that rotating the device on any carousel screen does not crash the app or reset the view.
        *   Verify that the app gracefully handles being sent to the background and then foregrounded while the carousel is visible.

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

*   **Security & Privacy:**
    *   The privacy policy link must open a secure in-app browser (`SFSafariViewController`/Chrome Custom Tabs) to prevent session hijacking or content injection.
    *   No user-identifiable information is collected or transmitted during this step. The `onboarding_started` event should use a device-level anonymous ID, not a user account ID.
    *   Refer to: `19-security-privacy.md` for general principles.
*   **Accessibility (A11y):**
    *   All text must meet WCAG 2.1 AA contrast ratios.
    *   The carousel must be navigable via screen readers (e.g., VoiceOver, TalkBack). Swiping actions should be announced.
    *   The "Begin Setup" button and privacy policy link must have accessible labels and be easily tappable.
    *   Refer to: `28-accessibility.md` for detailed guidelines.
*   **Internationalization (i18n) & Localization (l10n):**
    *   All text strings ("All Your Health Data, in Sync.", "Begin Setup", etc.) must be stored in localizable string files (e.g., `strings.xml`, `Localizable.strings`).
    *   The layout must be tested with longer strings from languages like German to ensure it doesn't break.
    *   The Privacy Policy link should ideally point to a localized version of the policy if available.
    *   Refer to: `26-internationalization.md`, `27-localization.md`.
*   **Data Governance & Compliance:**
    *   This initial screen does not handle any personal health information (PHI).
    *   The act of a user proceeding past this screen implies consent to the presented privacy policy. This interaction (timestamp, device ID) should be logged for compliance auditing.
    *   Refer to: `20-compliance-regulatory.md`.
*   **Release Strategy:**
    *   The copy and imagery of the carousel will be controlled via Firebase Remote Config to allow for A/B testing of value propositions without a full app release.
    *   The feature will be enabled for 100% of new users on launch.
    *   Refer to: `25-release-management.md`.

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

*   **Dependencies:**
    *   **US-01:** User must have completed the welcome carousel.
    *   **US-03:** The permission priming flow must be available to be triggered.

*   **Strategic Alignment:**
    *   **Achieve Product-Market Fit:** This story delivers the core "magic moment" of the app. Its successful and frictionless completion is the primary driver of a user's decision to adopt the product.
    *   **Deliver Best-in-Class Reliability:** The connection flow must be robust and handle errors gracefully to establish trust from the very first interaction.

*   **Test Scenarios:**
    *   **Positive:**
        *   Verify that after the carousel, the user is taken to the "Choose Source App" screen.
        *   Verify that selecting a source app initiates the correct OAuth flow.
        *   Verify that after a successful source auth, the user is taken to the "Choose Destination App" screen.
        *   Verify that after selecting a destination app and granting permissions, both apps are shown as "Connected".
    *   **Negative:**
        *   Verify that if the user cancels the OAuth flow, they are returned to the "Choose Source App" screen with a "Authorization failed" message.
        *   Verify that if the user enters incorrect credentials, the same failure flow occurs.
        *   Verify that selecting the same app as a source and destination is prevented or handled gracefully.
    *   **Edge Cases:**
        *   Verify that if the user has a network error during OAuth, a user-friendly error message is displayed.
        *   Test the flow with an app that has already been authorized with SyncWell and ensure it doesn't require a re-login if the token is still valid.

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
    *   OAuth 2.0 logic must securely handle the authorization code flow, and securely passing the authorization code to the SyncWell backend for token exchange and storage.
    *   The list of source/destination apps should be remotely configurable (e.g., via Firebase Remote Config) to allow for future additions without an app update.
    *   A state machine should manage the onboarding flow state (`AWAITING_SOURCE_AUTH`, `AWAITING_DESTINATION_AUTH`, etc.).
*   **Non-Functional Requirements (NFRs):**
    *   **Security:** The `WebView` must be secure and prevent any script injection or credential snooping.
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

*   **Security & Privacy:**
    *   OAuth 2.0 `state` parameter must be used to prevent CSRF attacks.
    *   The redirect URI must be strictly validated against a whitelist.
    *   The mobile app handles the `authorization_code` and passes it to the backend. The backend exchanges it for tokens, which are never returned to the device, and stores them securely in AWS Secrets Manager.
    *   The in-app browser for OAuth must prevent JavaScript injection and credential snooping.
    *   Refer to: `19-security-privacy.md`, Section 4.1 "OAuth2 Security".
*   **Accessibility (A11y):**
    *   The grid of app logos must be navigable with a screen reader. Each logo should have a clear, audible name (e.g., "Fitbit").
    *   Loading indicators must have an accessible label announcing that content is loading.
    *   Error messages (e.g., "Authorization failed") must be announced to the user via `aria-live` regions or similar platform-specific mechanisms.
    *   Refer to: `28-accessibility.md`.
*   **Internationalization (i18n) & Localization (l10n):**
    *   Error messages and status updates (e.g., "Connecting...") must be localized.
    *   The list of apps should be sorted alphabetically based on the current locale.
    *   Refer to: `26-internationalization.md`.
*   **Data Governance & Compliance:**
    *   The scopes requested during the OAuth flow must be the minimum necessary to perform the syncs. These scopes must be documented for each integration.
    *   User consent for data access is granted via the third-party OAuth screen. The app should log the grant event (timestamp, scopes granted) for auditing purposes.
    *   Refer to: `20-compliance-regulatory.md`.
*   **Release Strategy:**
    *   The list of supported source/destination apps will be controlled by Firebase Remote Config. This allows adding new apps or temporarily disabling a problematic integration without an app release.
    *   The feature is core and will be enabled for 100% of users.
    *   Refer to: `25-release-management.md`.

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

*   **Dependencies:**
    *   None. This is a self-contained, reusable component.

*   **Strategic Alignment:**
    *   **Establish a Loyal User Base:** Transparency around data access is the most critical component of building user trust, which is a prerequisite for loyalty.
    *   **Deliver Best-in-Class Reliability:** A high permission grant rate is essential for the app to function reliably. This story directly supports that goal.

*   **Test Scenarios:**
    *   **Positive:**
        *   Verify that triggering an action requiring permissions first shows the in-app "priming" dialog.
        *   Verify that the priming dialog correctly explains what permission is needed and why.
        *   Verify that tapping the positive action ("Yes, Notify Me") on the primer immediately triggers the native OS permission dialog.
        *   Verify that tapping the negative action ("Not Now") dismisses the primer and does *not* show the OS dialog.
    *   **Negative:**
        *   Verify that if a user denies the OS permission, the app handles it gracefully and shows an appropriate state.
    *   **Edge Cases:**
        *   Verify the flow for a user who has previously denied the permission permanently ("Don't Ask Again"). The app should guide them to the system settings.
        *   Test with different permission types (Notifications, HealthKit, etc.) to ensure the component is reusable.

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

*   **Security & Privacy:**
    *   The priming screen itself does not handle sensitive data, but it is a gatekeeper for data access. Its design must not be deceptive or coercive, adhering to platform guidelines (e.g., Apple's App Store Review Guideline 5.1.1).
*   **Accessibility (A11y):**
    *   The dialog must be fully accessible. All text should be readable by screen readers, and the buttons must be clearly labeled and focusable.
    *   Refer to: `28-accessibility.md`.
*   **Internationalization (i18n) & Localization (l10n):**
    *   The explanation text and button titles must be localized. The copy must be reviewed by native speakers to ensure it is clear and culturally appropriate.
*   **Data Governance & Compliance:**
    *   This flow is a key part of demonstrating explicit user consent for data access under GDPR and other regulations. The user's choice (positive or negative) should be logged for auditing purposes.
*   **Release Strategy:**
    *   The copy on the permission primers will be managed via Remote Config to allow for A/B testing of different messaging to optimize the permission grant rate.
    *   Refer to: `25-release-management.md`.

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

*   **Dependencies:**
    *   **US-02:** At least two apps must be connected.
    *   **US-16:** The dashboard must exist to display the newly created Sync Card.

*   **Strategic Alignment:**
    *   **Achieve Product-Market Fit:** This is the primary interface for the app's core functionality. A clear and intuitive configuration flow is essential for users to find value in the product.
    *   **Establish a Loyal User Base:** Empowering users with control over their data (the Alex persona's key desire) builds a strong sense of ownership and loyalty.

*   **Test Scenarios:**
    *   **Positive:**
        *   Verify that tapping the "+" FAB on the dashboard opens the "Sync Configuration" screen.
        *   Verify that the user can select one or more data types.
        *   Verify that the user can select a valid source and destination app from their connected apps.
        *   Verify that the "Review" screen accurately summarizes the user's choices.
        *   Verify that tapping "Save Sync" creates a new Sync Card on the dashboard and saves the configuration to the database.
    *   **Negative:**
        *   Verify that the destination list is disabled or filtered to prevent a user from selecting the same app as the source.
        *   Verify that the user cannot proceed through the flow without making a selection at each step.
    *   **Edge Cases:**
        *   Verify that platform limitations are handled (e.g., Garmin is shown as read-only and cannot be selected as a destination).
        *   Test creating a sync configuration with all available data types selected.

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
    *   The sync configuration is created on the client but the source of truth is stored in the backend database (DynamoDB). The client may cache this configuration for faster UI rendering.
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

*   **Security & Privacy:**
    *   No new credentials or sensitive data are handled here, but the configuration itself represents the user's intent to move data. This configuration is stored in the backend database. The client is responsible for sending it over a secure channel (HTTPS).
*   **Accessibility (A11y):**
    *   The multi-step progress indicator must be accessible.
    *   Multi-select and single-select lists must support screen readers and keyboard/switch controls. Grayed-out (disabled) options must be announced as such.
*   **Internationalization (i18n) & Localization (l10n):**
    *   Data type names ("Steps", "Sleep") and all UI text must be localized.
*   **Data Governance & Compliance:**
    *   The saved configuration represents a user's explicit instruction to process their data in a specific way. This configuration is critical for data processing audits under GDPR's "purpose limitation" principle.
*   **Release Strategy:**
    *   The available data types for sync may be controlled by Remote Config to allow for staged rollouts of new data types.

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

*   **Dependencies:**
    *   **US-04:** A sync configuration must exist to be executed.
    *   **US-14:** The core data mapping and transformation logic must be implemented.

*   **Strategic Alignment:**
    *   **Deliver Best-in-Class Reliability:** This is the single most important story for fulfilling the product's core promise of reliability. Its success is paramount to the product's success.
    *   **Establish a Loyal User Base:** For the "Sarah" persona, a "set it and forget it" experience is the primary driver of trust and long-term value.

*   **Test Scenarios:**
    *   **Positive:**
        *   Verify that after creating a sync and new data appears in the source app, a background sync is successfully completed within the OS-defined time window.
        *   Verify that the "Last Synced" timestamp on the dashboard updates after a successful background sync.
        *   Verify that data is correctly fetched, transformed, and written to the destination app.
    *   **Negative:**
        *   Verify that if a sync fails due to a network error, it is automatically retried with exponential backoff.
        *   Verify that if a sync fails due to a permanent error (e.g., revoked authentication), the sync is paused and the user is notified (see US-07).
    *   **Edge Cases:**
        *   Test the sync logic on various OS versions and devices with different battery optimization settings.
        *   Verify that the sync logic is idempotent by manually running the same sync job twice and ensuring no duplicate data is created.
        *   Test behavior when the device has no network connectivity for an extended period and then reconnects.

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
    *   This is the core feature, and it is **orchestrated by the backend**.
    *   The mobile app is responsible for initiating a sync request with the backend. For cloud-to-cloud syncs, the backend handles everything.
    *   For syncs involving device-native SDKs (e.g., Apple HealthKit), the backend uses push notifications to trigger background processing on the device.
    *   The core sync logic, error handling, and retry mechanisms reside on the backend workers, as detailed in `05-data-sync.md`.
*   **Non-Functional Requirements (NFRs):**
    *   **Resource Efficiency:** For syncs involving the device (e.g., writing to HealthKit), the background task must be lightweight and consume negligible battery. For cloud-to-cloud syncs, there is no impact on the user's device.
    *   **Resilience:** The sync job must be able to recover from network loss and resume when connectivity is restored.
    *   **Idempotency:** The sync logic must be designed to prevent duplicate data entries in the destination, even if a job is run multiple times.
*   **Stakeholder & Team Impact:**
    *   **Developer:** This is the most complex piece of engineering. It requires deep knowledge of the backend serverless architecture (Lambda, SQS) and the various third-party API integrations.
    *   **Support Team:** Will need clear dashboards to see sync success/failure rates at an aggregate level to identify systemic platform issues.

*   **UI/UX Considerations:**
    *   The user needs to be notified if background sync fails repeatedly and requires their intervention (e.g., re-authentication). This is a critical feedback loop.
    *   Refer to: `05-data-sync.md`.

*   **Analytics Hooks:**
    *   `event: background_sync_job_started`, `property: trigger` (e.g., 'periodic', 'os_push')
    *   `event: background_sync_job_completed`, `property: status` (e.g., 'success', 'failure'), `property: items_synced`
    *   `event: background_sync_job_failed`, `property: error_code`

*   **Associated Risks:**
    *   A third-party API outage or latency can cause syncs to fail or be delayed. Mitigation: Our backend has robust retry logic and a Dead-Letter Queue for failed jobs. We monitor partner API status.

*   **Security & Privacy:**
    *   All API calls made during the background sync must use HTTPS.
    *   The sync process must not log any Personal Health Information (PHI) to the console or analytics. Error logs should only contain non-identifiable information (e.g., error codes, sync job ID).
    *   Refer to: `19-security-privacy.md`.
*   **Accessibility (A11y):**
    *   This is a background process with no direct UI. However, its results (success, failure) are surfaced in the UI (US-07), which must be accessible. Any notifications sent (e.g., for failures) must be accessible.
*   **Internationalization (i18n) & Localization (l10n):**
    *   Any user-facing errors or notifications generated by the sync process must be localized.
*   **Data Governance & Compliance:**
    *   This is the core data processing engine. It must adhere strictly to the user's configuration (US-04).
    *   The logic must be auditable to prove that data is only moved between the user-specified source and destination. No data should be sent to any other location.
    *   The app must respect the data retention policies of the source/destination platforms.
*   **Release Strategy:**
    *   The frequency and batch size of background syncs may be controlled by Remote Config to manage server load on third-party APIs or to respond to platform-wide issues.

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

*   **Dependencies:**
    *   **US-05:** It reuses the same core sync logic.
    *   **US-07:** The UI must be able to reflect the "Syncing..." and final success/fail status.

*   **Strategic Alignment:**
    *   **Establish a Loyal User Base:** This feature directly serves the "Alex" persona's need for control and immediate feedback, building trust and engagement.
    *   **Deliver Best-in-Class Reliability:** Providing a manual override gives users confidence that the system is working and responsive to their needs.

*   **Test Scenarios:**
    *   **Positive:**
        *   Verify that performing a pull-to-refresh gesture on the main dashboard triggers a sync for all active configurations.
        *   Verify that a refresh indicator appears and the status on all cards changes to "Syncing...".
        *   Verify that upon completion, the statuses and "Last Synced" times are updated correctly.
    *   **Negative:**
        *   Verify that if a manual sync fails, the card shows a relevant error state.
        *   Verify that triggering a manual sync while one is already in progress is handled gracefully (e.g., the new request is ignored).
    *   **Edge Cases:**
        *   Trigger a manual sync with no active network connection and verify a "No connection" error is shown.
        *   Trigger a manual sync with a very large amount of data and verify the UI remains responsive.

*   **Acceptance Criteria (AC):**
    *   **Given** I am on the Main Dashboard with an active Sync Card.
    *   **When** I perform a "pull-to-refresh" gesture on the list of syncs.
    *   **Then** a refresh indicator appears.
    *   **And** the status text on all Sync Cards changes to "Syncing...".
    *   **And** a foreground sync process is initiated for all active configurations.
    *   **And** upon completion, a status text updates to the latest sync time (e.g., "Synced just now") or an error state.
    *   **And** the refresh indicator disappears.

*   **Technical Notes:**
    *   The manual sync sends a request to the backend to place a job in the high-priority `hot-queue`. The core sync logic is the same and is executed on the backend.
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

*   **Security & Privacy:**
    *   Same as US-05. All data transmission must be secure. No logging of PHI.
*   **Accessibility (A11y):**
    *   The pull-to-refresh gesture is a standard control but should be accompanied by an alternative for users who cannot perform it (e.g., a "Sync Now" button in a context menu).
    *   The "Syncing..." status text and indicator must be announced by screen readers.
*   **Internationalization (i18n) & Localization (l10n):**
    *   Status messages ("Syncing...", "Synced just now") must be localized, including handling of relative time formats.
*   **Data Governance & Compliance:**
    *   Same as US-05. The process is user-initiated but must follow the same data handling rules.
*   **Release Strategy:**
    *   The feature is core and will be enabled for 100% of users.

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

*   **Dependencies:**
    *   **US-16:** This story defines the content *within* the dashboard's Sync Cards.

*   **Strategic Alignment:**
    *   **Establish a Loyal User Base:** For the "Sarah" persona, transparent, at-a-glance status is the primary mechanism for building trust and reinforcing the "set it and forget it" value proposition.
    *   **Deliver Best-in-Class Reliability:** Clearly communicating status, especially error states, is part of a reliable system.

*   **Test Scenarios:**
    *   **Positive:**
        *   Verify a successfully completed sync displays a relative time (e.g., "Synced 5 minutes ago").
        *   Verify an in-progress sync shows "Syncing..." and an animated indicator.
    *   **Negative:**
        *   Verify a sync that failed due to expired authentication shows a "Needs attention" state in a distinct color (e.g., red/orange).
        *   Verify a sync that failed due to a temporary network issue shows a "Will retry" state.
        *   Verify that tapping on a card in an error state navigates the user to a screen with a clear path to resolution.
    *   **Edge Cases:**
        *   Verify that the relative timestamp updates correctly over time (e.g., "just now" -> "5 minutes ago" -> "1 hour ago").
        *   Ensure all status text is accessible and not reliant on color alone to convey meaning.

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

*   **Security & Privacy:**
    *   Error messages must not leak sensitive information (e.g., do not display raw API error responses containing tokens or user IDs).
*   **Accessibility (A11y):**
    *   Color must not be the only means of conveying status. The text itself must be descriptive (e.g., "Success", "Needs attention"). Icons should be used in addition to color and text.
    *   All status text and icons must have accessible labels that are announced by screen readers.
    *   Refer to: `28-accessibility.md`.
*   **Internationalization (i18n) & Localization (l10n):**
    *   All status messages (e.g., "Synced {minutes} ago", "Needs attention") must be localized.
*   **Data Governance & Compliance:**
    *   This feature provides transparency to the user about data processing activities, which is a requirement of GDPR.
*   **Release Strategy:**
    *   N/A. This is a core UI component.

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

*   **Dependencies:**
    *   **US-04:** A sync configuration must exist to be deleted.

*   **Strategic Alignment:**
    *   **Establish a Loyal User Base:** Providing easy-to-use control and management features caters to the "Alex" persona and builds trust by letting users easily undo a configuration.

*   **Test Scenarios:**
    *   **Positive:**
        *   Verify that tapping the context menu on a Sync Card reveals a "Delete" option.
        *   Verify that tapping "Delete" shows a confirmation dialog.
        *   Verify that confirming the deletion removes the Sync Card from the UI and the configuration from the database.
    *   **Negative:**
        *   Verify that tapping "Cancel" on the confirmation dialog dismisses it and makes no changes.
    *   **Edge Cases:**
        *   Attempt to delete a sync configuration while it is actively syncing and verify it is handled gracefully.
        *   Verify that any pending background jobs associated with the deleted sync are also cancelled.

*   **Acceptance Criteria (AC):**
    *   **Given** I am on the Main Dashboard with an existing Sync Card.
    *   **When** I tap the "three-dots" context menu on the Sync Card.
    *   **Then** a menu appears with a "Delete" option.
    *   **And** when I tap "Delete," a confirmation dialog appears with the title "Delete Sync?" and message "Are you sure you want to delete this sync? This cannot be undone."
    *   **And** the dialog has "Cancel" and "Delete" buttons.
    *   **And** if I tap "Delete," the Sync Card is removed from the dashboard, and the underlying configuration is deleted from the database.
    *   **And** if I tap "Cancel," the dialog is dismissed, and no change is made.

*   **Technical Notes:**
    *   The deletion request is sent to the backend. The backend is responsible for deleting the configuration from DynamoDB and cancelling any associated pending jobs.
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

*   **Security & Privacy:**
    *   The deletion of the configuration must be complete and irreversible from the backend database.
*   **Accessibility (A11y):**
    *   The confirmation dialog must be fully accessible, with clear labels for the "Delete" and "Cancel" actions.
*   **Internationalization (i18n) & Localization (l10n):**
    *   The text in the confirmation dialog must be localized.
*   **Data Governance & Compliance:**
    *   This fulfills the user's right to withdraw consent for a specific data processing activity. The deletion event should be logged for auditing.
*   **Release Strategy:**
    *   N/A. This is a core data management feature.

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

*   **Dependencies:**
    *   **US-11:** The "Restore Purchases" flow must be available from the paywall.

*   **Strategic Alignment:**
    *   **Build a Sustainable Business:** This story is the core of the monetization strategy and is the primary driver of revenue for the product.

*   **Test Scenarios:**
    *   **Positive:**
        *   Verify that a user whose trial has expired is shown a blocking paywall.
        *   Verify the paywall clearly states the price and Pro benefits.
        *   Verify that tapping "Unlock Pro" initiates the native IAP flow.
        *   Verify that a successful purchase dismisses the paywall and unlocks all app functionality.
    *   **Negative:**
        *   Verify that if a purchase fails (e.g., payment declined), the user is returned to the paywall with an error message.
        *   Verify that if the user cancels the purchase flow, they are returned to the paywall.
    *   **Edge Cases:**
        *   Test the purchase flow with a sandbox account.
        *   Test the handling of pending transactions (e.g., purchases that require parental approval).
        *   Verify the app correctly unlocks after a successful purchase, even if the app is restarted during the process.

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

*   **Security & Privacy:**
    *   The app must not handle or store any credit card information. All payment processing is delegated to the native StoreKit/Google Play Billing APIs.
    *   If server-side receipt validation is used, the receipt data must be transmitted securely and the server must be protected against replay attacks.
*   **Accessibility (A11y):**
    *   The paywall screen must be fully accessible. Benefits of Pro should be in a list that can be read by screen readers. The purchase button must be clearly labeled.
*   **Internationalization (i18n) & Localization (l10n):**
    *   The price must be displayed in the user's local currency, using the formatting provided by the store APIs.
    *   All text on the paywall (benefits, button titles, legal disclaimers) must be localized.
*   **Data Governance & Compliance:**
    *   The purchase history is considered personal data and must be handled according to the privacy policy. The link between a purchase and a user should be managed securely.
*   **Release Strategy:**
    *   The price and listed Pro benefits on the paywall will be controlled by Remote Config to allow for price testing and messaging updates.

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

*   **Dependencies:**
    *   **US-09:** User must have a Pro license to access this feature.
    *   **US-17:** A contextual paywall must be implemented to upsell this feature to free users.
    *   **US-05:** Reuses the core sync and data mapping logic.

*   **Strategic Alignment:**
    *   **Build a Sustainable Business:** As a key differentiator and Pro feature, this directly drives trial-to-paid conversion and justifies the product's price point.
    *   **Establish a Loyal User Base:** This feature provides immense value to the "Alex" persona, solving a major pain point and making the app a critical part of their data management workflow.

*   **Test Scenarios:**
    *   **Positive:**
        *   Verify a Pro user can access the "Historical Sync" screen.
        *   Verify the user can select a start and end date.
        *   Verify that initiating the sync shows a warning dialog about time/battery usage.
        *   Verify that a long-running foreground service is started with a persistent progress notification.
        *   Verify that data for the selected date range is correctly synced.
    *   **Negative:**
        *   Verify a free user attempting to access the feature is shown a contextual paywall (US-17).
        *   Verify the sync process can be paused and resumed by the user.
        *   Verify the process gracefully handles network errors, pausing and resuming when connectivity is restored.
    *   **Edge Cases:**
        *   Test with a very large date range (e.g., 5 years) to check for memory and performance issues.
        *   Verify the handling of API rate limits from service providers during a large sync.
        *   Test the "run only while charging" setting.

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
    *   This task is offloaded to the backend. The mobile app sends a request, and the backend uses a dedicated `cold-queue` and long-running `cold-workers` to process the historical sync, as detailed in `31-historical-data.md`.
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
    *   High API usage on third-party services. Mitigation: The backend will have rate-limiting and circuit-breaker patterns. The user will be warned that the sync may take a long time to complete on the backend.

*   **Security & Privacy:**
    *   Same as US-05. The large volume of data being transferred increases the importance of secure transmission and handling. The process must be robust against leaving orphaned data if it fails mid-way.
*   **Accessibility (A11y):**
    *   The date selection UI must be accessible.
    *   The progress indicator (e.g., "Syncing 3 of 90 days...") must be accessible and provide real-time updates to screen readers.
    *   The persistent progress notification must be accessible.
*   **Internationalization (i18n) & Localization (l10n):**
    *   The warning dialog, progress messages, and completion notification must all be localized. Date formats must respect the user's locale.
*   **Data Governance & Compliance:**
    *   This is a bulk data processing operation. It must be logged and auditable. The app must handle API rate limits gracefully and respect the terms of service of the source/destination platforms, which may have rules against bulk data export.
*   **Release Strategy:**
    *   This is a Pro feature, gated by the purchase status (US-09).
    *   The maximum date range allowed for a single historical sync job might be controlled by Remote Config to manage system load.

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

*   **Dependencies:**
    *   **US-09:** Depends on the same In-App Purchase integration.

*   **Strategic Alignment:**
    *   **Establish a Loyal User Base:** A smooth restore experience is essential for retaining customers when they switch devices. Failing here is a major source of user frustration and churn.
    *   **Build a Sustainable Business:** By reducing support tickets, this feature lowers operational costs.

*   **Test Scenarios:**
    *   **Positive:**
        *   Verify that a user with a previous purchase can tap "Restore Purchases" on a new device and have their Pro status unlocked.
        *   Verify the "Restore Purchases" button is available in both the Settings menu and on the paywall.
    *   **Negative:**
        *   Verify that a user with no previous purchase who taps "Restore" is shown a "No purchase found" message.
    *   **Edge Cases:**
        *   Test with a user logged into a different App Store / Play Store account than the one used for the original purchase.
        *   Test the restore process on a fresh install of the app.

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

*   **Security & Privacy:**
    *   Relies on the security of the native store APIs. The app is only requesting the user's entitlement status.
*   **Accessibility (A11y):**
    *   The "Restore Purchases" button must be clearly labeled and accessible.
    *   The success ("Purchase restored") or failure ("No purchase found") messages must be announced to the user.
*   **Internationalization (i18n) & Localization (l10n):**
    *   All button titles and status messages must be localized.
*   **Data Governance & Compliance:**
    *   This links a new device/install to a previous purchase record, re-establishing the user's data subject identity with respect to their payment history.
*   **Release Strategy:**
    *   N/A. This is a mandatory feature for apps with non-consumable IAPs as per App Store / Play Store guidelines.

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

*   **Dependencies:**
    *   None. This is a self-contained feature.

*   **Strategic Alignment:**
    *   **Build a Sustainable Business:** Directly reduces operational costs by deflecting support tickets.
    *   **Establish a Loyal User Base:** Empowering users to solve their own problems quickly improves satisfaction and trust.

*   **Test Scenarios:**
    *   **Positive:**
        *   Verify the "Help Center" can be accessed from the Settings screen.
        *   Verify the user is presented with a list of expandable FAQs.
        *   Verify that tapping an FAQ expands it to show the answer.
        *   Verify the "Contact Support" button opens a pre-filled email draft.
        *   Verify the "Feature Request" link opens the Canny.io portal in an in-app browser.
    *   **Negative:**
        *   Verify the screen functions correctly if the remote FAQ content fails to load (e.g., shows a "Could not load content" message).
    *   **Edge Cases:**
        *   Verify that the remote FAQ content can be updated and the app displays the new content on the next launch without requiring an app update.

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

*   **Security & Privacy:**
    *   If the Help Center loads content from a remote URL in a `WebView`, it must ensure the source is trusted and uses HTTPS to prevent content injection.
    *   The pre-filled support email should not contain any sensitive user data by default.
*   **Accessibility (A11y):**
    *   The expandable list of FAQs must be navigable and usable with screen readers. The expanded/collapsed state should be announced.
    *   Any search functionality must be accessible.
*   **Internationalization (i18n) & Localization (l10n):**
    *   The FAQ content should be fetched from a locale-specific endpoint (e.g., `.../faq/en-US.json`).
    *   The pre-filled support email should have a localized subject line.
*   **Data Governance & Compliance:**
    *   N/A, unless the feature request portal has its own privacy policy that needs to be considered and linked.
*   **Release Strategy:**
    *   The FAQ content will be fetched from a remote JSON file, allowing the Support team to update it at any time without an app release.

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

*   **Dependencies:**
    *   **US-02:** An app must be connected to be disconnected.
    *   **US-08:** Disconnecting an app must also trigger the deletion of any sync configurations that depend on it.

*   **Strategic Alignment:**
    *   **Establish a Loyal User Base:** Giving users full, transparent control over their data and privacy is fundamental to building trust. This is a cornerstone of the product's "user-first" promise.
    *   **Deliver Best-in-Class Reliability:** Securely and reliably handling user credentials throughout their lifecycle is a key component of a trustworthy system.

*   **Test Scenarios:**
    *   **Positive:**
        *   Verify the user can navigate to "Connected Apps" and see a list of their apps.
        *   Verify tapping "Disconnect" shows a confirmation warning.
        *   Verify that confirming the disconnect revokes the OAuth token, deletes local credentials, and removes the app from the list.
        *   Verify that all sync configurations using the disconnected app are also deleted.
    *   **Negative:**
        *   Verify that tapping "Cancel" on the confirmation dialog makes no changes.
    *   **Edge Cases:**
        *   Verify that the token revocation call is actually made to the service provider's API.
        *   Test disconnecting an app whose token has already expired or been revoked externally. The app should handle this gracefully.

*   **Acceptance Criteria (AC):**
    *   **Given** I have at least one app connected.
    *   **When** I navigate to "Settings" -> "Connected Apps."
    *   **Then** I see a list of my connected applications.
    *   **And** each application in the list has a "Disconnect" button.
    *   **When** I tap "Disconnect" for a specific app (e.g., Fitbit).
    *   **Then** a confirmation dialog appears, warning me that this will delete the connection and all associated sync configurations.
*   **And** if I confirm, the app sends a request to the SyncWell backend.
    *   **And** the backend revokes the OAuth token with the service provider and deletes it from AWS Secrets Manager.
    *   **And** all sync configurations using that app are deleted from the dashboard.
    *   **And** the app is removed from the "Connected Apps" list.

*   **Technical Notes:**
    *   The de-authorization request is sent to the backend.
    *   The backend is responsible for calling the `revoke` endpoint and securely deleting the credentials from AWS Secrets Manager and all related configurations from DynamoDB.
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

*   **Security & Privacy:**
    *   This is a critical security feature. It must ensure that the OAuth token revocation API call is made successfully.
    *   It must trigger the backend to perform a secure wipe of the credentials from AWS Secrets Manager.
    *   Refer to: `19-security-privacy.md`, Section 5 "Credential Lifecycle Management".
*   **Accessibility (A11y):**
    *   The confirmation dialog and "Disconnect" button must be fully accessible.
*   **Internationalization (i18n) & Localization (l10n):**
    *   The confirmation dialog text must be localized.
*   **Data Governance & Compliance:**
    *   This feature is a direct implementation of the user's "right to be forgotten" and the right to withdraw consent under GDPR. The successful revocation and deletion must be logged for compliance audits.
*   **Release Strategy:**
    *   N/A. This is a core privacy feature.

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

*   **Dependencies:**
    *   This is a foundational story that implements the core data mapping logic used by **US-05** and **US-06**.

*   **Strategic Alignment:**
    *   **Achieve Product-Market Fit:** This feature is the product's primary unique selling proposition and the solution to a major market pain point.
    *   **Deliver Best-in-Class Reliability:** The accuracy and fidelity of the data mapping between these two platforms are critical for establishing the product's reputation for quality.

*   **Test Scenarios:**
    *   **Positive:**
        *   Verify that steps data from Apple Health is accurately written to Google Fit.
        *   Verify that weight data from Google Fit is accurately written to Apple Health.
        *   Test with a variety of data types (Sleep, Workouts, Heart Rate) and ensure correct mapping.
    *   **Negative:**
        *   Verify that any data types that are not supported for cross-platform sync are clearly indicated in the UI.
    *   **Edge Cases:**
        *   Verify that unit conversions (lbs/kg, mi/km) are handled flawlessly.
        *   Test with historical data containing different metadata and ensure it is preserved where possible.
        *   Ensure the mapping logic is extensible to new data types without requiring a major refactor.

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

*   **Security & Privacy:**
    *   The data mapping layer is a sensitive component. It must be protected from any form of injection or manipulation. All transformations should happen in memory on the device.
*   **Accessibility (A11y):**
    *   Any UI that explains the mapping or limitations (e.g., which data types are not supported) must be clear and accessible.
*   **Internationalization (i18n) & Localization (l10n):**
    *   Data types and descriptions of them must be localized.
*   **Data Governance & Compliance:**
    *   This is the most sensitive data processing in the app. The mapping logic must be thoroughly documented and auditable to prove that it does not alter data in unintended ways. It must correctly handle different data privacy settings on each platform (e.g., if a user has granted permission for Steps but not Heart Rate).
*   **Release Strategy:**
    *   New data type mappings could be rolled out incrementally, controlled by a feature flag or Remote Config, to allow for careful testing and validation.

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

*   **Dependencies:**
    *   **US-09:** This is a Pro feature and requires an active license.
    *   **US-05:** The detection runs as part of the background sync process.
    *   **US-17:** A contextual paywall is needed to upsell this feature.

*   **Strategic Alignment:**
    *   **Achieve Product-Market Fit:** This feature is a major market differentiator that solves a significant pain point for multi-device athletes, solidifying product-market fit with the "Alex" persona.
    *   **Build a Sustainable Business:** As a headline Pro feature, it is a primary driver of monetization.

*   **Test Scenarios:**
    *   **Positive:**
        *   Verify that two activities from different sources with overlapping timestamps are flagged as a conflict.
        *   Verify the user is navigated to a clear side-by-side comparison screen for the conflicting activities.
        *   Verify the user can choose to "Keep Source A", "Keep Source B", or "Merge".
        *   Verify that the "Merge" option intelligently combines data (e.g., GPS from one, heart rate from another) into a single activity in the destination.
    *   **Negative:**
        *   Verify that two non-overlapping activities are not flagged as a conflict.
        *   Verify a free user who has a conflict detected is shown the contextual paywall instead of the resolution screen.
    *   **Edge Cases:**
        *   Test with activities that only partially overlap.
        *   Test the merge logic for various combinations of data types and sources.
        *   Allow the user to set a default resolution strategy (e.g., "Always prefer Garmin").

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
    *   The "merge" logic will be powered by the **`AI Insights Service`** as defined in `06-technical-architecture.md`. The worker lambda will send the two conflicting activities to the service, which will use a trained ML model to return an intelligently merged super-activity. This is more powerful than simple, hard-coded rules.
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

*   **Security & Privacy:**
    *   The conflict data is sensitive health data. The side-by-side comparison must not log or leak this information.
*   **Accessibility (A11y):**
    *   The side-by-side comparison screen is complex and must be designed for accessibility from the start. A screen reader user should be able to easily compare the conflicting data points and make a choice.
*   **Internationalization (i18n) & Localization (l10n):**
    *   All text on the resolution screen ("Keep Source A", "Merge", etc.) must be localized.
*   **Data Governance & Compliance:**
    *   The merge feature is a form of data modification. The user's explicit choice must be logged. The merge algorithm itself must be documented and auditable to show that it is deterministic and respects user intent.
*   **Release Strategy:**
    *   This is a Pro feature, gated by the purchase status (US-09).
    *   The conflict detection algorithm's sensitivity (e.g., the time window for considering activities as duplicates) could be controlled by Remote Config.

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

*   **Dependencies:**
    *   This is an "Epic-like" story that serves as the container for **US-04**, **US-07**, and **US-08**.

*   **Strategic Alignment:**
    *   **Establish a Loyal User Base:** The dashboard is the face of the product for most users. A clean, clear, and trustworthy dashboard is the key to retaining the "Sarah" persona.
    *   **Deliver Best-in-Class Reliability:** The dashboard is the primary vehicle for communicating the system's reliability (or lack thereof) to the user.

*   **Test Scenarios:**
    *   **Positive:**
        *   Verify the dashboard correctly displays a list of all configured syncs.
        *   Verify that adding a new sync (US-04) correctly adds a new card to the dashboard.
        *   Verify that deleting a sync (US-08) correctly removes the card.
        *   Verify that the status of each card updates correctly (US-07).
    *   **Negative:**
        *   Verify the dashboard displays a welcoming empty state when no syncs have been configured yet.
    *   **Edge Cases:**
        *   Test the dashboard's performance with a large number of sync cards (e.g., 20+).
        *   Verify the dashboard UI adapts correctly to different screen sizes and accessibility font sizes.

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

*   **Security & Privacy:**
    *   The dashboard displays a summary of data processing. It must not display sensitive data points directly.
*   **Accessibility (A11y):**
    *   The entire dashboard must be accessible. This includes the list of sync cards, their content, and the empty state. The layout should adapt to larger font sizes.
*   **Internationalization (i18n) & Localization (l10n):**
    *   The empty state text must be localized.
*   **Data Governance & Compliance:**
    *   The dashboard provides the transparency required by regulations like GDPR.
*   **Release Strategy:**
    *   N/A. This is the main screen of the app.

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

*   **Dependencies:**
    *   **US-09:** The purchase flow must be available to be initiated from the paywall.
    *   This story is a prerequisite for gating access to **US-10** and **US-15**.

*   **Strategic Alignment:**
    *   **Build a Sustainable Business:** This story is a critical component of the sales funnel, converting engaged free users into paying customers by demonstrating value at the point of need.

*   **Test Scenarios:**
    *   **Positive:**
        *   Verify that a free user attempting to access "Historical Sync" is shown a contextual paywall.
        *   Verify the paywall clearly explains the specific feature the user was trying to access.
        *   Verify that tapping "Unlock Pro" initiates the purchase flow.
    *   **Negative:**
        *   Verify there is a clear "Dismiss" or "Not Now" option that closes the paywall.
        *   Verify a Pro user does *not* see the contextual paywall when accessing the same features.
    *   **Edge Cases:**
        *   Ensure the upsell content can be configured remotely to allow for A/B testing of messaging without an app update.

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

*   **Security & Privacy:**
    *   N/A. This feature does not handle sensitive data.
*   **Accessibility (A11y):**
    *   The bottom sheet or paywall must be fully accessible and should not trap focus from screen readers. It must be dismissible with an escape gesture.
*   **Internationalization (i18n) & Localization (l10n):**
    *   The upsell messaging must be localized and tested for different screen sizes and languages.
*   **Data Governance & Compliance:**
    *   N/A.
*   **Release Strategy:**
    *   The content and appearance of the upsell prompts are prime candidates for A/B testing via Remote Config to optimize the conversion rate.

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

*   **Dependencies:**
    *   This story represents a major architectural shift. It requires a backend server and a user account system, which are not part of the MVP. It depends on the successful delivery and validation of the entire MVP first.

*   **Strategic Alignment:**
    *   **Build a Sustainable Business:** Introduces a recurring revenue model (subscriptions), which is key to long-term financial sustainability and predictable growth.

*   **Test Scenarios:**
    *   **Positive:**
        *   Verify a user can purchase a Family Plan subscription.
        *   Verify the plan owner can generate an invite code/link.
        *   Verify a second user can use the invite code to unlock Pro features on their device.
        *   Verify the plan owner can see who has joined their plan.
    *   **Negative:**
        *   Verify an invite code cannot be used more than the allowed number of times.
        *   Verify that if the owner's subscription lapses, the family members' Pro access is also revoked.
    *   **Edge Cases:**
        *   Test the process of a user leaving a family plan.
        *   Test the process of an owner removing a user from the plan.

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

*   **Security & Privacy:**
    *   This introduces user accounts and a backend, massively increasing the security surface area. It requires authentication, authorization, protection against data leakage between family members, and a secure invitation system. This requires a full backend security review.
    *   Refer to: `19-security-privacy.md`, Section 6 "Backend and API Security".
*   **Accessibility (A11y):**
    *   The UI for managing family members (inviting, removing) must be accessible.
*   **Internationalization (i18n) & Localization (l10n):**
    *   All new UI, emails, and notifications related to family plan management must be localized.
*   **Data Governance & Compliance:**
    *   This introduces multi-user accounts. The privacy policy must be updated significantly. It must be clear who the data controller is for the family plan data. Compliance with regulations like COPPA might be necessary if children could be invited.
*   **Release Strategy:**
    *   This is a major new feature. It would be launched as a new subscription tier, possibly to a small percentage of users at first (a beta) before a general rollout.

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

---

## Post-MVP User Story Backlog

This section contains a backlog of proposed user stories for future consideration.

### Epic 6: Advanced Sync Control & Automation

---

#### **US-19:** Prioritize the execution order of syncs.
*   **User Story:** As a power user (Alex), I want to set a priority order for my sync configurations so that more important syncs (like my daily run) are executed before less important ones.
*   **Persona:** Alex
*   **Priority:** Could-Have (C-1)
*   **Story Pts:** 5
*   **Business Goal:** **Retention.** This feature caters to power users, giving them a deeper sense of control and making the app more indispensable for complex use cases, thereby increasing long-term retention for this valuable user segment.
*   **Success Metrics (KPIs):**
    *   **Feature Adoption:** >25% of users with 3+ sync configurations use the prioritization feature.
    *   **Task Success Rate:** >99% of users who try to reorder their syncs succeed.
*   **Dependencies:**
    *   **US-05:** Depends on the core background sync engine.
*   **Strategic Alignment:**
    *   **Establish a Loyal User Base:** Directly addresses the needs of the "Alex" persona for fine-grained control.
*   **Test Scenarios:**
    *   **Positive:** Verify a user can drag-and-drop sync cards on the dashboard to reorder them. Verify the new order is saved and reflected on app restart. Verify that when a manual sync is triggered, higher-priority syncs are executed first.
    *   **Negative:** Verify that the reordering UI is disabled if there is only one sync configuration.
*   **Acceptance Criteria (AC):**
    *   **Given** I am a user on the Main Dashboard with multiple sync configurations.
    *   **When** I enter "edit" mode on the dashboard.
    *   **Then** I can drag and drop my Sync Cards to change their order.
    *   **And** when I save the new order, the background sync engine will prioritize executing jobs based on this order.
*   **Technical Notes:**
    *   Add a `priority` integer field to the sync configuration model in the database.
    *   The background job scheduler should query the jobs in `priority` order.
*   **Non-Functional Requirements (NFRs):**
    *   **Responsiveness:** The drag-and-drop interaction must be smooth and fluid.
*   **Security & Privacy:**
    *   No new sensitive data is introduced. The priority order is user preference data and should be stored in the encrypted local database.
*   **Accessibility (A11y):**
    *   Drag-and-drop must have an accessible alternative (e.g., "Move Up"/"Move Down" buttons in the context menu).
*   **Internationalization (i18n) & Localization (l10n):**
    *   All new UI text ("Edit Order", etc.) must be localized.
*   **Data Governance & Compliance:**
    *   N/A.
*   **Release Strategy:**
    *   This could be a Pro feature to further enhance the value of the paid tier. It would be gated by the user's subscription status.

---

#### **US-20:** Pause and resume all syncing globally.
*   **User Story:** As a user (Sarah), I want to be able to pause all syncing temporarily with a single tap so I can conserve battery or data when traveling.
*   **Persona:** Sarah, Alex
*   **Priority:** Should-Have (S-3)
*   **Story Pts:** 3
*   **Business Goal:** **Trust & Control.** Giving users a simple, global control to pause all activity builds trust and provides peace of mind, especially when they are in situations with limited battery or expensive data.
*   **Success Metrics (KPIs):**
    *   **Feature Usage:** >10% of monthly active users use the pause feature at least once.
*   **Dependencies:**
    *   **US-05:** Depends on the core background sync engine.
*   **Strategic Alignment:**
    *   **Establish a Loyal User Base:** A simple feature that shows respect for the user's device resources (battery, data) builds significant goodwill.
*   **Test Scenarios:**
    *   **Positive:** Verify there is a "Pause All Syncs" button in settings. Verify that tapping it stops any in-progress syncs and prevents new ones from starting. Verify the dashboard UI indicates that all syncs are paused. Verify that tapping "Resume Syncing" allows syncs to proceed as normal.
    *   **Negative:** Verify that manual syncs are also disabled when paused.
*   **Acceptance Criteria (AC):**
    *   **Given** I am a user in the app's settings.
    *   **When** I tap the "Pause All Syncing" button.
    *   **Then** all background and manual sync activity is immediately halted.
    *   **And** the button text changes to "Resume Syncing".
    *   **And** a clear indicator appears on the main dashboard showing that syncing is paused.
*   **Technical Notes:**
    *   A global flag in `SharedPreferences`/`UserDefaults` can control the pause state.
    *   The background job scheduler must check this flag before starting any work.
*   **Non-Functional Requirements (NFRs):**
    *   **State Integrity:** The app must correctly resume the sync state when unpaused, without losing track of what needs to be synced.
*   **Security & Privacy:**
    *   N/A.
*   **Accessibility (A11y):**
    *   The "Pause" button and the status indicator on the dashboard must be accessible.
*   **Internationalization (i18n) & Localization (l10n):**
    *   All related UI text ("Pause All Syncing", "Syncing Paused") must be localized.
*   **Data Governance & Compliance:**
    *   N/A.
*   **Release Strategy:**
    *   This will be a free feature available to all users.

---

#### **US-21:** Back up health data to personal cloud storage.
*   **User Story:** As a user (Alex), I want to create a "backup" sync that only runs once a week to archive my data to a cloud storage provider (e.g., Google Drive, Dropbox) so I have a personal, long-term record.
*   **Persona:** Alex
*   **Priority:** Could-Have (C-1)
*   **Story Pts:** 13
*   **Business Goal:** **Differentiation & Retention.** This is a powerful "pro" feature that provides significant value for data-conscious users, creating a strong moat and a reason to upgrade/retain a Pro license.
*   **Success Metrics (KPIs):**
    *   **Feature Adoption:** >15% of Pro users set up a cloud backup sync.
    *   **Successful Backups:** >99% of scheduled backup jobs complete successfully.
*   **Dependencies:**
    *   Requires new OAuth integrations for cloud storage providers (Google Drive, Dropbox APIs).
*   **Strategic Alignment:**
    *   **Build a Sustainable Business:** Acts as a compelling reason for users to upgrade to a Pro tier.
*   **Test Scenarios:**
    *   **Positive:** Verify a user can authorize their Google Drive/Dropbox account. Verify they can configure a sync to export a specific data type as a CSV/JSON file to a designated folder. Verify the backup runs on the user-defined schedule (e.g., weekly).
    *   **Negative:** Verify that if the cloud storage token is revoked, the sync is paused and the user is notified.
*   **Acceptance Criteria (AC):**
    *   **Given** I am a Pro user.
    *   **When** I create a new sync configuration.
    *   **Then** I can select "Cloud Backup" as a destination type.
    *   **And** I can choose between providers like "Google Drive" or "Dropbox".
    *   **And** after authorizing the chosen provider, I can configure a schedule (e.g., "Weekly on Sunday").
    *   **And** on the specified schedule, the app will export the data for the given period as a CSV file to a "SyncWell Backups" folder in my cloud storage.
*   **Technical Notes:**
    *   Requires implementing new OAuth2 flows for Google Drive and Dropbox APIs.
    *   Requires logic to convert health data into CSV or JSON format.
    *   The background job will need to be scheduled with a less frequent interval.
*   **Non-Functional Requirements (NFRs):**
    *   **Data Integrity:** The exported file must be well-formed and accurately represent the source data.
*   **Security & Privacy:**
    *   The app will be requesting broad file access permissions to the user's cloud storage. This must be clearly explained in the permission primer. The scopes requested must be the minimum necessary (e.g., permission to create files in its own folder, not read all files).
*   **Accessibility (A11y):**
    *   The new configuration options (schedule, file format) must be accessible.
*   **Internationalization (i18n) & Localization (l10n):**
    *   All new UI for backup configuration must be localized.
*   **Data Governance & Compliance:**
    *   The user is explicitly choosing to move their data to a third-party service. The UI must be clear that this data will then be subject to the cloud provider's terms and privacy policy.
*   **Release Strategy:**
    *   This will be a Pro feature. The list of supported cloud providers could be rolled out incrementally.

---
### Epic 7: Data Insights & Visualization

---

#### **US-22:** Compare data from two sources in a chart.
*   **User Story:** As a user (Sarah), I want to see a simple chart comparing my step count from two different sources over the last week so I can see how well they correlate.
*   **Persona:** Sarah
*   **Priority:** Could-Have (C-2)
*   **Story Pts:** 8
*   **Business Goal:** **Engagement & Trust.** By visualizing the data from different sources, we help users understand the nuances of their devices, building trust and providing a novel insight that increases engagement with the app.
*   **Success Metrics (KPIs):**
    *   **Feature Adoption:** >20% of users with multiple sources for the same data type view a comparison chart.
*   **Dependencies:**
    *   Requires a chart/graphing library to be added to the project.
*   **Strategic Alignment:**
    *   **Establish a Loyal User Base:** Moves the app beyond a simple utility to a tool for insight and understanding.
*   **Test Scenarios:**
    *   **Positive:** Verify that on a sync detail screen, a "Compare" button appears if data exists from multiple sources. Verify tapping it shows a simple bar chart comparing the data for the last 7 days. Verify the chart is readable and correctly labeled.
    *   **Negative:** Verify the "Compare" button is hidden if there is only one source for a data type.
*   **Acceptance Criteria (AC):**
    *   **Given** I have synced "Steps" from both Fitbit and Apple Health.
    *   **When** I view the details for my "Steps" sync.
    *   **Then** I see a "Compare Sources" button.
    *   **And** tapping the button displays a simple, clearly-labeled bar chart comparing the daily step counts from both sources for the past 7 days.
*   **Technical Notes:**
    *   A lightweight charting library (e.g., `react-native-chart-kit`) will be needed.
    *   The app will need to query the historical data from its local cache (if implemented) or re-fetch it from the source APIs.
*   **Non-Functional Requirements (NFRs):**
    *   **Performance:** The chart must render in under 1 second.
*   **Security & Privacy:**
    *   All data processing for the chart happens on-device. No new privacy concerns.
*   **Accessibility (A11y):**
    *   The chart must be accessible. This includes providing text alternatives for the data (e.g., a summary table) and ensuring colors are distinguishable for color-blind users. Chart elements should be focusable.
*   **Internationalization (i18n) & Localization (l10n):**
    *   Chart labels, dates, and numbers must be localized.
*   **Data Governance & Compliance:**
    *   N/A.
*   **Release Strategy:**
    *   This could be a free feature to drive engagement or a Pro feature to encourage upgrades. Decision to be made based on user feedback.

---

#### **US-23:** See a data completeness score.
*   **User Story:** As a user (Alex), I want to see a "data completeness" score for each day so I can easily identify if key data points (like sleep or workouts) are missing from my records.
*   **Persona:** Alex
*   **Priority:** Could-Have (C-1)
*   **Story Pts:** 8
*   **Business Goal:** **Engagement & Retention.** This feature gamifies data tracking and provides a clear, actionable goal for data-driven users, increasing their daily engagement with the app.
*   **Success Metrics (KPIs):**
    *   **Feature Engagement:** >30% of "Alex" persona users check their completeness score daily.
*   **Dependencies:**
    *   None.
*   **Strategic Alignment:**
    *   **Establish a Loyal User Base:** Directly serves the "Alex" persona's desire to meticulously track their data.
*   **Test Scenarios:**
    *   **Positive:** Verify a user can define their "key" data types in settings. Verify the main dashboard shows a daily score (e.g., a progress ring) indicating how many of the key data types have been synced for the current day.
    *   **Negative:** Verify the score is 0% if no key data types have been selected.
*   **Acceptance Criteria (AC):**
    *   **Given** I have configured "Steps", "Sleep", and "Workout" as my key data types.
    *   **When** I view the main dashboard.
    *   **Then** I see a visual indicator (e.g., a progress ring) showing "2 of 3 tracked today".
    *   **And** tapping the indicator shows me that "Workout" data is missing.
*   **Technical Notes:**
    *   Requires a new settings screen to let the user choose their key data types.
    *   The dashboard will need to query for the presence of these data types for the current day.
*   **Non-Functional Requirements (NFRs):**
    *   **Performance:** The calculation of the score should not slow down the dashboard load time.
*   **Security & Privacy:**
    *   N/A.
*   **Accessibility (A11y):**
    *   The progress ring must have an accessible label that announces the score (e.g., "Data completeness: 2 of 3 tracked").
*   **Internationalization (i18n) & Localization (l10n):**
    *   All related UI text must be localized.
*   **Data Governance & Compliance:**
    *   N/A.
*   **Release Strategy:**
    *   This is likely a Pro feature, as it caters to the most engaged and data-conscious users.

---

#### **US-24:** Receive a weekly summary notification.
*   **User Story:** As a user (Sarah), I want to receive a weekly summary notification with my key stats (e.g., total steps, average sleep) so I can see my progress at a glance.
*   **Persona:** Sarah
*   **Priority:** Should-Have (S-3)
*   **Story Pts:** 5
*   **Business Goal:** **Engagement.** Proactive, insightful notifications bring users back into the app and remind them of its value, even if they don't open it regularly.
*   **Success Metrics (KPIs):**
    *   **Notification Click-Through Rate:** >15% of users who receive the summary notification tap on it to open the app.
    *   **Opt-out Rate:** <5% of users disable the weekly summary notification.
*   **Dependencies:**
    *   **US-03:** Requires notification permissions.
*   **Strategic Alignment:**
    *   **Establish a Loyal User Base:** Provides gentle, positive reinforcement, making the user feel good about their progress and the app.
*   **Test Scenarios:**
    *   **Positive:** Verify that a user who has granted notification permissions receives a summary notification once a week. Verify the notification contains accurate data (e.g., average steps for the past week). Verify tapping the notification opens the app's main dashboard.
    *   **Negative:** Verify the notification is not sent if permissions are denied. Verify a user can disable this specific notification in settings without disabling all notifications.
*   **Acceptance Criteria (AC):**
    *   **Given** I have enabled notifications for the app.
    *   **When** it is the end of the week (e.g., Sunday evening).
    *   **Then** I receive a push notification with the title "Your Weekly SyncWell Summary".
    *   **And** the body of the notification contains a brief summary, such as "You averaged 8,500 steps and 7.5 hours of sleep this week. Keep it up!".
    *   **And** I can disable this specific notification in the app's settings.
*   **Technical Notes:**
    *   A recurring, weekly background job will query the last 7 days of data.
    *   To make the summary more engaging than simple stats, the data will be sent to the **`AI Insights Service`**. An LLM will generate a short, insightful, and personalized narrative summary for the user.
    *   The backend will then send this summary to the device via a push notification.
*   **Non-Functional Requirements (NFRs):**
    *   **Reliability:** The weekly notification must be delivered reliably.
*   **Security & Privacy:**
    *   The notification content contains sensitive health data. The app must ensure this content is not leaked or logged insecurely.
*   **Accessibility (A11y):**
    *   The notification content must be readable by screen readers.
*   **Internationalization (i18n) & Localization (l10n):**
    *   The entire notification text, including the summary sentence structure, must be localized.
*   **Data Governance & Compliance:**
    *   N/A.
*   **Release Strategy:**
    *   This could be a free feature to drive engagement for all users.

---
### Epic 8: Expanded Platform & Data Support

---

#### **US-25:** Connect to smart scales.
*   **User Story:** As a user (Alex), I want to connect my smart scale (e.g., Withings) as a data source so that my weight is automatically synced.
*   **Persona:** Alex
*   **Priority:** Should-Have (S-1)
*   **Story Pts:** 8
*   **Business Goal:** **Expansion & Acquisition.** Supporting popular hardware devices directly makes the app relevant to a wider audience and serves as a strong acquisition channel.
*   **Success Metrics (KPIs):**
    *   **Feature Adoption:** >10% of users connect a smart scale within 3 months of the feature's launch.
    *   **App Store Keyword Ranking:** Achieve top-10 ranking for keywords like "Withings sync app".
*   **Dependencies:**
    *   Requires a new OAuth integration with the Withings API (or other scale providers).
*   **Strategic Alignment:**
    *   **Achieve Product-Market Fit:** Expands the core value proposition to include more types of automated health data collection.
*   **Test Scenarios:**
    *   **Positive:** Verify "Withings" appears in the list of source apps. Verify a user can successfully authenticate their Withings account. Verify that a new weight measurement from the scale is automatically synced.
    *   **Negative:** Verify that if the Withings API is down, the app handles it gracefully.
*   **Acceptance Criteria (AC):**
    *   **Given** I am a user on the "Choose Source App" screen.
    *   **When** I select "Withings" from the grid.
    *   **Then** I am guided through the Withings OAuth flow.
    *   **And** upon successful connection, I can configure a sync for "Weight" and "Body Fat %" from Withings to my chosen destination.
*   **Technical Notes:**
    *   Requires a full new integration with the Withings API, including authentication, data fetching, and error handling.
*   **Non-Functional Requirements (NFRs):**
    *   **Reliability:** The integration must be robust and handle API changes gracefully.
*   **Security & Privacy:**
    *   The new integration must follow all the same security best practices as the existing ones (secure token storage, etc.).
*   **Accessibility (A11y):**
    *   N/A (changes are in the connection flow, which is already covered).
*   **Internationalization (i18n) & Localization (l10n):**
    *   Any new error messages specific to the Withings integration must be localized.
*   **Data Governance & Compliance:**
    *   The integration must adhere to the Withings API terms of service and data use policies.
*   **Release Strategy:**
    *   New integrations will be rolled out one at a time. The list of available integrations is controlled by Remote Config.

---

#### **US-26:** Connect to mindfulness apps.
*   **User Story:** As a user (Sarah), I want to connect my mindfulness app (e.g., Calm, Headspace) so that my meditation sessions are synced to Apple Health / Google Fit.
*   **Persona:** Sarah
*   **Priority:** Could-Have (C-2)
*   **Story Pts:** 8
*   **Business Goal:** **Expansion & Acquisition.** Tapping into the large user base of popular mindfulness apps can be a significant user acquisition channel.
*   **Success Metrics (KPIs):**
    *   **Feature Adoption:** >5% of users connect a mindfulness app.
*   **Dependencies:**
    *   Requires new integrations with Calm/Headspace APIs, if they exist and are public. If not, this story is not feasible.
*   **Strategic Alignment:**
    *   **Achieve Product-Market Fit:** Broadens the definition of "health data" to include mental wellness, appealing to a different user segment.
*   **Test Scenarios:**
    *   **Positive:** Verify "Calm" appears as a source. Verify a user can connect their account. Verify a completed meditation session in Calm is synced as a "Mindful Minute" session to Apple Health / Google Fit.
    *   **Negative:** N/A.
*   **Acceptance Criteria (AC):**
    *   **Given** I am a user connecting a new source app.
    *   **When** I select "Calm" from the list.
    *   **Then** I am guided through the connection process.
    *   **And** I can configure a sync for "Mindfulness Sessions" to my chosen destination.
*   **Technical Notes:**
    *   This is highly dependent on the availability and quality of public APIs from these third-party services. A technical investigation is the first step.
*   **Non-Functional Requirements (NFRs):**
    *   N/A.
*   **Security & Privacy:**
    *   Standard security practices for the new integration apply.
*   **Accessibility (A11y):**
    *   N/A.
*   **Internationalization (i18n) & Localization (l10n):**
    *   Any new error messages must be localized.
*   **Data Governance & Compliance:**
    *   Must adhere to the API terms of service for the new integration.
*   **Release Strategy:**
    *   New integrations will be rolled out one at a time.

---

#### **US-27:** Connect to nutrition apps.
*   **User Story:** As a user (Alex), I want the app to sync nutrition data (calories, macros) from MyFitnessPal so I have a complete picture of my health inputs.
*   **Persona:** Alex
*   **Priority:** Should-Have (S-1)
*   **Story Pts:** 13
*   **Business Goal:** **Expansion & Retention.** For many health-conscious users, nutrition is as important as exercise. Integrating with the market leader (MyFitnessPal) would make SyncWell dramatically more valuable and sticky.
*   **Success Metrics (KPIs):**
    *   **Feature Adoption:** >20% of Pro users connect a nutrition app.
    *   **App Store Keyword Ranking:** Achieve top-10 ranking for "MyFitnessPal sync".
*   **Dependencies:**
    *   Requires a new, potentially complex integration with the MyFitnessPal API.
*   **Strategic Alignment:**
    *   **Achieve Product-Market Fit:** Creates a "whole health" data platform, significantly expanding the product's value proposition.
*   **Test Scenarios:**
    *   **Positive:** Verify a user can connect their MyFitnessPal account. Verify that after logging a meal in MyFitnessPal, the nutrition data (calories, protein, carbs, fat) is synced to the destination (e.g., Apple Health).
    *   **Negative:** Test with incomplete nutrition data.
*   **Acceptance Criteria (AC):**
    *   **Given** I am a Pro user connecting a new source app.
    *   **When** I select "MyFitnessPal".
    *   **Then** I am guided through the connection process.
    *   **And** I can configure a sync for "Nutrition" to my chosen destination.
*   **Technical Notes:**
    *   The MyFitnessPal API is known to be complex or semi-private. A deep technical investigation and potential partnership may be required. This is a high-risk, high-reward feature.
*   **Non-Functional Requirements (NFRs):**
    *   N/A.
*   **Security & Privacy:**
    *   Nutrition data is highly sensitive. All standard security practices apply.
*   **Accessibility (A11y):**
    *   N/A.
*   **Internationalization (i18n) & Localization (l10n):**
    *   Nutrition-specific terms and units may need localization.
*   **Data Governance & Compliance:**
    *   Must adhere strictly to the MyFitnessPal API terms of service.
*   **Release Strategy:**
    *   This would be a major Pro feature. Its development would likely be a multi-sprint effort.

---

#### **US-28:** Export sync history to a CSV file.
*   **User Story:** As a user (Alex), I want to be able to export a specific sync's history as a CSV file so I can do my own analysis in a spreadsheet.
*   **Persona:** Alex
*   **Priority:** Should-Have (S-2)
*   **Story Pts:** 5
*   **Business Goal:** **Retention & Trust.** Empowering users to export their own data reinforces our "Your Data is Yours" promise. It gives power users the ultimate control, building deep trust and loyalty.
*   **Success Metrics (KPIs):**
    *   **Feature Usage:** >10% of Pro users use the export feature.
*   **Dependencies:**
    *   None.
*   **Strategic Alignment:**
    *   **Establish a Loyal User Base:** This is a key feature for the "Alex" persona, demonstrating a commitment to data portability and user control.
*   **Test Scenarios:**
    *   **Positive:** Verify that a "Export as CSV" option exists in the sync detail screen. Verify that tapping it allows the user to select a date range. Verify that a correctly formatted CSV file is generated and can be shared via the native share sheet.
    *   **Negative:** Verify the export handles an empty date range gracefully.
*   **Acceptance Criteria (AC):**
    *   **Given** I am a Pro user viewing the details for a specific sync.
    *   **When** I tap the "Export" button.
    *   **Then** I can select a date range.
    *   **And** upon confirmation, the app generates a CSV file with the sync history for that period.
    *   **And** the native OS share sheet is presented, allowing me to save the file or send it to another app.
*   **Technical Notes:**
    *   Requires logic to query the sync history from the local database and format it as a CSV string.
    *   Will use the native platform's share sheet intent/API.
*   **Non-Functional Requirements (NFRs):**
    *   **Performance:** The export for a large date range (e.g., one year) should complete in under 10 seconds.
*   **Security & Privacy:**
    *   The user is explicitly choosing to export their data. The app is responsible for generating the file securely, but once it is passed to the OS share sheet, it is outside the app's control.
*   **Accessibility (A11y):**
    *   The export options (date range, etc.) must be accessible.
*   **Internationalization (i18n) & Localization (l10n):**
    *   The column headers in the CSV file should be in English (as they are for machine reading), but the UI for the export feature must be localized.
*   **Data Governance & Compliance:**
    *   This feature directly supports the "Right to Data Portability" under GDPR.
*   **Release Strategy:**
    *   This will be a Pro feature.

---

#### **US-29:** Set custom sync frequency per connection.
*   **User Story:** As a power user (Alex), I want to control the sync frequency (e.g., hourly, every 6 hours, daily) for each of my sync connections, so that I can balance data freshness with battery life according to my priorities.
*   **Persona:** Alex
*   **Priority:** Could-Have (C-1)
*   **Story Pts:** 5
*   **Business Goal:** **Retention & Control.** This feature provides deeper control for power users, making the app more valuable for complex use cases and increasing long-term retention of this key user segment.
*   **Success Metrics (KPIs):**
    *   **Feature Adoption:** >30% of users with 3 or more sync configurations customize the frequency for at least one of them.
*   **Dependencies:**
    *   **US-05:** Depends on the core background sync engine. The scheduling logic will need to be adapted.
*   **Strategic Alignment:**
    *   **Establish a Loyal User Base:** Directly caters to the "Alex" persona's desire for granular control over their data and device performance.
*   **Test Scenarios:**
    *   **Positive:** Verify that in the sync configuration screen, there is a "Sync Frequency" option. Verify the user can select from a predefined list (e.g., "High" - approx. every 15-30 mins, "Medium" - approx. hourly, "Low" - approx. every 6 hours). Verify the background job scheduler respects this setting.
    *   **Negative:** Verify that if not set, the frequency defaults to the system-optimized setting.
*   **Acceptance Criteria (AC):**
    *   **Given** I am editing a sync configuration.
    *   **When** I navigate to the advanced settings for that sync.
    *   **Then** I see an option called "Sync Frequency."
    *   **And** I can choose from a list of options, such as "High," "Medium," and "Low."
    *   **And** my choice is saved with the sync configuration.
    *   **And** the background sync scheduler uses this setting to determine how often to run the sync job for this specific connection.
*   **Technical Notes:**
    *   This will require modifying the `WorkManager` or `BGAppRefreshTask` scheduling. Instead of one global schedule, each sync configuration will have its own scheduling parameters.
    *   The app must clearly communicate that these are not exact timers, but hints to the OS.
*   **Security & Privacy:** N/A.
*   **Accessibility (A11y):** The frequency selection UI must be accessible.
*   **Internationalization (i18n) & Localization (l10n):** The frequency option names ("High," "Medium," "Low") must be localized.
*   **Release Strategy:** This could be a Pro feature to further enhance the value of the paid tier.

---

#### **US-30:** Preview data before a sync is executed.
*   **User Story:** As a cautious user (Sarah), I want to see a preview of the data that will be synced before it's written to the destination app, so I can review and approve the changes.
*   **Persona:** Sarah
*   **Priority:** Could-Have (C-1)
*   **Story Pts:** 8
*   **Business Goal:** **Trust.** This feature is a powerful trust-builder. By giving users a final "say" before data is written, it addresses anxieties about data being changed incorrectly, which is critical for the "Sarah" persona.
*   **Success Metrics (KPIs):**
    *   **Feature Adoption:** >20% of users enable the "Pre-Sync Preview" option for at least one sync.
    *   **Approval Rate:** >95% of presented previews are approved by the user.
*   **Dependencies:**
    *   **US-05:** Intercepts the sync process before the final "write" step.
*   **Strategic Alignment:**
    *   **Establish a Loyal User Base:** Directly addresses the "Sarah" persona's need for security and trust.
*   **Test Scenarios:**
    *   **Positive:** Verify a user can enable "Pre-Sync Preview" in a sync's settings. Verify that when a sync runs, it pauses and sends a notification: "Ready to sync 5 new activities. Tap to review." Verify that tapping the notification opens a screen showing a summary of the data to be written. Verify the user can "Approve" or "Reject" the sync.
    *   **Negative:** Verify that if rejected, the data is not written and the sync is marked as "Skipped."
*   **Acceptance Criteria (AC):**
    *   **Given** I have enabled the "Pre-Sync Preview" option for a sync configuration.
    *   **When** a background sync runs and finds new data.
    *   **Then** the sync pauses and I receive a notification.
    *   **And** when I open the app, I am shown a summary of the data to be written (e.g., "New Activity: Run - 5.2 miles", "New Weight: 150.3 lbs").
    *   **And** I have two options: "Approve Sync" and "Skip Sync".
    *   **And** if I tap "Approve Sync", the data is written to the destination.
    *   **And** if I tap "Skip Sync", the data is discarded for this cycle.
*   **Technical Notes:**
    *   Requires a new state in the sync state machine: `AWAITING_USER_APPROVAL`.
    *   The data fetched from the source needs to be temporarily cached on the device until the user approves or rejects it.
*   **Security & Privacy:** The temporary cache of health data must be stored in the app's secure, encrypted storage and cleared immediately after the user acts.
*   **Accessibility (A11y):** The preview screen must be fully accessible, allowing a screen reader to clearly announce the data to be synced.
*   **Internationalization (i18n) & Localization (l10n):** All UI related to the preview and approval process must be localized.
*   **Release Strategy:** This is a strong candidate for a Pro feature.

---

#### **US-31:** Smart, automatic backfill of recent data for new users.
*   **User Story:** As a new user (Sarah), I want the app to automatically sync the last 7 days of my data upon setting up a new connection, so I can see immediate value and confirm it's working without manually running a full historical sync.
*   **Persona:** Sarah
*   **Priority:** Should-Have (S-2)
*   **Story Pts:** 5
*   **Business Goal:** **Activation.** This creates an immediate "wow" moment for new users, instantly demonstrating the app's value and power. It confirms the connection works and populates the destination app with recent data, significantly boosting activation rates.
*   **Success Metrics (KPIs):**
    *   **Activation Rate:** A measurable lift in users who continue to use the app 3 days after install.
    *   **Task Success Rate:** >99% of initial smart backfills complete successfully.
*   **Dependencies:**
    *   **US-04:** This feature would be an extension of the initial sync configuration.
*   **Strategic Alignment:**
    *   **Achieve Product-Market Fit:** This feature makes the initial user experience much more rewarding and sticky.
*   **Test Scenarios:**
    *   **Positive:** Verify that after creating the very first sync for a data type, the app automatically queues a historical sync for the past 7 days. Verify the user is notified that this is happening. Verify the data appears correctly in the destination app.
    *   **Negative:** Verify this only happens for the *first* sync of a given data type, not subsequent ones.
*   **Acceptance Criteria (AC):**
    *   **Given** I am a new user and I have just successfully created my first sync connection (e.g., Fitbit Steps -> Google Fit).
    *   **When** I save the configuration.
    *   **Then** a one-time job is automatically started to sync the last 7 days of data for that connection.
    *   **And** the UI shows a status like "Backfilling recent data..."
*   **Technical Notes:**
    *   This can reuse the logic from the Historical Sync feature (US-10) but with a fixed, non-editable date range.
    *   A flag needs to be stored locally to ensure this one-time backfill only runs once per new connection type.
*   **Security & Privacy:** Same as historical sync; data must be handled securely.
*   **Accessibility (A11y):** The status message ("Backfilling...") must be announced to screen readers.
*   **Internationalization (i18n) & Localization (l10n):** The status message must be localized.
*   **Release Strategy:** This should be a free feature for all users to improve the core onboarding experience.

---

#### **US-32:** Sync advanced biometric data (e.g., HRV, SpO2).
*   **User Story:** As a data-driven athlete (Alex), I want to sync advanced biometric data like Heart Rate Variability (HRV) and Blood Oxygen (SpO2) between my compatible devices, so I can analyze my recovery and performance in my preferred app.
*   **Persona:** Alex
*   **Priority:** Should-Have (S-1)
*   **Story Pts:** 8
*   **Business Goal:** **Differentiation & Retention.** Supporting niche but highly-valued data types for power users creates a strong competitive moat and makes the app indispensable for the most demanding (and often most influential) users.
*   **Success Metrics (KPIs):**
    *   **Feature Adoption:** >25% of Pro users sync at least one advanced biometric data type.
*   **Dependencies:**
    *   **US-14:** Extends the core data mapping logic to new, more complex data types.
*   **Strategic Alignment:**
    *   **Establish a Loyal User Base:** Directly serves the "Alex" persona's core need for comprehensive data tracking.
*   **Test Scenarios:**
    *   **Positive:** Verify "HRV" and "SpO2" appear as selectable data types in the sync configuration if the user has connected compatible source/destination apps. Verify that the data is mapped and synced correctly.
    *   **Negative:** Verify these data types are not shown or are disabled if the selected platforms do not support them.
*   **Acceptance Criteria (AC):**
    *   **Given** I am a Pro user.
    *   **When** I configure a sync between two apps that support HRV (e.g., Oura to Apple Health).
    *   **Then** "Heart Rate Variability" is an available data type to select.
    *   **And** when the sync runs, my HRV data from Oura is correctly written to Apple Health.
*   **Technical Notes:**
    *   Requires a deep technical investigation into how each platform's API exposes this data. The data models can be complex (e.g., HRV is often a series of R-R intervals, not a single number).
    *   The mapping logic will need to be carefully designed to handle these complexities.
*   **Security & Privacy:** This is highly sensitive health data and must be handled with the utmost care, following all existing security protocols.
*   **Accessibility (A11y):** N/A.
*   **Internationalization (i18n) & Localization (l10n):** The names of the new data types must be localized.
*   **Release Strategy:** This is a clear Pro feature. New advanced data types can be rolled out one by one.

---

#### **US-33:** Display API rate limit status to the user.
*   **User Story:** As a user (Alex) performing a large historical sync, I want to see the current status of my API rate limits for each service (e.g., "Garmin: 75% of hourly limit remaining"), so I can understand why a sync might be paused or running slowly.
*   **Persona:** Alex
*   **Priority:** Could-Have (C-3)
*   **Story Pts:** 4
*   **Business Goal:** **Trust & Support Deflection.** Proactively showing users technical limitations in a user-friendly way builds immense trust, especially with power users. It also prevents support tickets from users wondering why their large sync has stopped.
*   **Success Metrics (KPIs):**
    *   **Support Ticket Reduction:** A measurable decrease in support tickets related to stalled historical syncs.
*   **Dependencies:**
    *   **US-10:** Most relevant during historical syncs.
*   **Strategic Alignment:**
    *   **Deliver Best-in-Class Reliability:** Transparency about system constraints is a hallmark of a reliable service.
*   **Test Scenarios:**
    *   **Positive:** Verify that in the "Connected Apps" settings screen, there is a section showing the rate limit status for each app. Verify this status is updated after syncs. Verify that if a limit is close to being exceeded, the UI reflects this with a warning color.
    *   **Negative:** Verify that if a service's API doesn't provide rate limit information, the UI shows "Status not available."
*   **Acceptance Criteria (AC):**
    *   **Given** I am a user.
    *   **When** I navigate to the "Connected Apps" management screen.
    *   **Then** underneath each connected app, I see a summary of its current API rate limit status, if available.
    *   **And** the status is presented in a human-readable format (e.g., "Limit resets in 45 minutes").
*   **Technical Notes:**
    *   Requires parsing rate limit information from the headers of API responses from each third-party service. Not all services provide this.
    *   The app will need to store and display the last known rate limit status.
*   **Security & Privacy:** N/A.
*   **Accessibility (A11y):** The rate limit status information must be accessible to screen readers.
*   **Internationalization (i18n) & Localization (l10n):** The status messages must be localized.
*   **Release Strategy:** This could be a free feature for all users to improve transparency.

---

#### **US-34:** Set a "Source of Truth" for automatic conflict resolution.
*   **User Story:** As a user (Alex) who trusts my Garmin for runs, I want to declare it as the "Source of Truth" for running activities, so that if a conflict with another source is detected, the Garmin data is kept automatically without prompting me every time.
*   **Persona:** Alex
*   **Priority:** Should-Have (S-2)
*   **Story Pts:** 5
*   **Business Goal:** **Retention & Efficiency.** This feature makes the powerful conflict resolution engine (US-15) even smarter and more efficient for users with predictable patterns, reducing friction and making the app feel more personalized and powerful.
*   **Success Metrics (KPIs):**
    *   **Feature Adoption:** >40% of users who encounter conflicts set up at least one "Source of Truth" rule.
    *   **Automatic Resolutions:** >30% of all detected conflicts are resolved automatically via these rules.
*   **Dependencies:**
    *   **US-15:** This feature builds directly on top of the conflict resolution engine.
*   **Strategic Alignment:**
    *   **Establish a Loyal User Base:** This level of smart, configurable automation is exactly what the "Alex" persona looks for in a power tool.
*   **Test Scenarios:**
    *   **Positive:** Verify there is a "Conflict Resolution Rules" section in settings. Verify a user can create a rule like "For 'Running' activities, always prefer 'Garmin'." Verify that when a conflict matching this rule occurs, it is resolved automatically and noted in the sync history.
    *   **Negative:** Verify that if no rule is set, the user is prompted for manual resolution as before.
*   **Acceptance Criteria (AC):**
    *   **Given** I am a Pro user in the app's settings.
    *   **When** I navigate to the "Conflict Resolution" settings.
    *   **Then** I can define rules by data type.
    *   **And** for a given data type (e.g., "Sleep"), I can set a ranked list of preferred sources (e.g., 1. Oura, 2. Apple Health).
    *   **And** when a sync detects a conflict for that data type, it will automatically keep the data from the highest-ranking source and discard the others.
*   **Technical Notes:**
    *   The conflict detection engine needs to be modified to consult a new "Rules" table in the database before flagging a conflict for manual review.
*   **Security & Privacy:** N/A.
*   **Accessibility (A11y):** The UI for creating and managing these rules must be accessible.
*   **Internationalization (i18n) & Localization (l10n):** All UI for the rules engine must be localized.
*   **Release Strategy:** This is a Pro feature, as it enhances the existing conflict resolution capability.

---

#### **US-35:** Use an interactive guide for troubleshooting sync errors.
*   **User Story:** As a user (Sarah) who sees a "Sync Failed" error, I want the app to provide an interactive guide that asks me questions (e.g., "Are you connected to the internet?") to diagnose the problem and provide a specific solution, instead of me having to read a long FAQ.
*   **Persona:** Sarah
*   **Priority:** Should-Have (S-3)
*   **Story Pts:** 8
*   **Business Goal:** **Support Deflection & User Empowerment.** An interactive troubleshooter can solve a much wider range of problems than a static FAQ, leading to a dramatic reduction in support tickets. It also empowers users and reduces frustration.
*   **Success Metrics (KPIs):**
    *   **Resolution Rate:** >50% of users who start the interactive troubleshooter resolve their issue without contacting support.
    *   **Support Ticket Reduction:** A measurable decrease in tickets for common, solvable errors.
*   **Dependencies:**
    *   **US-07:** The troubleshooter would be launched from a sync card in an error state.
*   **Strategic Alignment:**
    *   **Establish a Loyal User Base:** Providing a smart, effective self-service support tool is a massive trust and satisfaction builder for the "Sarah" persona.
*   **Test Scenarios:**
    *   **Positive:** Verify that tapping on a sync card with a specific error code (e.g., `AUTH_FAILURE`) launches the troubleshooter. Verify it presents a decision tree (e.g., "Error: Authentication Failed. Let's fix it. Did you recently change your Fitbit password?"). Verify that following the steps leads to a resolution (e.g., navigating the user to the re-authentication screen).
    *   **Negative:** Verify that if the troubleshooter cannot solve the issue, it ends with a clear "Contact Support" call to action.
*   **Acceptance Criteria (AC):**
    *   **Given** my sync has failed with an error.
    *   **When** I tap on the error details.
    *   **Then** I am presented with an "Interactive Troubleshooter" button.
    *   **And** the troubleshooter presents me with a series of questions and answers to diagnose the issue.
    *   **And** based on my answers, it provides me with a specific, actionable solution (e.g., "It looks like your token expired. Tap here to log in to Garmin again.").
*   **Technical Notes:**
    *   Instead of a rigid, hard-coded decision tree, this will be powered by the **`AI Insights Service`**.
    *   When a user starts the troubleshooter, the app will open a conversational interface. The user's problem and the error code will be sent to a specialized LLM (via the AI service) that is primed with all of our support documentation, API docs, and common error resolutions.
    *   This allows for a much more natural and effective troubleshooting experience than a simple FAQ or decision tree.
*   **Security & Privacy:** N/A.
*   **Accessibility (A11y):** The entire interactive flow must be accessible, with questions and answers clearly announced.
*   **Internationalization (i18n) & Localization (l10n):** The entire troubleshooting script (questions, answers, solutions) must be localized.
*   **Release Strategy:** This would be a free feature for all users to improve the support experience.

---

#### **US-36:** Add a home screen widget for at-a-glance sync status.
*   **User Story:** As a user (Sarah), I want a home screen widget that shows the status of my most important syncs at a glance, so I don't even have to open the app to know things are working.
*   **Persona:** Sarah
*   **Priority:** Could-Have (C-2)
*   **Story Pts:** 8
*   **Business Goal:** **Engagement & Trust.** A home screen widget keeps the app top-of-mind and constantly reassures the user of its value. For "set it and forget it" users, this is a perfect, low-friction way to interact with the service.
*   **Success Metrics (KPIs):**
    *   **Widget Adoption:** >20% of monthly active users have the widget installed on their home screen.
*   **Dependencies:**
    *   Requires platform-specific implementation (WidgetKit for iOS, Glance for Android).
*   **Strategic Alignment:**
    *   **Establish a Loyal User Base:** This feature perfectly serves the "Sarah" persona's desire for effortless peace of mind.
*   **Test Scenarios:**
    *   **Positive:** Verify the user can add a SyncWell widget to their home screen. Verify the widget shows the status of the top 1-3 syncs. Verify the widget updates in the background after a sync completes. Verify tapping the widget opens the app.
    *   **Negative:** Verify the widget shows a "No syncs configured" state if applicable.
*   **Acceptance Criteria (AC):**
    *   **Given** I am a user on my phone's home screen.
    *   **When** I add a widget.
    *   **Then** I can find and select the "SyncWell Status" widget.
    *   **And** the widget displays a summary of my top sync configurations and their last sync status.
    *   **And** this status updates periodically in the background.
    *   **And** tapping the widget opens the SyncWell app.
*   **Technical Notes:**
    *   Requires using modern, platform-specific widget toolkits.
    *   Data needs to be shared from the main app to the widget extension through a shared data store.
    *   Background updates need to be efficient to conserve battery.
*   **Security & Privacy:** The data shared with the widget extension must be handled securely. The shared container should be properly sandboxed.
*   **Accessibility (A11y):** The widget must be accessible and its content readable by screen readers.
*   **Internationalization (i18n) & Localization (l10n):** All text in the widget must be localized.
*   **Release Strategy:** This could be a Pro feature, offered as a premium convenience.

---

#### **US-37:** Filter syncs by specific activity types.
*   **User Story:** As a user (Alex) who uses my Garmin for many activities but only wants to post my runs and bike rides to Strava, I want to configure my "Garmin to Strava" sync to only include those specific activity types.
*   **Persona:** Alex
*   **Priority:** Could-Have (C-3)
*   **Story Pts:** 5
*   **Business Goal:** **Retention & Control.** This provides an essential level of granularity for users who are selective about what they share to different platforms, making the app a more powerful and indispensable tool for them.
*   **Success Metrics (KPIs):**
    *   **Feature Adoption:** >25% of "Activity" syncs have a filter applied.
*   **Dependencies:**
    *   **US-04:** This adds a new option to the sync configuration screen.
*   **Strategic Alignment:**
    *   **Establish a Loyal User Base:** Directly addresses a key need of the "Alex" persona for fine-grained control.
*   **Test Scenarios:**
    *   **Positive:** Verify that when configuring an "Activity" sync, there's a "Filter" option. Verify the user can select multiple activity types (e.g., "Run", "Bike", "Swim") from a list. Verify that only activities matching the filter are synced.
    *   **Negative:** Verify that if no filter is applied, all activities are synced by default.
*   **Acceptance Criteria (AC):**
    *   **Given** I am configuring a sync for the "Activities" data type.
    *   **When** I enter the advanced settings for this sync.
    *   **Then** I see an option to "Filter by Activity Type."
    *   **And** I can select one or more activity types from a comprehensive list.
    *   **And** only activities whose type matches my selection will be synced.
*   **Technical Notes:**
    *   The sync engine will need to be modified to check the activity's type against the filter configuration before processing it.
    *   The list of available activity types may need to be fetched from the source platform's API.
*   **Security & Privacy:** N/A.
*   **Accessibility (A11y):** The multi-select list for activity types must be accessible.
*   **Internationalization (i18n) & Localization (l10n):** The activity type names must be localized.
*   **Release Strategy:** This is a strong candidate for a Pro feature.

---

#### **US-38:** Get notifications for "streaks" or "milestones."
*   **User Story:** As a user (Sarah), I want to get a fun, encouraging notification when I hit a milestone, like "You've synced 1 million steps!" or "You've synced your workout every day for 7 days straight!", so I feel motivated.
*   **Persona:** Sarah
*   **Priority:** Could-Have (C-3)
*   **Story Pts:** 5
*   **Business Goal:** **Engagement & Retention.** Gamification and positive reinforcement are powerful tools for building an emotional connection with users, making the app "stickier" and improving long-term retention.
*   **Success Metrics (KPIs):**
    *   **Notification CTR:** >20% click-through rate on milestone notifications.
    *   **Opt-out Rate:** <5% of users disable milestone notifications.
*   **Dependencies:**
    *   **US-03:** Requires notification permissions.
*   **Strategic Alignment:**
    *   **Establish a Loyal User Base:** Creates positive, delightful moments that build brand loyalty and goodwill with the "Sarah" persona.
*   **Test Scenarios:**
    *   **Positive:** Verify that after a sync that crosses a major milestone (e.g., total steps synced > 1,000,000), a congratulatory notification is sent. Verify a user can disable these specific notifications in settings.
    *   **Negative:** Verify notifications are not sent if the user has them disabled.
*   **Acceptance Criteria (AC):**
    *   **Given** I am a user with notifications enabled.
    *   **When** a sync completes that causes me to cross a pre-defined milestone (e.g., 500 total activities synced).
    *   **Then** I receive a friendly push notification congratulating me on the milestone.
    *   **And** I can disable these "Milestone Notifications" in the app's settings.
*   **Technical Notes:**
    *   Requires a background process to check for milestone achievements after each successful sync.
    *   The milestone definitions (e.g., what counts as a milestone) could be defined in a remote JSON file to allow for adding new ones over time.
*   **Security & Privacy:** N/A.
*   **Accessibility (A11y):** The notifications must be accessible.
*   **Internationalization (i18n) & Localization (l10n):** The notification templates must be fully localized.
*   **Release Strategy:** This is a great free feature to delight all users.
