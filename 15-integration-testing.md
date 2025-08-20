## Dependencies

### Core Dependencies
- `07-apis-integration.md` - APIs & Integration Requirements
- `14-qa-testing.md` - QA, Testing & Release Strategy
- `30-sync-mapping.md` - Source-Destination Sync Mapping

### Strategic / Indirect Dependencies
- `06-technical-architecture.md` - Technical Architecture
- `25-release-management.md` - Release Management & Versioning
- `44-contingency-planning.md` - Contingency & Rollback Plans

---

# PRD Section 15: Integration & End-to-End Testing

## 1. Executive Summary

This document provides the focused, detailed strategy for the Integration and End-to-End (E2E) testing of SyncWell. As SyncWell is fundamentally an integration product, this is the most critical and complex area of quality assurance. The strategy is designed to systematically de-risk the project's reliance on external, third-party APIs.

For the **solo developer**, this document is a technical blueprint for building a resilient testing framework. It details the setup for managing test data, the structure of automated test suites, and the process for manual E2E validation, all of which are essential for ensuring the core promise of the app—reliable data synchronization—is met.

## 2. Test Data Management (TDM)

A disciplined TDM strategy is required for reliable integration testing.

*   **Dedicated Test Accounts:** A separate, dedicated test account (e.g., `syncwell-test@gmail.com`) will be created for every supported third-party platform for the MVP (e.g., Fitbit, Strava). The credentials for these accounts will be securely stored in a password manager.
*   **Version-Controlled Mock Data:**
    *   A `__mocks__` directory will be created in the project repository.
    *   For each provider, a set of static JSON files will be stored, representing standard API responses (e.g., `fitbit-steps-response.json`, `strava-activity-response.json`).
    *   These files will be used by the mocked integration tests, ensuring that the tests are deterministic and can run offline.
*   **Test Data Seeding Scripts:**
    *   A collection of scripts (e.g., simple Node.js scripts using Axios) will be created to interact directly with the third-party APIs.
    *   These scripts will be used to "seed" the dedicated test accounts with known data before running live E2E tests (e.g., a script to `POST` a new workout to the Fitbit test account). This ensures our E2E tests start from a known, predictable state.

## 3. Automated Integration Test Suite

The automated integration tests are focused on verifying the correctness of each `DataProvider` module.

### Test Suite Structure

1.  **Shared Interface Test Suite:**
    *   A single, generic test suite will be written to test the `DataProvider` interface itself.
    *   Any new provider (e.g., `PolarProvider`) must be able to pass this entire suite of shared tests, which verify that all interface methods are implemented correctly.
2.  **Provider-Specific Test Suite (Mocked):**
    *   Each provider will have its own test file that runs against the version-controlled mock data.
    *   This suite will test the provider's unique logic, such as the correctness of its data transformation to and from the canonical model.
    *   **Example Test Case:** `it('correctly maps Fitbit sleep stages to the canonical model')`.
3.  **Live API Test Suite (Nightly):**
    *   This suite re-uses the provider-specific tests but runs them against the *live* sandbox APIs using the dedicated test accounts.
    *   Its purpose is to act as a canary, detecting when a third-party API has changed its format or behavior.

### CI/CD Integration

*   **On Pull Request:** The `Shared Interface Test Suite` and all `Provider-Specific Test Suites (Mocked)` must pass before a PR can be merged into `develop`.
*   **Nightly on `develop`:** The `Live API Test Suite` will be run on a nightly schedule against the `develop` branch. Failures will trigger an alert to the developer.

## 4. End-to-End (E2E) Test Strategy

### Automated E2E Test with Seeding

The E2E tests will be made more reliable through data seeding.

*   **Sample Scenario: "Import Fitbit Activity to Google Fit"**
    1.  **Setup (Script):** A pre-test script runs, using the Fitbit API to delete any old test activities and then `POST` a new, specific workout (e.g., "Running, 5km, 30 mins") to the `syncwell-test` Fitbit account.
    *   **Test Execution (Maestro):**
        *   The E2E test launches the SyncWell app.
        *   It navigates through the UI to configure and trigger a sync from Fitbit to Google Fit.
    3.  **Verification (Script):** A post-test script calls the Google Fit API directly to verify that a "Running, 5km, 30 mins" workout now exists in the `syncwell-test` Google Fit account.
    4.  **Teardown (Script):** The script cleans up by deleting the test activities from both Fitbit and Google Fit.

