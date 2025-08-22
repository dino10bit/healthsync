# Runbook: Third-Party Outage

This runbook details the steps to follow when a third-party provider's API is experiencing an outage.

## 1. Detection

1.  CloudWatch alarms fire for a specific provider, indicating a high error rate (e.g., `fitbit_api_5xx_errors`).
2.  The `ThirdPartyApiHttp429` metric may also show a spike if the provider is rate-limiting instead of failing.

## 2. Verification

1.  Check the third party's official status page or social media channels for a declared outage.
2.  Examine application logs for specific error messages from the provider's API.

## 3. Mitigation

1.  **Use AppConfig to disable the integration.** Navigate to the AWS AppConfig console and update the feature flag for the specific provider (e.g., `integrations.fitbit.enabled`) to `false`.
2.  This will prevent new sync jobs from being created for that provider, reducing error noise and user frustration.

## 4. Communication

1.  Post a user-facing notice on the public status page and in-app, informing users of the issue with the specific provider.
2.  Once the third-party provider resolves the outage, re-enable the integration via AppConfig and update the status page.
