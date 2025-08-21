# Repository Traceability Matrix

## 1. Executive Summary

This document provides a traceability matrix that links business requirements and user stories to the specific design elements, code modules, and test cases that implement and verify them. The purpose of this matrix is to ensure that all requirements are met by the final product and that a clear, auditable trail exists from a requirement to its implementation and verification.

This matrix was automatically generated and should be updated as the project evolves. Missing mappings are flagged for remediation.

## 2. Requirements Traceability Matrix (RTM)

| Requirement ID | Requirement Description | Linked User Stories | Architectural Component(s) | Source Code Module(s) | Test Case ID(s) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **NFR-PERF-01** | P99 API Latency < 500ms | N/A | `docs/architecture/06-technical-architecture.md` (API Gateway, Authorizer Lambda) | `src/authorizer/handler.js` | `LT-API-01` |
| **NFR-SEC-01** | All data transfer over TLS 1.2+ | *Implicit in all stories* | `docs/architecture/06-technical-architecture.md` (TLS Termination on ALB/APIGW) | `MISSING` | `SEC-TEST-01` |
| **NFR-SCALE-01**| Support 1M DAU / 3,000 RPS | N/A | `docs/architecture/06-technical-architecture.md` (Fargate Compute Model) | `MISSING` | `LOAD-TEST-01` |
| **FR-ONBOARD-01**| New user onboarding flow | US-01, US-02, US-03 | `docs/ux/08-ux-onboarding.md` | `MISSING` | `E2E-ONBOARD-01` |
| **US-01** | See a brief, clear overview of the app's value proposition | US-01 | `docs/ux/08-ux-onboarding.md` (Welcome Carousel) | `MISSING` | `E2E-ONBOARD-01` |
| **US-02** | Be guided through connecting the first two health apps | US-02 | `docs/architecture/07-apis-integration.md` (OAuth Flow) | `MISSING` | `E2E-CONNECT-01` |
| **US-03** | Be clearly informed about permission requests | US-03 | `docs/ux/08-ux-onboarding.md` (Permission Priming) | `MISSING` | `UI-TEST-PERM-01` |
| **US-04** | Configure a new data sync with full control | US-04 | `docs/ux/09-ux-configuration.md` (Sync Configuration Screen) | `MISSING` | `E2E-CONFIG-01` |
| **US-05** | Have data sync automatically in the background | US-05 | `docs/architecture/05-data-sync.md` (Hot Path Sync) | `src/worker/service.kt` | `E2E-BG-SYNC-01` |
| **US-06** | Manually trigger a sync from the main dashboard | US-06 | `docs/ux/09-ux-configuration.md` (Dashboard) | `MISSING` | `E2E-MANUAL-SYNC-01` |
| **US-07** | Easily view the status of sync connections | US-07 | `docs/ux/09-ux-configuration.md` (Sync Card) | `MISSING` | `UI-TEST-STATUS-01` |
| **US-08** | Delete a sync configuration that is no longer needed | US-08 | `docs/ux/09-ux-configuration.md` (Sync Card Context Menu) | `MISSING` | `E2E-DELETE-SYNC-01` |
| **US-09** | Purchase the Pro subscription | US-09 | `docs/prd/11-monetization.md` (RevenueCat) | `src/mobile/billing/PurchaseManager.kt` | `E2E-IAP-01`, `E2E-IAP-02`|
| **US-10** | Sync historical data | US-10 | `docs/prd/45-future-enhancements.md` (Cold Path) | (Post-MVP) | (Post-MVP) |
| **US-11** | Restore a previous purchase on a new device | US-11 | `docs/prd/12-trial-subscription.md` | `MISSING` | `E2E-RESTORE-IAP-01` |
| **US-12** | Find answers to common questions in an in-app Help Center | US-12 | `docs/ux/10-ux-feedback.md` | `MISSING` | `UI-TEST-HELP-01` |
| **US-13** | De-authorize a connected app and delete credentials | US-13 | `docs/ux/36-user-privacy-settings.md` | `MISSING` | `E2E-DEAUTH-01` |
| **US-14** | Sync data between Apple Health and Google Fit | US-14 | `docs/architecture/30-sync-mapping.md` | `MISSING` | `E2E-APPLE-GOOGLE-01` |
| **US-15** | Automatically detect and merge duplicate activities | US-15 | `docs/architecture/05-data-sync.md` (Conflict Resolution) | `MISSING` | `MISSING` |
| **US-16** | See a single dashboard with the status of all connections | US-16 | `docs/ux/09-ux-configuration.md` (Dashboard) | `MISSING` | `UI-TEST-DASH-01` |
| **US-17** | Be shown the value of Pro features contextually | US-17 | `docs/ux/08-ux-onboarding.md` (Contextual Upsell) | `MISSING` | `MISSING` |
| **US-18** | Be guided to re-enable a permanently denied permission | US-18 | `docs/ux/40-error-recovery.md` | `MISSING` | `MISSING` |
| **US-21** | Back up health data to personal cloud storage | US-21 | `MISSING` | `MISSING` | `MISSING` |
| **US-30** | Preview data before a sync is executed | US-30 | `MISSING` | `MISSING` | `MISSING` |
| **US-31** | Smart, automatic backfill of recent data for new users | US-31 | `MISSING` | `MISSING` | `MISSING` |
| **US-33** | Display API rate limit status to the user | US-33 | `MISSING` | `MISSING` | `MISSING` |
| **US-34** | Set a "Source of Truth" for automatic conflict resolution | US-34 | `MISSING` | `MISSING` | `MISSING` |
| **US-35** | Use an interactive guide for troubleshooting sync errors | US-35 | `MISSING` | `MISSING` | `MISSING` |
| **US-39** | Understand and retry failed historical syncs | US-39 | `MISSING` | `MISSING` | `MISSING` |
| **US-45** | Future enhancements | US-45 | `docs/prd/45-future-enhancements.md` | `MISSING` | `MISSING` |
| **US-66** | Costs Model | N/A | `docs/costs/66-costs-model.md` | `MISSING` | `MISSING` |
| **GLOSSARY** | Glossary of Terms | N/A | `docs/prd/GLOSSARY.md` | `MISSING` | `MISSING` |
| **README** | Top-level README | N/A | `README.md` | `MISSING` | `MISSING` |
| **TRACEABILITY** | Traceability Matrix | N/A | `reports/rtm/repository_traceability_matrix.md` | `MISSING` | `MISSING` |
| **f-1.md** | | `MISSING` | `MISSING` | `MISSING` | `MISSING` |
| **f-24.md** | | `MISSING` | `MISSING` | `MISSING` | `MISSING` |
| **load-testing** | | `MISSING` | `MISSING` | `MISSING` | `MISSING` |
| **other/diagram.md**| | `MISSING` | `MISSING` | `MISSING` | `MISSING` |
| **src/authorizer**| | `MISSING` | `MISSING` | `MISSING` | `MISSING` |
| **terraform/** | | `MISSING` | `MISSING` | `MISSING` | `MISSING` |
