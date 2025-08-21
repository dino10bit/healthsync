# Support Runbook Template

## 1. Issue / Symptom

_A clear, concise description of the problem this runbook helps to solve (e.g., "User reports that their Fitbit syncs are failing")._

## 2. Triage & Diagnosis

_A step-by-step guide for a support agent to diagnose the issue._

1.  **Check User Status:** _Look up the user in the admin panel. Are they a Pro subscriber? Is their account active?_
2.  **Check Service Status:** _Check the external provider's status page (e.g., status.fitbit.com). Is there a known outage?_
3.  **Check Logs:** _Using the user's ID, look for recent error logs in the logging system (e.g., CloudWatch Logs Insights). Look for specific error messages._

## 3. Resolution Steps

_A series of actions to resolve the issue._

*   **If the issue is a known outage:**
    1.  Communicate the known issue to the user.
    2.  Link them to the public status page.
    3.  Tag the support ticket to be updated when the outage is resolved.
*   **If the issue is an expired token:**
    1.  Guide the user to the "Connected Apps" screen.
    2.  Instruct them to tap "Disconnect" and then reconnect the service.
*   **If the issue is an unknown error:**
    1.  Gather all diagnostic information (userId, error logs, timestamps).
    2.  Escalate the issue to the engineering team by creating a high-priority ticket.
    3.  Provide the user with the ticket number and an estimated time for a follow-up.

## 4. Canned Responses

_Pre-written responses to send to the user at different stages of the process._

*   **Initial Response:** "Thanks for contacting us. We're looking into the issue with your syncs and will get back to you shortly."
*   **Known Outage Response:** "It looks like [Provider] is currently experiencing a service outage..."
*   **Escalation Response:** "We've identified a potential bug and have escalated your issue to our engineering team..."
