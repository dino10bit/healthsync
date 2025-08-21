# SyncWell Coding Style Guidelines

## 1. Overview
This document defines the coding style guidelines for all software developed at SyncWell. A consistent coding style is crucial for readability, maintainability, and collaboration. All code submitted to the SyncWell repositories must adhere to these guidelines.

Style is enforced automatically by linters in our CI/CD pipeline. Pull requests that do not meet these standards will be blocked from merging.

## 2. Language-Specific Guidelines

### 2.1. Kotlin (Backend & Android)
-   **Style Guide:** We adhere strictly to the **[official Kotlin Style Guide](https://kotlinlang.org/docs/coding-conventions.html)** maintained by JetBrains.
-   **Linter:** **Detekt** is used to automatically enforce these conventions. The Detekt configuration is located in the root of the application repository.

### 2.2. TypeScript (Lambdas & Frontend)
-   **Style Guide:** We use the **[Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)**, adapted for TypeScript.
-   **Linter:** **ESLint** with the Airbnb configuration is used to enforce the style. The `.eslintrc.js` file is located in the root of the relevant service's repository.
-   **Formatter:** **Prettier** is used for automatic code formatting.

### 2.3. Python (Lambdas & Scripts)
-   **Style Guide:** We adhere to the **[PEP 8 -- Style Guide for Python Code](https://www.python.org/dev/peps/pep-0008/)**.
-   **Linter:** **Flake8** is used to enforce PEP 8 compliance.
-   **Formatter:** **Black** is used for automatic code formatting to ensure a consistent style with no manual effort.

### 2.4. Swift (iOS)
-   **Style Guide:** We use the **[Ray Wenderlich Swift Style Guide](https://github.com/raywenderlich/swift-style-guide)**.
-   **Linter:** **SwiftLint** is used to enforce these conventions. The `.swiftlint.yml` file is located in the root of the iOS project.

## 3. General Principles
-   **Comments:** Write comments to explain the *why*, not the *what*. Assume the reader understands the language, but needs to understand the business logic or the reason for a specific implementation choice.
-   **Naming:** Use clear, descriptive names for variables, functions, and classes. Avoid abbreviations.
-   **Simplicity:** Prefer simple, readable code over overly clever or complex solutions.
