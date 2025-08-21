# Environment Strategy

## 1. Overview
This document defines the different environments used for developing, testing, and operating the SyncWell application. A well-defined environment strategy is crucial for ensuring code quality, stability, and a smooth path to production.

Our strategy is based on a standard three-environment model: `development`, `staging`, and `production`.

## 2. Environment Definitions

### 2.1. `development`
*   **Purpose:** Local development and unit testing.
*   **Infrastructure:** This is not a shared, persistent environment. Each engineer runs a local version of the stack on their machine using **LocalStack** and Docker Compose.
*   **Data:** Uses mock data or a small, sanitized seed dataset. No production data is ever used.
*   **Access:** Limited to the individual developer.

### 2.2. `staging`
*   **Purpose:** A shared, persistent environment for integration testing, end-to-end (E2E) testing, and QA validation. It is designed to be a faithful replica of the production environment.
*   **Infrastructure:** A dedicated AWS account that mirrors the production infrastructure, provisioned via the same Terraform configuration.
*   **Data:** A periodically refreshed, fully anonymized snapshot of production data. This allows for realistic testing without exposing sensitive user information.
*   **Deployment:** The `develop` branch is automatically deployed to this environment after all CI checks pass.
*   **Access:** Accessible to all engineers and the QA team.

### 2.3. `production`
*   **Purpose:** The live environment used by end-users.
*   **Infrastructure:** A dedicated AWS account, managed with strict access controls and monitoring.
*   **Data:** Live user data.
*   **Deployment:** Releases are deployed to production from the `main` branch using a canary release strategy.
*   **Access:** Highly restricted. All changes must go through the formal change management process. Direct access is limited to a small number of on-call SREs.
