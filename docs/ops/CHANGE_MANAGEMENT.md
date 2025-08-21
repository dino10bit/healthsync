# Change Management Process

## 1. Purpose
This document defines the process for managing all changes to the SyncWell production environment. The goal is to ensure that changes are deployed in a controlled, predictable, and low-risk manner, minimizing the potential for negative impact on our users.

## 2. Scope
This process applies to all changes to the production environment, including:
*   Application code deployments.
*   Infrastructure changes (via Terraform).
*   Configuration changes (via AWS AppConfig).
*   Manual database modifications (in emergencies only).

## 3. Guiding Principles
*   **No Surprises:** All changes should be communicated and approved before being deployed.
*   **Automation First:** Where possible, changes should be deployed via automated CI/CD pipelines rather than manual intervention.
*   **Reversibility:** Every change should have a clear rollback plan.

## 4. The Change Advisory Board (CAB)
The CAB is a virtual team responsible for reviewing and approving all significant production changes.
*   **Composition:**
    *   Head of Engineering (Chair)
    *   SRE Lead
    *   Core Backend Lead
    *   Mobile Lead
*   **Meetings:** The CAB meets once per week to review upcoming changes. Emergency changes can be approved asynchronously in Slack.

## 5. Change Request & Approval Workflow

### 5.1. Change Categories
Changes are classified into three categories:
*   **Standard Change:** A low-risk, routine change that follows a pre-approved template (e.g., a minor copy update deployed via the standard release process).
    *   **Approval:** Does not require CAB approval. Approval from the team lead is sufficient.
*   **Normal Change:** A change that has a potential impact on the production environment but is not an emergency (e.g., a new feature release, a significant infrastructure change).
    *   **Approval:** Requires CAB approval.
*   **Emergency Change:** A change that must be deployed immediately to resolve a critical production incident (e.g., a hotfix for a P1 bug).
    *   **Approval:** Requires approval from the Head of Engineering and the on-call Incident Commander. A retrospective review by the full CAB is required within 48 hours.

### 5.2. Process
1.  **Create Change Request:** The engineer responsible for the change creates a "Change Request" ticket in Jira. The ticket must include:
    *   A description of the change.
    *   The change category.
    *   The deployment plan.
    *   The rollback plan.
    *   A risk assessment.
2.  **CAB Review:** For Normal changes, the request is added to the agenda for the next CAB meeting.
3.  **Approval:** If approved, the Jira ticket is moved to the "Approved" state.
4.  **Implementation:** The change is deployed according to the plan.
5.  **Post-Implementation Review:** The Jira ticket is updated with the outcome of the change.

## 6. Communication
*   A calendar of all approved changes will be maintained and shared with the entire engineering organization.
*   A notification will be posted in the `#deployments` Slack channel immediately before and after any production change.
