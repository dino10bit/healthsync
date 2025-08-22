---
title: "Data Security & Privacy Specification"
migrated: true
---
## Dependencies

### Core Dependencies
- `../prd/01-context-vision.md` - Context & Vision
- `../architecture/06-technical-architecture.md` - **[Authoritative]** Technical Architecture
- `./20-compliance-regulatory.md` - Legal & Regulatory Compliance

### Strategic / Indirect Dependencies
- `../architecture/07-apis-integration.md` - APIs & Integration Requirements
- `../ops/17-error-handling.md` - Error Handling, Logging & Monitoring
- `../ops/18-backup-recovery.md` - Backup & Disaster Recovery
- `../ux/36-user-privacy-settings.md` - User Privacy Controls & Settings

---

# Data Security & Privacy Specification

## 1. Executive Summary

This document specifies the comprehensive data security and privacy architecture for the SyncWell application. In the health data space, trust is the foundation of the product. This document codifies our commitment to protecting user data through a "privacy-first" design philosophy and a robust, multi-layered security strategy.

This internal specification is a blueprint for the **engineering team** to implement state-of-the-art security measures. It is the technical foundation for the public-facing Privacy Policy.

## 2. Guiding Principles

*   **Data Minimization:** We only request and handle data that is absolutely essential.
*   **Privacy by Design:** The system is architected from the ground up to protect user data.
*   **Ephemeral Backend Processing:** This is our core privacy promise. SyncWell's backend services do not persist raw user health data. Health data is only ever held in-memory on our backend servers during an active sync job and is immediately discarded.
*   **Radical Transparency:** We are open and honest with users about what data we handle and why.

## 3. Threat Modeling & Countermeasures

| Threat Scenario | Description | Countermeasure(s) |
| :--- | :--- | :--- |
| **Backend Server Compromise** | An attacker gains access to the backend infrastructure. | - **Strict IAM Roles & Least Privilege:** All compute services have narrowly scoped IAM roles. <br>- **AWS Secrets Manager:** User OAuth tokens are stored encrypted in a dedicated, secure service. <br>- **VPC & Security Groups:** Backend services run in a private VPC. <br>- **Regular Audits & Pen Testing:** Proactively identify and fix vulnerabilities. |
| **Compromised Device** | A malicious actor gains root/jailbreak access to the user's device. | - **Keychain/Keystore:** Primary countermeasure using hardware-backed secure storage. <br>- **Jailbreak/Root Detection:** The app will use libraries like `react-native-jail-monkey` (or native equivalents) to make a best effort to detect a compromised OS. <br>- **User-Facing Warning:** If detected, the app will show a persistent, non-dismissible warning: `SyncWell has detected that your device may be compromised. For your security, some features may be limited.` <br>- **Logging:** A structured JSON log at `WARN` level will be sent to a dedicated CloudWatch Log Group. A Metric Filter on this group will trigger a high-priority CloudWatch Alarm. |
| **Man-in-the-Middle (MitM) Attack** | An attacker intercepts traffic between the app and the backend. | - **TLS 1.2+:** All network traffic is encrypted. <br>- **Certificate Pinning:** Deferred for the MVP. The operational risk of "bricking" clients due to a mishandled key rotation outweighs the security benefit for the MVP, especially since we enforce JWT authentication on all mutable endpoints. |
| **Vulnerable Container Image** | A container image or dependency has a known vulnerability (CVE). | - **Automated Image Scanning:** The CI/CD pipeline **must** scan every container image using **Amazon ECR Scanning**. The build **must** fail if a new critical or high-severity vulnerability is detected. <br>- **Minimal Base Images:** Use minimal, vetted base images (e.g., "distroless" or Alpine). <br>- **Regular Rebuilds:** The CI/CD pipeline will automatically rebuild and redeploy application images **every Monday at 02:00 UTC** to incorporate OS patches. |
| **Vulnerable Third-Party Dependency** | A library used by the app or backend has a known security vulnerability. | - **Automated Dependency Scanning:** Use Snyk/Dependabot to scan for CVEs. The build **must** fail on new critical or high-severity vulnerabilities. <br>- **Dependency Pinning:** All dependencies will be pinned to specific, audited versions. |
| **Unauthenticated Webhooks** | An attacker injects malicious data by sending unauthenticated requests to a webhook endpoint. | - **Mandatory HMAC Signature Validation:** All incoming webhooks **must** be validated using a shared secret and an HMAC signature passed in an HTTP header (e.g., `X-Fitbit-Signature`). The validation logic must be performed in the API Gateway integration or the initial Lambda function before any other processing. This is a non-negotiable security control. |
| **Webhook Endpoint Abuse** | The public-facing webhook ingestion endpoint is targeted by attackers. | - **Strict Input Validation:** Payloads must be validated against the `WebhookPayload` schema defined in `../architecture/07-apis-integration.md`. <br>- **AWS WAF Protection:** The endpoint will be protected by **AWS WAF** with the **OWASP Top 10 rule set** and a **rate limit of 1000 requests per IP per 5 minutes**. The action for this rule is `BLOCK`. |
| **Overly Permissive IAM Roles** | A compromised service has overly broad permissions, allowing an attacker to move laterally. | - **IAM Policy Variables for Granular Control:** IAM policies for worker Lambdas **must** be restricted to only the resources needed for a specific job. This will be enforced using IAM policy variables (e.g., `${aws:PrincipalTag/userId}`) to ensure a Lambda can only access secrets or data tagged with the ID of the user it is processing. |
| **AI/LLM Risks** | An LLM-based feature hallucinates, leaks PII, or is subject to prompt injection. | - **PII Stripping:** All data sent to any AI service **must** first pass through the Anonymizer Proxy defined in `../architecture/06-technical-architecture.md`. <br>- **Monitoring:** AI model outputs will be monitored for data drift, concept drift, feature attribution drift, and anomaly scores using **Amazon SageManager Model Monitor**. <br>- **Input Sanitization:** User-facing prompts will be sanitized to mitigate prompt injection attacks. |

