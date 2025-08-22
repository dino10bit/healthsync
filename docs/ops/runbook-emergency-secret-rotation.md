# Runbook: Emergency Secret Rotation

**Owner:** SRE Team
**Last Updated:** 2025-08-22

This runbook provides the step-by-step procedure for performing an emergency, out-of-band rotation of a compromised secret.

## 1. Triage & Assessment

*   **Trigger:** This runbook is triggered by a P0 security alert indicating a secret has been compromised (e.g., leaked in a public code repository, exposed in logs).
*   **Severity:** P0 (Urgent)

**Steps:**
1.  **Acknowledge PagerDuty Alert:** Acknowledge the page to notify the team you are responding.
2.  **Declare Incident:** Announce in the `#incidents` Slack channel: "Declaring P0 incident. Secret compromise detected. Initiating emergency rotation runbook."
3.  **Identify Compromised Secret (5 mins):**
    *   Work with the security team to identify the exact secret that was compromised (e.g., the API key for `provider-fitbit`).
    *   Assess the "blast radius": which systems and services use this secret?

## 2. Containment & Rotation

**Objective:** Revoke the old secret and replace it with a new one as quickly as possible.

**Steps:**
1.  **Generate New Secret (10 mins):**
    *   Navigate to the third-party provider's developer console (e.g., Fitbit Developer Portal).
    *   Generate a new API key/secret pair.
2.  **Update AWS Secrets Manager (5 mins):**
    *   Navigate to the AWS Secrets Manager console.
    *   Locate the secret to be rotated (e.g., `prod/syncwell/fitbit-api-key`).
    *   Create a new version of the secret, pasting in the new credentials.
    *   **Do not delete the old version yet.** Many secrets have a "previous" version that can be used for rollback.
3.  **Deploy New Secret (5-15 mins):**
    *   For services that automatically fetch the latest secret version on startup (like our Lambda functions), a rolling restart of the service is required to pick up the new secret.
    *   Trigger a deployment of the affected service (e.g., `syncwell-worker`) via the CI/CD pipeline. The canary deployment process will gradually roll out the change.
4.  **Monitor Application Health:**
    *   Closely monitor the application's error rate and key metrics during and after the deployment.
    *   Check for any increase in API errors from the third-party provider, which could indicate a problem with the new secret.

## 3. Eradication & Recovery

**Objective:** Ensure the old secret is fully disabled and the system is stable.

**Steps:**
1.  **Revoke Old Secret (10 mins):**
    *   Once the new secret is fully deployed and the system is stable, navigate back to the third-party provider's developer console.
    *   Explicitly revoke or delete the old, compromised secret. This is a critical step to ensure it can no longer be used.
2.  **Verify System Stability:**
    *   Continue monitoring the system for at least 1 hour after the old secret has been revoked to ensure there are no latent dependencies on it.
3.  **Post-Incident Review:**
    *   A full post-mortem is required for any P0 incident.
    *   Document the root cause of the leak and create action items to prevent recurrence.

## 4. Communication

*   Keep the `#incidents` channel and executive stakeholders updated every 15 minutes during the incident.
*   Update the public status page if the incident has any user-facing impact.
