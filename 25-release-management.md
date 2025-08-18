# PRD Section 25: Release Management & Versioning

## 1. Executive Summary

This document specifies the comprehensive release management strategy for SyncWell. The goal is to establish a highly reliable, predictable, and automated process for deploying updates. This disciplined approach is essential for maintaining application stability, building user trust, and enabling the solo developer to release new features and fixes with confidence and low stress.

This strategy incorporates professional software engineering practices, including Semantic Versioning, a GitFlow branching model, a "Release Train" schedule, and a heavily automated CI/CD pipeline.

## 2. Versioning & Branching

*   **Versioning:** SyncWell will strictly adhere to **Semantic Versioning (SemVer 2.0.0)**: `MAJOR.MINOR.PATCH`.
*   **Branching Strategy:** A **GitFlow** model will be used.
    *   `main`: Represents production. Only release and hotfix branches are merged here.
    *   `develop`: The primary development branch for ongoing work.
    *   `feature/...`: Branched from `develop` for new features.
    *   `release/x.y.z`: Branched from `develop`. This is a "release candidate" branch. Only bug fixes are committed here.
    *   `hotfix/...`: Branched from `main` to address critical production bugs.

## 3. The "Release Train" Schedule

To ensure predictability, SyncWell will operate on a "Release Train" schedule.
*   **Schedule:** A new minor version release train is scheduled to **depart (i.e., a `release` branch is created) on the first Monday of every month.**
*   **Cadence:** This results in a predictable feature release approximately every **4-5 weeks**, accounting for a 1-week "hardening" and rollout period.
*   **Flexibility:** If a major feature is not ready, it does not delay the train. It simply "misses the train" and waits for the next one. This prevents release deadlines from slipping.
*   **Hotfixes:** Critical patch releases are "special services" and can be deployed at any time, outside of the train schedule.

## 4. CI/CD Automation Pipeline

The release process will be heavily automated using a CI/CD service like GitHub Actions.

| Pipeline | Trigger | Key Stages |
| :--- | :--- | :--- |
| **Pull Request Check** | On PR against `develop` | 1. `npm install` (Install dependencies)<br>2. `npm run lint` (Check code style)<br>3. `npm run test` (Run all unit & mocked integration tests)<br>4. `npm run check-bundle-size` (Fail if bundle size increases >5%) |
| **Develop Build** | On merge to `develop` | 1. All stages from PR Check.<br>2. Build Android & iOS app packages.<br>3. Automatically distribute the build to the **Internal Beta** group via TestFlight & Google Play. |
| **Release Build** | On push to `release/...` | 1. All stages from PR Check.<br>2. Build app packages with a "Release Candidate" version (e.g., `1.2.0-rc.1`).<br>3. Automatically distribute to the **Public Beta** group. |
| **Production Deploy**| **Manual Trigger** on `main` branch | 1. Build signed, production-ready app packages.<br>2. Upload the packages to App Store Connect and Google Play Console, ready for staged rollout. |

## 5. The Release Process & Checklist

### 5.1. Minor Release (The Monthly Train)
1.  [ ] **Feature Freeze & Branching:** On the first Monday of the month, create the `release/x.y.z` branch from `develop`.
2.  [ ] **RC Build & Beta Testing:** The CI/CD pipeline automatically deploys the first Release Candidate (`rc.1`) to the public beta testers.
3.  [ ] **Hardening (1 week):** For one week, only critical bug fixes discovered by beta testers are committed to the `release` branch. Each fix generates a new RC build (e.g., `rc.2`). No new features are allowed.
4.  [ ] **Merge & Tag:** Once the release candidate is deemed stable, merge the `release/x.y.z` branch into `main` and tag the commit (e.g., `v1.2.0`). Then merge `main` back into `develop`.
5.  [ ] **Production Deploy:** Manually trigger the production deployment job in the CI/CD pipeline.
6.  [ ] **Staged Rollout:** Follow the staged rollout process (1% -> 10% -> 50% -> 100%) in the app store consoles, monitoring analytics at each stage.
7.  [ ] **Communication:** Once the rollout is at 100%, announce the release.

### 5.2. Hotfix Release (Emergency)
1.  [ ] **Create Hotfix Branch:** Create a `hotfix/fix-critical-bug` branch directly from `main`.
2.  [ ] **Implement & Test:** Implement the minimal required fix. Write a regression test.
3.  [ ] **Merge & Tag:** Merge the hotfix branch into `main` and tag it (e.g., `v1.2.1`). Then merge `main` back into `develop`.
4.  [ ] **Deploy & Monitor:** Trigger the production deployment job. Because this is a critical fix, the staged rollout may be accelerated or skipped. Monitor the fix closely.

## 6. Release Communication Plan

| Channel | Content | Timing |
| :--- | :--- | :--- |
| **App Store Release Notes** | Detailed, user-friendly summary of new features and major bug fixes. | Submitted with the release build. |
| **In-App "What's New" Screen** | Highlights the top 1-3 new features, especially community-requested ones. | Appears on first launch after update. |
| **Social Media / Blog** | A more detailed post celebrating the new release and thanking beta testers. | After the release is at 100% rollout. |

## 7. Optional Visuals / Diagram Placeholders
*   **[Diagram] GitFlow Branching Strategy:** A clear, visual diagram of the GitFlow model.
*   **[Diagram] CI/CD Pipeline:** A detailed flowchart showing the stages and triggers for the different CI/CD jobs.
*   **[Diagram] Release Train Schedule:** A visual calendar showing the "departure" dates for the next three release trains.
*   **[Checklist] Go/No-Go Release Checklist:** A detailed checklist for the final decision to start the staged rollout.
