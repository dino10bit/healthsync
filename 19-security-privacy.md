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

This document specifies the comprehensive data security and privacy architecture for the SyncWell application. In the health data space, trust is not a feature; it is the foundation of the entire product. This document codifies our commitment to protecting user data through a "privacy-first" design philosophy and a robust, multi-layered security strategy.

This internal specification serves two purposes: it is a blueprint for the **solo developer** to implement state-of-the-art security measures, and it is a testament to **investors** of the project's deep commitment to responsible data stewardship. It is the technical foundation for the public-facing Privacy Policy.

## 2. Guiding Principles

*   **Data Minimization:** We only request and handle data that is absolutely essential for the app's functionality.
*   **Privacy by Design:** Privacy is not an add-on. The system is architected from the ground up to protect user data.
*   **Zero Server-Side Health Data:** This is our core privacy promise. SyncWell operates as a secure, on-device data conduit. We **never** see, store, or process user health data on our servers.
*   **Radical Transparency:** We are open and honest with users about what data we handle and why.

## 3. Threat Modeling & Countermeasures

We will proactively model potential threats and define specific countermeasures.

| Threat Scenario | Description | Countermeasure(s) |
| :--- | :--- | :--- |
| **Compromised Device** | A malicious actor gains root/jailbreak access to the user's device. | - **Keychain/Keystore:** Use the most secure, hardware-backed storage for OAuth tokens. <br>- **Jailbreak/Root Detection:** The app will detect if it is running on a compromised device and may limit functionality or warn the user. |
| **Man-in-the-Middle (MitM) Attack** | An attacker on the same network intercepts traffic between the app and an API. | - **TLS 1.2+:** All network traffic is encrypted. <br>- **Certificate Pinning:** For calls to our own minimal backend, we will implement certificate pinning to ensure the app is talking to our legitimate server, not an imposter. |
| **OAuth CSRF Attack** | An attacker tricks a user into clicking a malicious link that initiates the OAuth flow, attempting to link the user's health data to an attacker-controlled account. | - **State Parameter:** Use a unique, unguessable `state` parameter in the OAuth 2.0 authorization request and validate it upon callback. This is a requirement for **US-02**. |
| **Insecure Data Storage** | Sensitive data (tokens, settings) is stored insecurely on the device's file system. | - **Keychain/Keystore for Tokens.** <br>- **Database Encryption:** The local Realm database containing user settings will be encrypted. |
| **Data Leakage via Export** | A user inadvertently shares a CSV export or cloud backup containing sensitive health data with an untrusted party. | - **Clear Warnings:** The UI must clearly warn the user about the sensitivity of the data they are exporting (**US-21**, **US-28**).<br>- **No Auto-Sharing:** The app must use the OS Share Sheet and not send the data anywhere automatically. The user is in full control of the destination. |
| **Re-identification from Anonymized Data** | An attacker with external data could potentially re-identify a user from the aggregated community statistics. | - **Strong Anonymization:** Use k-anonymity techniques. Do not show statistics for any group with fewer than N (e.g., 100) users. <br>- **Data Perturbation:** Add a small amount of random noise to aggregated results to further prevent re-identification. This is critical for **US-36**. |
| **Insecure Voice Integration** | Voice commands could be captured by a malicious app or on an insecure device. | - **On-Device Processing:** Use on-device speech recognition where possible.<br>- **Limited Actions:** Only allow non-destructive read-only commands via voice (e.g., "When did my last sync run?"). Do not allow de-authorization or deletion via voice (**US-34**). |
| **Vulnerable Third-Party Dependency** | A library used by the app has a known security vulnerability. | - **Automated Dependency Scanning:** The CI/CD pipeline will use Snyk to automatically scan for and flag known vulnerabilities in our dependencies. <br>- **Minimize Dependencies:** Keep the number of third-party libraries to a minimum. |

## 4. Data Flow & Classification

To ensure clarity, we classify data into four categories:

*   **Class 1: Health Data (In-Memory):** The user's actual health and fitness data (steps, heart rate, etc.) as it is being processed.
    *   **Flow:** Read from a source API -> Processed in-memory on-device -> Written to a destination API.
    *   **Storage:** **NEVER** stored at rest by SyncWell, only held in memory during an active sync job.
*   **Class 1a: Health Data (At Rest, External):** Health data that the user explicitly exports.
    *   **Flow:** Read from source API -> Formatted on-device into a file (CSV/JSON) -> Handed off to OS Share Sheet (**US-28**) or uploaded to user's personal cloud storage (**US-21**).
    *   **Storage:** The app may temporarily cache this data during the export process, but this cache must be securely wiped immediately after the export is complete. The app is not responsible for the data after the user has saved it externally.
*   **Class 2: Sensitive Credentials:** OAuth 2.0 tokens.
    *   **Flow:** Received from provider -> Stored in Keychain/Keystore -> Used for API calls.
    *   **Storage:** Exclusively in the hardware-backed Keychain/Keystore.
