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

*   **Trigger:** Our monitoring systems (CloudWatch) detect a widespread failure of a core service (e.g., Lambda, SQS) in one of our active AWS regions. Amazon's own status page confirms a regional issue.
*   **Expected System Behavior (Automated Response):**
    1.  **Health Check Failure:** Amazon Route 53 health checks for the affected region's load balancer will begin to fail.
    2.  **Automated Failover:** After a configured number of consecutive failures, **Route 53 will automatically stop routing traffic to the unhealthy region**. All user traffic will be directed to the healthy, active region(s).
    3.  **Service Continuity:** The service will remain available to users, served entirely out of the healthy region. Due to the use of DynamoDB Global Tables and replicated secrets, the failover region has all the data it needs to function.
*   **Action Plan (Manual Steps):**
    1.  **Acknowledge & Monitor:** Acknowledge the incident and closely monitor Route 53 and CloudWatch metrics to confirm the failover was successful.
    2.  **Public Communication:** Post a message to the public status page: "We are aware of a major outage affecting one of our hosting provider's data centers. Our system has automatically rerouted traffic to a healthy region, and the service is operational. Some users may experience slightly increased latency."
    3.  **Await Recovery:** Monitor the status of the failed AWS region.
    4.  **Restore & Rebalance:** Once the affected region is fully recovered and stable, update DNS settings (if necessary) to resume routing traffic to it, restoring the full active-active posture.
*   **RTO / RPO:**
    *   **RTO:** < 5 minutes (driven by Route 53 health check and failover time).
    *   **RPO:** < 2 seconds (driven by typical DynamoDB Global Table replication lag).

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
*   **Strategy:** The rollback strategy relies on the versioning capabilities of AWS Lambda and API Gateway, and is designed to be automated.
*   **Automated Rollback (During Canary Deployment):**
    1.  **Detection:** CloudWatch Alarms, configured to monitor the canary version, trigger due to an anomaly (e.g., error rate > 1%).
    2.  **Automated Action:** The CI/CD pipeline (or a dedicated Lambda function triggered by the alarm) will automatically shift 100% of traffic back to the stable, previous version.
    3.  **Notification:** The on-call engineer is notified that an automatic rollback has occurred.
*   **Manual Rollback (Post-Full Deployment):**
    1.  **Decision:** The on-call engineer, after identifying a critical bug in the new version, makes the decision to roll back.
    2.  **Lambda Rollback:**
        *   The CI/CD pipeline will have a dedicated "rollback" job.
        *   This job will take a version number as input.
        *   It will use the AWS CLI or SDK to update the Lambda function aliases (e.g., the `live` alias) to point to the previous stable function version. AWS Lambda automatically keeps previous versions of the code, making this a fast and safe operation.
    3.  **API Gateway Rollback:**
        *   If the API Gateway stage was updated, the rollback job will redeploy the previous stable stage from its deployment history.
    4.  **Verification:** After the rollback job is complete, the engineer will manually verify that the backend is functioning correctly and that the critical bug is no longer present.
    5.  **Communication:** The public status page will be updated to inform users of the issue and the successful rollback.
*   **Testing:** The manual rollback procedure will be tested in the staging environment on a regular basis (e.g., quarterly) to ensure it works as expected and that the on-call team is familiar with the process.

### Plan G: Widespread User Data Corruption

*   **Trigger:** A bug in a new deployment causes widespread, logical corruption of user configuration data in the `SyncWellMetadata` DynamoDB table (e.g., deleting or overwriting valid sync configurations). This is detected via a spike in user support tickets or specific error log patterns. This plan is a last resort and is distinct from the HA failover plan.
*   **Objective:** To restore the `SyncWellMetadata` table to a known good state just before the incident began, minimizing data loss and restoring service for all users.
*   **Strategy:** This plan leverages the **Point-in-Time Recovery (PITR)** feature of Amazon DynamoDB, which must be enabled on the table from day one.
*   **Action Plan (Manual Runbook):**
    1.  **Confirm & Halt:** Confirm the issue is widespread data corruption. Immediately halt any processes that write to the DynamoDB table (e.g., by scaling down the Fargate worker service to zero tasks) to prevent further damage.
    2.  **Identify Recovery Point:** Analyze logs and deployment timestamps to identify the exact time the faulty code was deployed. The recovery point will be the timestamp immediately preceding the deployment.
    3.  **Initiate PITR:** Use the AWS Management Console or CLI to start the PITR process. This will create a *new* DynamoDB table (`SyncWellMetadata-restored`) with the data from the specified recovery point. This process can take several hours depending on the table size.
    4.  **Data Validation (Spot-Check):** Once the new table is created, perform a manual spot-check on a few known-good user accounts to verify that their data has been restored correctly.
    5.  **Traffic Redirection:**
        *   This is the most critical and sensitive step. The application code needs to be pointed to the new, restored table.
        *   **This process is critically dependent on the DynamoDB table name being managed externally in AWS AppConfig, as specified in `06-technical-architecture.md`.** Hardcoding the table name in the application code is not acceptable as it would make this recovery process too slow and error-prone.
        *   The recovery process is to update the `DynamoDBTableName` parameter in AppConfig to the name of the new, restored table (e.g., `SyncWellMetadata-restored`).
        *   A rolling deployment of the Fargate worker service and relevant Lambda functions is then initiated to force the services to pick up the new configuration parameter.
    6.  **Re-enable Services:** Once traffic is successfully pointed to the restored table, re-enable the services that were halted in step 1.
    7.  **User Communication:**
        *   **Initial:** Post a message to the status page acknowledging a major issue and that the service is in maintenance mode.
        *   **Final:** After the restore is complete, post an update explaining that the service has been restored from a backup. Acknowledge that any changes made by users during the incident window (e.g., new syncs configured between the backup time and the halt time) have been lost.
*   **Post-Mortem:** Conduct a thorough, blameless post-mortem to understand the root cause of the bug and implement preventative measures.
