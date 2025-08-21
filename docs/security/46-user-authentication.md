## Dependencies

### Core Dependencies
- `06-technical-architecture.md` - Technical Architecture
- `19-security-privacy.md` - Security & Privacy

### Strategic / Indirect Dependencies
- `08-ux-onboarding.md` - UX Onboarding
- `36-user-privacy-settings.md` - User Privacy Settings

---

# PRD Section 46: User Authentication (Deep Dive)

## 1. Introduction
User authentication is the foundation of a personalized and secure user experience in SyncWell. It allows users to create and access their accounts, manage their data synchronization settings, and subscribe to premium features. This document outlines the requirements for a robust, secure, and user-friendly authentication system that supports multiple sign-in methods.

## 2. Authentication Methods & User Flows

### 2.1. Detailed Email Sign-Up Flow
1.  **User Action:** User taps "Sign Up with Email".
2.  **UI:** App presents a form with fields for "Email," "Password," and "Confirm Password."
3.  **Validation (Client-Side):**
    -   Email field must be a valid email format.
    -   Password must meet the criteria defined in the **Password Policy Specification (Section 3)**.
    -   "Confirm Password" must match "Password."
4.  **API Call:** App sends a `POST /v1/auth/signup` request with the email and password.
5.  **Backend:**
    -   Verifies the email is not already in use.
    -   Hashes the password using bcrypt.
    -   Creates a new user record in the database.
    -   Generates a JWT (JSON Web Token) pair (access and refresh tokens).
6.  **Response:** Backend returns the JWT pair to the client.
7.  **Client Action:** The client securely stores the tokens (see **Session & Token Management, Section 4**) and navigates the user to the main app screen, now in a logged-in state.

### 2.2. Detailed Email Sign-In Flow
1.  **User Action:** User taps "Sign In."
2.  **UI:** App presents a form with fields for "Email" and "Password."
3.  **API Call:** App sends a `POST /v1/auth/login` request.
4.  **Backend:**
    -   Finds the user by email.
    -   Compares the provided password with the stored hash.
    -   If valid, generates a new JWT pair.
5.  **Response:** Returns the JWT pair. If invalid, returns a `401 Unauthorized` error.
6.  **Client Action:** On success, stores tokens and proceeds. On failure, displays an error: "Invalid email or password."

### 2.3. Google Sign-In Deep Dive
1.  **User Action:** User taps "Sign in with Google."
2.  **Client Action:** The app initiates the Google Sign-In flow using the native Google SDK.
3.  **UI (Google):** The Google SDK presents a native consent screen, asking the user to choose an account and grant permission for SyncWell to access their basic profile info (email, name).
4.  **Client Action:** Upon user consent, the Google SDK provides an `id_token` to the app.
5.  **API Call:** The app sends this `id_token` to the backend: `POST /v1/auth/google`.
6.  **Backend:**
    -   Uses the Google API client library to verify the `id_token`'s signature and expiration.
    -   Extracts the user's email, name, and profile picture URL.
    -   Performs an "upsert": If a user with this email exists, log them in. If not, create a new user account with the info from Google.
    -   Generates a SyncWell JWT pair.
7.  **Response:** Returns the SyncWell JWT pair to the client for session management.

### 2.4. Apple Sign-In Deep Dive
1.  **User Action:** User taps "Sign in with Apple."
2.  **Client Action:** The app initiates the native "Sign in with Apple" flow.
3.  **UI (Apple):** The OS presents the native Apple Sign-In sheet.
4.  **User Choice:** The user can choose to share their real email or use Apple's private email relay service.
5.  **Client Action:** Upon user consent, the OS provides an identity token and user details to the app.
6.  **API Call:** The app sends the identity token to the backend: `POST /v1/auth/apple`.
7.  **Backend:**
    -   Verifies the token with Apple's public key.
    -   Handles the logic for both real and private relay emails.
    -   Performs an "upsert" similar to the Google flow.
    -   Generates a SyncWell JWT pair.
8.  **Response:** Returns the SyncWell JWT pair to the client.

