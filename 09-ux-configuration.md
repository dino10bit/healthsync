## Dependencies

### Core Dependencies
- `02-product-scope.md` - Product Scope, Personas & MVP Definition
- `04-user-stories.md` - User Stories
- `32-platform-limitations.md` - Platform-Specific Limitations
- `36-user-privacy-settings.md` - User Privacy Controls & Settings
- `38-ux-flow-diagrams.md` - UX Flow & Interaction Diagrams

### Strategic / Indirect Dependencies
- `05-data-sync.md` - Data Synchronization & Reliability
- `10-ux-feedback.md` - UX Feedback & Iteration Loops
- `28-accessibility.md` - Accessibility (WCAG)
- `40-error-recovery.md` - Error Recovery & Troubleshooting

---

# PRD Section 9: User Configuration Options

## 1. Executive Summary

This document provides a detailed specification for all user-facing configuration screens within the SyncWell application. After onboarding, these screens are the primary interface for the user. Therefore, their design must be exceptionally clear, intuitive, and efficient. The goal is to empower users with granular control over their data synchronization without causing confusion.

This document serves as a blueprint for the **solo developer**, detailing the information architecture, component-level UI, and state handling for the app's core configuration experience. A well-designed configuration UX is a key factor in reducing support tickets and increasing long-term user retention.

## 2. Information Architecture

The app's configuration options will be organized into a clear hierarchy, accessible from a main "Settings" tab or menu.

*   **Main Dashboard (Home Screen)**
    *   List of Active Syncs
    *   Add New Sync (+) Button
*   **Settings Screen**
    *   **Manage Account** (View license, Restore Purchases)
    *   **Connected Apps** (De-authorize apps)
    *   **Notifications** (Toggle notification types)
    *   **Privacy & Security** (Link to policy, Analytics toggle)
    *   **Help Center**
    *   **About** (Version, Acknowledgements)

## 3. UI & Component Specification

### 3.1. Main Dashboard Screen

*   **Purpose:** To provide an at-a-glance view of all active syncs and their status.
*   **Components:**
    *   **Sync Card (List Item):** Each configured sync will be represented by a card with the following elements:
        *   **Source Icon:** Logo of the source app (e.g., Fitbit logo).
        *   **Arrow Icon:** A right-facing arrow (→).
        *   **Destination Icon:** Logo of the destination app (e.g., Google Fit logo).
        *   **Title:** Text describing the sync (e.g., "Steps & Activities").
        *   **Status Text:** A subtitle showing the last sync status (e.g., "Synced 5 minutes ago", "Syncing...", "Needs attention"). The text color will change based on status (e.g., green for success, red for error).
        *   **Context Menu:** A "three-dots" menu on each card with options to "Pause/Resume", "Edit", or "Delete" the sync.
    *   **Floating Action Button (FAB):** A prominent "+" button to initiate the "Add New Sync" flow.
*   **States:**
    *   **Empty State:** Before any syncs are configured, the screen will display a message like "No syncs yet. Tap the '+' button to create your first one!"
    *   **Loading State:** When the app is launched, a shimmer or skeleton loader will be shown in place of the sync cards while the initial status is being checked.

### 3.2. Sync Configuration Screen

*   **Purpose:** To guide the user through creating or editing a sync. The flow will be a simple, multi-step process.
*   **Step 1: Choose Data Type(s)**
    *   **UI:** A grid or list of selectable data types (e.g., "Steps", "Sleep", "Activities", "Weight").
    *   **Action:** User taps one or more data types.
*   **Step 2: Choose Source App**
    *   **UI:** A grid showing the logos of all connected apps that can be a source for the selected data type(s).
    *   **Action:** User taps one source app.
*   **Step 3: Choose Destination App**
    *   **UI:** A grid showing logos of all connected apps that can be a destination. Apps that cannot be a destination (e.g., Garmin, or the selected source app) will be grayed out and unselectable. Tapping a grayed-out icon will show a toast/tooltip explaining why (e.g., "Garmin cannot be a destination").
    *   **Action:** User taps one destination app.
*   **Step 4: Review & Save**
    *   **UI:** A summary screen showing the user's choices (e.g., "Sync **Steps** from **Fitbit** to **Google Fit**").
    *   **Action:** A "Save Sync" button commits the configuration and returns the user to the dashboard.

### 3.3. Connected Apps Screen

*   **Purpose:** To allow users to manage their third-party account connections.
*   **Components:**
    *   A simple list of connected applications (e.g., "Fitbit", "Strava").
    *   Each list item will have a "Disconnect" button next to it.
    *   Tapping "Disconnect" will trigger the de-authorization flow as defined in `36-user-privacy-settings.md`.

## 4. Accessibility Requirements

*   All icons (app logos, arrows, FAB) must have appropriate `accessibilityLabel`s for screen readers.
*   The "Sync Card" list items must be focusable as a single unit, and the screen reader should announce the full summary (e.g., "Syncing Steps from Fitbit to Google Fit. Last synced 5 minutes ago.").
*   Color-based status indicators (e.g., red text for an error) must be accompanied by text to be accessible to color-blind users.
*   All touch targets, including the context menu button, must meet the minimum size requirements (44x44px).

## 5. Risk Analysis & Mitigation

(This section remains largely the same but is included for completeness.)

| Risk ID | Risk Description | Probability | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **R-25** | The configuration UI is too complex, leading to user frustration and abandonment. | Medium | High | The step-by-step configuration flow is designed to mitigate this by simplifying the decision-making process. Usability testing with the clickable prototype is key. |
| **R-26** | Users misunderstand the configuration options and set up their syncs incorrectly. | Medium | Medium | Use clear, unambiguous language. The visual cue of graying out invalid options with an explanation is a critical part of preventing user error. |
| **R-27** | The app fails to properly save or reflect the user's configuration changes. | Low | High | Implement a robust state management solution (e.g., Redux) to ensure that the UI is always a direct reflection of the app's state. |

## 6. Optional Visuals / Diagram Placeholders
*   **[Mockup] High-Fidelity Main Dashboard:** A mockup showing several "Sync Cards" in different states (synced, syncing, error).
*   **[User Flow Diagram] Add New Sync:** A detailed diagram illustrating the four-step process on the Sync Configuration Screen.
*   **[Wireframe] Connected Apps Screen:** A wireframe showing the list of connected apps with "Disconnect" buttons.
*   **[Component Diagram] Sync Card:** A diagram breaking down the visual components and states of a single "Sync Card".
