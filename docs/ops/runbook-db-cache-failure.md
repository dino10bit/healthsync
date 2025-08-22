# Runbook: Master DB / Cache Failure

This runbook details the steps to follow in the event of a failure of the primary database or cache node. It assumes the recommended Multi-AZ architecture is in place.

## 1. Detection & Verification

1.  CloudWatch alarm fires for "ElastiCache CPU Utilization High" on the primary node and/or "ElastiCache Failover" event is detected.
2.  Application-level metrics show increased latency and cache miss rates.

## 2. Automatic Failover Verification

1.  Navigate to the ElastiCache console in AWS.
2.  Verify that ElastiCache has automatically promoted the replica node to primary. The cluster status should be "available" and the node roles should be swapped.

## 3. Application Recovery Verification

1.  Check the application logs for any connection errors to Redis. The application's Redis client should automatically handle the endpoint change and reconnect.
2.  Monitor the cache miss rate metric. It should spike during the failover and then return to normal levels within 5-10 minutes as the new primary warms up.

## 4. Manual Intervention (If Necessary)

*   **No Action Needed (If Automatic):** If failover is successful and the application recovers, no manual intervention is needed. The runbook is to observe and verify.
*   **Manual Failover (If Automatic Fails):** If the automatic failover does not complete, immediately escalate to AWS Support and execute the manual ElastiCache failover command via the AWS CLI.
