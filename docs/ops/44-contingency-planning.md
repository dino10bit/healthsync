---
title: "PRD Section 44: Contingency & Rollback Plans"
migrated: true
---
## Dependencies

### Core Dependencies
- `06-technical-architecture.md` - Technical Architecture
- `18-backup-recovery.md` - Backup & Disaster Recovery
- `21-risks.md` - Risks, Constraints & Mitigation
- `22-maintenance.md` - Maintenance & Post-Launch Operations (SRE)

### Strategic / Indirect Dependencies
- `19-security-privacy.md` - Data Security & Privacy Policies
- `24-user-support.md` - Help Center, Support & Feedback

---

# PRD Section 44: Contingency & Rollback Plans

## 1. Executive Summary

This document outlines the formal contingency and rollback plans for SyncWell. It serves as a set of "break glass in case of emergency" procedures for handling specific, high-impact disaster scenarios. While our architecture is designed for high availability, this document provides the specific, step-by-step action plans to be executed if a major risk is realized.

The purpose of this document is to enable a calm, rational, and rapid response under pressure. Having these plans documented in advance is critical for mitigating the impact of a major incident and restoring service as quickly as possible.

## 2. Contingency Plan Philosophy
*(Unchanged)*

## 3. Specific Contingency Plans

### Plan A: Full AWS Regional Outage

*   **Trigger:** Our monitoring systems detect a widespread, prolonged failure of multiple core services in our primary AWS region. Amazon's own status page confirms a regional issue. This plan is for the single-region MVP architecture.
*   **Expected System Behavior:** The service will be completely unavailable to all users.
*   **Action Plan (Manual Steps):** This is a manual disaster recovery process that involves restoring the service in a new, healthy AWS region.
    1.  **Declare Major Incident:** A major incident is declared. The on-call engineer is responsible for initiating this plan.
    2.  **Public Communication:** Post a message to the public status page: "We are currently experiencing a major service outage due to a regional failure at our hosting provider. We are working to restore service in a different region. We will provide updates as they become available."
    3.  **Deploy Infrastructure:** Use the project's Terraform scripts to deploy a complete copy of the backend infrastructure to a designated secondary region (e.g., `us-west-2`).
    4.  **Restore Data:** Initiate a Point-in-Time Recovery (PITR) of the `SyncWellMetadata` DynamoDB table in the new region. This is the longest step and governs the RTO.
    5.  **Redirect Traffic:** Once the infrastructure is up and the data is restored, update the application's DNS records to point to the new load balancer in the healthy region.
    6.  **Verification:** Thoroughly test the newly deployed environment to ensure it is fully functional.
    7.  **Communicate Restoration:** Update the status page to inform users that the service has been restored.
*   **RTO / RPO:**
    *   **RTO:** < 4 hours (driven by the manual deployment and data restore process).
    *   **RPO:** < 15 minutes (driven by the continuous backup window of DynamoDB PITR).

### Plan B: AI Insights Service Failure

*   **Trigger:** CloudWatch alarms indicate a high error rate or timeout rate from the `AI Insights Service` (e.g., the SageMaker endpoint or the LLM API).
*   **Expected System Behavior (Automated Response):**
    1.  **Fallback Mechanism:** As specified in `05-data-sync.md`, the `Smart Conflict Resolution Engine` is designed with a **fallback mechanism**.
    2.  **Graceful Degradation:** If a call to the AI service fails, the engine will log the error, skip the AI-powered merge, and automatically fall back to the default, deterministic `Prioritize Source` strategy for the sync job.
    3.  **Core Service Unaffected:** The core data sync operation will succeed, ensuring the user's data is synced reliably, albeit without the enhanced conflict resolution. The feature gracefully degrades.
*   **Action Plan (Manual Steps):**
    1.  **Acknowledge & Investigate:** Acknowledge the CloudWatch alarm and begin investigating the root cause of the AI service failure (e.g., issue with the model, API key, etc.).
    2.  **Communicate (If Necessary):** If the outage is prolonged, a minor note can be added to the status page: "Our AI-powered features are currently experiencing issues. Core data sync functionality remains unaffected."
    3.  **Remediate & Restore:** Fix the underlying issue and deploy the fix to restore full AI functionality.

### Plan C: Critical Production Bug in a New Release
*(Largely unchanged, but references new architecture)*

*   **Trigger:** The `Crash-Free User Rate` SLO drops below 99.9% within 24 hours of a new release, or a critical data-loss bug is discovered.
*   **Action Plan:**
    1.  Halt the staged rollout in Google Play Console and App Store Connect.
    2.  Communicate to users.
    3.  Triage using CloudWatch Logs and X-Ray traces.
    4.  Decide whether to hotfix or roll back.
    5.  Roll back by submitting the previous stable version with a higher version number.
    6.  Conduct a blameless postmortem.

### Plan D: Major Third-Party API Outage
*(Largely unchanged)*

*   **Trigger:** API error rate for a major partner spikes, and their status page confirms an outage.
*   **Action Plan:**
    1.  Use a remote feature flag to temporarily disable the affected integration. The app will display a banner explaining the situation.
    2.  Post a message on the status page.
    3.  Monitor the partner's status.
    4.  Disable the feature flag to re-enable the integration once the outage is over.

