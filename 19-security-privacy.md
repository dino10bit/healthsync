## Dependencies

### Core Dependencies
- `01-context-vision.md` - Context & Vision
- `06-technical-architecture.md` - Technical Architecture, Security & Compliance
- `20-compliance-regulatory.md` - Legal & Regulatory Compliance

### Strategic / Indirect Dependencies
- `07-apis-integration.md` - APIs & Integration Requirements
- `17-error-handling.md` - Error Handling, Logging & Monitoring
- `18-backup-recovery.md` - Backup & Disaster Recovery
- `36-user-privacy-settings.md` - User Privacy Controls & Settings

---

# PRD Section 19: Data Security & Privacy Policies

## 1. Executive Summary

This document specifies the comprehensive data security and privacy architecture for the SyncWell application. In the health data space, trust is the foundation of the product. This document codifies our commitment to protecting user data through a "privacy-first" design philosophy and a robust, multi-layered security strategy.

This internal specification is a blueprint for the **engineering team** to implement state-of-the-art security measures. It is the technical foundation for the public-facing Privacy Policy.

## 2. Guiding Principles

*   **Data Minimization:** We only request and handle data that is absolutely essential.
*   **Privacy by Design:** The system is architected from the ground up to protect user data.
*   **Ephemeral Backend Processing:** This is our core privacy promise. SyncWell's backend services **never persist user health data**. Health data is only ever held in-memory on our backend servers during an active sync job and is immediately discarded.
*   **Radical Transparency:** We are open and honest with users about what data we handle and why.

## 3. Threat Modeling & Countermeasures

| Threat Scenario | Description | Countermeasure(s) |
| :--- | :--- | :--- |
| **Backend Server Compromise** | An attacker gains access to the backend infrastructure. | - **Strict IAM Roles & Least Privilege:** All compute services (Lambda functions) have narrowly scoped roles that grant access only to the specific resources they need. <br>- **AWS Secrets Manager:** User OAuth tokens are stored encrypted in a dedicated, secure service. <br>- **VPC & Security Groups:** Backend services are isolated from the public internet where possible. <br>- **Regular Audits & Pen Testing:** Proactively identify and fix vulnerabilities. |
| **Compromised Device** | A malicious actor gains root/jailbreak access to the user's device. | - **Keychain/Keystore:** This is the primary countermeasure for protecting on-device secrets, as it utilizes hardware-backed secure storage. <br>- **Jailbreak/Root Detection (Defense-in-Depth):** The app will make a best effort to detect if it is running on a compromised OS. While this is not a foolproof countermeasure and can be bypassed, it serves as a valuable deterrent and an additional layer of security. |
| **Man-in-the-Middle (MitM) Attack** | An attacker intercepts traffic between the app and the backend. | - **TLS 1.2+:** All network traffic is encrypted. This is the primary and sufficient countermeasure for the MVP. <br>- **(Future) Dynamic Certificate Pinning:** While providing an additional layer of security, dynamic certificate pinning adds significant operational complexity and risk (e.g., "bricking" older app versions). This feature is **deferred for the MVP** and will be re-assessed for a future release when the product's risk profile justifies the added complexity. |
| **Insecure Data Storage** | Sensitive data is stored insecurely. | - **Backend:** All user tokens are stored encrypted in AWS Secrets Manager. <br>- **On-Device:** The local settings database is encrypted. |
| **Vulnerable Third-Party Dependency (Supply Chain Attack)** | A library used by the app or backend has a known security vulnerability, or a build tool/dependency is compromised. | - **Automated Dependency Scanning:** The CI/CD pipeline will use Snyk/Dependabot to scan for known CVEs. <br>- **Dependency Pinning:** All dependencies will be pinned to specific, audited versions. <br>- **Reproducible Builds:** Build environments will be scripted and version-controlled to detect unauthorized changes. |
| **AI Service Data Poisoning or Leakage** | The future AI Insights Service is attacked, either by "poisoning" the training data to produce incorrect results, or by an attacker crafting inputs to extract information about the model or other users' data. | - **Ephemeral Processing:** The AI service will process data ephemerally, just like the core sync engine. <br>- **Input Sanitization:** All inputs to the AI service will be strictly sanitized and validated. <br>- **Model Monitoring:** The outputs of the AI models will be monitored for anomalous results or statistical drift. <br>- **Data Provenance:** The training data for any future ML models will come from trusted, audited sources. |

## 4. Data Flow & Classification

