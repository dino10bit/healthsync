# PRD Section 66: Costs Model

## 1. Executive Summary

This document provides a detailed cost analysis for the SyncWell backend architecture, built on AWS Fargate. It outlines the estimated monthly costs under two distinct operational scenarios: "Normal Load" and "Peak Load." The analysis aims to provide clear, data-driven financial projections to inform budgeting and strategic planning.

## 2. Cost Analysis: Normal Load

This analysis models the estimated monthly cost of operating the SyncWell backend under a "Normal Load" scenario, representing typical day-to-day usage by 1 million Daily Active Users (DAU).

### 2.1. Assumptions

This analysis builds on the component pricing from the Peak Load section and introduces assumptions about user activity to create a realistic baseline.

*   **User Base:** 1,000,000 DAU.
*   **Tier Distribution:** 80% Free Tier (800,000 users), 20% Pro Tier (200,000 users).
*   **User Activity:**
    *   Free Tier: 1 automatic + 1 manual sync/day = 2 syncs/user/day.
    *   Pro Tier: 24 automatic + 6 manual syncs/day = 30 syncs/user/day.
*   **Total Daily Jobs:** (800k * 2) + (200k * 30) = 1.6M + 6M = 7.6 million jobs/day.
*   **Average Throughput:** 7.6 million jobs / 86,400 seconds ≈ **88 RPS**.
*   **Monthly Volume:** 7.6 million jobs/day * 30 days = 228 million jobs/month.

### 2.2. Estimated Monthly Cost Breakdown (Normal Load)

| Service | Component | Calculation | Estimated Cost (per Month) |
| :--- | :--- | :--- | :--- |
| **Compute** | AWS Fargate | ~9 concurrent tasks * $0.055/hr * 24 * 30 | $356.40 |
| **Messaging** | Amazon SQS | 228M requests * $0.40/M | $91.20 |
| **Database** | Amazon DynamoDB | (228M writes * $1.40/M) + (22.8M reads * $0.28/M) | $325.58 |
| **Cache** | Amazon ElastiCache | 2 nodes * $0.07/hr * 24 * 30 | $100.80 |
| **Networking**| Data Transfer & VPC Endpoints | 456 GB processed + hourly fees | $26.16 |
| **Total** | | | **~$900.14** |

### 2.3. Analysis

Under normal operating conditions, the estimated monthly cost for the SyncWell backend is approximately **$900**. This represents a highly efficient and sustainable cost structure for supporting one million daily active users.

*   **Key Cost Drivers:** The primary cost drivers at normal load are AWS Fargate compute and DynamoDB writes, which together account for over 75% of the total cost. These costs are variable and scale directly with user activity.
*   **Fixed vs. Variable Costs:** The ElastiCache cluster represents the largest fixed cost component. The Fargate, SQS, and DynamoDB costs are almost entirely variable, which is ideal for a usage-based model as it means costs will naturally decrease during periods of lower activity.
*   **Efficiency of Tiered Model:** The cost model accurately reflects the impact of the tiered sync frequency. Pro users, with their higher sync rates, contribute proportionally more to the variable costs, aligning infrastructure expense with revenue-generating features.

## 3. Cost Analysis: Peak Load

This analysis models the estimated cost of operating the SyncWell backend for **one continuous hour at the peak design load of 3,000 requests per second (RPS)**. This scenario represents the system's maximum throughput capacity.

### 3.1. Assumptions

The following cost analysis is based on a sustained peak load of **3,000 requests per second (RPS)** for one hour. All pricing is based on publicly available AWS pricing for the `us-east-1` region using Graviton2/ARM64 architecture where applicable, as of Q3 2025. These figures are estimates and may vary based on actual usage patterns, data sizes, and AWS pricing changes.

*   **Compute:** AWS Fargate tasks running on Graviton2/ARM64.
*   **Task Sizing:** Each Fargate task is provisioned with 1 vCPU and 2 GB of memory.
*   **Task Throughput:** Each Fargate task is assumed to process 10 jobs/second.
*   **Database Operations:** Each job performs one 1KB read and one 1KB write to DynamoDB.
*   **Caching:** A 90% cache hit rate is assumed for user configuration reads, reducing load on DynamoDB.
*   **Networking:** All backend traffic remains within the AWS network using VPC Endpoints.

### 3.2. Cost Breakdown per Hour at Peak Load

| Service | Component | Calculation | Estimated Cost (per Hour) |
| :--- | :--- | :--- | :--- |
| **Compute** | AWS Fargate | 300 tasks * $0.055/task-hour | $16.50 |
| **Messaging** | Amazon SQS | 10.8M requests * $0.40/M | $4.32 |
| **Database** | Amazon DynamoDB | (10.8M writes * $1.40/M) + (1.08M reads * $0.28/M) | $15.42 |
| **Cache** | Amazon ElastiCache | 2 nodes * `cache.t4g.medium` @ $0.07/hr | $0.14 |
| **Networking**| Data Transfer & VPC Endpoints | ~22 GB processed + hourly endpoint fees | $0.25 |
| **Total** | | | **$36.63** |

### 3.3. Analysis

The analysis shows that at peak load, the system's operational cost is approximately **$36.63 per hour**. The most significant cost drivers are the compute resources (AWS Fargate) and the database write operations (Amazon DynamoDB).

The Fargate-based architecture provides a cost-effective solution for handling this high-throughput workload. The cost scales linearly with the number of tasks required, and the use of Graviton2 instances provides a significant price-performance advantage.

The DynamoDB costs are directly tied to the number of write operations. The strategy to cache user configurations is critical, as it reduces the read-related costs by 90%. Any future optimization to batch writes or reduce the data payload per write could further reduce these costs.

The ElastiCache and Networking costs are relatively minor in comparison, demonstrating the efficiency of the VPC Endpoint strategy.
