## Dependencies

### Core Dependencies
- `../security/19-security-privacy.md` - Security & Privacy
- `../security/20-compliance-regulatory.md` - Compliance & Regulatory
- `../ux/47-user-profile-management.md` - User Profile Management (Deep Dive)

### Strategic / Indirect Dependencies
- `../support/24-user-support.md` - User Support
- `../ops/65-incident-response.md` - Incident Response Plan

---

# PRD Section 48: Data Deletion Policy (Deep Dive)

## 1. Introduction & Guiding Principles
This document defines SyncWell's policy and procedures for the secure and permanent deletion of user data.
- **Principle of Control:** Users have the right to delete their data at any time for any reason.
- **Principle of Data Minimization:** We only keep data for as long as it is necessary to provide the service.
- **Principle of Compliance:** Our processes are designed to meet the requirements of privacy regulations like GDPR ("Right to Erasure") and CCPA.

## 2. Deletion Scenarios & Workflows

### 2.1. User-Initiated Deletion from App
This is the primary method for account deletion.
1.  **Entry Point:** User navigates to 'Settings' > 'Account' > 'Delete Account'.
2.  **Warning Screen:** A screen details exactly what data will be permanently deleted (account credentials, sync configurations, API tokens, etc.). The user must type "DELETE" to proceed.
3.  **Final Confirmation:** A native OS alert requires a final, explicit confirmation.
4.  **API Call:** `DELETE /v1/user/account` is called.
5.  **Execution:** The backend queues a deletion job. See **Section 3: Technical Implementation**.
6.  **Client-Side:** The app immediately logs the user out, deletes all locally stored data (tokens, cache), and returns to the welcome screen.

### 2.2. User-Initiated Deletion via Support
For users who cannot access their account.
1.  **Request:** A user emails support requesting account deletion.
2.  **Identity Verification:** The support agent must verify the user's identity to prevent malicious requests. This is done by asking for details only the legitimate user would know (e.g., a list of specific services they had connected, the date of their subscription).
3.  **Manual Trigger:** Once verified, the support agent uses an internal admin tool to trigger the deletion process for the user's account ID. This tool calls the same underlying deletion logic as the in-app flow.

### 2.3. Automated Deletion of Inactive Accounts
1.  **Identification:** A nightly scheduled job (`cron`) runs a query to find all user accounts where `lastLoginAt` < (NOW() - 24 months).
2.  **Pre-Deletion Notification:** For any accounts found, the job checks if a `deletionWarningSentAt` timestamp exists.
    -   If not, it sends the 30-day warning email and sets `deletionWarningSentAt = NOW()`.
    -   If a warning was already sent, it checks if `deletionWarningSentAt` < (NOW() - 30 days). If true, it proceeds to deletion.
3.  **Execution:** The job queues a deletion task for the identified user IDs.

## 3. Technical Implementation Details

### 3.1. Database Deletion Strategy
-   **Method:** We will use a **hard delete** strategy. When a deletion is requested, all database rows associated with the `userId` are permanently removed via `ON DELETE CASCADE` constraints in the database schema.
-   **Justification:** A soft-delete (e.g., setting an `isDeleted` flag) is not sufficient to comply with the "Right to Erasure" principle and introduces complexity. Hard deletion is cleaner and more compliant.

### 3.2. Log & Analytics Data Handling
-   **User-Identifiable Logs:** Our logging service (e.g., CloudWatch) must be configured with a data retention policy (e.g., 30 days). Upon account deletion, we will make a best effort to scrub recent logs containing the `userId`, but primarily rely on the short retention period to automatically purge this data.
-   **Analytics Data:** The `user_id` is a key identifier in our analytics system. Upon account deletion, we will call the analytics provider's data deletion API (e.g., Google Analytics User Deletion API) to remove all data associated with that user ID.

### 3.3. Deletion Confirmation & Audit Trail
-   **Logging:** Every deletion request (and its trigger method) is logged to a secure, immutable audit log.
-   **Process:** When the deletion job completes, it adds a "SUCCESS" entry to the audit log with a timestamp.
-   **Purpose:** This provides a permanent record that we can use to verify and prove compliance with a user's request.

## 4. Policy Clarifications

