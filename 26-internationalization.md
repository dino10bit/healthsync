# PRD Section 26: Internationalization & Multi-Language Support

## 1. Executive Summary

This document specifies the technical architecture and strategy for the **Internationalization (i18n)** of the SyncWell application. Internationalization is the foundational engineering work required to make an application capable of adapting to different languages and regions without code changes. It is the prerequisite for all future localization efforts.

This document details a robust i18n strategy that will be implemented from day one of the project. For the **solo developer**, this proactive approach is vastly more efficient than attempting to retrofit i18n into an existing codebase. It ensures the app is "world-ready" from its initial launch.

## 2. i18n Architecture & Implementation

*   **Core Library:** **`react-i18next`** will be the chosen i18n framework. It is a mature, full-featured library with strong support for React Native.
*   **Centralized Service:** A custom `useTranslation` hook will be created that wraps the core `react-i18next` functionality. All UI components will use this single hook to access translations. This provides a single point of control for future enhancements or debugging.
*   **Initialization:** The i18n service will be initialized at the app's root. It will:
    1.  Detect the user's device language.
    2.  Asynchronously load the appropriate language resource file.
    3.  Set English as the default fallback language if a translation file for the user's language does not exist.
*   **Formatting:** The library's built-in support for the `Intl` API will be used for all date, time, and number formatting to ensure locale-correct presentation.

## 3. Structured Language Resource Files

To ensure maintainability, all language resource files (e.g., `en.json`, `es.json`) will be structured, namespaced JSON.

**Example `en.json` structure:**
```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "error": "An error occurred."
  },
  "dashboard": {
    "title": "Your Syncs",
    "empty_state": "No syncs yet. Tap the '+' button to create your first one!",
    "sync_card_status": "Last synced: {{val, datetime}}"
  },
  "settings": {
    "title": "Settings",
    "notifications": "Notifications"
  },
  "notifications": {
    "sync_error_title": "Sync Failed",
    "sync_error_body": "Could not sync {{dataType}} from {{source}} to {{destination}}."
  },
  "user_messages": {
    "welcome_messages_one": "You have {{count}} new message.",
    "welcome_messages_other": "You have {{count}} new messages."
  }
}
```
*   **Nesting:** Keys are grouped by screen or feature to make them easier to find.
*   **Interpolation:** Variables are passed into translations using the `{{variable}}` syntax.
*   **Pluralization:** The library's support for CLDR pluralization rules will be used (e.g., `_one`, `_other`).

## 4. Automated i18n Testing Strategy

The CI/CD pipeline will be configured to run several automated checks on every pull request to enforce i18n best practices.

1.  **Linting for Hard-Coded Strings:** A static analysis (lint) rule will be configured to detect user-facing strings that are hard-coded in the JSX, flagging them as an error.
2.  **Missing Key Detection:** A script will be run that compares the keys used in the application code against the keys present in the primary `en.json` file. The build will fail if any keys are missing from the resource file.
3.  **Key Parity Check:** A script will ensure that all other language files (e.g., `es.json`, `de.json`) contain the exact same set of keys as the `en.json` file. This prevents crashes in a translated language due to a missing translation.

## 5. Pseudo-localization for Layout Testing

To proactively find UI layout bugs, a pseudo-localized language will be created and used during development and testing.

*   **Locale:** `en-pseudo`
*   **Implementation:** A script will generate the `en-pseudo.json` file from the `en.json` file by applying transformations:
    *   **String Expansion:** Add extra characters to each string to simulate longer languages like German (e.g., "Save" -> "[Šååvéé one two]").
    *   **Accents:** Add non-standard accents and characters to test font rendering.
    *   **Brackets:** Surround each string with brackets to instantly identify any text that has not been correctly externalized.
*   **Usage:** The developer can switch the app to the `en-pseudo` locale in a debug build to visually inspect all screens for text overflow, truncation, and other layout issues.

## 6. Execution Plan
1.  **Phase 1: i18n Framework Setup (1 week, during initial project setup)**
    *   Integrate `react-i18next` and configure the initialization logic.
    *   Create the initial `en.json` file with the nested structure.
    *   Implement the automated i18n testing scripts in the CI/CD pipeline.
2.  **Phase 2: i18n-Aware Development (Ongoing)**
    *   Enforce the rule that all new user-facing text must be added to the `en.json` file and referenced via the `useTranslation` hook.
3.  **Phase 3: Pre-Localization Audit (Before localization begins)**
    *   Perform a full manual test run of the app in the `en-pseudo` locale to find and fix all layout bugs.
    *   Perform a full manual test run in an RTL language (e.g., Arabic, by creating a temporary, machine-translated `ar.json` file) to find and fix all right-to-left layout bugs.

## 7. Optional Visuals / Diagram Placeholders
*   **[Diagram] i18n Data Flow:** A diagram showing how a component's call to `useTranslation('dashboard.title')` results in the correct string being loaded from the appropriate JSON file based on the device's locale.
*   **[Screenshot] Pseudo-localization:** A screenshot of a UI screen running in the `en-pseudo` locale, showing the expanded, accented text and brackets.
*   **[Screenshot] CI/CD Check:** A screenshot of a failing GitHub pull request check due to a "missing translation key" error from the automated script.
*   **[Code Snippet] `useTranslation` Hook:** A sample of the custom `useTranslation` hook that wraps the library.
