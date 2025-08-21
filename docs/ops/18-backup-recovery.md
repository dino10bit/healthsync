---
title: "PRD Section 18: Backup & Disaster Recovery"
migrated: true
---
## Dependencies

### Core Dependencies
- `../architecture/06-technical-architecture.md` - Technical Architecture, Security & Compliance
- `../security/19-security-privacy.md` - Data Security & Privacy Policies
- `./44-contingency-planning.md` - Contingency & Rollback Plans

### Strategic / Indirect Dependencies
- `./22-maintenance.md` - Maintenance & Post-Launch Operations (SRE)

---

# PRD Section 18: Backup & Disaster Recovery

## 1. Executive Summary

This document specifies the strategy for data backup, high availability, and disaster recovery for the SyncWell application's MVP. To balance cost, complexity, and time-to-market, the MVP will be deployed to a **single AWS region: `us-east-1`**. The strategy is therefore focused on **intra-region high availability** and a robust, well-tested plan for recovering from a disaster scenario.

## 2. High Availability Strategy (Intra-Region)

High availability for the MVP is achieved by deploying services across multiple Availability Zones (AZs) within our primary AWS region.
*   **Stateless Services:** API Gateway and AWS Fargate run across multiple AZs by default.
*   **Stateful Services:** DynamoDB, ElastiCache for Redis, and Secrets Manager are all configured for Multi-AZ resilience.

This multi-AZ approach ensures that the failure of a single Availability Zone does not result in a service outage.

## 3. Disaster Recovery (DR) Strategy

A "disaster" is defined as an event that makes the service entirely unavailable or results in widespread data corruption. The recovery plan is manual and focuses on restoring data integrity and service functionality from backups.

This strategy yields the following recovery objectives.

| Failure Scenario | Recovery Time Objective (RTO) | Recovery Point Objective (RPO) | Mechanism |
| :--- | :--- | :--- | :--- |
| **Full Regional Outage** or **Data Corruption Event** | **< 4 hours** | **< 15 minutes** | **Manual Restore.** An engineer initiates a DynamoDB Point-in-Time Recovery (PITR) to a new table. The application is then repointed to the new table using AWS AppConfig. |
| **Availability Zone Failure** | **< 5 minutes** | **~0** | **Automatic Failover.** Handled automatically by the Multi-AZ configuration of AWS services. |

**RTO/RPO Validation:** These objectives are validated via **mandatory, quarterly Disaster Recovery (DR) tests**. The RTO of < 4 hours is considered aggressive and **must** be validated by these tests. If a test fails to meet the RTO, the documented RTO must be revised upwards to a realistic figure. The results and learnings from all DR tests must be documented in a central location (e.g., Confluence).

### User Communication Plan for DR Events
In the event of a disaster that impacts users, clear and timely communication is critical.
1.  **Status Page Update:** The first step is to update the public status page (e.g., status.syncwell.com) and the official company Twitter/X account to acknowledge the issue and inform users that we are investigating.
2.  **Internal Communication:** The incident commander will establish a dedicated Slack channel for internal coordination.
3.  **Ongoing Updates:** The status page will be updated at regular intervals (e.g., every 30 minutes) throughout the incident.
4.  **Post-Resolution:** Once the service is restored, a final update will be posted to the status page. For severe incidents, a full post-mortem will be published on the company blog.

## 4. System-Level Recovery Runbooks

### 4.1. Recovery Mechanisms