## 4. Data Flow & Classification

*   **Class 1: Health Data (In-Memory, Ephemeral):** Never stored at rest on SyncWell servers.
*   **Class 2: Sensitive Credentials (OAuth Tokens):** Stored encrypted at rest in **AWS Secrets Manager**.
*   **Class 3: Configuration & Metadata:** Stored in DynamoDB. Does not contain raw health data.

## 5. Credential Lifecycle Management

*   **Creation:** Tokens are acquired via the secure hybrid OAuth 2.0 flow.
*   **Storage:** Tokens are stored encrypted in **AWS Secrets Manager**.
*   **Usage:** Worker Lambdas are granted temporary, role-based access via dynamically-generated, single-use session policies, as defined in `06-technical-architecture.md`.
*   **Re-authentication:** When a connection is marked `needs_reauth`, the client will prompt the user to reconnect via the `POST /v1/connections/{connectionId}/reauth` endpoint. This endpoint is defined in the Core API Contracts section of `06-technical-architecture.md`.
*   **Deletion:** When a user de-authorizes an app, the backend makes a best-effort call to the provider's `revoke` endpoint (if supported). The primary security mechanism is the permanent deletion of the token from Secrets Manager.
*   **Rotation:** A formal secrets rotation policy **must** be enforced.
    *   **Automated Rotation:** For all secrets that support it, automated rotation **must** be enabled with a cadence of **90 days**.
    *   **Manual Rotation:** For secrets that require manual rotation (e.g., third-party API keys), a quarterly manual rotation process **must** be documented and tracked via recurring tickets assigned to the SRE team.
    *   **Emergency Rotation:** A detailed, step-by-step runbook for out-of-band, emergency secret rotation **must** be created and maintained at `../ops/runbook-emergency-secret-rotation.md`.

## 6. Backend and API Security