### 4.1. Data Anonymization vs. Deletion
-   This policy concerns the **deletion of personally identifiable data**.
-   Aggregated, fully anonymous data (e.g., "15% of our users connect to Garmin") is not subject to this deletion policy, as it cannot be tied back to an individual. This is detailed in the **Data Retention (Section 6)**.

### 4.2. Deletion from Third-Party Services
-   SyncWell acts as a data conduit. When we sync data from Source A to Destination B, that data becomes subject to the policies of Destination B.
-   Our data deletion policy **does not and cannot** trigger deletion of data from third-party services (e.g., deleting a user's Strava account). Our Privacy Policy must make this limitation clear to the user.

### 4.3. Legal & Compliance Hold
-   In the rare event of receiving a valid legal order (e.g., a subpoena) for a user's data, the account will be placed on a "legal hold."
-   This hold is a flag in the user's database record that prevents the automated and user-initiated deletion processes from running until the hold is manually lifted by a system administrator after the legal matter is resolved.

### 4.4. Data Recovery Scenarios
-   **Policy:** Once an account deletion is processed, data recovery is **not possible**. The data is permanently removed from our production database.
-   **Backups:** While database backups are taken for disaster recovery, they are not intended for restoring individual user accounts. Restoring a single user from a backup is operationally complex and risks inconsistencies. Furthermore, keeping data in backups for extended periods that could be used to restore a deleted user's data runs counter to the spirit of the erasure request. Backups will be retained for a limited time (e.g., 30 days).

## 5. Analysis & Calculations
### 5.1. Database Size & Cost Reduction
-   **Hypothesis:** The automated deletion policy for inactive accounts will help control database growth and reduce long-term storage costs.
-   **Assumptions:**
    -   Total Users at Year 3: 200,000
    -   Annual Churn Rate: 20% (40,000 users per year)
    -   Rate of permanent inactivity (users who churn and never return): 75% of churned users = 30,000 users/year.
    -   Average size of a user's record in the database (account, settings, tokens): 5 KB
-   **Calculation:**
    -   *Number of accounts eligible for deletion each year (after 24mo grace period)*: 30,000
    -   *Annual Storage Reduction* = 30,000 users * 5 KB/user = 150,000 KB = 150 MB.
    -   *Annual Cost Saving (DynamoDB)*: While small initially, this prevents indefinite data growth. At DynamoDB's pay-per-request pricing, the primary cost is not storage, but this policy reduces the number of items that need to be scanned or managed in backups, providing operational benefits.
-   **Conclusion:** This policy is primarily a compliance and data hygiene measure, but it provides a secondary benefit of controlling costs and data bloat.

### 5.2. Risk Analysis
-   **Risk:** A user accidentally deletes their account and loses their settings.
    -   **Mitigation:** The requirement for a two-step confirmation process (either password re-entry or email link) is designed to mitigate this. The UI copy must be extremely clear about the permanent nature of this action.
-   **Risk:** A legitimate user is marked as inactive and their account is deleted.
    -   **Mitigation:** The 24-month inactivity window is very generous. The dual-notification system (30 days and 7 days prior) provides ample opportunity for the user to prevent the deletion by simply logging in.
-   **Risk:** Failure to comply with a user's deletion request under GDPR/CCPA.
    -   **Impact:** High. Potential for significant fines (up to 4% of annual global turnover for GDPR) and severe brand damage.
    -   **Mitigation:** The deletion process must be robust, automated, and auditable. Logs should be kept of deletion requests and their successful completion.

## 6. Data Retention
-   **User Analytics Data:** User-level analytics data, which is tied to a specific `userId` but is not core health data (e.g., button clicks, screen views), will be retained for a maximum of **24 months** after the event was generated. This allows for long-term cohort analysis while still adhering to data minimization principles.
-   **Anonymized Aggregated Data:** Aggregated, fully anonymized data that is not personally identifiable (e.g., overall sync success rates) may be retained indefinitely for analytical purposes.
-   **Financial Records:** For legal and accounting purposes, records of subscriptions and payments will be retained for the period required by law (e.g., 7 years), but will be disconnected from the user's deleted account.

## 7. Compliance
This policy will be regularly reviewed and updated to ensure ongoing compliance with international data protection laws.
