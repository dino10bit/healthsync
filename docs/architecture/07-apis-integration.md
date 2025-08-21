---
title: "PRD Section 7: APIs & Integration Requirements"
migrated: true
---
## Dependencies

### Core Dependencies
- `./06-technical-architecture.md` - Technical Architecture, Security & Compliance
- `../security/19-security-privacy.md` - Data Security & Privacy Policies
- `../security/20-compliance-regulatory.md` - Legal & Regulatory Compliance
- `./32-platform-limitations.md` - Platform-Specific Limitations
- `./33-third-party-integration.md` - Third-Party Integration Strategy

### Strategic / Indirect Dependencies
- `./05-data-sync.md` - Data Synchronization & Reliability
- `../qa/15-integration-testing.md` - Integration & End-to-End Testing
- `../prd/21-risks.md` - Risks, Constraints & Mitigation
- `../ux/40-error-recovery.md` - Error Recovery & Troubleshooting

---

# PRD Section 7: APIs & Integration Requirements

## 1. Executive Summary

This document provides the detailed technical requirements for integrating with third-party Health & Fitness APIs. A robust, scalable, and maintainable approach is paramount. This document specifies the design of the **`DataProvider`** architecture, the handling of authentication, and the specific endpoints for the MVP integrations. It is designed for the **engineering team** and reflects the hybrid sync model outlined in `./06-technical-architecture.md`.

## 2. The `DataProvider` Architecture

To ensure consistency and quality as we scale to dozens of integrations, each third-party integration will be built against a standardized set of interfaces and utilities. This framework, maintained as a **shared module** within the main application's monorepo, separates the unique business logic of an integration from the boilerplate code required for all integrations.

### 2.1. The Shared Integration Module

The shared module provides a set of abstract classes and utilities that every provider must implement or use. This includes:
*   **Standardized Interfaces:** A clear `DataProvider` interface definition (see below).
*   **Centralized Error Handling:** A common set of exceptions that provider-specific code can throw to signal specific outcomes to the sync engine.
    *   `PermanentAuthError`: Thrown when an API call fails with a non-recoverable authentication error (e.g., 401 Unauthorized), indicating the user must re-authenticate.
    *   `TransientAPIError`: Thrown for temporary server-side errors (e.g., 5xx status codes) that can be retried.
    *   `RateLimitError`: Thrown when a rate limit is hit (e.g., 429 Too Many Requests), signaling the worker to back off.
*   **Automatic Metrics & Logging:** The framework will automatically capture and publish key metrics (e.g., API call latency, success/failure rates) and structured logs.

### 2.2. `DataProvider` Interface & Responsibilities

Each `DataProvider` implementation will focus purely on the provider-specific business logic:
*   **Authentication:** Providing the provider-specific URLs and parameters for the OAuth flow.
*   **Data Mapping:** Transforming the provider's unique data model into SyncWell's canonical data model, and vice-versa.
*   **Endpoint Logic:** Knowing which specific API endpoints to call for reading and writing data.

To enforce this separation of concerns, every provider must implement the `DataProvider` interface defined in the KMP shared module. This creates a standardized contract for all integrations.

