# Runbook: Sudden 5-10x Traffic Spike

This runbook details the steps to follow in the event of a sudden, unexpected, and significant increase in traffic.

## 1. Detection & Verification

1.  CloudWatch alarms fire for "High Request Count (API Gateway)," "High Lambda Concurrent Executions," and "High DynamoDB Consumed Capacity."

## 2. Monitor System Scaling

1.  **Lambda:** Check the "Concurrent Executions" metric in the CloudWatch console for the `WorkerLambda`. Confirm it is scaling up automatically to meet demand.
2.  **DynamoDB:** Check the "Read/Write capacity" metrics for the `SyncWellMetadata` table. Confirm that On-Demand capacity is scaling to absorb the load and that no throttling is occurring.
3.  **Third-Party APIs:** Check the custom metric for "ThirdPartyApiHttp429" (Throttling/Rate Limiting). If this metric is spiking, the system is working as designed by backing off, but it indicates a potential capacity issue with a partner API.

## 3. Assess Financial Impact

1.  Navigate to AWS Cost Explorer and review the hourly costs.
2.  Project the cost impact if the spike is sustained.

## 4. Communication

1.  **No Action Needed (If Scaling Correctly):** If the serverless components are scaling as designed and there is no excessive throttling, no action is needed. The system is operating as intended.
2.  **Communicate:** Inform stakeholders (Product, Finance) of the traffic spike and the successful automated scaling response. Provide an initial estimate of the cost impact.
