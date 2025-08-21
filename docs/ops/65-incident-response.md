## Dependencies

### Core Dependencies
- `22-maintenance.md` - Maintenance
- `44-contingency-planning.md` - Contingency Planning
- `64-server-monitoring.md` - Backend Monitoring Strategy (Deep Dive)

### Strategic / Indirect Dependencies
- `24-user-support.md` - User Support

---

# PRD Section 65: Incident Response Plan (Deep Dive)

## 1. Introduction
An incident is an unplanned interruption or reduction in the quality of a service. This document is the authoritative guide for how SyncWell responds to production incidents, with the primary goal of restoring service safely and quickly.

## 2. Incident Roles & Responsibilities

### 2.1. Incident Commander (IC)
-   **Responsibilities:**
    -   The ultimate authority on the incident call.
    -   Coordinates all aspects of the response.
    -   Delegates tasks to SMEs.
    -   Manages communication and stakeholder updates.
    -   Decides when the incident is resolved.
-   **What the IC does NOT do:** The IC's job is to lead, not to type. They should not be the one actively debugging or fixing the issue.

### 2.2. Communications Lead
-   **Responsibilities (for SEV-1/SEV-2):**
    -   Manages all external and internal communication.
    -   Updates the public status page.
    -   Provides regular updates to the support team and company leadership.
    -   Shields the engineering team from distracting questions.

### 2.3. Subject Matter Expert (SME)
-   **Responsibilities:**
    -   The hands-on expert for the affected system.
    -   Investigates the issue, forms hypotheses, and proposes fixes.
    -   Executes the remediation actions decided upon by the IC.

## 3. Incident Response Process

### 3.1. The "War Room"
-   For any SEV-1 or SEV-2 incident, a "war room" is immediately established.
-   **Slack Channel:** A new, temporary Slack channel is created (e.g., `#incident-2025-08-18-api-outage`). All incident-related chat happens here.
-   **Video Bridge:** A dedicated video call (Zoom/Meet) is started for real-time voice communication.

### 3.2. SEV-1 Incident Protocol
A SEV-1 incident triggers our highest level of response:
1.  The on-call engineer is paged and immediately assumes the role of Incident Commander.
2.  The IC establishes the war room (Slack + Video).
3.  The IC pages any other required SMEs and a Communications Lead.
4.  An initial internal notification is sent to company leadership.
5.  The incident is worked according to the lifecycle in **Section 4**, with the Comms Lead updating the status page every 30 minutes.

### 3.3. Incident Status Page
-   **Tool:** We will use a hosted service like Statuspage.io.
-   **When to Use:** For any SEV-1 or SEV-2 incident that is expected to have visible user impact.
-   **Content:** Updates should be clear, concise, and non-technical. "Investigating - We are investigating an issue with data synchronization. -> Identified - We have identified the cause and are working on a fix. -> Monitoring - A fix has been deployed and we are monitoring the results. -> Resolved - The issue has been resolved."

### 3.4. Incident Timeline
-   The IC is responsible for ensuring a timeline of key events is maintained in the Slack channel.
-   **Examples:**
    -   `13:05 - PagerDuty alert fires for "High 5XX Error Rate".`
    -   `13:06 - IC declares SEV-1 incident.`
    -   `13:15 - SME proposes rolling back the last deployment.`
    -   `13:20 - Rollback initiated.`
    -   `13:25 - Error rates return to normal. Service restored.`

## 4. Post-Incident Process

A formal post-incident review, or post-mortem, is a critical part of our continuous improvement cycle.

### 4.1. Post-Mortem Process
-   **Trigger:** A post-mortem is **mandatory for all SEV-1 incidents** and highly encouraged for SEV-2 incidents.
-   **Ownership:** The **Incident Commander** from the incident is responsible for scheduling the post-mortem meeting and for writing the final post-mortem document.
-   **Timeline:** The post-mortem meeting must be held within **3 business days** of the incident's resolution to ensure details are fresh.
-   **Attendees:** Required attendees are the Incident Commander, all Subject Matter Experts involved in the resolution, and representatives from any significantly impacted teams (e.g., customer support).
-   **Blameless Culture:** The primary rule of the post-mortem is that it is **blameless**. The goal is to identify weaknesses in our systems and processes, not to assign blame to individuals. We assume everyone acted with the best intentions based on the information they had at the time.

