# Runbook: Firebase Authentication Outage DR

**Owner:** SRE Team
**Last Updated:** 2025-08-22

This runbook provides the step-by-step disaster recovery (DR) procedure for a major, prolonged outage of the primary identity provider, Firebase Authentication. This plan addresses **BLOCKER 3** from the production readiness review.

## 1. Triage & Detection

*   **Trigger:** This runbook is triggered by a P0 alert for `High API Gateway 4xx Errors`, specifically `401 Unauthorized` and `403 Forbidden`, coupled with alerts indicating the `AuthorizerLambda` is failing to validate Firebase JWTs.
*   **Severity:** P0 (System Down for all users)

**Steps:**
1.  **Acknowledge PagerDuty Alert:** Acknowledge the page immediately.
2.  **Confirm Outage (5 mins):**
    *   Check the official Google Cloud Status Dashboard and the Firebase Status Dashboard for any active incidents related to Firebase Authentication. **This is the source of truth.**
    *   Check application logs. Confirm that the `AuthorizerLambda` is logging errors related to fetching Firebase's JWKS or validating tokens.
3.  **Assess Impact (5 mins):**
    *   Confirm that all new user sign-ins and API requests for existing users are failing.
    *   The impact is 100% of the user base. Escalate immediately.

## 2. Failover to Cognito

**Objective:** Switch the system to the standby AWS Cognito User Pool to restore authentication functionality. This relies on the dual-authorizer strategy implemented in the `AuthorizerLambda`.

**Steps:**
1.  **Declare Incident (2 mins):**
    *   Announce in the `#incidents` Slack channel: "Declaring P0 incident. Firebase Authentication is down. Executing failover to Cognito DR."
    *   Update the public status page to "Major Outage - User Login Unavailable".
2.  **Update Client-Side Configuration (10 mins):**
    *   This is the most critical step. The mobile client needs to be instructed to use Cognito instead of Firebase for its next authentication attempt.
    *   In the **AWS AppConfig** console, for the mobile client's configuration profile, update the `auth.provider` key from `"firebase"` to `"cognito"`.
    *   Publish the configuration change. The mobile client will fetch this new configuration on its next startup.
3.  **Verify Authorizer Behavior (10 mins):**
    *   Monitor the `AuthorizerLambda` logs in CloudWatch.
    *   Verify that after the AppConfig change propagates, the authorizer begins receiving and successfully validating JWTs issued by AWS Cognito.
    *   Look for log entries indicating successful validation against the Cognito JWKS endpoint.
4.  **Verify User Impact:**
    *   Work with QA or use a test account.
    *   Force close and restart the mobile app to ensure it picks up the new AppConfig setting.
    *   Attempt to log in. The app should now direct the user through the Cognito authentication flow.
    *   Verify that API calls are succeeding with Cognito-issued tokens.

## 3. Post-Failover

**Objective:** The system is now operating on the DR identity provider.

**Steps:**
1.  **Communicate:**
    *   Update the public status page to "System operating on alternate login provider. User login has been restored."
    *   Keep stakeholders informed via the `#incidents` channel.
2.  **Plan for Failback:**
    *   Continuously monitor the Firebase status page.
    *   Once Firebase confirms the incident is fully resolved, begin planning for a controlled failback.
    *   **Do not fail back automatically.** Schedule a maintenance window. The failback process is the reverse of the failover: update the AppConfig key back to `"firebase"` and monitor the system.

## 4. DR Drill Requirements

*   This failover procedure **must** be tested as part of the mandatory, quarterly "gameday" chaos engineering exercises.
*   The drill must validate both the backend authorizer logic and the client-side's ability to correctly switch providers based on the AppConfig flag.
*   The measured RTO for this procedure must be documented in the gameday results. The target RTO is **< 1 hour**.
