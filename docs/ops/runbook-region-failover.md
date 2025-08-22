# Runbook: Full Region Outage

This runbook details the steps to follow in the event of a full, unrecoverable outage of the primary AWS region (`us-east-1`).

## 1. Detection & Verification

1.  A major CloudWatch alarm for "API Unhealthy" fires and does not resolve.
2.  The AWS Health Dashboard confirms a large-scale service disruption in the primary region (`us-east-1`).

## 2. Escalation

1.  The on-call engineer escalates to the Incident Commander.
2.  The Incident Commander declares a disaster and initiates this runbook.

## 3. Failover Execution

Run the pre-approved, tested failover script: `scripts/failover-to-dr.sh`.

This script performs the following actions via the AWS CLI/SDK:

1.  **Promote DR Database:** Updates the DynamoDB Global Table replica in `us-west-2` to be the new primary write endpoint.
2.  **Update App Configuration:** Changes the `dynamodb.tableName` value in AWS AppConfig to the ARN of the now-primary table in `us-west-2`.
3.  **Switch DNS:** Updates the primary Route 53 CNAME record to point to the API Gateway endpoint in `us-west-2`.

## 4. Verification

1.  Run a synthetic test (`canary.js`) against the public API endpoint to confirm it is serving traffic from the DR region.
2.  Manually check the AWS console to confirm Route 53 and AppConfig have been updated correctly.

## 5. Communication

1.  Update the public status page to "Monitoring".
2.  Communicate with all relevant internal stakeholders.
