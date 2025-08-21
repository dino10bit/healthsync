# Runbook: "Break-Glass" Procedure for PII Access

## 1. Overview
This runbook details the exceptional procedure for an authorized support engineer to access a user's PII for critical debugging purposes. This is a high-friction, strictly audited process that should only be used as a last resort when all other debugging methods have failed.

## 2. Prerequisites
- The engineer must be a member of the `Support-L2` IAM group.
- The engineer must have a valid, active MFA-authenticated session.
- A Jira ticket must exist detailing the user-reported issue and why PII access is required.

## 3. Procedure
1.  **Open a Pull Request:** The requesting engineer opens a pull request in the `internal-ops` repository.
    *   The PR description must include the Jira ticket ID, the `userId` to be accessed, and a detailed justification.
2.  **Obtain Approval:** The PR must be reviewed and approved by a senior engineer from the Core Backend team. This approval serves as the first layer of authorization.
3.  **Run the Access Script:** Once the PR is approved and merged, the engineer can run the `scripts/grant-debug-access.sh` script from their local machine.
    *   The script requires the Jira ticket ID and `userId` as parameters.
    *   The script will programmatically check for the merged PR and then invoke the `BreakGlassGrantAccessLambda`.
4.  **Second Factor Approval (Technical Enforcement):**
    *   The `BreakGlassGrantAccessLambda` will send a request for approval to the `#security-alerts-high` Slack channel.
    *   A different senior engineer must click "Approve" in the interactive Slack message. This approval requires MFA and serves as the second, technically enforced authorization factor.
5.  **Access Granted:** Upon Slack approval, the Lambda populates the `SyncWellBreakGlassIndex` table, granting the requesting engineer temporary access to the user's data via a secure, read-only debugging interface.
6.  **Access Revocation:** Access is automatically revoked after 72 hours via the DynamoDB TTL.

## 4. Auditing
- All steps are logged in the `#security-alerts-high` Slack channel.
- All API calls are logged in AWS CloudTrail.
- The `SyncWellBreakGlassIndex` table serves as an immutable log of all access grants.
