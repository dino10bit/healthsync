# PRD Section 18: Backup & Disaster Recovery

## 1. Executive Summary

This document specifies the strategy for data backup and disaster recovery for the SyncWell application. The primary objective is to ensure a seamless user experience when switching devices or reinstalling the app. While SyncWell's core privacy principle is to **never store user health data**, it does store user-created configuration data on the device. Protecting this data from loss is critical for user retention.

This strategy focuses on leveraging robust, automated, platform-native solutions (iCloud and Google Drive Auto Backup) to minimize development overhead and provide a reliable recovery experience. It also details the data schema and user experience for the restore process.

## 2. Data to be Backed Up

The following non-sensitive, user-specific configuration data is considered critical for the backup process.

*   **Sync Configurations:** The user-defined rules for data synchronization (source, destination, data type).
*   **App Settings:** User preferences (e.g., notification toggles).
*   **Connected App Metadata:** The *names* of the apps the user has authorized (e.g., "fitbit"). This allows the UI to show which apps need re-authentication.

**Explicitly Out of Scope for Backup:**
*   **OAuth Tokens:** For security reasons, sensitive credentials stored in the Keychain/Keystore are **not** included in the backup.
*   Any personal health and fitness data.
*   Detailed sync logs and application cache.

## 3. Backup Data Schema & Versioning

The backed-up data will be stored in a single, versioned JSON file (e.g., `syncwell_backup_v1.json`).

*   **Schema Versioning:** The file will contain a `schema_version` key (e.g., `"schema_version": 1`). When a new version of the app introduces a breaking change to the settings structure, this version number will be incremented.
*   **Migration on Restore:** When the app restores a backup file, it will first check the `schema_version`. If the version is older than the current version, the app will run a migration function to update the restored settings to the new structure before applying them. This prevents crashes and data corruption from old backups.

## 4. Backup & Recovery Strategy

### 4.1. Automated Cloud Backup (Primary Method)

*   **Mechanism:** Leverage the native, free, and automatic backup services:
    *   **iOS:** iCloud Backup. Data will be stored in the `Application Support` directory.
    *   **Android:** Auto Backup for Apps. The backup rules will be configured in `backup_rules.xml` to include only the `syncwell_backup_v1.json` file.
*   **User Experience on Restore:**
    1.  User installs SyncWell on a new device that has been restored from a cloud backup.
    2.  On first launch, the app detects both that it is a fresh install AND that a `syncwell_backup_v1.json` file exists.
    3.  The app displays a "Welcome Back!" screen: "We've restored your sync configurations. For your security, please re-connect your apps."
    4.  The user is taken to the "Connected Apps" screen, which shows their previously connected apps but with a "Needs Re-authentication" status.
    5.  The user taps each app to go through the quick OAuth login flow. Once re-authenticated, the syncs automatically become active again.

### 4.2. Manual Export/Import (Post-MVP)

*   **Purpose:** To provide a manual, user-controlled backup method for users who disable cloud backups or want to share settings.
*   **Export Flow:**
    *   A user navigates to `Settings > Export Settings`.
    *   The app generates the `syncwell_backup_v1.json` file.
    *   The OS Share Sheet is presented, allowing the user to save the file to their device, cloud storage, or send it via email.
*   **Import Flow:**
    *   A user opens a `.json` backup file in another app (e.g., Files, email client) and uses "Open with..." to select SyncWell.
    *   SyncWell parses the file, validates its schema version, and prompts the user: "Import settings from this file? This will overwrite your current configurations."
    *   Upon confirmation, the settings are applied, and the user is guided to re-authenticate the necessary apps.

## 5. Disaster Recovery Scenarios

(This section remains largely the same but is included for completeness.)

| Scenario | Impact | Recovery Plan |
| :--- | :--- | :--- |
| **User gets a new phone.** | User needs to set up SyncWell on the new device without losing their configurations. | The automated cloud backup and restore flow is the primary solution. The user re-authenticates, and their setup is restored. |
| **A bug corrupts local config data.** | User's settings are gone or the app crashes. | This is a code-level issue. A hotfix release is required. The manual import/export feature serves as a powerful recovery tool for affected users. |
| **Cloud backup is disabled.** | User loses their phone and has no backup. | This is outside of SyncWell's control. The manual export feature provides a solution for these users to maintain their own backups. |

## 6. Risk Analysis & Mitigation

(This section remains largely the same but is included for completeness.)

| Risk ID | Risk Description | Probability | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **R-52** | A change in the OS backup behavior breaks the automatic restore functionality. | Low | High | Stay up-to-date with the latest OS releases and developer documentation. Test the restore flow on new OS versions before they are publicly released. |
| **R-105** | A user imports a malformed or malicious backup file, causing the app to crash or behave unexpectedly. | Medium | Medium | The import logic must perform strict validation on any imported file. It must check for the correct schema, data types, and version number. Any invalid file should be rejected with a user-friendly error message. |

## 7. Optional Visuals / Diagram Placeholders

*   **[Flowchart] New Device Restore UX:** A detailed flowchart illustrating the user experience described in section 4.1, from first launch to the "Welcome Back" screen to re-authentication.
*   **[Diagram] Data Backup Scope:** A diagram visually separating what is backed up (Config JSON) from what is not (Keychain Tokens, Health Data).
*   **[Code Snippet] Backup Schema:** A sample of the `syncwell_backup_v1.json` file structure.
*   **[Wireframe] Manual Import/Export:** Wireframes for the "Export Settings" and "Import Confirmation" screens.