*   **Class 1: Health Data (In-Memory, Ephemeral):** The user's actual health data (steps, etc.).
    *   **Flow:** Read from a source API -> Processed in-memory on a backend worker task OR on-device -> Written to a destination API.
    *   **Storage:** **NEVER** stored at rest on SyncWell servers. It is discarded from memory immediately after the job completes.
*   **Class 2: Sensitive Credentials (OAuth Tokens):**
    *   **Flow:** Acquired via a secure hybrid flow, where the mobile app gets an auth code and the backend exchanges it for tokens.
    *   **Storage:** Stored encrypted at rest in **AWS Secrets Manager**, tightly controlled by IAM policies.
*   **Class 3: Configuration & Metadata:** User sync settings and job metadata.
    *   **Flow:** Settings are created by the user and sent to the backend.
    *   **Storage:** Stored in DynamoDB. Does not contain any raw health data.

### Data Security Flow Diagram
```mermaid
graph TD
    subgraph User Device
        A[Mobile App]
        B[Secure Keystore/Keychain]
    end
    subgraph AWS Backend
        C[API Gateway]
        D[Worker Lambdas]
        E[AWS Secrets Manager]
        F[DynamoDB]
    end
    subgraph External
        G[3rd Party APIs]
    end

    A -- User Auth --> G
    A -- Sends Auth Code to --> C
    C --> D
    D -- Exchanges Code for Tokens --> G
    G -- Tokens --> D
    D -- Stores Tokens in --> E
    D -- Stores Config in --> F
    D -- Gets Tokens from --> E
    D -- Syncs Data with --> G
```

The following workflow describes the secure process of acquiring and using credentials for a third-party service:
1.  The user initiates the authentication flow from the **Mobile App**, which directs them to the third-party service's login page.
2.  After successful authentication, the third-party service redirects back to the app with a short-lived authorization code.
3.  The Mobile App sends this authorization code to the SyncWell backend via the secure **API Gateway**.
4.  A **Worker Lambda** receives the code.
5.  The Worker Lambda makes a backend call to the third-party service's API, exchanging the authorization code for a long-lived refresh token and a short-lived access token.
6.  These tokens are immediately stored securely in **AWS Secrets Manager**, encrypted at rest. The `CredentialArn` is stored in DynamoDB.
7.  For subsequent sync jobs, the Worker Lambda retrieves the required tokens from Secrets Manager using its IAM role to communicate with the **3rd Party APIs** on the user's behalf.

## 5. Credential Lifecycle Management

The lifecycle of user credentials is managed by the backend to maximize security.

*   **Creation:** Tokens are acquired via the secure hybrid OAuth 2.0 flow detailed in `07-apis-integration.md`.
*   **Storage:** Tokens are stored encrypted in **AWS Secrets Manager**.
*   **Usage:** Worker Lambda functions are granted temporary, role-based access to retrieve the tokens they need for a specific job.
*   **Deletion:** When a user de-authorizes an app via the mobile client:
    1.  The mobile app sends a "revoke" request to the SyncWell backend.
    2.  The backend retrieves the token from Secrets Manager.
    3.  The backend calls the service provider's `revoke` endpoint to invalidate the token.
    4.  The backend permanently deletes the token from Secrets Manager.

## 6. Backend and API Security

The backend is a core component and must be secured accordingly.

*   **Authentication:** Communication between the mobile app and our backend API Gateway will be authenticated using short-lived JSON Web Tokens (JWTs) or a similar standard.
*   **Secure JWT Validation:** The Lambda Authorizer is a security-critical component. To avoid common pitfalls in security implementation ("don't roll your own crypto"), the authorizer **must** use a well-vetted, open-source library for JWT validation. A library like **AWS Lambda Powertools** will be used to handle the complexities of fetching the JWKS, validating the signature, and checking standard claims (`iss`, `aud`, `exp`).
*   **Authorization:** All backend compute services (API Gateway and Lambda functions) will use strict IAM roles, adhering to the principle of least privilege. A worker for Fitbit should not have access to Garmin tokens.
*   **Authorizer Policy Caching:** The architecture uses API Gateway's built-in authorizer caching to improve performance. From a security perspective, the Time-to-Live (TTL) of this cache represents a window during which a user's permissions might be stale. For example, if a user's access is revoked, they may retain access until the cached policy expires. The TTL will be set to a short duration (e.g., 5 minutes) as a balance between performance and security responsiveness.
*   **Network Security:** Services are isolated in a Virtual Private Cloud (VPC). To ensure traffic between our backend Lambda functions and other AWS services (like DynamoDB, SQS, and Secrets Manager) does not traverse the public internet, we use **VPC Endpoints**. This creates a private, secure connection to these services from within our VPC, reducing the attack surface and preventing potential data exposure. Access to databases and secret stores is restricted to services within the VPC via security groups and network ACLs. Furthermore, to control outbound traffic from the VPC to third-party APIs, an **AWS Network Firewall** will be implemented. This acts as an egress filter, configured with an allow-list of the specific domain names of our required partners (e.g., Fitbit, Strava). This enforces the principle of least privilege at the network layer and provides a critical defense-in-depth measure against potential data exfiltration or communication with malicious domains in the event of a compromised worker.
*   **Logging & Monitoring:** All API calls and backend activity will be logged and monitored for anomalous behavior using services like AWS CloudTrail and CloudWatch. All logs will be scrubbed of sensitive data before being persisted.

