## Dependencies

### Core Dependencies
- `06-technical-architecture.md` - Technical Architecture, Security & Compliance
- `19-security-privacy.md` - Data Security & Privacy Policies
- `44-contingency-planning.md` - Contingency & Rollback Plans

### Strategic / Indirect Dependencies
- `22-maintenance.md` - Maintenance & Post-Launch Operations (SRE)

---

# PRD Section 18: Backup & Disaster Recovery

## 1. Executive Summary

This document specifies the strategy for data recovery and service resilience for the SyncWell application, architected to support 1 million DAU. Our strategy has evolved from simple backups to a comprehensive **Disaster Recovery (DR) and High Availability (HA)** plan centered on a **multi-region AWS deployment**. The primary objective is to ensure near-continuous availability and data durability, even in the event of a full regional outage, providing a seamless and reliable user experience.

## 2. The Recovery Model: A Highly Available Backend

The concept of a "backup" is superseded by a model of continuous replication and automated failover. The user's configuration and operational metadata are treated as critical assets, and the architecture is designed to protect them.

*   **User Account:** Each user is identified by a stable, unique ID from "Sign in with Apple/Google".
*   **Backend State:** All data associated with this user ID is stored in a highly available and durable backend:
    *   **Sync Configurations & App Settings:** Stored in a **DynamoDB Global Table**.
    *   **OAuth Tokens:** Encrypted and stored in **AWS Secrets Manager with cross-region replication**.

This means a user can install the app on any device, sign in, and their experience will be instantly restored. More importantly, the service itself is resilient to major infrastructure failures.

## 3. The New Device / Re-install Experience
*(Unchanged from previous version, as this flow remains the same)*

The recovery process is an integral part of the onboarding flow for a returning user.

1.  **First Launch:** On first launch, the app presents the user with "Sign in with Apple" and "Sign in with Google" options.
2.  **Authentication:** The user signs in with the same method they used originally.
3.  **State Recovery:** The app, directed by Route 53 to the nearest healthy region, sends the user's ID to the SyncWell backend. The backend retrieves the user's complete configuration from the local replica of the DynamoDB Global Table.
4.  **Instant Setup:** The app UI populates with all the user's sync configurations.
5.  **Seamless Syncing:** The user's OAuth tokens are available in the region, so syncs can resume immediately.

## 4. Disaster Recovery Strategy: Active-Active Multi-Region

As defined in `06-technical-architecture.md`, we will operate in an **active-active multi-region architecture** to achieve maximum availability and resilience. A "disaster" is now defined as an event that makes an entire AWS region unavailable.

This strategy yields different recovery objectives depending on the nature of the disaster.

| Failure Scenario | Recovery Time Objective (RTO) | Recovery Point Objective (RPO) | Mechanism |
| :--- | :--- | :--- | :--- |
| **Full Regional Outage** | **< 5 minutes** | **< 2 seconds** | **Automated Failover.** Amazon Route 53 health checks detect the failure and automatically redirect traffic to a healthy region. The RPO is governed by the replication lag of DynamoDB Global Tables. |
| **Cache Cluster Failure** | **< 60 minutes** | **< 1 minute** | **Manual Promotion.** An on-call engineer promotes a secondary ElastiCache replica to primary. The RPO is governed by the ElastiCache Global Datastore replication lag. |
| **Data Corruption Event** (e.g., bad code deployment) | **< 4 hours** | **< 5 minutes** | **Manual Restore.** An engineer initiates a DynamoDB Point-in-Time Recovery (PITR) and uses AWS AppConfig to redirect traffic to the restored table. RPO is governed by the continuous backup window of PITR. See the detailed runbook below. |

### Recovery Mechanisms:

*   **Infrastructure as Code (IaC):** The entire backend infrastructure is defined in **Terraform**. This allows for consistent and repeatable deployments across multiple regions.
*   **Automated Traffic Failover (Amazon Route 53):**
    *   We will use Route 53 with latency-based routing and health checks.
    *   If the health checks for one region fail, Route 53 will automatically stop sending users to the unhealthy region and redirect all traffic to the healthy region(s). This failover is automatic and requires no manual intervention.

*   **Replicated Configuration Data (DynamoDB Global Tables):**
    *   Our core user metadata tables are configured as **DynamoDB Global Tables**.
    *   This provides a fully managed, multi-master database that automatically replicates data between AWS regions with typical latency of under one second.
    *   Both regions have a complete, live copy of the data, so if one region fails, the other can continue operating seamlessly.

*   **Replicated Credentials (AWS Secrets Manager):**
    *   The OAuth tokens stored in Secrets Manager are critical for our service.
    *   We will configure **cross-region replication** for our secrets. When a secret is updated in the primary region (e.g., a refreshed token), Secrets Manager automatically replicates that change to the replica secret in the secondary region.
    *   This ensures that if the primary region fails, the workers in the failover region have access to the up-to-date credentials needed to continue processing sync jobs.

