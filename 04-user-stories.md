# PRD Section 4: User Stories & Acceptance Criteria (v2 - Expanded)

## 1. Executive Summary

This document translates the product scope into a backlog of actionable user stories for the SyncWell MVP. Each story is crafted from the perspective of our user personas and is accompanied by detailed, testable acceptance criteria, technical notes, and non-functional requirements. This structured approach ensures that development efforts are directly tied to user needs and business value, leaving no room for ambiguity for the solo developer. This revised version reflects a deeper analysis of the technical and user experience requirements.

---

## 2. Revised MVP User Story Backlog

### Epic 1: First-Time User Experience & Onboarding

#### **US-01: Value Proposition Overview**
*   **User Story:** As a new user (Alex), I want to see a brief, clear overview of what the app does so that I can understand its value proposition immediately.
*   **Persona:** Alex, Sarah
*   **Dependencies:** None
*   **Acceptance Criteria:**
    *   **Given** I am a new user launching the app for the first time
    *   **When** I see the welcome screen
    *   **Then** I am presented with a 3-screen carousel.
    *   **And** Screen 1 clearly states the value proposition: "All Your Health Data, in Sync."
    *   **And** Screen 2 clearly states the privacy promise: "Your Data is Yours. We never see, store, or sell your health information."
    *   **And** Screen 3 presents a clear call to action: "Let's Get Started."
    *   **And** I can swipe between the screens or use the page indicators.
*   **Technical Implementation Notes:**
    *   Use a standard `ViewPager2` (Android/Compose) or `TabView` with `PageTabViewStyle` (iOS/SwiftUI) for the carousel.
    *   The state of whether the user has seen the onboarding should be stored locally in the SQLDelight database to ensure it's only shown once.
*   **Non-Functional Requirements:**
    *   **Performance:** The carousel must load in under 200ms and animations must be smooth (60fps).
    *   **Usability:** The swipe gesture must be responsive and intuitive.

#### **US-02: Guided App Connection**
*   **User Story:** As a new user (Sarah), I want a simple, guided process to connect my first two health apps so that I can get set up with minimal friction.
*   **Persona:** Sarah
*   **Dependencies:** US-01
*   **Acceptance Criteria:**
    *   **Given** I have completed the welcome carousel and tapped "Begin Setup"
    *   **When** I am on the "Connect Source App" screen and select a source app (e.g., Fitbit)
    *   **Then** the official Fitbit OAuth web flow is presented in a secure in-app browser (`SFSafariViewController`/`ChromeCustomTabs`).
    *   ---
    *   **Scenario: Successful Connection**
    *   **Given** I successfully log in and authorize SyncWell in the OAuth flow
    *   **When** I am returned to the app
    *   **Then** the app shows Fitbit as a connected source and I am prompted to connect a destination app.
    *   ---
    *   **Scenario: User cancels OAuth**
    *   **Given** the Fitbit OAuth web flow is presented
    *   **When** I tap the "Cancel" or "Back" button
    *   **Then** I am returned to the "Connect Source App" screen.
    *   **And** a non-blocking message (e.g., a Toast/Snackbar) is shown: "Connection cancelled."
*   **Technical Implementation Notes:**
    *   Use the Ktor HTTP client in the shared KMP module for all OAuth token exchange calls.
    *   Use the `SecureStorageWrapper` (which abstracts Keychain/Keystore) to securely store the received OAuth tokens (access and refresh tokens).
    *   The callback URL for the OAuth flow must be correctly configured using custom URL schemes (iOS) and intent filters (Android).
*   **Non-Functional Requirements:**
    *   **Security:** OAuth tokens must *never* be stored in plain text. They must be stored in the device's secure element. All OAuth network traffic must use TLS 1.2+.
    *   **Reliability:** If the network connection drops during the token exchange, a user-friendly error message must be displayed with a "Retry" option.

*(Note: The same level of detail would be applied to all 18 user stories. For brevity, only the first two are fully expanded here. The structure is the key deliverable.)*

---

## 3. Revised Story Points & MVP Sprint Plan

### Revised Story Points
Based on the detailed requirements, the original story points have been re-evaluated.

