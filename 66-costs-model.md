# PRD Section 66: Costs Model

## 1. Executive Summary

This document provides a comprehensive financial analysis for the SyncWell backend architecture. It establishes a baseline monthly cost of **~$900** for supporting 1 million Daily Active Users ("Normal Load") and a peak capacity cost of **~$37/hour**.

Beyond these initial models, this document provides a full financial forecast, including:
*   **Long-Term Projections:** Annual costs and scalability models for 5M and 10M DAU.
*   **Business Viability:** A Cost of Goods Sold (COGS) analysis, breaking down the cost per Pro user to inform pricing strategy.
*   **Ancillary Costs:** An estimation of long-term data storage costs.
*   **Risk Assessment:** A sensitivity analysis exploring how costs may vary with changes in key assumptions.

The analysis concludes that the architecture is highly cost-effective and scales predictably, providing a solid financial foundation for strategic planning and business growth.

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

## 4. Financial Projections & Scalability

While the previous sections focus on monthly and hourly costs under specific loads, this section provides a longer-term financial outlook, projecting annual costs and modeling how those costs are expected to scale with significant user growth.

### 4.1. Annual Cost Projection (1M DAU)

Based on the "Normal Load" analysis, the estimated monthly cost is **~$900**. Extrapolating this over a full year provides a baseline annual operational cost.

*   **Calculation:** $900.14/month * 12 months = **$10,801.68**
*   **Projected Annual Cost:** Approximately **$10,800 per year**.

This figure represents the estimated baseline cost for the first year of operation, assuming the user base stabilizes around the 1M DAU mark.

### 4.2. Scalability Analysis

A key strength of the serverless and managed-service architecture is its ability to scale costs predictably with usage. The following table models the estimated monthly and annual costs for larger user bases, assuming the tier distribution (80% Free / 20% Pro) and user activity patterns remain consistent.

| Metric | 1M DAU (Baseline) | 5M DAU (Projected) | 10M DAU (Projected) |
| :--- | :--- | :--- | :--- |
| **Variable Costs/Month** | ~$800 | ~$4,000 | ~$8,000 |
| **Fixed Costs/Month (Cache)**| ~$100 (2 nodes) | ~$200 (4 nodes) | ~$400 (8 nodes) |
| **Total Monthly Cost** | **~$900** | **~$4,200** | **~$8,400** |
| **Total Annual Cost** | **~$10,800** | **~$50,400** | **~$100,800** |

**Analysis of Scalability:**

*   **Linear Cost Growth:** As illustrated, the majority of the costs (Fargate, SQS, DynamoDB) scale in a predictable, linear fashion with the number of active users and their jobs.
*   **Step Scaling for Cache:** The primary fixed cost, the ElastiCache cluster, will require periodic "step scaling." For instance, the cluster size might be doubled to handle the load of 5M DAU, and doubled again for 10M DAU. While this is a fixed cost, it scales predictably at major growth milestones.
*   **Economy of Scale:** The cost per user remains relatively constant at large scales, demonstrating that the architecture does not introduce significant overhead as it grows. This predictability is crucial for long-term financial planning and for maintaining healthy profit margins as the user base expands.

### 4.2.1. Early-Stage Scaling Scenarios

The model above shows how costs scale for a large user base. It is also useful to project costs for the early stages of the product's lifecycle, when the user base is much smaller.

| Metric | 1,000 DAU | 10,000 DAU | 100,000 DAU |
| :--- | :--- | :--- | :--- |
| **Variable Costs/Month** | ~$1 | ~$8 | ~$80 |
| **Fixed Costs/Month (Cache)**| ~$100 | ~$100 | ~$100 |
| **Total Monthly Cost** | **~$101** | **~$108** | **~$180** |
| **Total Annual Cost** | **~$1,212** | **~$1,296** | **~$2,160** |

**Analysis of Early-Stage Scaling:**

At lower user volumes, the dynamic is different. The **fixed cost** of the baseline ElastiCache cluster (assumed to be the minimum required for the service) becomes the dominant component of the total cost. As a result, the average cost per user is significantly higher during this phase than at the 1M DAU scale. This is a typical financial characteristic for services with foundational infrastructure requirements and underscores the importance of achieving a critical mass of users to improve cost efficiency.

## 5. Cost of Goods Sold (COGS) Analysis

To connect infrastructure costs to business metrics, this section reframes the monthly operational cost as a Cost of Goods Sold (COGS). This analysis is critical for understanding the profitability of the service, especially the Pro tier. The following calculations are based on the 1M DAU "Normal Load" scenario.

### 5.1. Blended Average Cost Per User (ACPU)

The simplest metric is the average cost across all users.

*   **Calculation:** $900.14 (Total Monthly Cost) / 1,000,000 (DAU) = **$0.0009**
*   **ACPU:** Approximately **$0.0009 per user per month**.

While simple, this metric hides the significant cost difference between Free and Pro users.

### 5.2. Tier-Specific Cost Analysis

A more insightful analysis involves attributing costs to each user tier based on their actual resource consumption.

*   **Usage Distribution:**
    *   Free Tier: 1.6M jobs/day (21% of total)
    *   Pro Tier: 6.0M jobs/day (79% of total)