```kotlin
// Simplified for documentation purposes.

/**
 * Defines the granular capabilities of a given DataProvider for specific data types.
 */
enum class Capability {
    READ_STEPS, WRITE_STEPS,
    READ_WORKOUTS, WRITE_WORKOUTS,
    READ_SLEEP, WRITE_SLEEP,
    SUPPORTS_WEBHOOKS
}

/**
 * Represents the parsed and validated payload from a provider's webhook.
 */
data class WebhookPayload(
    val userId: String,
    // The type of data, which must correspond to a CanonicalData model (e.g., "workout", "sleep_session").
    val dataType: String,
    val eventTimestamp: Long
)

interface DataProvider {
    /**
     * A unique, machine-readable key for the provider (e.g., "strava", "fitbit").
     */
    val providerKey: String

    /**
     * The set of granular capabilities supported by this provider.
     */
    val capabilities: Set<Capability>

    /**
     * Handles the initial OAuth 2.0 authorization flow to acquire tokens.
     */
    suspend fun authenticate(authCode: String): ProviderTokens

    /**
     * Refreshes an expired access token using a refresh token.
     */
    suspend fun refreshAccessToken(refreshToken: String): ProviderTokens

    /**
     * Revokes the given tokens with the third-party provider.
     */
    suspend fun revoke(tokens: ProviderTokens)

    /**
     * Fetches lightweight metadata for a specific type of data. This is the first step in the "Intelligent Hydration" flow.
     */
    suspend fun fetchMetadata(tokens: ProviderTokens, dateRange: DateRange, dataType: String): List<CanonicalData>

    /**
     * Fetches the full, heavy data payloads for a specific list of record IDs. This is the second step in the "Intelligent Hydration" flow.
     */
    suspend fun fetchPayloads(tokens: ProviderTokens, recordIds: List<String>, dataType: String): List<CanonicalData>

    /**
     * Pushes a list of canonical data models to the provider's API. The implementation
     * is responsible for casting the `CanonicalData` objects to the correct concrete type.
     * If a cast fails, it should be logged as an error and the item should be included in the `failedItemIds` of the result.
     */
    suspend fun pushData(tokens: ProviderTokens, data: List<CanonicalData>): PushResult

    /**
     * Optional: Performs a lightweight pre-flight check to see if there is any new data available.
     */
    suspend fun hasNewData(tokens: ProviderTokens, dateRange: DateRange): Boolean? = null

    /**
     * Handles an incoming webhook event. The implementation is responsible for
     * verifying the webhook's authenticity (e.g., by checking a signature header) and parsing its payload.
     * The specific authentication mechanism is provider-dependent and must be documented in the implementation.
     */
    suspend fun handleWebhook(requestHeaders: Map<String, String>, requestBody: String): WebhookPayload?
}

/**
 * Represents the result of a push operation, including any items that failed.
 */
data class PushResult(
    val success: Boolean,
    // [C-015] This list should contain the `sourceId` from the canonical model for each item that failed to push.
    val failedItemIds: List<String> = emptyList()
)

/**
 * [C-017] Defines a simple date range using a full ISO 8601 timestamp with timezone.
 */
data class DateRange(
    val startDate: String, // ISO 8601 format (e.g., "2023-01-01T00:00:00Z")
    val endDate: String    // ISO 8601 format (e.g., "2023-12-31T23:59:59Z")
)
```

### 2.3. Network Environment & Security
All backend `DataProvider` logic runs within the main application's VPC on AWS. To balance cost and security, outbound traffic is routed through a **hybrid firewall model**, as defined in `06-technical-architecture.md`.

This hybrid approach means that for a new `DataProvider` to function, the domain name(s) of the third-party API it needs to call **must** be added to the allow-list of the appropriate egress path. This is a mandatory part of the process for enabling a new provider.

## 3. Authentication: A Secure Hybrid Flow

All cloud-based APIs will use the **OAuth 2.0 Authorization Code Flow with PKCE**. The key security principle is that **long-lived tokens never touch the user's device**.

### Authentication Flow Steps:

1.  **Initiate (Mobile):** The mobile app generates a `code_verifier` and `code_challenge`.
2.  **Open WebView (Mobile):** The app opens a secure in-app browser with the provider's authorization URL.
3.  **User Consent (Mobile):** The user logs in and grants consent on the provider's web page.
4.  **Redirect with Auth Code (Mobile):** The provider redirects to SyncWell's redirect URI (e.g., `syncwell://oauth-callback`) with a one-time `authorization_code`. The `state` parameter is used to identify the `DataProvider`.
5.  **Secure Hand-off to Backend (Mobile -> Backend):** The mobile app sends the `authorization_code` and `code_verifier` to a secure endpoint on the SyncWell backend.
6.  **Token Exchange (Backend):** A dedicated backend function receives the `authorization_code` and invokes the correct `DataProvider` to perform the token exchange.
7.  **Secure Storage (Backend):** Upon receiving the tokens, the backend stores them securely in **AWS Secrets Manager**.

## 4. Token Management & Granular Error Handling

### 4.1. Token Auto-Refresh
Token management is a purely backend process. The shared module will automatically perform a pre-flight check for token validity and handle the refresh flow if necessary. If a refresh fails, it will throw a `PermanentAuthError`.

### 4.2. API Error Handling Strategy
A robust sync engine must intelligently handle the wide variety of errors that can occur. The canonical error handling policies and user-facing messages are defined in **`../ops/17-error-handling.md`**. This document serves as the single source of truth. The `DataProvider` shared module will classify errors and apply the appropriate strategy as defined there.

*   **`PermanentAuthError` (e.g., 401 Unauthorized):** The sync job is failed, the connection is marked `needs_reauth`, and a push notification is sent to the user immediately.
    *   **[NEEDS_CLARIFICATION]** The specific content of the push notification must be defined.
    *   **[NEEDS_CLARIFICATION]** The deep-link URL schema for the notification must be defined.
*   **`RateLimitError` (e.g., 429 Too Many Requests):** The job is returned to the SQS queue with an increasing visibility timeout (exponential backoff).
*   **`TransientAPIError` (e.g., 5xx):** The job is returned to the SQS queue with an increasing visibility timeout (exponential backoff).