### 6.1. Secure Logging Practices

To comply with privacy regulations like GDPR and to protect user anonymity, our logging strategy will adhere to the following principles:

*   **No Persistent User Identifiers:** We will **not** log the permanent `userId` in any backend service. Logging unique identifiers that can be tied to a specific person is a violation of our privacy promise and can be a legal liability.
*   **Use of Correlation IDs:** For debugging and tracing purposes, each request will be assigned a temporary, randomly generated `correlationId`. This ID can be used to trace a single request's journey through our backend systems. This ID will have no link to the user's permanent ID and should be considered ephemeral.
*   **Strict PII Scrubbing:** All logging libraries and services will be configured with strict scrubbing rules to remove any potential PII (names,emails, locations, etc.) that might accidentally be captured in error messages or stack traces.

#### 6.1.1. "Break-Glass" Procedure for User-Specific Debugging

While `userId` is never logged by default, a critical operational gap exists for debugging specific user-reported issues. To address this for the MVP, a secure, manual, and fully-audited "break-glass" procedure will be used. Building a fully-featured internal tool is deferred as a post-launch enhancement.

*   **Security Requirements:** This procedure, despite being manual, must adhere to strict security controls.
    *   **Authentication:** The engineer running the procedure must authenticate to AWS via SSO with mandatory MFA.
    *   **Peer Review:** The script to be run and the parameters to be used (`userId`, `ticketId`) must be submitted as a pull request and receive approval from a second authorized engineer (the "Four-Eyes" principle).
    *   **Immutable Auditing:** All actions performed via the AWS console or CLI are logged by default in AWS CloudTrail. This provides a permanent, immutable audit log of who ran what, and when.

*   **MVP Workflow:**
    1.  **Request:** An authorized support engineer, working on a specific support ticket (e.g., `TICKET-123`), identifies the need to debug for a specific `userId`.
    2.  **Approval:** The engineer creates a pull request containing the script to be run (e.g., a simple AWS CLI command to query a purpose-built lookup index) and the `userId` as a parameter. A second authorized engineer reviews the PR, verifies the legitimacy of the support ticket, and approves the PR.
    3.  **Execution:** Once approved, the engineer executes the peer-reviewed script from their local machine using their MFA-authenticated AWS credentials. The script performs a temporary lookup to find recent `correlationId`s associated with that `userId`.
    4.  **Debugging:** The engineer uses the retrieved `correlationId`s to find the relevant logs in CloudWatch to diagnose the issue. The mapping between `userId` and `correlationId` is not stored permanently; it is only available for a short time in the secure lookup index as described below.
*   **Future Enhancement:** Post-launch, this manual process will be replaced by a dedicated internal web tool that automates the approval and lookup workflow, but the core security principles (MFA, peer approval, auditing) will remain the same.

#### 6.1.2. Break-Glass Lookup Index Design

The "purpose-built lookup index" is a critical component of the break-glass procedure. It will be implemented as a dedicated, highly secure DynamoDB table with the following characteristics:

*   **Table Name:** `SyncWellBreakGlassIndex`
*   **Primary Key:**
    *   **Partition Key (PK):** `USER#{userId}`
    *   **Sort Key (SK):** `TIMESTAMP#{timestamp}`
*   **Attributes:**
    *   `correlationId`: The correlation ID for a specific request.
    *   `ttl`: An epoch timestamp for automatic deletion.