### Manual E2E Testing

The manual test plan will use a formal test case format.

*   **Sample Test Case:**
    *   **Test Case ID:** `TC-005`
    *   **Feature:** Fitbit to Apple Health Sleep Sync.
    *   **Preconditions:** User is logged into the Fitbit and Apple Health test accounts. A sync for "Sleep" is configured.
    *   **Steps:**
        1.  Manually record a new sleep session in the Fitbit test account.
        2.  Open SyncWell and trigger a manual sync.
        3.  Open the Apple Health app on the test device.
        4.  Navigate to the Sleep data section.
    *   **Expected Result:** The new sleep session, with corresponding start time, end time, and sleep stages, appears correctly in Apple Health.
    *   **Status:** Pass/Fail.

## 5. Optional Visuals / Diagram Placeholders

*   **[Diagram] Test Data Flow:** A diagram showing how the `Test Data Seeding Scripts` and `Version-Controlled Mock Data` are used by the different automated test suites.
*   **[Diagram] E2E Test Architecture:** A diagram illustrating the E2E test scenario, including the pre-test seeding script, the UI automation, and the post-test verification script.
*   **[Table] Manual Test Suite:** A sample of the manual test plan in a table format, showing several test cases with their detailed steps and expected results.
*   **[Diagram] CI/CD Testing Stages:** A flowchart showing which test suites are run at which stage of the CI/CD pipeline.

## 5. Backend Integration Testing Strategy

While the strategies above focus on testing the `DataProvider` modules, it is equally critical to test the integrations *between our own backend services*. This section outlines the strategy for testing the serverless backend itself.

*   **Objective:** To verify that the different components of the serverless backend (API Gateway, Lambda, SQS, DynamoDB, Step Functions) interact correctly and that data flows through the system as expected.
*   **Local Testing with LocalStack & Docker Compose:**
    *   **Framework:** The primary tool for local backend testing will be a combination of **LocalStack** and **Docker Compose**. This allows the entire AWS cloud stack to be emulated locally, while the Fargate worker task runs as a standard Docker container.
    *   **Process:** Developers will write integration tests (e.g., using JUnit for the JVM backend code) that run against this local environment. These tests will be executed locally during development to provide rapid feedback.
    *   **Example Test Case:**
        1.  The test starts the local environment via `docker-compose up`.
        2.  It programmatically sends a message to the local SQS queue.
        3.  It then asserts that the worker container processes the message and writes the correct item to the local DynamoDB table.
*   **Staging Environment Testing:**
    *   **Environment:** A dedicated staging environment, which is a 1:1 mirror of the production environment, will be used for running a full suite of backend integration tests.
    *   **Process:** As part of the CI/CD pipeline (on every merge to `develop`), a test runner will execute a suite of integration tests against the live staging environment.
    *   **Example Test Case (Step Functions):**
        1.  The test triggers a `Historical Sync` Step Functions execution via an API call to the staging API Gateway.
        2.  It then polls the Step Functions API until the execution is complete.
        3.  Finally, it asserts that the execution succeeded and that the expected data was written to the destination service (by calling the third-party service's API with test account credentials).
*   **Scope:** This strategy covers testing the core backend flows, including:
    *   The "hot path" real-time sync (API Gateway -> SQS -> Fargate).
    *   The "cold path" historical sync (Step Functions orchestration).
    *   The data import and export flows (Step Functions orchestration).
    *   **Webhook Ingestion & Coalescing:** A dedicated test suite will verify the full webhook flow, including the `WebhookIngressLambda`, the `CoalescingBufferQueue`, and the `CoalescingTriggerLambda`.
    *   **Adaptive Polling:** Integration tests will be created to verify that the adaptive polling logic correctly sends messages to the SQS queue with the appropriate `DelaySeconds` value.