*   **Authentication:** Mobile-to-backend communication is authenticated using short-lived JWTs.
*   **Secure JWT Validation:** The Lambda Authorizer **must** use a well-vetted library like **AWS Lambda Powertools** for JWT validation.
*   **Authorization & Access Control:**
    *   **Authorizer Policy Caching:** The cache TTL is authoritatively defined as **5 minutes** in `06-technical-architecture.md`.
    *   **Insecure Direct Object Reference (IDOR) Prevention:** To prevent a user from accessing another user's data, the system **must** enforce Attribute-Based Access Control (ABAC). The Lambda execution role's IAM policy must include a condition that compares the `userId` from the JWT (passed by the authorizer) with the partition key of the requested DynamoDB resource. Access must be denied unless the `userId` in the request context matches the `userId` of the data item.
    *   **Per-User Rate Limiting:** To protect against abusive clients, API Gateway Usage Plans **must** be configured to enforce per-user (or per-API-key) rate limits. A reasonable starting point is 100 requests per minute with a burst capacity of 200.
*   **Network Security:** The backend runs in a private VPC.
    *   **Ingress:** Entry is via API Gateway, protected by AWS WAF.
        *   **Financial DoS Protection:** WAF **must** be configured with a rate-based rule that blocks any source IP sending more than 1,000 requests in a 5-minute period.
    *   **Egress:** All egress traffic **must** be routed through AWS Network Firewall with a strict, domain-based allow-list to prevent data exfiltration. The hybrid model is deprecated in favor of a more secure posture.
*   **Incident Response:** All security incidents will be handled according to the formal **[Incident Response Plan](./INCIDENT_RESPONSE_PLAN.md)**.

*   **Security-Specific Logging & Alerting:** The observability plan, which is primarily focused on performance and availability, **must** be augmented with security-specific monitoring.
    *   **Alerting:** High-severity alerts **must** be configured for security-centric events, including but not limited to:
        *   A high number of AWS WAF `BLOCK` actions.
        *   Suspicious IAM activity detected by AWS GuardDuty.
        *   Unauthorized API calls that are denied by the Lambda Authorizer.
        *   Critical security findings from AWS Inspector.
    *   **Dashboard:** A dedicated "Security Operations" dashboard must be created in CloudWatch to visualize these metrics.

### 6.1. Secure Logging & "Break-Glass" Procedure

#### Automated PII Detection
To prevent accidental leakage of Personally Identifiable Information (PII) in logs, the system **must** use **CloudWatch Logs Data Protection**. Because the architecture's tiered logging strategy may log more verbose data for `PRO` tier users, this control is especially critical to ensure that sensitive information is not inadvertently exposed. Policies will be configured to automatically identify and mask PII data (e.g., email addresses, names, etc.) in all log groups in real-time. This automated, scalable solution replaces any manual audit process.

#### "Break-Glass" for Debugging
To balance user privacy with the need for debugging, `userId` is never logged. A secure "break-glass" procedure is used for user-specific debugging. The high friction of this workflow is a deliberate security trade-off. The detailed runbook is maintained in **[`../ops/RUNBOOK_BREAK_GLASS.md`](../ops/RUNBOOK_BREAK_GLASS.md)**.

**Procedure Summary:** An authorized engineer runs the `scripts/grant-debug-access.sh` script, which requires a peer-reviewed and approved PR and triggers a multi-factor approval workflow in Slack that is technically enforced. All requests and approvals are logged in the **`#security-alerts-high`** Slack channel.

**Lookup Index Design:**
The `SyncWellBreakGlassIndex` is a dedicated, highly secure DynamoDB table.
*   **Schema:** PK=`USER#{userId}`, SK=`TIMESTAMP#{timestamp}`, Attributes=`traceId`, `ttl`.
*   **TTL:** A **72-hour TTL** is enforced by DynamoDB to ensure automatic deletion. This is a non-configurable DynamoDB feature.
*   **Security:** Write access is restricted to the Lambda Authorizer's IAM role. Read access is restricted to an admin-only IAM group. The table **must be encrypted with a customer-managed KMS key** with an **annual rotation policy**. The key policy must restrict all access except to the specific IAM role used by the break-glass approval Lambda.

