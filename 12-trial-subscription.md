## Dependencies

### Core Dependencies
- `04-user-stories.md` - User Stories
- `08-ux-onboarding.md` - UX, Onboarding & Support
- `11-monetization.md` - Monetization, Pricing & Business Model
- `38-ux-flow-diagrams.md` - UX Flow & Interaction Diagrams

### Strategic / Indirect Dependencies
- `23-analytics.md` - Analytics & Metrics Tracking
- `29-notifications-alerts.md` - Push Notifications & Alerts
- `41-metrics-dashboards.md` - Analytics Dashboard Design

---

# PRD Section 12: Free Trial & Subscription Flow

## 1. Executive Summary

This document provides the detailed functional and user experience (UX) specification for SyncWell's free trial and subscription flow. This flow is the engine of our business model, responsible for converting engaged users into paying customers. The goal is to create a journey that is seamless, transparent, and effectively communicates the value of upgrading, thereby maximizing the trial-to-paid conversion rate.

For the **solo developer**, this document provides a precise blueprint for implementing the paywall, trial logic, and entitlement states, leaning on third-party tools like RevenueCat to simplify development and increase reliability.

## 2. User Entitlement State Machine

The app will model a user's access level as a formal state machine. A user can only be in one state at any given time.

*   `ANONYMOUS`: A user who has just installed the app but not yet completed onboarding. No sync functionality.
*   `TRIALING`: The user has completed onboarding. The trial period is active. All features are unlocked except those explicitly gated (e.g., Historical Sync).
*   `TRIAL_EXPIRED`: The trial period has ended. Core sync functionality is disabled. The user is prompted to upgrade.
*   `SUBSCRIBED`: The user has an active, auto-renewing subscription. All features are unlocked.

The entitlement state will be managed by the RevenueCat SDK, which serves as the source of truth, preventing trial abuse and simplifying cross-platform state management.

## 3. Detailed UX for Each State

### `TRIALING` State

*   **UI:** The app is fully functional. A small, non-intrusive banner is displayed at the bottom of the main dashboard: "You have X days left in your free trial. [Upgrade Now]".
*   **Gating:** If the user attempts to access a premium-gated feature (e.g., Historical Sync), they are immediately shown the paywall screen.
*   **Notifications:** A single push notification will be sent 24 hours before the trial expires.

### `TRIAL_EXPIRED` State

*   **UI:**
    *   On app launch, the user is immediately presented with the full-screen paywall.
    *   If they dismiss the paywall, the main dashboard is visible, but a prominent, persistent error-colored banner at the top reads: "Your trial has ended. Please upgrade to continue syncing."
    *   All "Sync Card" items on the dashboard are shown in a disabled state.
    *   The manual sync button is disabled.
*   **Functionality:** Core data synchronization is completely disabled. The user can still access settings, the help center, and manage their connected apps.

### `SUBSCRIBED` State

*   **UI:** The app is fully unlocked. All trial-related banners and prompts are removed.
*   **Settings:** The "Manage Account" screen shows the user's current status (e.g., "SyncWell Pro: Subscription renews on [Date]"). A "Manage Subscription" button will deep-link to the native OS subscription management screen.

## 4. Paywall Design & Copy

The paywall is a critical conversion surface. Its design must be clear and persuasive.

*   **Headline:** "Unlock SyncWell's Full Potential"
*   **Value Propositions (Bulleted List with Icons):**
    *   ✅ **Unlimited Syncing:** Keep all your apps in sync, automatically.
    *   ✅ **Historical Sync:** Import your complete health data history.
    *   ✅ **Smart Conflict Resolution:** Intelligently merge duplicate activities.
    *   ✅ **Support a Solo Developer:** Help keep SyncWell running and improving.
*   **Purchase Options:**
    *   **SyncWell Pro:** A single, clear option for the yearly subscription. Price: `$24.99 / year`.
*   **Call to Action:** A single "Upgrade to Pro" button.
*   **Footer:** Small text links to "Restore Purchases", the Privacy Policy, and Terms of Service.

## 5. A/B Testing Strategy

To optimize conversion, we will use Firebase A/B Testing in conjunction with RevenueCat to test key variables.

*   **Test 1: Trial Length:**
    *   **Variable:** `trial_duration`
    *   **Hypothesis:** A longer, 14-day trial may give users more time to see the value, leading to a higher conversion rate.
    *   **Groups:** Group A gets a 7-day trial. Group B gets a 14-day trial.
    *   **Metric:** Trial-to-paid conversion rate.
*   **Test 2: Paywall Copy:**
    *   **Variable:** `paywall_headline`
    *   **Hypothesis:** A benefit-oriented headline ("Unlock Your Health Data") will convert better than a feature-oriented one ("Unlock All Features").
    *   **Groups:** Group A sees Headline A. Group B sees Headline B.
    *   **Metric:** Paywall view-to-purchase conversion rate.

## 6. Risk Analysis & Mitigation

(This section remains largely the same but is included for completeness.)

| Risk ID | Risk Description | Probability | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **R-34** | Users are confused about why the app has stopped working after 7 days. | Medium | Medium | The in-app banner during the trial and the clear paywall upon expiration are the primary mitigations. |
| **R-35** | A bug in the trial state tracking allows users to extend their trial indefinitely. | **Low** | **High** | Using a third-party service like RevenueCat as the source of truth for entitlements almost completely mitigates this risk, as the state is managed on their servers, not just the client. |
| **R-36** | The paywall is not persuasive enough, leading to a low conversion rate. | Medium | High | The A/B testing strategy defined in Section 5 is the primary mitigation. Continuously iterate on the design and copy based on data. |

## 7. Optional Visuals / Diagram Placeholders
*   **[Diagram] User Entitlement State Machine:** A formal state diagram showing the `ANONYMOUS`, `TRIALING`, `TRIAL_EXPIRED`, and `SUBSCRIBED` states and the transitions between them.
*   **[Mockup] In-App Banners:** Mockups of the "X days left" banner and the "Trial Expired" banner.
*   **[Mockup] High-Fidelity Paywall Screen:** A detailed mockup of the paywall as described in Section 4.
*   **[Diagram] A/B Testing Plan:** A table visually laying out the A/B tests, their variables, and their primary success metrics.