## 3. Password Policy Specification
To ensure account security, all user-created passwords must adhere to the following policy, enforced on both client and server-side:
-   **Minimum Length:** 10 characters.
-   **Complexity:** Must contain at least 3 of the following 4 categories:
    -   Uppercase letters (A-Z)
    -   Lowercase letters (a-z)
    -   Numbers (0-9)
    -   Special characters (`!@#$%^&*()_+-=[]{}\|;':",./<>?`)
-   **Breached Password Check:** The password will be checked against a list of known breached passwords (e.g., using the "Have I Been Pwned" API) and rejected if it is compromised.

## 4. Session & Token Management Strategy
-   **Token Type:** We will use JSON Web Tokens (JWTs).
-   **Access Token:** Short-lived (15 minutes). Stored in memory on the client. Sent with every API request.
-   **Refresh Token:** Long-lived (30 days). Stored securely in the device's Keychain/Keystore. Used only to get a new access token when the old one expires.
-   **Refresh Flow:**
    1.  App makes an API call with an expired access token.
    2.  Backend responds with `401 Unauthorized`.
    3.  Client-side interceptor catches the 401, sends the refresh token to a `POST /v1/auth/refresh` endpoint.
    4.  Backend validates the refresh token, issues a new JWT pair.
    5.  Client stores the new tokens and retries the original API request.
-   **Logout:** When a user logs out, both the access and refresh tokens are deleted from the client, and the refresh token is invalidated on the backend.

## 5. Comprehensive Error Handling Table
| Scenario | Error Code | User-Facing Message |
| :--- | :--- | :--- |
| Invalid email/password | `401 Unauthorized` | "Invalid email or password. Please try again." |
| Email already exists on sign-up | `409 Conflict` | "An account with this email already exists. Please sign in." |
| Invalid social token | `401 Unauthorized` | "Authentication with Google/Apple failed. Please try again." |
| Server error during auth | `500 Internal Server Error` | "Something went wrong on our end. Please try again in a few minutes." |
| Password reset token expired | `400 Bad Request` | "This password reset link has expired. Please request a new one." |

## 6. Security Threat Model Analysis
| Threat | Mitigation |
| :--- | :--- |
| **Credential Stuffing** | Use of a CAPTCHA after several failed login attempts from the same IP. Breached password checking prevents users from choosing common passwords. |
| **Token Hijacking (XSS/CSRF)** | As a mobile app, we are less vulnerable to web-based XSS/CSRF. However, storing refresh tokens in the secure Keychain/Keystore (not in `localStorage` equivalent) is the primary mitigation. |
| **Brute-force Attack** | Rate limiting on login and password reset endpoints. Account lockout after a high number of failed attempts. |
| **Insecure Data Transmission** | Enforcing TLS 1.2+ for all API communication. |

## 7. Auth Service Provider Comparison
| Provider | Pros | Cons |
| :--- | :--- | :--- |
| **Firebase Auth** | Excellent SDKs, completely free at our initial scale, integrates seamlessly with other Firebase products (FCM, Analytics). | Less vendor-neutral. |
| **AWS Cognito** | Highly scalable, integrates with the AWS ecosystem. | More complex to configure, SDKs are considered less developer-friendly than Firebase's. |
| **Auth0** | Very powerful and flexible, great documentation and developer experience. | Most expensive option by far, not cost-effective for a B2C app at our stage. |
| **Decision:** **Firebase Authentication** is the clear choice for V1 due to its zero cost at our scale, ease of use, and tight integration with our planned analytics and push notification stack.

## 8. Future Authentication Methods
This section is for future planning and is not part of the V1 scope.
-   **Passkeys / WebAuthn:** The future of passwordless authentication. We should plan to adopt this once it has wider support and clear implementation patterns for mobile apps.
-   **Magic Links:** Email-based sign-in without a password. This can be a great, low-friction alternative, and we should consider adding it if users show resistance to social logins.