## 7. Pre-Launch Security Audit Checklist

| Category | Control | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Data Security** | User OAuth tokens are stored encrypted in AWS Secrets Manager. | `[x]` | |
| | On-device database is encrypted using SQLCipher. | `[x]` | This must also be noted in `06-technical-architecture.md`. |
| | No sensitive PII (userId, email, etc.) is written to logs, verified by audit. | `[x]` | |
| | Production builds are obfuscated (ProGuard/R8 on Android, Swift Obfuscator on iOS). | `[x]` | |
| **Network** | All network traffic uses TLS 1.2+. | `[x]` | |
| | Backend services are properly isolated in a private VPC with strict security groups. | `[x]` | |
| | Egress traffic is controlled via a firewall with a documented allow-list. | `[x]` | |
| **Authentication** | Mobile-to-backend communication is authenticated via JWTs. | `[x]` | |
| | The de-authorization process is robust and deletes all relevant user data. | `[x]` | |
| **Access Control** | IAM roles follow the principle of least privilege. | `[x]` | |
| | MFA is enforced for all engineers on all production systems. | `[x]` | |
| **Vulnerability Mgmt**| All third-party dependencies have been scanned for vulnerabilities using Snyk. | `[x]` | |
| | All container images have been scanned for vulnerabilities using ECR Scan. | `[x]` | |
| | A third-party penetration test has been completed and all critical/high findings are resolved. | `[ ]` | **BLOCKER:** This must be completed before launch. |

## 8. Data Portability and Deletion

### 8.1. User Data Export
*   **User Journey:** 1. User navigates to Settings > Account > Export Data. 2. User taps 'Start Export'. 3. A status indicator shows 'Export in progress...'. 4. User receives a push notification: `Your SyncWell data export is ready. Open the app to download it.` 5. The app UI updates to show a 'Download Now' button.
*   **Backend Workflow:** The request triggers the `DataExportQueue` (SQS), which is processed by a dedicated `DataExportTask`.
    *   **Task Definition:** Fargate, 0.5 vCPU/1GB Memory.
    *   **IAM Permissions:** The task role must have `s3:PutObject` permissions for the export bucket and read-only access to the user's data in DynamoDB.
*   **S3 Bucket Security:** Public access is blocked, default encryption is enabled, and a lifecycle policy permanently deletes objects after **3 days**. The pre-signed download URL is valid for **1 hour**.

### 8.2. Account Deletion ("Right to be Forgotten")
*   **Workflow:** A user confirms deletion in the app. This triggers the `AccountDeletionQueue` (SQS), which is processed by a dedicated `AccountDeletionTask` to perform a "scorched earth" deletion.
    *   **Task Definition:** Fargate, 0.5 vCPU/1GB Memory.
    *   **IAM Permissions:** The task role must have write/delete permissions for all user-related data in DynamoDB and Secrets Manager.
*   **Data in Backups:** User data will remain in DynamoDB backups for the retention period (**35 days**). This is an accepted practice under GDPR and will be stated in our privacy policy.
*   **Reconciliation:** A weekly reconciliation Lambda (`DeletionReconLambda`) will scan for data that should have been deleted and alert on any discrepancies.
    *   **Technical Specifications:** Python 3.11, 128MB Memory, runs every Sunday at 03:00 UTC.

## 9. Risk Analysis

| Risk ID | Risk Description | Probability | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **R-40** | An engineer is tricked via social engineering into approving a malicious "break-glass" request. | Low | High | Mandatory, annual security training for all engineers with access, covering social engineering attack vectors. The high-friction, multi-approver workflow, which is technically enforced, also serves as a mitigation. |
| **R-41** | A bug in the deletion workflow causes an incomplete data deletion, violating our "Right to be Forgotten" promise. | Low | High | The weekly reconciliation Lambda provides a safety net to ensure our deletion process is robust. |
