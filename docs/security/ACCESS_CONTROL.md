# Access Control Policy

## 1. Purpose
This document defines the policy and process for requesting, approving, and provisioning access to SyncWell's internal systems and services. The goal is to enforce the principle of least privilege, ensuring that employees only have access to the information and resources that are strictly necessary for their roles.

## 2. Guiding Principles
*   **Principle of Least Privilege:** Users will be granted the minimum level of access required to perform their job duties.
*   **Default Deny:** Access is denied by default and must be explicitly granted.
*   **Separation of Duties:** Where possible, responsibilities for requesting, approving, and implementing access changes will be separated.
*   **Regular Audits:** Access rights will be reviewed on a regular basis to remove unnecessary permissions.

## 3. Access Request Process
All requests for new access or changes to existing access must be made via a **Jira ticket** using the "Access Request" issue type.

The ticket must include:
*   **Requestor:** The employee requesting access.
*   **User:** The employee for whom access is being requested.
*   **System:** The specific system or service (e.g., AWS, GitHub, PagerDuty).
*   **Role/Permission Level:** The specific level of access required (e.g., "read-only", "admin").
*   **Justification:** A clear business reason for why the access is needed.

## 4. Approval Workflow
Access requests are routed for approval based on the sensitivity of the system and the level of access requested.

| System | Role / Access Level | Approver |
| :--- | :--- | :--- |
| **GitHub** | `Read` | Team Lead |
| | `Write` | Team Lead |
| | `Admin` | Head of Engineering |
| **AWS** | `Read-only` (Staging) | Team Lead |
| | `PowerUser` (Staging) | SRE Lead |
| | `Read-only` (Production) | SRE Lead |
| | `Admin` (Production) | Head of Engineering + CTO |
| **Jira / Confluence** | `User` | Team Lead |
| **PagerDuty** | `User` | SRE Lead |

## 5. Provisioning and Deprovisioning
*   **Provisioning:** Once a request is approved, the system administrator (e.g., SRE Lead for AWS) will provision the access. The Jira ticket is then updated with a comment confirming that access has been granted.
*   **Deprovisioning:** When an employee leaves the company, the HR offboarding process will automatically trigger a Jira ticket to revoke all their access rights. This process is owned by the SRE team and must be completed within 24 hours of the employee's departure.

## 6. Access Review
*   **Quarterly Audits:** The SRE and Security teams will conduct a mandatory access audit on a quarterly basis for all critical systems (AWS, GitHub).
*   **Process:** A report of all users and their permissions will be generated. This report will be reviewed by the respective team leads to identify and flag any permissions that are no longer necessary.
*   **Remediation:** Unnecessary access will be revoked within 5 business days of the audit's completion.