*   **Infrastructure as Code (IaC):** The entire backend infrastructure is defined in **Terraform**. The full runbook for redeploying the stack is maintained in the `RUNBOOK_REGIONAL_RECOVERY.md` file in the `/ops` directory of the infrastructure repository.
*   **Data Backup (DynamoDB Point-in-Time Recovery):** **DynamoDB PITR** is enabled on the `SyncWellMetadata` table, providing continuous backups with the ability to restore to any single second in the preceding 35 days.
*   **Credential Backup (AWS Secrets Manager):** Secrets Manager is a highly available regional service. For a full regional outage, secrets would need to be manually recreated in the new region. This is an accepted risk for the MVP's RTO.
*   **Configuration-Driven Recovery (AWS AppConfig):** The application fetches the DynamoDB table name from AWS AppConfig at startup. The specific key for this is `applications/syncwell-backend/production/dynamodb_metadata_table_name`. This allows the application to be repointed to a restored table without a code deployment, dramatically reducing the RTO.
*   **Stateless Compute (AWS Fargate):** The backend worker fleet is stateless, allowing a new fleet to be deployed and start processing jobs immediately once the data layer is restored.

### 4.2. Runbook: Data Corruption Recovery (PITR)

This is a last-resort, high-risk manual procedure.

1.  **Declare Incident & Halt Writes:** A major incident is declared. Writes to DynamoDB are disabled if possible.
2.  **Identify Restore Point:** Engineers use logs and metrics to identify the precise moment *before* the corruption began. **This timestamp must be reviewed and approved by a second authorized engineer before proceeding.**
3.  **Initiate PITR:** An authorized engineer initiates a Point-in-Time Recovery of the `SyncWellMetadata` table.
4.  **Validate Restored Data:** The engineer must run validation scripts against the new table to ensure data consistency. The validation scripts are located in the `/scripts/validation` directory of the backend monorepo and include checks for item counts and schema adherence.
5.  **Update AppConfig & Redirect Traffic:** The engineer updates the AppConfig key and deploys the configuration change to redirect traffic.
6.  **Post-Mortem:** A full post-mortem analysis is conducted.

## 5. User-Level Recovery Procedures

### 5.1. New Device Recovery Flow
When a user gets a new device, their experience is seamless. After signing in with the same Google or Apple account, the mobile app will fetch all their settings and connection information from the SyncWell backend. No manual backup or restore is needed by the user.

### 5.2. Manual Account Recovery (e.g., Lost Sign-In)

**CRITICAL RISK ADVISORY:** Manually migrating user data between identities is exceptionally high-risk and is not supported by a dedicated tool in the MVP. While a one-off, emergency script is technically possible, its use would require explicit, logged approval from the CTO and Head of Engineering due to the security implications.

*   **MVP Policy:** If a user permanently loses access to their sign-in provider, they lose access to their SyncWell data. This is a deliberate product decision to avoid the immense security risks.
*   **User Communication:** Support staff must communicate this policy clearly and empathetically.
    *   **Canned Response:** "I understand how frustrating it is to lose access to an account. Unfortunately, for security and privacy reasons, we cannot manually change the Google or Apple account associated with your SyncWell data. If you are unable to regain access to your original sign-in account, your only option is to create a new SyncWell account. We apologize for this limitation."
*   **Future Implementation Requirements:** If this feature is prioritized in the future, it **must** be built as a dedicated, secure, and audited internal tool. It must enforce a "two-person rule", which will be technically implemented by requiring the tool to be invoked with two separate, valid MFA-authenticated sessions from engineers in the `Support-L2` IAM group. The immutable audit trail for this tool will be stored in a dedicated, write-once Amazon QLDB (Quantum Ledger Database) table.

## 6. Risk Analysis & Mitigation

| Risk ID | Risk Description | Probability | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **R-50** | A bug in our code corrupts user configuration data in DynamoDB. | Low | High | **Mitigated.** Use the manual DynamoDB PITR runbook to restore the table. |
| **R-51** | A full AWS regional outage makes the backend unavailable. | Low | Critical | **Partially Mitigated.** The RTO is < 4 hours via a manual restore process to a new region. Residual risk includes the potential for human error in the manual process and the possibility of the DR test failing to meet the RTO. |
| **R-52** | User loses access to their Apple/Google account, resulting in data loss for that user. | Medium | **High** | **Accepted Risk for MVP.** Manual account recovery is not supported. This is a known limitation that will be communicated clearly to users who contact support. |