*   **Distributed Locking (DynamoDB Conditional Writes):**
    *   To prevent race conditions (e.g., two workers processing the same sync job concurrently), a distributed locking mechanism is required.
    *   **Anti-Pattern Avoidance:** Using a replicated cache (like ElastiCache Global Datastore) for distributed locking in an active-active, multi-region setup is a known anti-pattern. The inherent replication lag can break the mutual exclusion guarantee of a lock, leading to data corruption.
    *   **Correct Implementation:** We will use **DynamoDB's conditional write** functionality to implement a robust, consistent distributed lock. A worker will attempt to acquire a lock by creating a specific lock item in the `SyncWellMetadata` table with a condition that fails if the item already exists. This leverages DynamoDB's strong consistency for a single-region write, providing a reliable locking mechanism. The lock item will have a short TTL to prevent deadlocks.
*   **Replicated Cache Data (Amazon ElastiCache):**
    *   The ElastiCache for Redis cluster is a critical component for **caching and rate-limiting**. A regional failure would lead to a "cache stampede" that could overwhelm the database.
    *   To mitigate this, each regional ElastiCache cluster will operate independently. In the event of a regional failover, the cache in the newly active region will be cold. This is an acceptable trade-off, as the system will gracefully handle the initial cache misses, and the cache will warm up quickly, preventing a prolonged service degradation.

### Disaster Recovery Flow (Regional Outage)
```mermaid
graph TD
    subgraph "Users"
        UserDevice
    end
    subgraph "DNS"
        Route53
    end
    subgraph "AWS Region 1 (Healthy)"
        App_R1[SyncWell App - Region 1]
    end
    subgraph "AWS Region 2 (Failed)"
        App_R2[SyncWell App - Region 2]
    end

    UserDevice -- DNS Query --> Route53
    Route53 -- Health Check OK --> App_R1
    Route53 -- Health Check FAILED --> App_R2
    UserDevice -- Traffic --> App_R1
```

## 5. Risk Analysis & Mitigation

| Risk ID | Risk Description | Probability | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **R-50** | A bug in our code corrupts user configuration data in DynamoDB. | Low | High | Use DynamoDB Point-in-Time Recovery (PITR) to restore the table to a state before the corruption occurred. This is a manual recovery process, separate from the automated HA failover. |
| **R-51** | A full AWS regional outage makes one of our backend deployments unavailable. | Low | Critical | **Mitigated by Design.** The active-active multi-region architecture with Route 53 failover, DynamoDB Global Tables, and replicated secrets ensures the service remains available. |
| **R-52** | User loses access to their Apple/Google account. | Medium | Medium | Provide a clear path to contact support for a defined manual account recovery process. See Section 6. |
| **R-53** | Cross-region replication lag for DynamoDB or Secrets Manager exceeds the RPO. | Low | Medium | Monitor replication lag metrics in CloudWatch. Configure alarms to notify the on-call team of unusual delays. |

## 6. Detailed Recovery Runbooks

### Runbook: Data Corruption Recovery (PITR)
This is a last-resort, high-risk manual procedure to be followed in the event of widespread data corruption.

1.  **Declare Incident & Halt Writes:** A major incident is declared. If possible, writes to the DynamoDB table are temporarily disabled to prevent further corruption.
2.  **Identify Restore Point:** This is the most critical and difficult step. Engineers must use logs and metrics to identify the precise moment *before* the corruption began. This determines the restore timestamp. All data written between this point and the incident declaration will be lost. This data loss must be acknowledged and accepted before proceeding.
3.  **Initiate PITR:** An authorized engineer initiates a Point-in-Time Recovery of the `SyncWellMetadata` DynamoDB table from the AWS console, using the identified restore timestamp. This creates a new table (e.g., `SyncWellMetadata-restored-YYYY-MM-DD`).
4.  **Validate Restored Data:** The engineer must run validation scripts against the new table to ensure the data is consistent and the corruption is gone.
5.  **Update AppConfig & Redirect Traffic:** The application code does not contain a hardcoded table name. Instead, it fetches the table name from **AWS AppConfig**. To redirect all application traffic to the newly restored table, the engineer updates the `tableName` configuration value in AppConfig and deploys the configuration change. This is a fast and safe way to repoint the entire application without a code deployment.
6.  **Post-Mortem:** A full post-mortem analysis is conducted to understand the root cause and prevent recurrence.

### Runbook: Manual Account Recovery
This process is for the rare case where a user permanently loses access to their social sign-in account and needs to link their SyncWell data to a new social account. This has significant security implications and must be handled with extreme care.

1.  **User Verification:** The user must contact support and provide sufficient proof of identity. This includes:
    *   A receipt of their Pro subscription purchase.
    *   Answering specific questions about their sync configurations that only the true user would know.
2.  **Engineering Ticket:** Once support has verified the user's identity to a high degree of confidence, they will create a high-priority engineering ticket with all verification details.
3.  **Manual Data Migration:** An authorized engineer will run a peer-reviewed, version-controlled script that performs the following actions:
    *   This is a delicate and dangerous operation. Because a partition key cannot be updated in place, the script must perform a multi-step migration:
        1.  Query all items belonging to the old `USER#{userId}` partition.
        2.  For each item, create a new item with the new `USER#{userId}` partition key.
        3.  After successful validation, delete all the original items from the old partition.
4.  **Confirmation:** The engineer confirms with the support team that the migration is complete, and the user is notified.
