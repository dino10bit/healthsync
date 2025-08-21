# Succession & Bus Factor Mitigation Plan

## 1. Purpose
This document outlines the strategy for mitigating the "bus factor" risk—the risk that the project becomes overly dependent on a small number of key individuals. A high bus factor is a significant threat to long-term project velocity and resilience. The goal of this plan is to ensure that knowledge is distributed and that the team can continue to operate effectively even if a key member is unavailable.

## 2. Core Principles
*   **No Single Point of Failure:** No single person should be the only one who knows how to perform a critical task.
*   **Knowledge Sharing is Everyone's Responsibility:** All team members are expected to actively participate in documenting and sharing their knowledge.
*   **Documentation as a Primary Tool:** High-quality, up-to-date documentation is our primary defense against knowledge silos.

## 3. Mitigation Strategies

### 3.1. Role Deputies
For every key role, a primary and secondary deputy will be designated. The deputy is not expected to be an expert, but they should have enough context to take over the most critical responsibilities in an emergency.

| Key Role | Primary Deputy | Secondary Deputy |
| :--- | :--- | :--- |
| **Head of Engineering** | Core Backend Lead | Mobile Lead |
| **Core Backend Lead** | Senior Backend Engineer A | Senior Backend Engineer B |
| **Mobile Lead** | Senior iOS Engineer | Senior Android Engineer |
| **SRE Lead** | Senior SRE | Core Backend Lead |
| **Security Lead** | Senior Security Engineer | SRE Lead |

### 3.2. Mandatory Paired Work
*   **Critical Deployments:** All production deployments must be performed by a pair of engineers.
*   **On-call Handoffs:** The outgoing on-call engineer must have a verbal handoff meeting with the incoming on-call engineer to discuss any ongoing issues.
*   **Architectural Decisions:** Major architectural decisions must be documented in an ADR (Architecture Decision Record) and reviewed by at least two other senior engineers.

### 3.3. Knowledge Sharing Culture
*   **Internal Tech Talks:** The team will hold bi-weekly internal tech talks where engineers can share their work and learnings.
*   **Lunch & Learns:** Regular, informal sessions to demonstrate new tools or processes.
*   **"Documentation Days":** One day per quarter will be dedicated to a "documentation hackathon" where the entire team focuses on improving and updating our technical documentation.

### 3.4. Code & Process Ownership
*   **Code Review Mandate:** All pull requests must be reviewed and approved by at least one other engineer before being merged. For critical services, two approvals are required.
*   **Runbook Testing:** All operational runbooks (e.g., Disaster Recovery, Break-Glass) must be tested quarterly by an engineer who is *not* the primary author of the runbook.

## 4. Review Cycle
This succession plan and the designated deputies will be reviewed and updated on an **annual basis**, or whenever there is a significant change in team structure. The Head of Engineering is responsible for this review process.
