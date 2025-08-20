# PRD Appendix: Firebase Authentication Exit Strategy

## 1. Executive Summary

This document outlines the technical strategy for migrating the SyncWell user authentication system from **Firebase Authentication** to **Amazon Cognito**. This plan addresses the strategic risk **[RISK-HIGH-03]** of relying on a non-AWS service for a critical function. The migration is designed to be executed in phases to minimize user disruption and risk. The end state will be a unified, AWS-native architecture that improves security posture, simplifies operational management, and aligns with our long-term technical vision.

The core of the strategy is a **phased, dual-write migration**. For a period, both Firebase and Cognito will be treated as valid authentication systems, with a preference to migrate users to Cognito over time. This approach avoids a single, high-risk "big bang" migration.

## 2. Migration Goals & Success Metrics

*   **Primary Goal:** Successfully migrate 100% of the active user base from Firebase Authentication to Amazon Cognito with zero data loss and minimal user-facing impact.
*   **Secondary Goal:** Consolidate the tech stack within AWS to reduce cross-cloud dependencies and simplify operations.
*   **Success Metrics:**
    *   **User Disruption:** < 0.1% of DAU creating support tickets related to login/authentication issues during the migration period.
    *   **Migration Completion:** 99.9% of users who log in during the migration period are successfully migrated to a Cognito account.
    *   **Performance:** P99 latency for the new Cognito-based authentication flow must be within 10% of the existing Firebase flow.

## 3. Phased Migration Strategy

The migration will be executed in four distinct phases.

### Phase 1: Preparation & Shadowing (Target: 1-2 Sprints)

*   **Objective:** Build the necessary Cognito infrastructure and run it in a non-blocking "shadow" mode.
*   **Key Actions:**
    1.  **Infrastructure as Code:** Define the Amazon Cognito User Pool, Identity Pool, and all associated configurations (e.g., password policies, MFA settings) in Terraform.
    2.  **Modify Sign-Up Flow:** Update the user sign-up flow in the mobile app. New users will now create an account in **both** Firebase Auth and Amazon Cognito simultaneously. This dual-write process ensures all new users are immediately native to the new system.
    3.  **Deploy Shadow Login Flow:** Modify the user sign-in flow. When an existing user logs in with Firebase, the backend will, in the background (asynchronously), attempt to create a corresponding user account in Cognito using the Firebase user's verified email. This process is invisible to the user and allows us to pre-populate Cognito without requiring a password reset.
    4.  **Update Authorizer:** The backend `AuthorizerLambda` will be updated to be able to validate JWTs from **both** Firebase and Cognito. It will inspect the token to determine its issuer and apply the correct validation logic.

### Phase 2: Active Migration & User Prompting (Target: 2-4 Sprints)

*   **Objective:** Actively migrate existing users who log in to use Cognito as their primary authentication method.
*   **Key Actions:**
    1.  **Prioritize Cognito Login:** The mobile app's login flow will be changed to attempt a Cognito login *first*. If it succeeds, the user's session is Cognito-based, and the migration is complete for them.
    2.  **Fallback to Firebase & Transparent Migration:** If the Cognito login fails (for an existing user not yet migrated), the app will seamlessly fall back to the Firebase login flow.
    3.  **On-Success Migration:** Upon a successful Firebase login, the backend will now **synchronously** perform the migration. It will create the Cognito user (if not already created in shadow mode) and then return **both** a Firebase JWT (for the current session) and a new Cognito JWT to the client.
    4.  **Secure Token Storage:** The mobile client will securely store the new Cognito token and discard the old Firebase token, effectively making Cognito the authority for the next session.

### Phase 3: Forced Migration for Remaining Users (Target: 1 Sprint)

*   **Objective:** Migrate the long tail of active users who have not logged in during Phase 2.
*   **Key Actions:**
    1.  **Identify Unmigrated Users:** Run a script to compare the Firebase and Cognito user bases to identify active users who still only have a Firebase account.
    2.  **Force Re-authentication:** When an unmigrated user opens the app, they will be presented with a screen informing them that for security reasons, they need to re-authenticate their account. Tapping "Continue" will log them out and initiate the login flow from Phase 2, which will result in their migration.

### Phase 4: Decommissioning Firebase (Target: 1 Sprint)

*   **Objective:** Completely remove the dependency on Firebase Authentication.
*   **Key Actions:**
    1.  **Remove Firebase SDK:** Remove the Firebase Authentication SDK from the mobile clients.
    2.  **Remove Firebase Login Logic:** Remove all fallback login logic from the app and backend.
    3.  **Remove Firebase Token Validation:** The `AuthorizerLambda` will be simplified to only validate Cognito JWTs.
    4.  **Disable Firebase Project:** The Firebase project will be disabled and scheduled for deletion after a 30-day observation period.

## 4. Technical Implementation Details

### Data Migration
*   User attributes (email, user ID) will be migrated. Since passwords cannot be exported from Firebase, the migration relies on the user logging in again to establish a new password in Cognito.
*   The Firebase `uid` will be stored as a custom attribute (`custom:firebase_uid`) in the Cognito user profile to maintain a link to the old identity for data reconciliation purposes.

### Backend API Changes
*   The `AuthorizerLambda` will need the most significant changes to support dual-token validation during phases 1-3. It will use the `iss` (issuer) claim in the JWT to determine whether to use Google's public keys (for Firebase) or the Cognito User Pool's public keys for signature validation.

### Client-Side Changes
*   The mobile application's authentication manager will be refactored to support the dual-login and token replacement logic required for Phase 2.

## 5. Risks & Mitigation

*   **Risk:** User confusion or support tickets during the forced re-authentication in Phase 3.
    *   **Mitigation:** Clear, user-friendly in-app messaging explaining the need to re-authenticate. Prepare the support team with a detailed FAQ.
*   **Risk:** A bug in the dual-write or migration logic could lead to users being unable to log in.
    *   **Mitigation:** The entire flow must be rigorously tested in a staging environment with a feature flag controlling its activation. The rollout in Phase 2 should be gradual, starting with a small percentage of users.
*   **Risk:** The migration takes longer than expected, increasing the cost and complexity of maintaining two systems.
    *   **Mitigation:** The phased approach is designed to be pausable. If issues arise, the active migration can be temporarily disabled via a feature flag while fixes are implemented.