## 4a. API Rate Limit Management

Proactively managing third-party rate limits is a core architectural requirement. The strategy is to use a **distributed, global rate limiting** system using the **token bucket algorithm**, implemented in Redis.

*   **Prioritization:** The rate limiting service will be aware of job priority. The event payload for every sync job **must** include a `priority` field. The definition for this enum is maintained in `06-technical-architecture.md` as the single source of truth.

## 5. MVP API Endpoint Mapping

| Platform | Data Type | Read Endpoint | Write Endpoint | Integration Model | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Google Fit** | Steps | `users/me/dataset:aggregate` | `users/me/dataSources/.../datasets:patch` | Hybrid (Polling) | Requires Health Connect SDK on device. Does not have a webhook API. |
| **Apple Health** | Steps | `HKSampleQuery` | `HKHealthStore.save()` | Device-to-Cloud / Cloud-to-Device | N/A (On-device) |
| **Fitbit** | Steps | `1/user/-/activities/steps/date/[date]/1d.json` | `N/A` | Cloud-to-Cloud (Webhook-First) | Read-only for activity data. Supports webhooks. |
| **Strava** | Activities | `athlete/activities` | `activities` | Cloud-to-Cloud (Webhook-First) | Does not provide daily step data. Supports webhooks. |
| **Garmin** | Steps | `daily-summary-service/daily-summary/...` | `N/A` | Cloud-to-Cloud (Polling) | **Deferred Post-MVP.** Unofficial API. No webhook support. |

## 6. Risk Analysis & Mitigation

| Risk ID | Risk Description | Probability | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **R-19** | An API provider makes a breaking change, disabling a key integration. | High | High | Implement contract testing and versioned `DataProviders`. Have robust monitoring to detect API errors quickly. |
| **R-20** | SyncWell is denied access to a critical API. | Low | High | Be transparent with users. Have a plan to prioritize other integrations. |
| **R-21** | The complexity of implementing and maintaining numerous providers becomes a significant engineering burden. | Medium | High | Strictly adhere to the provider architecture. Automate testing for each provider. Allocate dedicated engineering resources for maintenance. |
| **R-22** | A vulnerability in the backend leads to a leak of user OAuth tokens from Secrets Manager. | Low | Critical | Enforce strict IAM policies with the principle of least privilege. Encrypt all secrets. Conduct regular security audits and penetration testing. |
| **R-23** | Inconsistent implementation of `DataProviders` leads to varied quality and behavior. | Medium | Medium | The shared module mitigates this, but code reviews and a strict QA process for new providers are essential. |

## 7. Visual Diagrams

### Sequence Diagram for Authentication (Hybrid Flow)
```mermaid
sequenceDiagram
    participant MobileApp as Mobile App
    participant ExtProvider as External Provider
    participant Backend as SyncWell Backend
    participant SecretsManager as AWS Secrets Manager

    MobileApp->>ExtProvider: 1. Request Auth Code (with PKCE challenge)
    ExtProvider-->>MobileApp: 2. Redirect with Auth Code
    MobileApp->>Backend: 3. Send Auth Code & Verifier
    activate Backend
    Backend->>ExtProvider: 4. Exchange Auth Code for Tokens
    ExtProvider-->>Backend: 5. Return Access & Refresh Tokens
    Backend->>SecretsManager: 6. Store Tokens securely
    SecretsManager-->>Backend: 7. Confirm Storage
    Backend-->>MobileApp: 8. Auth Success
    deactivate Backend
```

## 8. Managing Unstable & Poorly Documented APIs

A key risk is the varying quality and stability of third-party APIs. This section outlines a proactive strategy for managing this risk.

*   **Provider-Specific Monitoring:** Each `DataProvider` will have its own dedicated set of CloudWatch Alarms monitoring error rate and P95 latency.
*   **Circuit Breaker Pattern:** For notoriously unstable APIs, a Circuit Breaker pattern will be implemented within the shared module.
    *   **Mechanism:** If the failure rate for a specific provider's API calls exceeds a configured threshold, the circuit "opens," and all subsequent calls will fail fast for a cooldown period.
    *   **[C-016] Configuration:** The thresholds for the circuit breaker **must be configurable per-provider** via AWS AppConfig.
*   **Graceful Degradation via Feature Flags:** If a provider's API is causing persistent problems, a remote feature flag will be used to gracefully degrade or disable the integration.
*   **Defensive Coding and Documentation:** The developer responsible for an integration is also responsible for documenting any known quirks or undocumented behaviors of the provider's API directly in the `DataProvider`'s source code.