### 4.2. Post-Mortem Document Template
All post-mortems must follow a standard template, which will be maintained in Confluence. The template must include the following sections:
1.  **Executive Summary:** A brief, high-level summary of the incident, including what happened, the user impact, and the duration.
2.  **Timeline:** A detailed, timestamped log of all key events, from initial detection to full resolution.
3.  **Root Cause Analysis:** A deep dive into the root cause(s) of the incident. The **"5 Whys"** technique should be used here to move beyond surface-level causes.
4.  **Action Items:** A list of concrete, actionable, and owned tasks that will be implemented to prevent this class of incident from recurring or to improve the response process.
5.  **Lessons Learned:** A summary of what went well during the response and what could be improved.

### 4.3. Action Item Tracking
-   All action items identified in a post-mortem **must** be converted into Jira tickets.
-   Each ticket must have a clear owner and a due date.
-   The Incident Commander is responsible for ensuring these tickets are created.
-   The SRE Team Lead is responsible for tracking these action items to completion. These tickets are treated with high priority in the next development sprint.

## 5. Preparedness

### 5.1. Game Days & Practice
-   Once per quarter, the engineering team will conduct a "Game Day."
-   **Process:** We will deliberately and safely inject failure into our staging environment (e.g., shut down a database, introduce high latency) and practice our full incident response process.
-   **Goal:** To ensure the team is familiar and comfortable with the process, and to identify weaknesses in our monitoring or runbooks.

### 5.2. On-Call Handover Process
-   The on-call responsibility shifts every Monday at 10 AM.
-   The outgoing on-call engineer sends a "handover report" to the incoming engineer, summarizing any issues, recent deployments, or ongoing alerts from the past week.

## 6. Analysis & Calculations
### 6.1. Mean Time To Recovery (MTTR) Analysis
-   **Hypothesis:** Our incident response process should be primarily optimized to reduce Mean Time To Recovery (MTTR), which is the average time it takes to recover from a failure. This is a more valuable metric than Mean Time Between Failures (MTBF), as it acknowledges that failures are inevitable.
-   **Metric Definition:** MTTR = Total downtime / Number of incidents.
-   **Goal:** For SEV-1 incidents, our target MTTR is **< 60 minutes**.
-   **Analysis of MTTR Components:**
    -   *Time to Detect (TTD):* How long it takes for us to know an incident is happening. This is improved by the alerting strategy in `64-server-monitoring.md`.
    -   *Time to Diagnose (TTD):* How long it takes to find the root cause. This is improved by the observability tools (logs, traces, metrics) and clear runbooks.
    -   *Time to Repair (TTR):* How long it takes to deploy a fix. This is improved by a robust CI/CD pipeline and rollback capabilities.
-   **Conclusion:** Focusing on MTTR means prioritizing investments in alerting, observability, and deployment automation.

### 6.2. Cost of Downtime Calculation
-   **Hypothesis:** Downtime has a direct, measurable financial cost due to lost revenue and reputational damage. Quantifying this helps justify investment in reliability.
-   **Calculation:**
    -   *Assumptions:*
        -   Target Year 1 MRR: $5,000. This equals ~$0.116 per minute in gross revenue. ($5000 / 43200 mins).
        -   A major SEV-1 outage causes a 1% increase in monthly churn. With 1,002 subscribers, this is ~10 lost subscribers.
    -   *Cost of a 2-hour SEV-1 Outage:*
        -   *Direct Revenue Loss:* 120 minutes * $0.116/min = **$13.92**. (This is small).
        -   *Churn-related Revenue Loss:* 10 lost subscribers * $85 LTV/subscriber = **$850**.
        -   *Intangible Costs:* Damage to brand reputation, negative App Store reviews, increased load on customer support.
-   **Conclusion:** The immediate revenue loss from downtime is minimal for a subscription business. The **real financial impact comes from increased churn**. A single major outage can cost the business nearly $1,000 in lost LTV. This justifies spending significant engineering effort on preventative measures (e.g., automated testing, canary releases) and on a rapid, well-practiced incident response process to keep downtime to an absolute minimum.

## 7. Out of Scope
-   Handling customer support tickets (this is covered in `24-user-support.md`).
-   The specific technical details of disaster recovery (this is covered in `18-backup-recovery.md`).
