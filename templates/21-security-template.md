# Security Review Template

## 1. Feature Overview

_A brief description of the feature and its purpose._

## 2. Data Flow Diagram

_A diagram showing how data flows through the system for this feature. This should classify the data (e.g., PII, sensitive, public) and show where it is stored and processed._

## 3. Threat Model

_A table outlining potential threats, their impact, and the planned countermeasures._

| Threat Scenario | Description | Countermeasure(s) |
| :--- | :--- | :--- |
| **Example Threat** | An attacker could attempt to... | 1. The system prevents this by...<br>2. We will also monitor for... |

## 4. Security Checklist

*   [ ] **Authentication:** Are all endpoints properly authenticated?
*   [ ] **Authorization:** Are all actions properly authorized, adhering to the principle of least privilege?
*   [ ] **Input Validation:** Is all user-provided input strictly validated and sanitized?
*   [ ] **Data Encryption:** Is all sensitive data encrypted at rest and in transit?
*   [ ] **Logging:** Are all sensitive actions logged? Are logs scrubbed of any sensitive data?
*   [ ] **Dependency Scan:** Have all new third-party dependencies been scanned for vulnerabilities?

## 5. Security Sign-off

_This section to be completed by the security reviewer._

*   **Reviewed by:**
*   **Date:**
*   **Outcome:** (Approved / Approved with conditions / Rejected)
*   **Notes:**