### Plan E: Security Vulnerability Discovered
*(Largely unchanged)*

*   **Trigger:** A critical security vulnerability is discovered.
*   **Action Plan:**
    1.  Verify the vulnerability.
    2.  If severe, use a remote feature flag to put the app into a read-only or maintenance mode.
    3.  Deploy a high-priority hotfix.
    4.  If necessary, use backend scripts to invalidate all stored OAuth tokens in Secrets Manager across all regions, forcing users to re-authenticate.
    5.  Communicate transparently with users.
    6.  Conduct a full postmortem and security audit.

### Plan F: Backend Deployment Rollback

*   **Trigger:** The canary release of a new backend version shows a critical issue (e.g., high error rate, increased latency), or a critical bug is discovered after the new version has been fully rolled out.
*   **Objective:** To quickly and safely revert the backend services to the last known stable version, minimizing user impact.
*   **Strategy:** The rollback strategy for the **AWS Fargate** worker service relies on the capabilities of **AWS CodeDeploy** and its blue/green deployment configuration.
*   **Automated Rollback (During Canary Deployment):**
    1.  **Detection:** CloudWatch Alarms, configured to monitor the "green" (new) environment, trigger due to an anomaly (e.g., error rate > 1%).
    2.  **Automated Action:** The CodeDeploy deployment group is configured with an automatic rollback setting. On an alarm trigger, CodeDeploy will immediately shift 100% of traffic back to the "blue" (stable, previous) environment and halt the deployment.
    3.  **Notification:** The on-call engineer is notified that an automatic rollback has occurred.
*   **Manual Rollback (Post-Full Deployment):**
    1.  **Decision:** The on-call engineer, after identifying a critical bug in the new version, makes the decision to roll back.
    2.  **Action:** The engineer will trigger a new deployment in the CI/CD pipeline, but will specify the Docker image tag of the *previous stable version*.
    3.  **Process:** This will initiate a new blue/green deployment, where the "green" environment is simply the old, stable version of the code. The process of traffic shifting will safely re-deploy the stable version.
    4.  **Verification:** After the rollback deployment is complete, the engineer will manually verify that the backend is functioning correctly.
    5.  **Communication:** The public status page will be updated to inform users of the issue and the successful rollback.
*   **Testing:** The manual rollback procedure will be tested in the staging environment on a regular basis (e.g., quarterly) to ensure it works as expected and that the on-call team is familiar with the process.

### Plan G: Widespread User Data Corruption

*   **Trigger:** A bug in a new deployment causes widespread, logical corruption of user configuration data in the `SyncWellMetadata` DynamoDB table (e.g., deleting or overwriting valid sync configurations). This is detected via a spike in user support tickets or specific error log patterns. This plan is a last resort and is distinct from the HA failover plan.
*   **Objective:** To restore the `SyncWellMetadata` table to a known good state just before the incident began, minimizing data loss and restoring service for all users.
*   **Strategy:** This plan leverages the **Point-in-Time Recovery (PITR)** feature of Amazon DynamoDB, which must be enabled on the table from day one.
*   **Action Plan (Manual Runbook):**
    1.  **Confirm & Halt:** Confirm the issue is widespread data corruption. Immediately halt any processes that write to the DynamoDB table (e.g., by scaling the Fargate worker fleet's desired count to 0) to prevent further damage.
    2.  **Identify Recovery Point:** Analyze logs and deployment timestamps to identify the exact time the faulty code was deployed. The recovery point will be the timestamp immediately preceding the deployment.
    3.  **Initiate PITR:** Use the AWS Management Console or CLI to start the PITR process. This will create a *new* DynamoDB table (`SyncWellMetadata-restored`) with the data from the specified recovery point. This process can take several hours depending on the table size.
    4.  **Data Validation (Spot-Check):** Once the new table is created, perform a manual spot-check on a few known-good user accounts to verify that their data has been restored correctly.
    5.  **Traffic Redirection:**
        *   This is the most critical and sensitive step. The application code needs to be pointed to the new, restored table.
        *   **This process is critically dependent on the DynamoDB table name being managed externally in AWS AppConfig, as specified in `06-technical-architecture.md`.** Hardcoding the table name in the application code is not acceptable as it would make this recovery process too slow and error-prone.
        *   The recovery process is to update the `DynamoDBTableName` parameter in AppConfig to the name of the new, restored table (e.g., `SyncWellMetadata-restored`).
        *   A rolling deployment of the worker Fargate service is then initiated to force the tasks to pick up the new configuration parameter.
    6.  **Re-enable Services:** Once traffic is successfully pointed to the restored table, re-enable the services that were halted in step 1.
    7.  **User Communication:**
        *   **Initial:** Post a message to the status page acknowledging a major issue and that the service is in maintenance mode.
        *   **Final:** After the restore is complete, post an update explaining that the service has been restored from a backup. Acknowledge that any changes made by users during the incident window (e.g., new syncs configured between the backup time and the halt time) have been lost.
*   **Post-Mortem:** Conduct a thorough, blameless post-mortem to understand the root cause of the bug and implement preventative measures.
