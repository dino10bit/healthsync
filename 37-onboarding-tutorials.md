# PRD Section 37: Onboarding Guides & Tutorials

## 1. Executive Summary

This document provides the detailed specification for SyncWell's user education system, encompassing onboarding guides, contextual tooltips, and a comprehensive Help Center. The objective is to proactively educate users, which reduces frustration, minimizes support tickets, and increases feature adoption and long-term retention.

This specification details the technical architecture for delivering tutorials, a content strategy for creating them, and a multi-layered approach to user guidance, from simple tooltips to interactive walkthroughs. For the **solo developer**, this represents a scalable investment in user success.

## 2. Tutorial System Architecture

*   **`TutorialService` (Client-Side):** A dedicated service responsible for managing the state of user education.
    *   **Responsibilities:**
        *   Tracks which one-time "coach marks" or interactive guides a user has already seen. This state will be stored locally and backed up with the user's settings.
        *   Determines if a contextual guide should be displayed for a given screen or feature.
*   **Remote Content for Help Center (Server-Side):**
    *   **Technology:** The content (text, image URLs, video URLs) for all Help Center articles will be hosted in a **Firebase Firestore** database.
    *   **Architecture:** The app will fetch and cache the Help Center content from Firestore upon launch.
    *   **Benefit:** This is critical for a solo developer, as it allows for updating, correcting, or adding new tutorials and guides **without needing to ship a new version of the app**.

## 3. Tutorial Formats & Delivery

### Level 1: Contextual Coach Marks

*   **Description:** A single, dismissible tooltip that appears the first time a user encounters a specific UI element or screen.
*   **Trigger:** The `TutorialService` checks if the `has_seen_historical_sync_tooltip` flag is false for the user.
*   **Use Case:** Pointing out the "Manual Sync" button, explaining what a specific setting does.

### Level 2: Interactive Guides

*   **Description:** An engaging, multi-step walkthrough that overlays the live UI. Each step highlights a UI element and requires the user to tap it to proceed.
*   **Trigger:** Manually launched by the user from a "Show Me How" button in a corresponding Help Center article.
*   **Use Case:** A guided walkthrough of the multi-step "Add New Sync" configuration process.

### Level 3: Help Center Articles

*   **Description:** The most detailed format, providing comprehensive explanations with text, images, and video.
*   **Trigger:** User navigates to the in-app Help Center or is deep-linked from a contextual help button.
*   **Content Template:** Every troubleshooting article will follow a strict template:
    1.  **The Problem:** A clear, one-sentence description of the issue (e.g., "Your steps are not syncing from Fitbit.").
    2.  **The Cause:** A simple explanation of the root cause (e.g., "This often happens if you have recently changed your Fitbit password.").
    3.  **The Solution:** A numbered, step-by-step list of actions to resolve the issue, with screenshots for each step.

## 4. Content Strategy

*   **"Top 5" Focus:** At any given time, the top 5 most common user-reported issues will have a corresponding, best-in-class troubleshooting guide in the Help Center, complete with high-quality screenshots and an embedded video tutorial.
*   **Video Tutorials:** Short (<30 seconds), silent, looping videos will be created for the "Top 5" issues to visually demonstrate the solution steps.
*   **Content Sourcing:** The backlog for new tutorial content will be sourced directly from an analysis of support ticket tags. If more than 5 users submit a ticket with the same tag in a month, a new article will be prioritized.

## 5. KPIs / Success Metrics

*   **Tutorial Completion Rate:** An analytics event, `tutorial_completed`, will be fired when a user finishes an interactive guide.
*   **Help Center Article Effectiveness:** A "Was this helpful?" (Yes/No) poll at the bottom of each article. Articles with a <70% "Yes" rating will be prioritized for a rewrite.
*   **Support Ticket Deflection:** We will track the number of tickets created for topics that have a corresponding "Top 5" tutorial. A successful tutorial should lead to a measurable decrease in these tickets.
*   **Feature Adoption Post-Tutorial:** Correlating the viewing of a feature's tutorial with the subsequent adoption of that feature by the user.

## 6. Optional Visuals / Diagram Placeholders
*   **[Diagram] Tutorial System Architecture:** A diagram showing the `TutorialService` on the client, fetching its state from local storage and fetching Help Center content from the remote Firestore database.
*   **[Mockup] Interactive Guide:** A sequence of mockups showing the steps of an interactive guide, with the UI overlay and highlighted elements.
*   **[Template] Help Center Article:** A visual template showing the "Problem/Cause/Solution" structure of a troubleshooting article.
*   **[Flowchart] Content Creation Pipeline:** A flowchart showing how a trend in support tickets leads to the creation and publication of a new Help Center article.
