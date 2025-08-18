# PRD Section 8: UX, Onboarding & Support

## 1. Executive Summary

This document details the User Experience (UX) strategy for SyncWell, with a primary focus on the critical initial user onboarding flow. A smooth, intuitive, and trustworthy onboarding is the single most important factor in converting a new install into an engaged, long-term user. It is our first and best opportunity to demonstrate the app's value and build trust.

For the **solo developer**, a highly-polished and largely automated onboarding process is essential. It must educate the user, guide them to their "aha!" moment (the first successful sync), and do so in a way that minimizes friction and the need for subsequent user support.

## 2. Onboarding Philosophy

The onboarding experience will be guided by three core principles:

1.  **Progressive Disclosure:** We will not overwhelm the user with all options at once. The process will reveal complexity gradually, asking only for what is needed at each step.
2.  **Immediate Value:** The goal is to get the user to a successful outcome—their first configured sync—as quickly as possible. Every step should feel like it is making progress toward that goal.
3.  **Building Trust:** From the very first screen, we will be transparent. This involves clear explanations of our privacy policy and "priming" for permission requests so the user understands why we need access before the OS asks for it.

## 3. The Onboarding Flow: A Step-by-Step Guide

This is the precise sequence of events for a new user.

*   **Step 1: Welcome Carousel (3 Screens)**
    *   **Screen 1: The Value Proposition.** Headline: "All Your Health Data, in Sync." Body: "Connect your fitness apps and devices to see a complete picture of your health."
    *   **Screen 2: The Privacy Promise.** Headline: "Your Data is Yours." Body: "SyncWell processes data only on your device. We never see, store, or sell your personal health information." Link to Privacy Policy.
    *   **Screen 3: The Call to Action.** Headline: "Let's Get Started." A single, prominent "Begin Setup" button.
*   **Step 2: Notification Permission Priming**
    *   **Pre-Permission Dialog:** A friendly, in-app dialog appears. Headline: "Stay in the loop?" Body: "Allow SyncWell to send notifications so we can alert you if a sync fails or needs your attention." Buttons: "Not Now", "Yes, Notify Me".
    *   **OS Dialog:** If the user taps "Yes," the native iOS/Android permission dialog is triggered immediately.
*   **Step 3: Source App Selection**
    *   **Screen:** "First, choose where your data comes from." A grid of logos for the supported source apps (Fitbit, Garmin, etc.).
    *   **Action:** User taps on a source app (e.g., Fitbit).
*   **Step 4: Source App Authentication**
    *   **Screen:** The standard OAuth 2.0 login flow for the selected app is presented in a secure `WebView`.
    *   **Action:** The user logs in and authorizes SyncWell. They are then returned to the app.
*   **Step 5: Destination App Selection**
    *   **Screen:** "Great! Now, where should your data go?" A grid of logos for the supported destination apps (Google Fit, Strava, etc.).
    *   **Action:** User taps on a destination app (e.g., Google Fit).
*   **Step 6: Destination App Authorization**
    *   **Screen:** The native permission request screen for the platform's health store (Apple Health or Google Fit/Health Connect) is displayed, showing the specific data types SyncWell wants to write.
    *   **Action:** The user grants permission.
*   **Step 7: First Sync Configuration**
    *   **Screen:** A simplified version of the main sync configuration screen appears. It might pre-select a common data type. Headline: "Configure Your First Sync."
    *   **Content:** "Sync **Steps** from **Fitbit** to **Google Fit**". A single "Save & Finish" button.
*   **Step 8: Onboarding Complete**
    *   **Screen:** The user is taken to the main dashboard. It is no longer an empty state; it shows their first configured sync connection.
    *   **Feedback:** A success message appears briefly (e.g., "Setup complete! SyncWell will now sync your data automatically.").

## 4. KPIs / Success Metrics

*   **Onboarding Funnel Conversion Rate:**
    *   % of users who complete the Welcome Carousel.
    *   % of users who connect a source app.
    *   % of users who connect a destination app.
    *   % of users who configure their first sync (the final Onboarding Completion Rate).
*   **Time to First Sync:** The median time it takes a new user to get from app install to the "Onboarding Complete" screen. Goal: < 2 minutes.
*   **Permission Acceptance Rate:** The percentage of users who accept the push notification and health data permissions.

## 5. Risk Analysis & Mitigation

(This section remains largely the same but is included for completeness.)

| Risk ID | Risk Description | Probability | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **R-22** | The onboarding flow is confusing or too long, causing a high drop-off rate at a specific step. | Medium | High | Use analytics to track the funnel conversion rate for each step. If a large drop-off is detected at Step 5, for example, it indicates a problem with that specific screen that needs to be addressed via UI/UX changes. |
| **R-24** | The app's value proposition is not clearly communicated during onboarding, leading to low trial-to-paid conversion later. | Medium | Medium | A/B test the copy on the Welcome Carousel screens to see what resonates most with users and leads to higher completion rates. |

## 6. Optional Visuals / Diagram Placeholders

*   **[Diagram] Detailed User Flow of Onboarding:** A comprehensive flowchart showing every screen, user action, and decision branch in the step-by-step process described in Section 3.
*   **[Mockups] High-Fidelity Onboarding Screens:** Mockups for each of the 8 steps, including the pre-permission priming dialogs.
*   **[Wireframe] Dashboard Empty State:** A wireframe showing what the main dashboard looks like before the first sync is configured, with a clear call-to-action guiding the user.
