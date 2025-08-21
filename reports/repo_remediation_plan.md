# Repository Remediation Plan

## 1. Overview

This document outlines a prioritized plan for improving the state of the project's documentation and tooling, based on the findings from the initial repository reorganization and automated analysis.

## 2. Current State

The repository has been significantly reorganized into a structured, "audit-ready" format. Key documentation has been moved into categorized directories, and automated reports for traceability and risk have been generated.

However, the process has highlighted several areas that require further attention. This plan details the recommended next steps.

## 3. Prioritized Remediation Tasks

### Priority 1: Complete Documentation Migration & Link Integrity

*   **Issue:** A significant number of documentation files still reside in the root directory. The link normalization process was partial and based on assumptions.
*   **Action Plan:**
    1.  **Move Remaining Files:** Systematically move all remaining markdown documents from the root directory into their appropriate `docs/` subdirectories.
    2.  **Full Link Scan:** Create and run a script that scans every single markdown file in the `docs/` directory and verifies that every relative link points to an existing file.
    3.  **Fix Broken Links:** Remediate any broken links found by the scan.
*   **Justification:** This is the highest priority as it completes the foundational reorganization and ensures the documentation is reliable and navigable.

### Priority 2: Address Critical Risks

*   **Issue:** The `risk_register.md` identified several "High" or "Critical" level risks that need immediate attention.
*   **Action Plan:**
    1.  **Review Critical Risks:** Hold a review session for all risks marked "Critical", starting with `R-69` (Concurrency Model Feasibility).
    2.  **Create Mitigation Epics:** For each high-priority risk, create a corresponding Epic or Story in the project backlog to formally track the implementation of the mitigation strategy.
    3.  **Prioritize Security Risks:** Pay special attention to security risks like `R-55` (Leak of user OAuth tokens).
*   **Justification:** Proactively mitigating the highest impact risks is crucial for project stability and success.

### Priority 3: Enhance Automation & Tooling

*   **Issue:** The analysis and CI scripts created in the `tools/` and `.github/workflows/` directories are basic stubs.
*   **Action Plan:**
    1.  **Flesh out `api_diff_reporter.py`:** Integrate a real OpenAPI diff library to make the CI check meaningful.
    2.  **Improve `generate_risk_register.py`:** Enhance the script to parse tables more accurately and avoid including non-risk-related content.
    3.  **Implement Semantic Checking:** Develop the `semantic_checker.py` script to perform basic terminology consistency checks.
*   **Justification:** Improving the automation will increase the long-term quality and consistency of the documentation and reduce manual effort.

### Priority 4: Fill in "TBD" Content

*   **Issue:** Many documents contain "TBD" sections or are placeholders.
*   **Action Plan:**
    1.  **Identify TBDs:** Run a `grep` search for "TBD" across the `docs/` directory to create a list of all incomplete sections.
    2.  **Prioritize Content Creation:** Prioritize the completion of the most critical documents, such as the `01-context-vision.md` and key architecture diagrams.
*   **Justification:** Completing the documentation will provide a more comprehensive and useful resource for all stakeholders.
