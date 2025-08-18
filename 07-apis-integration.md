## Dependencies

### Core Dependencies
- `06-technical-architecture.md` - Technical Architecture, Security & Compliance
- `19-security-privacy.md` - Data Security & Privacy Policies
- `20-compliance-regulatory.md` - Legal & Regulatory Compliance
- `32-platform-limitations.md` - Platform-Specific Limitations
- `33-third-party-integration.md` - Third-Party Integration Strategy

### Strategic / Indirect Dependencies
- `05-data-sync.md` - Data Synchronization & Reliability
- `15-integration-testing.md` - Integration & End-to-End Testing
- `21-risks.md` - Risks, Constraints & Mitigation
- `40-error-recovery.md` - Error Recovery & Troubleshooting

---

# PRD Section 7: APIs & Integration Requirements

## 1. Executive Summary

This document provides the detailed technical requirements for integrating with third-party Health & Fitness APIs. As these integrations are the lifeblood of SyncWell, a robust, scalable, and maintainable approach is paramount. This document specifies the design of the **`DataProvider`** architecture, the handling of authentication, and the specific endpoints for the MVP integrations.

For the **solo developer**, this document serves as a critical technical playbook. The provider-based architecture isolates the complexity of each API, while the detailed specifications for authentication and token management provide a clear guide for building secure and resilient integrations.

## 2. The `DataProvider` Interface

Each third-party integration will be a self-contained module that implements the following `DataProvider` interface. This ensures consistency and allows the core sync engine to interact with any provider in a standardized way.

```typescript
// Using TypeScript for clear type definitions
import { CanonicalData } from './canonical-models';

interface DataProvider {
  // Returns the unique name of the provider (e.g., "fitbit")
  getName(): string;

  // Handles the full OAuth 2.0 flow. Returns true on success.
  authenticate(): Promise<boolean>;

  // Revokes access and deletes stored tokens.
  revokeAccess(): Promise<void>;

  // Fetches data from the API since the last sync.
  fetchData(dataType: string, since: Date | null): Promise<CanonicalData[]>;

  // Writes canonical data to the API.
  writeData(data: CanonicalData[]): Promise<void>;

  // Checks if a token is expired and refreshes it if necessary.
  // Called automatically before any data fetch/write.
  refreshTokenIfNecessary(): Promise<void>;
}
```

## 3. Authentication: OAuth 2.0 with PKCE

All cloud-based APIs (Fitbit, Garmin, etc.) will use the **OAuth 2.0 Authorization Code Flow with PKCE**. PKCE (Proof Key for Code Exchange) is a security extension that is critical for mobile applications to prevent authorization code interception attacks.

### Authentication Flow Steps:

1.  **Initiate:** The `authenticate()` method in the provider generates a `code_verifier` and a `code_challenge`.
2.  **Open WebView:** The app opens a secure in-app browser (`WebView`) pointed at the provider's OAuth authorization URL, passing the `code_challenge` and other required parameters.
3.  **User Login & Consent:** The user logs in and grants consent within the provider's web page.
4.  **Redirect with Auth Code:** The provider redirects to SyncWell's predefined redirect URI (e.g., `syncwell://oauth-callback`), including a one-time `authorization_code`.
5.  **Handle Redirect:** The app's deep linking mechanism catches this redirect and passes the `authorization_code` back to the provider module.
6.  **Exchange for Tokens:** The provider module makes a secure, direct backend call to the provider's token endpoint, exchanging the `authorization_code` (along with the original `code_verifier`) for an `access_token` and a `refresh_token`.
7.  **Secure Storage:** The provider module stores the `access_token` and `refresh_token` securely in the device's Keychain/Keystore.

## 4. Token Management & Auto-Refresh

*   **Token Expiration:** Access tokens are short-lived (e.g., 1 hour). When an API call is made with an expired token, the API will return an error (typically a 401 Unauthorized status).
*   **Proactive Refresh:** To avoid these errors, the `refreshTokenIfNecessary()` method will be called before any API request. This method will check the stored expiration time of the access token.
*   **Refresh Flow:** If the token is expired (or close to expiring), the provider will make a backend call to the API's token endpoint, sending the long-lived `refresh_token` to get a new `access_token` and a new `refresh_token`. The newly acquired tokens are then stored securely, overwriting the old ones.
*   **Refresh Failure:** If the refresh token flow fails (e.g., the user manually revoked access on the provider's website), the provider must mark the connection as invalid and prompt the user to re-authenticate.

## 5. MVP API Endpoint Mapping

This table provides a specific, actionable list of the primary endpoints to be used for the MVP.

| Platform | Data Type | Read Endpoint | Write Endpoint | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Google Fit** | Steps | `users/me/dataset:aggregate` with `dataTypeName: com.google.step_count.delta` | `users/me/dataSources/.../datasets:patch` | Requires careful construction of the aggregate request body. |
| **Apple Health** | Steps | `HKSampleQuery` for `HKQuantityTypeIdentifier.stepCount` | `HKHealthStore.save()` | Uses the native HealthKit SDK, not a REST API. |
| **Fitbit** | Steps | `1/user/-/activities/steps/date/[date]/1d.json` | `N/A` (Fitbit API is largely read-only for activity data) | Fitbit is primarily a data source. |
| **Garmin** | Steps | `daily-summary-service/daily-summary/...` | `N/A` (API is read-only) | API is undocumented and may require more research. |
| **Strava** | Activities | `athlete/activities` | `activities` | Note: Strava does not provide daily step data via its API. |

## 6. Risk Analysis & Mitigation

(This section remains largely the same but is included for completeness.)

| Risk ID | Risk Description | Probability | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **R-19** | An API provider makes a breaking change, disabling a key integration. | High | High | Implement a robust monitoring and alerting system. The modular provider architecture will allow for rapid, isolated fixes. |
| **R-20** | SyncWell is denied access to a critical API. | Low | High | Have a backup plan to prioritize other integrations. Be transparent with users about the status of API integrations. |
| **R-21** | The complexity of implementing and maintaining numerous providers becomes overwhelming for a solo developer. | Medium | High | Strictly adhere to the provider architecture to ensure maintainability. Automate testing for each provider. |

## 7. Optional Visuals / Diagram Placeholders

*   **[Diagram] Class Diagram:** A diagram showing the `DataProvider` interface and its relationship with concrete provider implementations like `FitbitProvider`.
*   **[Diagram] Sequence Diagram for OAuth 2.0 (PKCE):** A detailed sequence diagram illustrating the entire authentication flow, including the roles of the app, the WebView, and the backend calls.
*   **[Diagram] Sequence Diagram for Token Refresh:** A diagram showing how the app detects an expired token, uses the refresh token to get a new one, and retries the original API call.
*   **[Table] Comprehensive Endpoint Map:** A more detailed version of the table in section 5, covering all MVP data types and their corresponding API endpoints and required scopes.
