---
title: "PRD Section 19: Data Security & Privacy Policies"
migrated: true
---
## Dependencies

### Core Dependencies
- `../prd/01-context-vision.md` - Context & Vision
- `../architecture/06-technical-architecture.md` - Technical Architecture, Security & Compliance
- `./20-compliance-regulatory.md` - Legal & Regulatory Compliance

### Strategic / Indirect Dependencies
- `../architecture/07-apis-integration.md` - APIs & Integration Requirements
- `../ops/17-error-handling.md` - Error Handling, Logging & Monitoring
- `../ops/18-backup-recovery.md` - Backup & Disaster Recovery
- `../ux/36-user-privacy-settings.md` - User Privacy Controls & Settings

---

# PRD Section 19: Data Security & Privacy Policies

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
| **Compromised Device** | A malicious actor gains root/jailbreak access to the user's device. | - **Keychain/Keystore:** Primary countermeasure using hardware-backed secure storage. <br>- **Jailbreak/Root Detection:** The app will make a best effort to detect a compromised OS, display a persistent warning to the user, and log the event to the backend for monitoring. |
| **Man-in-the-Middle (MitM) Attack** | An attacker intercepts traffic between the app and the backend. | - **TLS 1.2+:** All network traffic is encrypted. <br>- **Certificate Pinning:** Deferred for the MVP to reduce operational complexity and risk. The rationale is that the combination of TLS and the secure authentication token (JWT) provides sufficient protection for the initial release. |
| **Vulnerable Container Image** | A container image or dependency has a known vulnerability (CVE). | - **Automated Image Scanning:** The CI/CD pipeline **must** scan every container image using **Amazon ECR Scanning**. The build **must** fail if a new critical or high-severity vulnerability is detected. <br>- **Minimal Base Images:** Use minimal, vetted base images (e.g., "distroless" or Alpine). <br>- **Regular Rebuilds:** The CI/CD pipeline will automatically rebuild and redeploy application images **every Monday at 02:00 UTC** to incorporate OS patches. |
| **Vulnerable Third-Party Dependency** | A library used by the app or backend has a known security vulnerability. | - **Automated Dependency Scanning:** Use Snyk/Dependabot to scan for CVEs. The build **must** fail on new critical or high-severity vulnerabilities. <br>- **Dependency Pinning:** All dependencies will be pinned to specific, audited versions. |
| **Webhook Endpoint Abuse** | The public-facing webhook ingestion endpoint is targeted by attackers. | - **Signature Validation:** All incoming webhooks **must** be validated using the provider's signature mechanism (e.g., HMAC-SHA256). The specific algorithm is provider-dependent. <br>- **Strict Input Validation:** Payloads must be validated against a strict schema. <br>- **AWS WAF Protection:** The endpoint will be protected by **AWS WAF** with the **OWASP Top 10 rule set** and a **rate limit of 1000 requests per IP per 5 minutes**. |

## 4. Data Flow & Classification

*   **Class 1: Health Data (In-Memory, Ephemeral):** Never stored at rest on SyncWell servers.
*   **Class 2: Sensitive Credentials (OAuth Tokens):** Stored encrypted at rest in **AWS Secrets Manager**.
*   **Class 3: Configuration & Metadata:** Stored in DynamoDB. Does not contain raw health data.

## 5. Credential Lifecycle Management

*   **Creation:** Tokens are acquired via the secure hybrid OAuth 2.0 flow.
*   **Storage:** Tokens are stored encrypted in **AWS Secrets Manager**.
*   **Usage:** Worker Fargate Tasks are granted temporary, role-based access.
*   **Re-authentication:** When a connection is marked `needs_reauth`, the client will prompt the user to reconnect.
    *   **API Endpoint:** `POST /v1/connections/{connectionId}/reauth`
    *   **Response:** A `200 OK` with the new `authorizationUrl` in the response body. [NEEDS_CLARIFICATION: This endpoint must be added to the OpenAPI specification.]
*   **Deletion:** When a user de-authorizes an app, the backend revokes the token with the provider and permanently deletes it from Secrets Manager.

## 6. Backend and API Security

