## Dependencies

### Core Dependencies
- `26-internationalization.md` - Internationalization & Multi-Language Support

### Strategic / Indirect Dependencies
- `11-monetization.md` - Monetization, Pricing & Business Model
- `23-analytics.md` - Analytics & Metrics Tracking
- `24-user-support.md` - Help Center, Support & Feedback
- `25-release-management.md` - Release Management & Versioning

---

# PRD Section 27: Localization & Cultural Adaptation

## 1. Executive Summary

This document specifies the operational strategy for the **Localization (l10n)** of the SyncWell application. Localization is the process of adapting our internationalized product to the specific linguistic and cultural context of a target market. It is a critical driver of global growth.

This plan moves beyond a simple "translate the strings" approach to a professional, repeatable, and high-quality localization workflow. It details how we will use data to select languages, professional services to ensure quality, and automation to make the process efficient for a **solo developer**.

## 2. Localization Strategy

*   **Data-Driven Selection:** The choice of which languages to support will be determined by a weighted scoring system based on post-launch analytics:
    *   `Priority Score = (0.5 * % of DAU by country) + (0.3 * % of App Store page views by country) + (0.2 * # of direct user requests)`
*   **Phased Rollout:** Localization will be done in waves based on the priority score. Wave 1 will target the top 3-5 languages.
*   **Professional Human Translation:** We will exclusively use professional, human translation services. Machine translation is unacceptable for user-facing content.
*   **Continuous & Automated Workflow:** We will use a modern Translation Management System (TMS) like **Lokalise** or **Crowdin** to automate and streamline the entire l10n process.

## 3. The Localization Workflow (TMS-Powered)

This workflow is designed to be highly automated.

1.  **Source String Push (Automated):** A CI/CD job, triggered on every merge to the `develop` branch, will use the TMS API to automatically upload any new or modified strings from the `en.json` source file to the translation project.
2.  **Translation (Manual):** The developer notifies the professional translation service. The translators log into the TMS web platform and complete the translation work. They have access to context, screenshots, and the style guide within the TMS.
3.  **Translation Pull (Automated):** Once a language is 100% translated and approved in the TMS, the developer triggers another CI/CD job. This job uses the TMS API to:
    *   Pull the completed JSON file for the new language.
    *   Create a new branch (e.g., `l10n/add-spanish-translation`).
    *   Commit the new language file to this branch.
    *   Automatically create a pull request.
4.  **LQA & Merge (Manual):** The developer merges the pull request after the Localization QA process is complete.

## 4. Localization Quality Assurance (LQA)

Quality assurance for localization is a two-step process.

1.  **Linguistic Testing:**
    *   **Process:** Before the translation PR is merged, a build of that branch will be provided to a second, independent native speaker for review.
    *   **Goal:** The reviewer will use the app in their native language to check for grammatical errors, typos, awkward phrasing, and cultural inaccuracies. They will provide feedback directly to the primary translator via the TMS.
2.  **Cosmetic Testing:**
    *   **Process:** After the PR is merged, the developer will perform a full manual review of the app in the new language.
    *   **Goal:** To identify and fix all UI layout bugs, such as text overflowing its container, misaligned elements due to RTL flipping, or un-translated (hard-coded) strings.

## 5. The Localization Style Guide

A detailed style guide will be created in the TMS to ensure consistency and quality.

*   **Tone of Voice:** "SyncWell's tone is helpful, clear, and trustworthy. Please avoid overly casual or technical language."
*   **Glossary of Terms:** A list of terms that must be used consistently or should **not** be translated.
    *   `SyncWell`: Never translate.
    *   `Fitbit`, `Garmin`, etc.: Never translate brand names.
    *   `Sync`: Provide the preferred, consistent translation for this key verb.
*   **Character Limits:** For specific UI elements like button labels or notification titles, the TMS will provide character limit warnings to the translators.
*   **Screenshots & Context:** All strings will be uploaded to the TMS with associated screenshots, providing crucial context to the translators.

## 6. Scope of Localization
The following assets will be localized for each target language. The technical scope of all in-app content is defined in `26-internationalization.md`, Section 8. This list serves as the operational checklist for the localization manager.

*   **In-App UI Strings:** This includes all text visible in the application.
    *   Core UI (buttons, labels, titles, chart elements).
    *   Status and error messages (**US-07**).
    *   Permission primer copy (**US-03**).
    *   Paywall and upsell copy (**US-09**, **US-17**).
    *   Confirmation dialogs (**US-08**).
    *   Push Notification Content (**US-24**).
*   **App Store Presence:**
    *   App Store Listings (Title, Description, Keywords, Release Notes).
    *   Localized App Store Screenshots.
*   **Support & Community:**
    *   The top 10-15 most viewed Help Center articles (**US-12**).
    *   Canned email responses for common support queries.
    *   Release announcements for the blog or social media.

## 7. Optional Visuals / Diagram Placeholders
*   **[Diagram] Automated l10n Workflow:** A flowchart showing the automated process from `git push`, to the TMS, and back to a new pull request.
*   **[Screenshot] Translation Management System:** A screenshot of the Lokalise or Crowdin web interface, showing strings, context, and translation status.
*   **[Table] Language Priority Scorecard:** A sample table showing the calculation of the priority score for several potential languages.
*   **[Checklist] LQA Checklist:** A sample checklist for both the linguistic and cosmetic testing phases.
