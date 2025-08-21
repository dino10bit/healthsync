## Dependencies

### Core Dependencies
- `07-apis-integration.md` - APIs & Integration
- `06-technical-architecture.md` - Technical Architecture

### Strategic / Indirect Dependencies
- `62-developer-onboarding.md` - Developer Onboarding (Deep Dive)

---

# PRD Section 61: Internal API Documentation (Deep Dive)

## 1. Introduction & Philosophy
This document provides the comprehensive strategy for our internal API documentation.
-   **Philosophy:**
    -   **Docs as Code:** Documentation should live with the code that it describes. It should be generated, not manually written.
    -   **Single Source of Truth:** The generated documentation portal is the undeniable source of truth for all API contracts.
    -   **Audience-First:** The documentation is written for our primary audience: SyncWell developers. It should be clear, concise, and easy to use.

## 2. The OpenAPI Specification (OAS)
-   **Standard:** We will use the OpenAPI Specification 3.0 (OAS3) for defining our API contracts.
-   **Key Components:**
    -   `info`: Metadata about the API (version, title).
    -   `servers`: The base URLs for different environments (dev, staging, prod).
    -   `paths`: The core of the spec, defining each endpoint, its HTTP method, parameters, and responses.
    -   `components/schemas`: Reusable data models for request and response bodies.
    -   `components/securitySchemes`: Defines the authentication method (e.g., JWT).

## 3. The Documentation Toolchain

### 3.1. Code Annotation Style Guide
-   We will use annotations directly in our backend code (e.g., JSDoc-style comments for a Node.js backend) to define the OAS.
-   **Style Guide:**
    -   Every endpoint must have a `@summary` and `@description` tag.
    -   Every parameter must have a `@param` tag with its type, name, and description.
    -   Every response must have a `@returns` tag with the status code and a reference to a response schema.

### 3.2. Automated Generation Workflow
This process is part of our CI/CD pipeline.
1.  **Commit:** A developer commits code with new/updated annotations.
2.  **Lint:** A linting step checks if the annotations are correctly formatted.
3.  **Generate:** A tool (e.g., `swagger-jsdoc`) scans the codebase and generates a single `openapi.json` file.
4.  **Deploy:** The generated `openapi.json` is deployed to a static hosting service (e.g., S3 bucket).

### 3.3. Interactive UI: Swagger UI vs. Redoc
-   **Swagger UI:** The most popular tool. Its key feature is the "Try It Out" functionality.
-   **Redoc:** Creates a beautiful, three-pane static documentation site. Generally considered more readable. Does not have a built-in "Try It Out" feature.
-   **Decision:** We will use **Swagger UI**. The interactive "Try It Out" feature is a killer feature for developer productivity and debugging, making it more valuable than Redoc's superior aesthetics for our internal purposes.

## 4. Documentation Lifecycle & Processes

### 4.1. API Versioning Strategy
-   All our APIs will be versioned in the URL path (e.g., `/v1/`, `/v2/`).
-   A new version will be introduced for any breaking change.
-   The documentation portal will have a dropdown to switch between different versions of the API documentation.

### 4.2. "Try It Out" Functionality
-   The Swagger UI will be configured so that the "Try It Out" feature points to our **staging environment**.
-   Developers can acquire a valid JWT for the staging environment and use it in the Swagger UI to make live API calls, which is invaluable for testing and debugging.

### 4.3. Contribution & Review Process
-   **Contribution:** A developer updates the API documentation by changing the annotations in the code as part of their feature branch.
-   **Review:** During a pull request review, the reviewer is responsible for checking that the code changes are accurately reflected in the documentation annotations. The PR cannot be merged if the docs are out of sync with the code's behavior.

## 5. Measuring Success

### 5.1. Measuring Documentation Quality
-   **Metric: Time to First API Call:** For new developers, we will track the time it takes from their start date to them successfully making their first API call to the staging environment using the docs. Our goal is < 2 days.
-   **Metric: Developer Confidence Score:** We will run a quarterly anonymous survey asking developers to rate their confidence in the API documentation on a scale of 1-5. Our goal is a score of > 4.0.

### 5.2. Onboarding with Documentation
-   The `62-developer-onboarding.md` guide will instruct new developers to read the "API Documentation" as one of their first tasks.
-   Their first "good issue" will often involve using the documentation to understand an endpoint and then fix a bug or add a small enhancement to it.

## 6. Analysis & Calculations
### 6.1. Impact on Developer Velocity
-   **Hypothesis:** A well-documented API, generated automatically from code, will significantly reduce the time developers spend understanding the backend, leading to faster feature development and easier onboarding.
-   **Analysis:**
    -   **Without Docs:** A new developer might spend hours reading through unfamiliar backend code to understand how to call a specific endpoint, its parameters, and its response structure. This process is error-prone and slow.
    -   **With Docs:** A developer can consult the interactive API documentation and understand the endpoint in minutes. The ability to use "try it out" features directly in the docs (like Swagger UI provides) further accelerates this process.
-   **Calculation (Time Saved):**
    -   *Assumptions:*
        -   A new developer works on 10 tasks involving new API endpoints in their first month.
        -   Time saved per task by using docs vs. reading code: **1.5 hours**.
    -   *Total Time Saved per New Developer per Month* = 10 tasks * 1.5 hours/task = **15 hours**.
-   **Conclusion:** Investing in a docs-as-code approach saves approximately two full workdays per new developer in their first month alone, dramatically accelerating their time-to-productivity. This is a high-leverage investment for a growing team.

### 6.2. Bug Reduction Analysis
-   **Hypothesis:** Clear, auto-generated API documentation reduces the number of bugs caused by incorrect API usage (e.g., sending the wrong data type, misunderstanding an error response).
-   **Analysis:** Bugs related to API misuse are common, especially between mobile and backend teams. They often manifest as "it works on my machine" issues and can be time-consuming to debug. By providing a single source of truth that is guaranteed to be in sync with the code, we eliminate this entire class of bugs.
-   **Goal:** We aim for **zero critical bugs** caused by a misunderstanding of an API's contract (request/response shape).
-   **Measurement:** During bug triage, we will specifically look for the root cause. If a bug is caused by a developer misusing an API, we will track it. The goal is to drive this number down to near-zero as the documentation culture is adopted.

## 7. Out of Scope
-   A public-facing developer API or partner API. This documentation is strictly for internal use.
-   Manually written, long-form API guides (the focus is on auto-generated reference documentation).
