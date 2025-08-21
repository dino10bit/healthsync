# PRD Section 16a: Performance & Scalability Load Testing Plan

## 1. Executive Summary

This document specifies the plan for conducting a mandatory proof-of-concept (PoC) load test to validate the performance and scalability of the SyncWell backend architecture. As outlined in the primary architecture documents, the system is designed to support 1 million DAU, which translates to a projected peak load of **3,000 requests per second (RPS)**. This level of traffic presents significant technical and financial risks.

The primary goal of this load test is to de-risk the launch by validating our core architectural assumptions, measuring performance against our SLOs under production-like load, and identifying any potential bottlenecks before they impact real users.

## 2. Goals & Objectives

The load test has the following primary objectives:
*   **Validate Scalability:** Determine if the serverless backend can successfully scale to handle the target of 3,000 RPS.
*   **Measure Performance against SLOs:** Measure key performance indicators (KPIs), such as API latency and error rates, under heavy load to ensure they remain within the defined SLOs.
*   **Identify Bottlenecks:** Uncover any hidden bottlenecks in the system, including downstream dependencies like third-party APIs, ElastiCache, or DynamoDB.
*   **Assess Cost at Scale:** Use the test results to build a more accurate financial model for the cost of operating the service at our target scale.
*   **Build Confidence:** Provide the engineering and product teams with confidence that the system is ready for a production launch.

## 3. Scope & Test Scenario

### 3.1. In-Scope

*   The test will focus exclusively on the **"hot path" real-time sync workflow**. This is the most frequent and latency-sensitive operation and therefore represents the highest scalability risk.
*   The test will simulate a high volume of authenticated users making concurrent calls to the `POST /v1/sync-jobs` API endpoint.

### 3.2. Out-of-Scope

*   **Cold Path (Historical Syncs):** The Step Functions-based historical sync workflow will not be tested at this time. Its performance characteristics are different and less critical for real-time system stability.
*   **On-device or Hybrid Syncs:** The test will only cover the cloud-to-cloud sync model.
*   **UI Performance:** This test is purely for the backend infrastructure.

### 3.3. Primary Test Scenario: Real-time Sync at Scale

1.  **Authentication:** The test script must first simulate the Firebase authentication flow to acquire a valid JWT for a test user.
2.  **API Call:** The script will then make a `POST` request to the `/v1/sync-jobs` endpoint, including the JWT for authorization and a unique `Idempotency-Key` header.
3.  **Ramp-Up Strategy:** The load test will be executed with a gradual ramp-up of virtual users (VUs) to simulate increasing load:
    *   **Phase 1 (Baseline):** 100 RPS for 10 minutes.
    *   **Phase 2 (Soak Test):** 1,000 RPS for 30 minutes.
    *   **Phase 3 (Peak Load):** Ramp up to **3,000 RPS** and sustain for at least 15 minutes.
    *   **Phase 4 (Stress Test):** Ramp up beyond 3,000 RPS until the system's breaking point is identified (i.e., when error rates exceed 1%).

## 4. Key Metrics & Success Criteria

The following metrics will be monitored closely from AWS CloudWatch during the test. The test will be considered a **success** if all success criteria are met at the peak load of 3,000 RPS.

| Metric | SLO Target (at 3,000 RPS) | Success Criteria |
| :--- | :--- | :--- |
| **API Gateway Latency (P95)** | < 500 ms | P95 latency remains below 500ms. |
| **API Gateway Error Rate (5xx)**| < 0.1% | 5xx error rate remains below 0.1%. |
| **Fargate Task Errors** | < 0.5% | The percentage of Fargate tasks that stop due to an application error remains below 0.5%. |
| **Fargate Task CPU/Memory** | < 80% | The average CPU and Memory utilization across the Fargate service remains below 80%. |
| **DynamoDB Throttled Requests**| 0 | There are zero read or write throttle events. |
| **SQS Hot Path Queue Depth** | < 1,000 (sustained) | The number of visible messages in the main SQS queue does not grow uncontrollably. |
| **ElastiCache CPU Utilization**| < 80% | CPU utilization on the Redis cluster remains at a safe level. |

## 5. Tooling & Environment

*   **Load Generation Tool:** **k6** (by Grafana Labs), as specified in the architecture documentation.
*   **Execution Environment:** The k6 scripts will be run from a dedicated EC2 instance or a containerized service (e.g., Fargate) within the same AWS region as the backend to ensure minimal network latency between the load generator and the API Gateway.
*   **Target Environment:** The load test will be run against a dedicated, production-scale **`load-testing`** environment. This environment must be an exact replica of the production infrastructure, as defined in Terraform. Testing against a non-production-scale environment will not yield valid results.
