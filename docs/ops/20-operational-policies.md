# Operational Policies & Procedures

> **DOCUMENT STATUS: AUTHORITATIVE**
> This document is the single source of truth for key operational policies. It is a living document, maintained by the engineering team.

This document details critical operational policies that must be implemented to ensure the stability, security, and maintainability of the SyncWell platform.

*   **Third-Party API Versioning:** If a partner API introduces a breaking change, a new, separate `DataProvider` implementation must be created. A gradual migration will be managed using a feature flag to control which user cohorts use the new provider.
*   **DataProvider Retirement:** If an integration is no longer supported, users will be notified **via in-app messaging and email** at least 60 days in advance.
*   **API Quota Management:** The system **must** use Redis to track usage against long-term (e.g., monthly) API quotas to prevent service cut-offs.
*   **Schema Migration:** For breaking changes to canonical models, a two-phase deployment will be used. A background data migration job, implemented as a Step Functions workflow, will be used to update existing records.
*   **LocalStack in CI/CD:** The CI/CD pipeline **must** include a stage where backend integration tests are run against LocalStack. A failure in this stage **must** block the build.
*   **Feature Flag Lifecycle:** To prevent technical debt, a quarterly review process, owned by the **Principal Engineer**, will be held to identify and remove obsolete flags. The agenda will include a review of each flag's usage metrics and a decision to retain or remove it.
*   **AppConfig Validators:** To prevent outages from configuration typos, **critical** configurations in AWS AppConfig **must** be deployed with a corresponding validator Lambda function. Critical configurations include the DynamoDB table name, any third-party API endpoints, and the JWT issuer URL.
