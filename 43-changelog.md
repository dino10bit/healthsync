## Dependencies

### Core Dependencies
- `25-release-management.md` - Release Management & Versioning

### Strategic / Indirect Dependencies
- `13-roadmap.md` - Roadmap, Milestones & Timeline
- `22-maintenance.md` - Maintenance & Post-Launch Operations (SRE)
- `42-customer-feedback.md` - Customer Feedback Loop

---

# PRD Section 43: Changelog & Version History

## 1. Executive Summary

This document serves as the definitive, internal changelog for the SyncWell application. It is a technical, chronological log of all significant changes made in each version release. Its purpose is to provide a single source of truth for the developer to track the evolution of the product, understand when specific features or fixes were introduced, and aid in debugging regressions.

While the user-facing "What's New" notes are a marketing tool, this document is a critical engineering and maintenance artifact. It will be maintained in the project's source control repository (e.g., as `CHANGELOG.md`) and updated as part of every release process.

## 2. Changelog Format

The changelog will adhere to the principles of [Keep a Changelog](https://keepachangelog.com/en/1.0.0/). All entries will be organized under the version number and date, and grouped into the following categories:

*   **`Added`** for new features.
*   **`Changed`** for changes in existing functionality.
*   **`Deprecated`** for soon-to-be-removed features.
*   **`Removed`** for now-removed features.
*   **`Fixed`** for any bug fixes.
*   **`Security`** in case of vulnerabilities.

Each entry will include a brief description of the change and, where applicable, a link to the corresponding issue or pull request in the project's version control system (e.g., GitHub).

## 3. Version History

---
### [Unreleased]

*   **Added**
    *   Initial implementation of the Data Import feature for FIT, TCX, and GPX files.
    *   Added a "Privacy Dashboard" screen to give users more control over their data.

---
### [1.2.0] - 2024-11-15

*   **Added**
    *   **Polar Integration!** Added full support for syncing data from Polar Flow accounts. (Fixes #112)
    *   **Withings Integration!** Added support for syncing data from Withings, available as a separate premium subscription. (Fixes #125)
    *   Added a "Rate this App" prompt that appears after 20 successful syncs.
*   **Changed**
    *   Improved the error handling for Fitbit API outages. The app will now pause automatically and notify the user.
    *   Updated the UI of the main dashboard to improve accessibility for screen readers. (PR #130)
*   **Fixed**
    *   Fixed a bug where the app could crash if a user de-authorized an app while a sync was in progress. (Fixes #128)
    *   Resolved a layout issue on the settings screen for smaller Android devices.

---
### [1.1.1] - 2024-10-22

*   **Fixed**
    *   **Hotfix:** Patched a critical bug that caused the app to crash on launch for users with a corrupted local database. The app now handles the corruption gracefully and prompts the user to clear app data. (Fixes #105)

---
### [1.1.0] - 2024-10-20

*   **Added**
    *   **Historical Data Sync!** Premium users can now backfill their data history from supported platforms.
    *   Added a 6-month subscription option alongside the lifetime license.
*   **Changed**
    *   The sync engine now uses a dual-queue system to prioritize real-time data over historical backfills.
*   **Fixed**
    *   Corrected a data mapping issue where some Garmin running activities were being classified as "Other." (Fixes #98)

---
### [1.0.0] - 2024-09-15

*   **Added**
    *   Initial public release of SyncWell!
    *   Support for syncing Steps, Activities, Sleep, Weight, and Heart Rate.
    *   Integrations with Google Fit, Apple Health, Fitbit, Garmin, and Strava.
    *   7-day free trial with a one-time "Lifetime License" purchase option.
    *   Core sync engine with automatic background updates.
    *   In-app Help Center.

---

## 4. Maintenance Process

*   **During Development:** The developer will maintain an "Unreleased" section at the top of this document. As feature branches are merged into `develop`, a corresponding entry will be added to this section.
*   **During Release Prep:** As part of the release process (when the `release` branch is created), the developer will:
    1.  Change the `[Unreleased]` heading to the new version number and add the date (e.g., `[1.3.0] - 2024-12-20`).
    2.  Review all entries for clarity and accuracy.
    3.  Use these detailed notes to write the more user-friendly, marketing-oriented "What's New" text for the app stores.
    4.  Create a new, empty `[Unreleased]` section at the top, ready for the next development cycle.

## 5. Optional Visuals / Diagram Placeholders
*   **[Diagram] Changelog in the Release Process:** A flowchart of the release process, highlighting the step where this `CHANGELOG.md` file is updated and used to generate the public release notes.
*   **[Screenshot] A Well-Formatted Commit Message:** A sample `git commit` message that includes a reference to the issue tracker, which makes generating this changelog easier. (e.g., `feat: Add Polar integration (fixes #112)`)