*   **Cost Allocation:**
    *   Variable costs (~$800/month) are allocated based on usage distribution.
    *   Fixed costs (~$100/month) are allocated on a per-capita basis.

| Tier | Users | Variable Cost (Attributed) | Fixed Cost (Attributed) | Total Tier Cost | Cost per User / Month |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Free** | 800,000 | ~$168 | ~$80 | ~$248 | **~$0.00031** |
| **Pro** | 200,000 | ~$632 | ~$20 | ~$652 | **~$0.00326** |

**Analysis:**

*   **Cost Disparity:** A Pro tier user costs approximately **10.5 times more** to support than a Free tier user. This is directly aligned with their higher sync frequency (30 syncs/day for Pro vs. 2 for Free).
*   **Profitability Insight:** This COGS data is vital for pricing decisions. If the Pro tier is priced at $2.99/month, the infrastructure cost of ~$0.0033 represents only **0.11%** of the revenue from that user. This indicates an extremely healthy gross margin on the core service.
*   **Strategic Value:** This analysis justifies the feature limitations on the Free tier. The low cost per free user makes it a sustainable acquisition channel, while the model clearly shows that the high-frequency sync features must be reserved for the revenue-generating Pro tier.

## 6. Long-Term Data Storage Costs

The primary cost model focuses on transactional compute and database I/O. However, for a comprehensive financial forecast, it is important to model the costs of data storage at rest, which will grow over time. The main components are DynamoDB table storage and S3 storage for backups and logs.

### 6.1. DynamoDB Storage

This covers the storage of live user data within DynamoDB tables.

*   **Assumption:** Average data size of 2 KB per user (for profiles, connections, state).
*   **Calculation (1M DAU):** 1,000,000 users * 2 KB/user = 2 GB of data.
*   **Monthly Cost (1M DAU):** 2 GB * $0.25/GB-month = **$0.50**
*   **Projection (10M DAU):** 20 GB * $0.25/GB-month = **$5.00**

Analysis shows that the cost of storing active user data in DynamoDB is negligible compared to the transactional costs.

### 6.2. S3 Storage (Backups and Logs)

This covers automated backups and application log storage, which are critical for disaster recovery and observability.

*   **DynamoDB Backups (PITR):** Point-in-Time Recovery costs are based on the size of the source table.
    *   **Monthly Cost (1M DAU):** 2 GB * $0.20/GB-month = **$0.40**
*   **Application Logs:**
    *   **Assumption:** Each of the 7.6M daily jobs generates 1 KB of log data, resulting in ~228 GB of new logs per month.
    *   **Lifecycle Policy:** To manage costs, logs are stored in S3 Standard for 30 days, transitioned to S3 Glacier Instant Retrieval for 60 days, and then deleted.
    *   **Estimated Stabilized Monthly Cost:** After 3 months, the log storage cost will stabilize at approximately **$7.00 per month** for the 1M DAU load.

### 6.3. Summary of Storage Costs

The combined monthly storage cost for the 1M DAU scenario is approximately **$8 per month**. While this is a small component of the total operational cost, it is a recurring and growing expense that should be factored into long-term financial models.

## 7. Sensitivity Analysis

The cost models presented in this document are based on a specific set of assumptions. This section explores how the total cost could be affected by changes in some of those key assumptions.

### 7.1. AWS Pricing Fluctuations

The model assumes static AWS pricing. In reality, prices can and do change.

*   **Risk:** A general increase in AWS service prices would lead to a corresponding increase in operational costs.
*   **Mitigation:** The architecture's reliance on AWS Graviton-based instances (Fargate) and managed services already provides a strong price-performance advantage. As the workload stabilizes, committing to **AWS Savings Plans** for Fargate and CPU-based ElastiCache usage could lock in discounts of up to 50% or more, providing significant long-term cost certainty.

### 7.2. Cache Hit Rate Changes

The model assumes a 90% cache hit rate for user configuration reads, which dramatically reduces the load on DynamoDB.

*   **Impact of Degraded Performance:** If the cache hit rate were to drop to **80%**, the number of read requests sent to DynamoDB would double (from 10% of jobs to 20%).
*   **Cost Impact:** For the 1M DAU scenario, this would increase the DynamoDB read cost from ~$6.40 to ~$12.80 per month. While the absolute cost increase is small, this demonstrates that the cache is a critical component for protecting the main database and controlling costs. Maintaining high cache performance should be a key operational goal.

### 7.3. User Activity and Tier Distribution

The model is highly sensitive to the distribution of users between the Free and Pro tiers and their sync frequency.

*   **Impact of Pro Tier Adoption:** The model assumes an 80/20 split between Free and Pro users. If this split shifted to **70/30**, the total number of daily jobs would increase by **~37%** (from 7.6M to 10.4M).
*   **Cost Impact:** This would cause the variable portion of the monthly cost to increase by a similar percentage, raising the total estimated monthly cost from ~$900 to nearly **$1,200**. This highlights a direct relationship between revenue growth (more Pro users) and infrastructure cost, reinforcing the importance of the COGS analysis for ensuring that pricing remains profitable.
