# Open-Source Software (OSS) Policy

## 1. Purpose
This document defines the policy for the selection, approval, and management of open-source software dependencies within the SyncWell project. The goal is to leverage the benefits of OSS while mitigating the associated risks, such as security vulnerabilities, license compliance issues, and project sustainability concerns.

## 2. Guiding Principles
*   **Default to OSS:** We will use high-quality open-source software where it meets our needs, rather than reinventing the wheel.
*   **Security First:** All dependencies must be vetted for security vulnerabilities.
*   **License Compliance:** We must understand and comply with the license terms of all our dependencies.
*   **Community Health:** We prefer dependencies from projects with a healthy, active community.

## 3. Approved Licenses
Only dependencies with one of the following permissive licenses are pre-approved for use in the SyncWell project:
*   MIT License
*   Apache License 2.0
*   BSD License (2-Clause and 3-Clause)

### 3.1. Restricted Licenses (Copyleft)
The use of libraries with "copyleft" licenses is generally prohibited as it may require us to open-source our own proprietary code. This includes, but is not limited to:
*   GPL (General Public License - all versions)
*   LGPL (Lesser General Public License - all versions)
*   AGPL (Affero General Public License - all versions)

**Exception Process:** Use of a library with a restricted license requires explicit, written approval from the **Head of Engineering** and the **Legal Counsel**. A detailed justification must be provided, including a risk analysis and a plan for compliance with the license terms.

## 4. Dependency Management Process

### 4.1. Selection
When selecting a new dependency, engineers must consider:
*   **Functionality:** Does it meet our technical requirements?
*   **License:** Is it on the approved list?
*   **Community:** Is the project actively maintained? Look at the date of the last commit, the number of open issues, and the responsiveness of the maintainers.
*   **Popularity & Usage:** Is the library widely used and trusted by the community?

### 4.2. Approval
*   **Pre-approved Licenses:** For libraries with an approved license, no formal approval is needed. The engineer can add the dependency.
*   **Other Licenses:** For all other licenses, the engineer must follow the exception process outlined in section 3.1.

### 4.3. Vulnerability Management
*   **Automated Scanning:** The CI/CD pipeline **must** include an automated dependency scanning step using **Snyk** and **Dependabot**.
*   **Build Failure:** The build **must** fail if a new dependency with a critical or high-severity vulnerability is introduced.
*   **Remediation:** When a vulnerability is discovered in an existing dependency, a P1 or P2 ticket (depending on the severity) must be created in Jira to track the remediation work. The goal is to patch critical vulnerabilities within 72 hours.

### 4.4. Dependency Review
The list of all third-party dependencies will be reviewed on a **quarterly basis** by the Core Backend and Mobile leads to identify and remove unused or outdated libraries.