*   **Authentication:** Mobile-to-backend communication is authenticated using short-lived JWTs.
*   **Secure JWT Validation:** The Lambda Authorizer **must** use a well-vetted library like **AWS Lambda Powertools** for JWT validation.
*   **Authorization:**
    *   **IAM Roles:** All backend services use strict IAM roles. For Fargate tasks, the ideal state is one IAM role per provider type. For the MVP, a single worker role may be used, but its policy must be as constrained as possible.
    *   **Authorizer Policy Caching:** The cache TTL is set to **5 minutes** as a balance between performance and security responsiveness.
*   **Network Security:** The backend runs in a private VPC.
    *   **Ingress:** Entry is via API Gateway and an Application Load Balancer, both protected by AWS WAF.
    *   **Internal Traffic:** VPC Gateway Endpoints are used to keep traffic to other AWS services off the public internet.
    *   **Egress:** A hybrid firewall model (AWS Network Firewall and NAT Gateway) is used to control outbound traffic, as defined in `06-technical-architecture.md`.

### 6.1. Secure Logging & "Break-Glass" Procedure

*NOTE: The following section describes a security-critical operational process. The canonical, step-by-step runbook for execution should be maintained in the `docs/ops/` folder.*

To balance user privacy with the need for debugging, `userId` is never logged. A secure "break-glass" procedure is used for user-specific debugging.

#### 6.1.1. "Break-Glass" Procedure Workflow

1.  **Request & Approval:** An authorized engineer, working on a support ticket, creates a pull request to run a lookup script with the `userId`. The request is posted in the `#break-glass-requests` Slack channel and requires approval from a second authorized engineer.
2.  **Execution:** The engineer executes the peer-reviewed script, which queries the `SyncWellBreakGlassIndex` to find recent `correlationId`s associated with the `userId`.
3.  **Debugging:** The engineer uses the retrieved `correlationId`s to find the relevant logs in CloudWatch.

#### 6.1.2. Break-Glass Lookup Index Design

The `SyncWellBreakGlassIndex` is a dedicated, highly secure DynamoDB table.

*   **Table Schema:**
    *   **Primary Key:** `USER#{userId}` (PK), `TIMESTAMP#{timestamp}` (SK)
    *   **Attributes:** `correlationId`, `ttl`
*   **Time-to-Live (TTL):** All items **must** have a TTL of **72 hours**. This ensures the mapping is automatically and permanently deleted.
*   **Population:** The **Lambda Authorizer** is the only component with write permissions to this table.
*   **Security:** Access is stringently controlled via IAM. The table **must be encrypted with a customer-managed KMS key** for an additional layer of security and auditing.

## 7. Pre-Launch Security Audit Checklist

*   [ ] User OAuth tokens are stored encrypted in AWS Secrets Manager.
*   [ ] The on-device database is encrypted.
*   [ ] No sensitive data is written to logs.
*   [ ] All network traffic uses TLS 1.2+.
*   [ ] Backend services are properly isolated in a VPC.
*   [ ] Mobile-to-backend communication is authenticated via JWTs.
*   [ ] IAM roles follow the principle of least privilege.
*   [ ] The de-authorization process is robust.
*   [ ] The app is obfuscated in production builds.
*   [ ] All third-party dependencies have been scanned for vulnerabilities.

## 8. Data Portability and Deletion

### 8.1. User Data Export

*   **Workflow:** A user initiates an export from the app. An asynchronous Fargate task prepares a `.zip` file and saves it to a secure S3 bucket. The user is notified via push and can get a pre-signed download URL from within the app.
*   **S3 Bucket Security:**
    *   Public access is blocked.
    *   Default encryption is enabled.
    *   A lifecycle policy permanently deletes objects after **3 days**.
    *   The pre-signed download URL is valid for **1 hour**.

### 8.2. Account Deletion ("Right to be Forgotten")

*   **Workflow:** A user confirms deletion in the app. An asynchronous Fargate task is triggered to perform a "scorched earth" deletion:
    1.  Mark the user's profile in DynamoDB with `status: DELETING`.
    2.  Revoke all third-party tokens and delete them from Secrets Manager.
    3.  Delete all user data from the `SyncWellMetadata` DynamoDB table.
*   **Data in Backups:** User data will remain in DynamoDB backups for the retention period (**35 days**). This is an accepted practice under GDPR and will be stated in our privacy policy.

### 8.3. Manual Account Recovery
*   **MVP Policy: Not Supported.** To eliminate the significant security risks, manual account recovery is not supported for the MVP.
