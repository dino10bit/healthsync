## Dependencies

### Core Dependencies
- `61-api-documentation.md` - Internal API Documentation (Deep Dive)
- `06-technical-architecture.md` - Technical Architecture
- `25-release-management.md` - Release Management

### Strategic / Indirect Dependencies
- `15-integration-testing.md` - Integration Testing

---

# PRD Section 62: Developer Onboarding (Deep Dive)

## 1. Introduction

### 1.1. Onboarding Goals & Philosophy
-   **Goals:**
    -   **Week 1:** First contribution merged.
    -   **Month 1:** Autonomous on small-to-medium sized tasks.
    -   **Month 3:** Deep understanding of one area of the codebase; contributing to design discussions.
-   **Philosophy:** Our onboarding process is structured but personal. We prioritize pairing and hands-on learning over just reading documents. We aim to create a welcoming environment where questions are encouraged.

### 1.2. The Onboarding "Buddy" System
-   **Assignment:** Every new hire is assigned an "Onboarding Buddy" from the engineering team for their first 6 weeks.
-   **Role of the Buddy:**
    -   The go-to person for all "silly questions."
    -   Hosts a daily 15-minute check-in for the first week.
    -   Responsible for making introductions to other team members.
    -   The buddy is NOT the new hire's manager, but a peer and a friendly guide.

## 2. The 30-60-90 Day Plan
This template provides a structure for the new hire and their manager to set expectations.
-   **First 30 Days: Learn the Ropes**
    -   Complete all onboarding checklist items.
    -   Merge at least 3 small PRs.
    -   Gain a solid understanding of the local development setup and CI/CD pipeline.
    -   Sit in on user feedback review sessions.
-   **First 60 Days: Increase Autonomy**
    -   Take ownership of a medium-sized feature.
    -   Perform a code review for a teammate's PR.
    -   Write a new integration test.
-   **First 90 Days: Become a Contributor**
    -   Lead the development of a feature.
    -   Help onboard the next new hire.
    -   Identify and document an area for technical improvement.

## 3. The Onboarding Process

### 3.1. The Onboarding Checklist

This checklist provides a detailed, week-by-week guide for the new hire.

#### Week 1: Setup & First Contribution
-   [ ] **Day 1: HR & Initial Setup**
    -   [ ] Complete all HR paperwork.
    -   [ ] Get company laptop and peripherals.
    -   [ ] Meet your Onboarding Buddy.
    -   [ ] **Tooling & Access:**
        -   [ ] Slack account created and joined to `#engineering`, `#general`, and your team channel.
        -   [ ] Google Workspace (Email, Calendar) account created.
        -   [ ] GitHub account created and invited to the SyncWell organization with "Read" access.
        -   [ ] Jira & Confluence accounts created.
        -   [ ] Figma account created (view-only).
        -   [ ] AWS Console account created (read-only access to the `staging` environment).
        -   [ ] PagerDuty account created (if applicable for the role).
-   [ ] **Day 2: Local Environment**
    -   [ ] Clone the main application repository.
    -   [ ] Run the `./scripts/setup.sh` script to install all dependencies and configure your local environment.
    -   [ ] Successfully run the application locally.
    -   [ ] Successfully run the unit test suite locally.
-   [ ] **Day 3: Architecture & Code**
    -   [ ] Attend the Architectural Overview Session with a senior engineer.
    -   [ ] Pick your "Good First Issue" from Jira with your buddy.
-   [ ] **Day 4: First PR**
    -   [ ] Implement the fix for your first issue.
    -   [ ] Create a pull request, following the PR template.
    -   [ ] Your buddy will review the PR with you.
-   [ ] **Day 5: Merge & Celebrate**
    -   [ ] Address any feedback on your PR.
    -   [ ] Merge your first contribution to the `develop` branch.
    -   [ ] Join the team for the weekly engineering demo.

### 3.2. Local Development Environment - Deep Dive
-   **The Setup Script (`./scripts/setup.sh`):** This script is the cornerstone of a smooth setup. It must:
    1.  Run a version check for all prerequisites (Node, Java, etc.).
    2.  Install all `npm` packages for mobile and backend.
    3.  Install all mobile-specific dependencies (CocoaPods, Gradle).
    4.  Create a `.env` file from a `.env.example` template.
    5.  (Optional) Run a health check to ensure all parts of the system can communicate locally.
