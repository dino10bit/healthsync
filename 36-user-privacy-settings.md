## Dependencies

### Core Dependencies
- `19-security-privacy.md` - Data Security & Privacy Policies
- `20-compliance-regulatory.md` - Legal & Regulatory Compliance

### Strategic / Indirect Dependencies
- `18-backup-recovery.md` - Backup & Disaster Recovery
- `23-analytics.md` - Analytics & Metrics Tracking
- `34-data-export.md` - Data Export Feature

---

# PRD Section 36: User Privacy Controls & Settings

## 1. Executive Summary

This document specifies the design and functionality of the **Privacy Dashboard**, the central hub for all user-facing privacy and security controls within SyncWell. The purpose of this feature is to go beyond mere compliance and to tangibly demonstrate our core value of user trust and empowerment. It provides users with transparent information and direct control over their data connections and app settings.

For the **solo developer**, implementing these controls robustly and clearly is a non-negotiable requirement for launch. This specification provides the detailed technical and UX blueprint for building a best-in-class privacy experience.

## 2. The Privacy Dashboard

The "Privacy & Security" screen will be designed as a "Privacy Dashboard," empowering users rather than just presenting settings.

### 2.1. Manage Connected Apps

This is the core component of the dashboard. It will be a list of all third-party services the user has connected.

*   **UI:** Each connected app will be displayed as a card with the following information:
    *   **App Name & Logo:** e.g., "Fitbit".
    *   **Connection Date:** e.g., "Connected on October 27, 2023".
    *   **Granted Permissions:** A summary of the permissions granted, derived from the OAuth scopes (e.g., "Has access to read your Activities and Sleep data").
    *   **"Disconnect" Button:** A prominent button to initiate the de-authorization flow.
*   **De-authorization Flow:**
    1.  User taps "Disconnect."
    2.  A confirmation dialog appears: "Are you sure you want to disconnect from Fitbit? This will delete your credentials from this device and disable all syncs using Fitbit."
    3.  Upon confirmation, the `revokeAccess()` method for the provider is called, which securely deletes all tokens and, if possible, revokes the grant on the provider's servers.
    4.  The card is removed from the list.

### 2.2. Data Management Actions

Two primary actions will be presented clearly on the Privacy Dashboard.

*   **Export My Settings Data:**
    *   **UI:** A button labeled "Export My App Settings."
    *   **Action:** Triggers the manual export flow defined in `18-backup-recovery.md`, generating a JSON file of all sync configurations and app settings.
    *   **Rationale:** Directly supports the GDPR "Right to Portability" for the configuration data we store.
*   **Delete All My Data:**
    *   **UI:** A clearly marked, "danger zone" style button labeled "Delete All SyncWell Data."
    *   **Action:** Tapping this button will trigger a two-step confirmation process to prevent accidental deletion.
    *   **Technical Implementation:** Upon final confirmation, the app will execute the following sequence:
        1.  Iterate through every connected `DataProvider` and call the `revokeAccess()` method on each.
        2.  Wipe all tables in the local Realm database.
        3.  Clear all data from `SharedPreferences` (Android) or `UserDefaults` (iOS).
        4.  Programmatically restart the app, which will now launch into the first-time onboarding state.
    *   **Rationale:** Directly supports the GDPR "Right to Erasure" and provides a "nuke everything" option for ultimate user control.

### 2.3. Analytics & Policy

*   **Analytics Consent Toggle:**
    *   **UI:** A toggle switch labeled "Share Anonymous Analytics."
    *   **Description:** "Help us improve SyncWell by sharing anonymous usage data. We never track your personal health data."
    *   **Action:** Toggling this off will call the `setAnalyticsCollectionEnabled(false)` method of the Firebase SDK.
*   **Privacy Policy Link:** A clear link to the full, public Privacy Policy.

## 3. Non-Functional Requirements

*   **Clarity & Transparency:** The language must be simple and unambiguous. The permissions displayed must accurately reflect the OAuth scopes granted.
*   **Effectiveness:** The data deletion and de-authorization processes must be immediate, complete, and irreversible.
*   **Security:** Access to the Privacy Dashboard may require the user to re-authenticate with their device PIN/Biometrics for sensitive actions like deleting all data.

## 4. Risk Analysis & Mitigation

(This section remains largely the same but is included for completeness.)

| Risk ID | Risk Description | Probability | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **R-97** | A bug in the de-authorization flow fails to properly delete the OAuth token. | **Low** | **High** | This must be a primary focus of the QA process. The test plan must include verifying, after de-authorization, that the token is gone from the secure storage and that subsequent API calls fail. |
| **R-106**| A user accidentally taps "Delete All My Data" and loses their complex configuration. | **Medium** | **Medium** | The use of a multi-step confirmation dialog with a scary warning ("This action is irreversible and will permanently delete all your sync configurations.") is the primary mitigation. |
| **R-99** | The "opt-out of analytics" toggle does not fully disable all tracking. | **Low** | **Critical**| This must be verified during the pre-launch compliance audit. The test plan will include using a network proxy to confirm that no analytics events are sent when the switch is off. |

## 5. Optional Visuals / Diagram Placeholders
*   **[Mockup] Privacy Dashboard:** A high-fidelity mockup of the main dashboard screen, showing the list of connected apps with their detailed permissions, and the Export/Delete action buttons.
*   **[Sequence Diagram] "Delete All Data" Flow:** A detailed sequence diagram showing the technical operations that occur when the user confirms deletion.
*   **[Wireframe] Deletion Confirmation Dialog:** A wireframe of the multi-step confirmation dialog, including the text of the warning message.
*   **[Table] OAuth Scopes to User-Friendly Text:** A mapping table that shows how technical OAuth scopes (e.g., `activity:read_all`) are translated into the human-readable permission strings shown in the UI.