*   **Time-to-Live (TTL):** The `ttl` attribute will be enabled on this table. All items written to this table **must** have a TTL of **24 hours**. This ensures that the mapping between a user's permanent ID and their temporary correlation IDs is automatically and permanently deleted after a short period, enforcing the principle of data minimization.
*   **Population:** The `AuthorizerLambda` at the API Gateway entrypoint will be the only component responsible for writing to this table. Upon successfully validating a user's JWT, it will write a new item containing the `userId` and the newly generated `correlationId` for that request.
*   **Security:** Access to this table will be extremely restricted via IAM policies. Only the `AuthorizerLambda` will have write permissions. Read permissions will only be granted to a specific IAM role that can only be assumed by authorized engineers performing the peer-reviewed break-glass procedure.

## 7. Pre-Launch Security Audit Checklist

### Data Storage & Cryptography
*   [ ] User OAuth tokens are stored encrypted in AWS Secrets Manager.
*   [ ] The on-device database is encrypted.
*   [ ] No sensitive data (tokens, health data) is written to application or backend logs.

### Network Communication
*   [ ] All network traffic uses TLS 1.2+.
*   [ ] Backend services are properly isolated in a VPC.
*   [ ] Certificate Pinning is confirmed as deferred for MVP to manage operational risk.

### Authentication & Authorization
*   [ ] Mobile-to-backend communication is authenticated (e.g., via JWTs).
*   [ ] IAM roles follow the principle of least privilege.
*   [ ] The de-authorization process is robust and deletes tokens from the backend.

### Code Quality & Build Settings
*   [ ] The app is obfuscated in production builds.
*   [ ] All third-party dependencies (mobile and backend) have been scanned for known vulnerabilities.

## 8. Data Portability and Deletion

To comply with privacy regulations such as GDPR, the system must provide users with the ability to export their data and to permanently delete their account and all associated information. These flows are critical for user trust and legal compliance.

### 8.1. User Data Export

Users will be able to request an export of all their configuration data stored by SyncWell.

*   **Workflow:**
    1.  A user initiates a data export from the app settings.
    2.  The app sends a request to a dedicated backend API endpoint.
    3.  A `DataExportLambda` is triggered, which queries the `SyncWellMetadata` table in DynamoDB to retrieve all items associated with that `USER#{userId}`.
    4.  The function formats this data into a human-readable JSON file.
    5.  The JSON file is saved to a secure, private S3 bucket with a randomly generated, time-limited path.
    6.  The user is sent a push notification (see `29-notifications-alerts.md`) with a secure, pre-signed S3 URL to download their data export. This URL will have a short expiry (e.g., 24 hours).

### 8.2. Account Deletion ("Right to be Forgotten")

Users will have a clear and irreversible option to delete their account. This process must be comprehensive, ensuring all user-related metadata and credentials are purged from our systems.

*   **Workflow:**
    1.  A user confirms their intent to delete their account from the app settings. This is a high-friction action requiring re-authentication.
    2.  The app sends a request to a dedicated `DELETE /v1/user/me` endpoint.
    3.  An `AccountDeletionLambda` is triggered with the user's validated `userId`.
    4.  The Lambda function executes a "scorched earth" policy in the following order:
        a. **Revoke and Delete Credentials:** It iterates through all `CONN#{connectionId}` items for the user. For each, it retrieves the `CredentialArn`, fetches the tokens from AWS Secrets Manager, calls the third-party provider's token revocation endpoint, and then permanently deletes the secret from Secrets Manager.
        b. **Delete DynamoDB Data:** It deletes all items from the `SyncWellMetadata` table with the partition key `USER#{userId}`. This includes the user profile, all connections, and all sync configurations.
    5.  Once the process is complete, the user is logged out of the mobile app.

*   **Data in Backups:** User data will remain in DynamoDB backups (e.g., PITR) for their retention period (e.g., 35 days). This is an accepted practice under GDPR, provided the data is not used for any purpose and is overwritten in due course. This will be clearly stated in our public privacy policy.
*   **Access Control and Least Privilege:** Access to all backend resources is governed by the principle of least privilege. We use AWS Identity and Access Management (IAM) to enforce this.
    *   **Granular IAM Roles:** Each backend compute service (Lambda function) will have its own unique IAM role with a narrowly scoped policy. For example, a worker for a specific third-party service is only granted permission to access the specific secrets and DynamoDB records relevant to its task. It cannot access resources related to other services.
    *   **Resource-Based Policies:** Where applicable, resource-based policies are used as an additional layer of defense. For example, the AWS Secrets Manager secret containing third-party tokens will have a resource policy that only allows access from the specific IAM roles of the worker Lambdas that need it.