-   **Troubleshooting Guide:** The `README.md` will contain a guide for common setup issues (e.g., "What to do if CocoaPods install fails").

### 3.3. "A Day in the Life"
-   **9:30 AM:** Daily team stand-up (15 mins).
-   **9:45 AM:** Focused coding time.
-   **12:30 PM:** Lunch.
-   **1:30 PM:** Code reviews / pairing sessions.
-   **3:00 PM:** Focused coding time.
-   **5:00 PM:** End-of-day wrap-up, push code for review.

## 4. Engineering Culture & Practices

### 4.1. Code Review Culture & Best Practices
-   **Automate First:** The linter and code formatter are the first line of review. Comments should not be about code style.
-   **Be Kind and Specific:** Comments should be constructive and clear. "Good: 'Could we extract this into a function to improve readability?' Bad: 'This is confusing.'"
-   **Small, Focused PRs:** Pull requests should be small and represent a single logical change. A PR with more than 500 lines of changes is usually too large.
-   **Timeliness:** Reviewers should aim to provide feedback within 24 hours.

### 4.2. Architectural Overview Session
-   **When:** During the first week.
-   **Who:** A senior engineer and the new hire.
-   **Content:** A 2-hour interactive session. The senior engineer will use the C4 model diagrams from our architecture documents to explain:
    -   The high-level system context.
    -   The containers (mobile app, backend API, database).
    -   The key components within the backend.
    -   The data flow for a single end-to-end sync.

### 4.3. Finding "Good First Issues"
-   **Jira Label:** We maintain a `good-first-issue` label in Jira.
-   **What makes an issue "good":**
    -   Well-defined and self-contained.
    -   Touches only 1-2 files.
    -   Has a clear "Definition of Done."
    -   Low-risk (e.g., a copy change, a minor UI bug).

## 5. Measuring Success

### 5.1. Measuring Onboarding Success
-   **Primary Metric:** Time to First Contribution < 5 business days.
-   **Secondary Metric:** New Hire Onboarding Survey Score.
-   **Survey:** At the end of the first month, the new hire is sent an anonymous survey asking them to rate the onboarding process (1-5) and provide qualitative feedback on what went well and what could be improved. The results are reviewed by the engineering manager.

## 6. Analysis & Calculations
### 6.1. Time to First Contribution Analysis
-   **Hypothesis:** A streamlined onboarding process, especially a one-step setup script, is the most important factor in reducing a new developer's "Time to First Contribution."
-   **Metric:** Time to First Contribution is defined as the time from the developer's start date to when their first pull request is successfully merged.
-   **Goal:** Our goal for this metric is **less than 5 business days**.
-   **Analysis of Bottlenecks:**
    -   **Environment Setup (Highest Risk):** A developer getting stuck for days trying to configure their local machine is the most common and frustrating onboarding failure mode. The `./scripts/setup.sh` script is the key mitigation here.
    -   **Access Issues:** Delays in granting access to code repositories, tools, or API keys. The Day 1 checklist is designed to prevent this.
    -   **Lack of a Good First Issue:** Not having a pre-vetted list of simple, well-defined tasks can leave a new developer unsure where to start.

### 6.2. Cost of Onboarding Calculation
-   **Hypothesis:** Onboarding is a significant cost to the company, not just in salary but also in the time spent by other team members. Optimizing this process has a direct financial benefit.
-   **Assumptions:**
    -   New Developer Salary: $120,000/year ≈ $480/day.
    -   Senior Developer's Time (for mentoring/reviews): Valued at $720/day ($180k/year).
    -   Time spent by Senior Dev mentoring in Week 1: 1 hour/day = 5 hours.
-   **Cost Calculation (First Week):**
    -   *New Developer's Salary (Week 1):* 5 days * $480/day = **$2,400**.
    -   *Mentor's Time Cost (Week 1):* 5 hours * ($720/8 hours) = 5 * $90 = **$450**.
    -   *Total Cost for First Week (before productivity):* $2,400 + $450 = **$2,850**.
-   **Conclusion:** The first week of a new developer's employment represents a significant investment. A poor onboarding process that extends the non-productive period from one week to two would double this cost to nearly $6,000 before the developer makes any contribution. This highlights the high ROI of investing in a smooth, scripted, and well-documented onboarding experience.

## 7. Out of Scope
-   Onboarding for non-engineering roles.
-   Performance management and career progression (this is a separate process).
