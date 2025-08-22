# Runbook: Security Event

This runbook details the initial steps for responding to a critical security event. This is a high-level guide; a more detailed incident response plan is maintained in `../security/INCIDENT_RESPONSE_PLAN.md`.

## 1. Detection

A security event can be detected through various channels:

1.  A critical AWS WAF alarm fires (e.g., "High-risk SQL Injection Detected").
2.  A GuardDuty finding indicates a compromised resource.
3.  A security researcher reports a vulnerability.
4.  An automated scanner (like Snyk) discovers a critical vulnerability in a production dependency.
5.  CloudWatch alarm for PII discovery in logs is triggered.

## 2. Triage & Escalation

1.  **Immediately escalate to the security on-call engineer.**
2.  The security engineer will assess the severity and potential impact of the event.
3.  If the event is confirmed to be a credible threat, the security engineer will initiate the formal incident response plan.

## 3. Immediate Containment Actions

The following are examples of immediate actions that may be taken to contain a threat while the full investigation is underway. These should only be executed by or with the approval of the security team.

*   **WAF Rule:** If an attack is sourced from a specific IP or region, create a temporary WAF rule to block the traffic.
*   **Revoke Credentials:** If a credential is suspected to be leaked, immediately revoke it in AWS IAM or Secrets Manager.
*   **Isolate Instance:** If an EC2 instance or Fargate task is suspected to be compromised, immediately isolate it from the network by changing its security group.

## 4. Communication

Internal communication is critical. The security engineer will create a dedicated Slack channel for the incident and invite all relevant stakeholders, including engineering leads, legal, and communications. All communication about the incident should happen in this channel.