*   **Class 3: Configuration & Analytics Data:** User sync settings and anonymous analytics.
    *   **Definition:** This includes sync configurations (source app, destination app, data types), user preferences (e.g., "run only while charging," sync priority), and anonymous analytics events (e.g., `onboarding_completed`, `sync_job_failed`).
    *   **Flow:** Settings are created by the user and stored locally. Analytics are sent to Firebase.
    *   **Storage:** Settings are stored in the encrypted on-device database. Analytics data is stored in Firebase.
*   **Class 4: Health Data (In Notification):** Health data displayed in a push notification.
    *   **Flow:** Data is read from the source, a summary is generated, and it is displayed in a local push notification (**US-24**, **US-31**).
    *   **Storage:** The notification content may be stored temporarily by the operating system. Notifications should not contain highly sensitive data and should be cleared after being read.
*   **Class 5: Anonymized & Aggregated Data:** Data used for community statistics.
    *   **Flow:** Anonymized data points (e.g., "a sync happened") are sent to a secure backend. The backend aggregates this data. The app can then query the aggregated results.
    *   **Storage:** The raw anonymized events are stored on the backend for a limited time for aggregation, then deleted. Only the final aggregated results are stored long-term. This is required for **US-36**.

### 4.1. OAuth2 Security
As detailed in **US-02**, the OAuth 2.0 implementation must follow best practices:
*   The `state` parameter will be used to prevent Cross-Site Request Forgery (CSRF).
*   The `redirect_uri` will be strictly validated against a whitelist of allowed URIs.
*   The in-app browser used for the flow must be secure (e.g., `SFSafariViewController` on iOS) and not allow for credential snooping or script injection.

## 5. Credential Lifecycle Management
Per **US-13**, the lifecycle of user credentials must be managed securely.
*   **Creation:** Tokens are acquired via the OAuth 2.0 flow.
*   **Storage:** Tokens are stored exclusively in the hardware-backed `Keystore`/`Keychain`.
*   **Deletion:** When a user de-authorizes an app, the app MUST:
    1.  Make an API call to the service provider's `revoke` endpoint to invalidate the token on the server side.
    2.  Perform a secure wipe of the access and refresh tokens from the local `Keystore`/`Keychain`. This action must be irreversible.

## 6. Privacy Impact Assessment (PIA) Process

Before any new feature that handles a new type of data is developed, a mini-PIA will be conducted by answering the following questions:
1.  What new data is being collected/processed?
2.  Why is it necessary for the feature to function?
3.  How will it be secured in transit and at rest?
4.  Will this data be shared with any new third parties?
5.  How can the user control or delete this data?
6.  Does this change require an update to the Privacy Policy?

## 6. Pre-Launch Security Audit Checklist

The following audit, based on the OWASP MASVS, will be performed before the MVP launch.

### Data Storage & Cryptography
*   [ ] All sensitive data (tokens) is stored exclusively in the Keychain/Keystore.
*   [ ] The local database is encrypted.
*   [ ] No sensitive data is written to application logs.
*   [ ] The app properly clears any sensitive data from memory after use.

### Network Communication
*   [ ] All network traffic uses TLS 1.2+.
*   [ ] Certificate pinning is correctly implemented for backend communication.

### Authentication & Authorization
*   [ ] OAuth 2.0 with PKCE is used for all cloud-based integrations.
*   [ ] The OAuth `state` parameter is used and validated correctly (**US-02**).
*   [ ] The token refresh mechanism is secure.
*   [ ] The de-authorization process calls the provider's `revoke` endpoint and securely wipes local tokens (**US-13**).
*   [ ] For integrations that require file access (e.g., Cloud Backup, **US-21**), the app requests the narrowest possible permission scope.
*   [ ] Shared configuration templates (**US-35**) are stripped of all user-identifying information before being shared.

### Code Quality & Build Settings
*   [ ] The app is obfuscated in production builds.
*   [ ] The app has jailbreak/root detection mechanisms.
*   [ ] All third-party dependencies have been scanned for known vulnerabilities.

## 7. Optional Visuals / Diagram Placeholders

*   **[Diagram] Data Flow Diagram (DFD):** A detailed DFD showing the three classes of data and how they flow between the user, the mobile app, the secure storage, third-party APIs, and the minimal backend.
*   **[Table] Threat Model:** A more detailed version of the table in Section 3, including risk ratings (Probability/Impact) for each threat.
*   **[Checklist] Pre-Launch Security Audit:** A full, detailed checklist based on Section 6 that can be used to track the audit process.

## 8. Backend and API Security (Future)
While the MVP is designed to be client-only, future features like the Family Plan (**US-18**) and Community Statistics (**US-36**) will require a backend. This section will be expanded to include:
*   API authentication and authorization (e.g., JWTs).
*   Server hardening procedures.
*   Database security and encryption at rest.
*   Robust anonymization and aggregation pipeline design.
*   Protection against common web vulnerabilities (OWASP Top 10).