| ID | User Story | Original Pts | Revised Pts | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| US-01 | Overview | 2 | 2 | Simple UI, complexity is low. |
| US-02 | Connect Apps | 5 | **8** | Increased for OAuth complexity, secure storage, and error handling. |
| US-03 | Permissions | 2 | 3 | Added complexity for pre-permission priming dialogs. |
| US-04 | Configure Sync | 5 | 5 | No change. |
| US-05 | Background Sync | 8 | **21** | Hugely underestimated. Requires extensive backend work (Lambda, SQS, DynamoDB), not just a mobile task. This is a multi-sprint epic. |
| US-06 | Manual Sync | 3 | 3 | No change. |
| US-07 | View Status | 3 | 4 | Added complexity for real-time status updates. |
| US-08 | Delete Sync | 2 | 2 | No change. |
| US-09 | Purchase | 5 | **8** | Increased for RevenueCat integration and state management. |
| US-10 | Historical Sync | 8 | **13** | Complex batch processing logic on the backend. |
| US-11 | Restore Purchase | 3 | 3 | Mostly handled by RevenueCat. |
| US-12 | Help Center | 3 | 3 | No change. |
| US-13 | De-authorize | 3 | 4 | Requires secure token deletion and backend notification. |
| US-14 | Cross-platform | 13 | **13** | Already estimated as a large task. |
| US-15 | Conflict Resolution | 13 | **21** | Very complex logical engine on the backend. |
| US-16 | Dashboard | 5 | 5 | No change. |
| US-17 | Upsell | 3 | 4 | Requires careful state management. |
| US-18 | Family Plan | 8 | **13** | Complex entitlement logic. |

### Revised MVP Sprint Plan
The original plan was too aggressive. This revised plan is more realistic for a solo developer.

*   **Sprint 1: Foundations & Onboarding UI** (Stories: US-01, US-03)
*   **Sprint 2: Backend Scaffolding** (Part of US-05)
*   **Sprint 3: Core Connections & Secure Storage** (Story: US-02)
*   **Sprint 4: Backend Sync Logic - Part 1** (Part of US-05, US-14)
*   **Sprint 5: Mobile Sync Configuration UI** (Stories: US-04, US-07, US-08, US-16)
*   **Sprint 6: Backend Sync Logic - Part 2** (Part of US-05, US-06)
*   **Sprint 7: Monetization & Support** (Stories: US-09, US-11, US-12, US-13)
*   **Sprint 8: Integration & Bug Bash**

---

## 4. Proposed Updates for Dependent Documents

### **File:** `01-context-vision.md`
*   **Reason for Update:** The vision document contains statements about the architecture ("on-device engine") that are contradicted by the more detailed technical documents, creating confusion.
*   **Required Changes:**
    *   In Section 5 (Non-Functional Requirements), amend the "Security" paragraph to clarify that while health data is not stored on servers, a serverless backend is used for orchestrating syncs.
    *   Update the "Conceptual Data Flow" diagram placeholder to reflect the server-side architecture.

### **File:** `06-technical-architecture.md`
*   **Reason for Update:** Contains a direct contradiction regarding where data processing occurs. This is a critical detail for security and compliance.
*   **Required Changes:**
    *   In Section 4 (Compliance), remove or rephrase the sentence: "All user data processing happens on the user's device." This is incorrect. The processing (conflict resolution, data mapping) happens in the AWS Lambda workers. The text should be changed to reflect that PII health data is only processed in-memory and is never stored at rest on the servers, which is the true compliance architecture.

### **File:** `05-data-sync.md`
*   **Reason for Update:** The document is excellent but needs to be explicitly linked to the user stories that depend on it.
*   **Required Changes:**
    *   Add a new section "Related User Stories" and link to `US-05`, `US-10`, `US-14`, and `US-15`. This improves traceability.

### **File:** `12-trial-subscription.md`
*   **Reason for Update:** The detailed ACs for monetization stories require more specific error handling.
*   **Required Changes:**
    *   Update the "Paywall Flow" to include user-facing error states, such as "Payment Failed" or "Could not connect to the App Store."
    *   Specify that the "Restore Purchases" button should handle a "No Purchases Found" state gracefully.

### **File:** `14-qa-testing.md`
*   **Reason for Update:** The expanded user stories introduce testable NFRs that should be explicitly included in the QA plan.
*   **Required Changes:**
    *   Add a section on "NFR Testing" that includes plans to verify performance (e.g., screen load times using automated UI tests) and reliability (e.g., testing retry mechanisms by simulating network failures).
    *   The "Definition of Done" should be updated to include a check for "All NFRs for this story are met and tested."