## 9. Functional Requirements (Summary)
| ID | Requirement | Description | Priority |
| :--- | :--- | :--- | :--- |
| **AUTH-F-01** | **Email/Password Sign-Up** | Users must be able to create an account using their email address and a secure password. | **High** |
| **AUTH-F-02** | **Email/Password Sign-In** | Registered users must be able to sign in with their email and password. | **High** |
| **AUTH-F-03** | **Social Sign-In (Google)** | Users must be able to sign up and sign in using their Google account for a seamless experience. | **High** |
| **AUTH-F-04** | **Social Sign-In (Apple)** | Users must be able to sign up and sign in using their Apple ID, complying with App Store guidelines. | **High** |
| **AUTH-F-05** | **Password Reset** | Users must be able to securely reset their password via an email link if they forget it. | **High** |
| **AUTH-F-06** | **Account Linking** | If a user signs up with email and later uses a social provider with the same email, the accounts should be linked. | **Medium** |
| **AUTH-F-07** | **Persistent Login** | Users should remain logged in across app sessions until they explicitly log out. | **High** |
| **AUTH-F-08** | **Explicit Logout** | Users must have a clear option to log out of their account from the app settings. | **High** |

## 10. Non-Functional Requirements (Summary)
| ID | Requirement | Description |
| :--- | :--- | :--- |
| **AUTH-NF-01** | **Security** | All authentication tokens (e.g., JWTs, OAuth tokens) must be stored securely in the device's Keychain/Keystore. All communication with the backend must use TLS 1.2+. Passwords must be hashed using a strong, salted algorithm (e.g., Argon2, bcrypt). |
| **AUTH-NF-02** | **Performance** | The authentication process (from user tap to signed-in state) should complete in under 3 seconds on a standard network connection. |
| **AUTH-NF-03** | **Reliability** | The authentication service must have an uptime of >99.9%. |
| **AUTH-NF-04** | **Usability** | The sign-in and sign-up flows must be intuitive and require minimal user effort, following platform-specific best practices. |

## 11. Analysis & Calculations
### 11.1. Impact on Conversion Rate
-   **Hypothesis:** Providing social login options (Google, Apple) in addition to email/password will significantly reduce friction during sign-up and increase the user conversion rate.
-   **Industry Benchmark:** Studies from sources like Web3Auth and Auth0 suggest that adding social logins can increase sign-up conversion rates by 20% to 40%.
-   **Calculation:**
    -   Let's assume a baseline conversion rate of **5%** for email-only sign-up (i.e., 5 out of 100 app installs lead to a created account).
    -   We will target a conservative **25% improvement** in this rate by adding social logins.
    -   *Projected New Conversion Rate* = 5% * (1 + 0.25) = **6.25%**.
-   **KPI:** This will be tracked against the "Onboarding Completion Rate" KPI defined in `01-context-vision.md`.

### 11.2. Choice of Social Providers
-   **Google:** Essential for the Android user base. It is the most common social login provider on the Android platform.
-   **Apple:** Mandatory for iOS apps that offer third-party sign-in, according to App Store Review Guideline 4.8. Failure to include "Sign in with Apple" when other social logins are present is a common cause for app rejection.
-   **Facebook/Other:** While Facebook has a large user base, its developer platform has been subject to privacy-related controversies. We will defer implementation of other providers to gauge user demand post-launch, minimizing initial complexity and potential security surface area.

### 11.3. Cost Analysis
-   **Authentication Service:** We will use a managed authentication service like Firebase Authentication or AWS Cognito.
-   **Cost Calculation (Firebase Auth):**
    -   Firebase Authentication is **free** for the first 50,000 Monthly Active Users (MAU).
    -   For users beyond that, the cost is tiered, but it is extremely low (e.g., $0.0055 per user per month in the 50k-100k tier).
    -   **Conclusion:** For the first 1-2 years of operation, the direct cost of the authentication service is expected to be **$0**. This makes it a highly cost-effective solution.

## 12. Out of Scope
-   Two-Factor Authentication (2FA).
-   Support for other social providers (e.g., Facebook).
-   Implementation of Passkeys or Magic Links in V1.
