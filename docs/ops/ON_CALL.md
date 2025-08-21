# On-Call & Escalation Policy

## 1. Purpose
This document defines the on-call rotation schedule, responsibilities, and escalation policies for the SyncWell engineering team. The goal is to ensure that production incidents are responded to and resolved in a timely manner, 24/7.

## 2. On-Call Schedule
*   **Rotation:** The on-call rotation is managed in **PagerDuty**.
*   **Schedule:** The rotation is weekly, with the handoff occurring every **Monday at 10:00 AM UTC**.
*   **Primary On-Call:** One engineer from the Core Backend or SRE team is designated as the Primary On-Call Engineer for the week.
*   **Secondary On-Call (Backup):** A second engineer is designated as the Secondary On-Call Engineer. The secondary is only paged if the primary does not acknowledge an alert within 15 minutes.

## 3. On-Call Responsibilities
The Primary On-Call Engineer is responsible for:
*   **Acknowledging Alerts:** Acknowledging all incoming PagerDuty alerts within **15 minutes**.
*   **Triage:** Quickly assessing the impact and severity of the incident.
*   **Incident Command:** Acting as the initial Incident Commander (IC) for any new incident, responsible for coordinating the response.
*   **Communication:** Providing regular updates in the `#incidents` Slack channel.
*   **Escalation:** Escalating to the appropriate subject matter experts or leadership if necessary.
*   **Handoff:** Conducting a thorough handoff with the next on-call engineer at the end of their shift.

## 4. Alerting & Escalation Path

Alerts flow from our monitoring systems to PagerDuty, which then notifies the on-call engineers.

### 4.1. Alert Severity Levels
*   **P1 (Critical):** A critical, user-impacting outage or data integrity issue.
    *   **Examples:** Site-wide unavailability, major data corruption, security breach.
    *   **Action:** PagerDuty pages the Primary On-Call Engineer via phone call, SMS, and push notification.
*   **P2 (High):** A significant degradation of service or a potential user-impacting issue.
    *   **Examples:** Increased API latency, high error rate for a single provider.
    *   **Action:** PagerDuty pages the Primary On-Call Engineer via push notification.

### 4.2. Escalation Policy
If an alert is not acknowledged or resolved in a timely manner, the following automated escalation path is triggered by PagerDuty:

1.  **0 minutes:** P1 alert triggers. PagerDuty notifies the **Primary On-Call Engineer**.
2.  **15 minutes:** If the alert is not acknowledged, PagerDuty automatically escalates and notifies the **Secondary On-Call Engineer**.
3.  **30 minutes:** If the alert is still not acknowledged, PagerDuty automatically escalates and notifies the **SRE Lead**.
4.  **45 minutes:** If the alert is still not acknowledged, PagerDuty automatically escalates and notifies the **Head of Engineering**.

## 5. Post-Incident
For every P1 incident, a formal, blameless post-mortem must be conducted within 72 hours of the incident's resolution. The process for this is defined in `docs/ops/65-incident-response.md`.
