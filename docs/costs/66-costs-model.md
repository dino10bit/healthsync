# 66: Costs Model & Financial Alignment

> **DOCUMENT STATUS: SINGLE SOURCE OF TRUTH**
> This document is the single, authoritative source of truth for the SyncWell financial model. It has been reconciled with the production architecture defined in `06-technical-architecture.md`.

## 1. Executive Summary

This document provides a reconciled, bottom-up financial analysis for the SyncWell backend architecture. The model is based on the production-ready architecture specified in `06-technical-architecture.md`, which uses **AWS Lambda for the "Hot Path"** sync workload.

The reconciled model estimates a total monthly on-demand cost of **~$12,936** for supporting 1 million Daily Active Users. This figure is significantly higher than previous estimates, which were based on an incorrect compute model (Fargate) and misaligned traffic assumptions.

This document provides:
*   A detailed, service-by-service cost breakdown for the production architecture.
*   A sensitivity analysis showing how costs react to changes in user activity.
*   A list of actionable cost-optimization levers to govern and reduce operational expenditure.

## 2. T-Shirt Cost Estimate (Reconciled, On-Demand)

Based on the detailed analysis in Section 9, the T-shirt cost estimates for the recommended production configuration are:

*   **Low (Conservative Traffic):** **~$7,000 / month**
*   **Mid (Nominal Traffic):** **~$13,000 / month**
*   **High (Aggressive Traffic):** **~$25,000 / month**

**Cost Breakdown (Nominal Scenario):**
*   **Compute (Lambda):** ~48%
*   **Observability (CloudWatch):** ~27%
*   **Database (DynamoDB):** ~8%
*   **Network & Egress:** ~7%
*   **Other (Cache, Messaging, Security, etc.):** ~10%

**Conclusion:** Compute and Observability are the dominant cost drivers, accounting for ~75% of the total monthly spend.

## 3. Reconciled, Production-Ready Monthly Cost Table

This table presents a more realistic, bottom-up cost estimate based on the **recommended production architecture** and the **Nominal traffic model** (1M DAU, 1.35B API requests, 10M syncs/day, ~16.4TB egress).

**Note on Omitted Costs:** This model **intentionally omits** the Fargate compute and data transfer costs for the historical sync "Cold Path" feature. While this feature is a critical post-MVP enhancement, its absence from this model provides a clearer financial picture of the core real-time sync platform. The "Cold Path" costs must be modeled and budgeted for separately before that feature is prioritized.

| Component | Service | Unit Cost | Units (Monthly) | **Reconciled Cost** | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Compute** | AWS Lambda (Graviton) | `$0.00001333/GB-s` | 300M invokes, 1024MB, 1.5s duration | **$6,120** | Aligned with `06-technical-architecture.md`. |
| | | `$0.20/M invokes` | 300M invocations | **$60** | |
| **Database** | DynamoDB (On-Demand) | `$1.25/M WCU` | 600M WCUs (Global Table) | **$750** | Aligned. |
| | | `$0.25/M RCU` | 300M RCUs | **$75** | Aligned. |
| | AWS Backup | `$0.17/GB-month`| 1 TB table size | **$170** | Aligned. |
| **Caching** | ElastiCache for Redis | `$0.266/hr` | 2x `cache.m7g.large` | **$383** | Aligned. |
| **Network/Egress**| NAT Gateway | `$0.045/GB` | 16,400 GB processed | **$738** | Aligned. Assumes VPC Endpoints are used. |
| | Network Firewall | `$0.065/GB` | 1,640 GB (10% of egress) | **$107** | Aligned. |
| **Messaging** | **API Gateway** | `$1.00/M requests` | **1,350M requests** | **$1,350** | **CORRECTED:** Aligned with traffic model. |
| | Amazon SQS | `$0.40/M requests` | ~600M requests | **$240** | Aligned. |
| **Observability**| **CloudWatch Logs** | `$0.50/GB` | **500 GB ingested** | **$250** | **CORRECTED:** Assumes tiered logging is implemented. |
| | CloudWatch Metrics| (Varies) | - | **$750** | Aligned. Assumes EMF is NOT fully adopted yet. |
| | CloudWatch Alarms | (Varies) | - | **$250** | Aligned. |
| **Security** | **AWS WAF** | `$0.60/M requests` | **1,350M requests** | **$810** | **CORRECTED:** Aligned with traffic model. |
| | AWS Inspector | `$1.25/instance` | 50 Fargate tasks (placeholder) | **$63** | Aligned. |
| **Other** | (Secrets Manager, etc.) | - | - | **$250** | Aligned. |
| **TOTAL** | | | | **~$12,376 / month** | *(On-Demand)* |

## 4. Reconciled Cost Metrics & Sensitivity Analysis

*   **Reconciled Cost-per-DAU (Monthly):** `$12,376 / 1,000,000 =` **$0.012 per user per month**.
*   **Reconciled Cost-per-1M-DAU (Annualized):** `$12,376 * 12 =` **$148,512 per year**.

The table below shows how this reconciled cost shifts under different traffic scenarios and with the application of a **3-year, all-upfront Compute Savings Plan (~40% discount on Lambda)**.

| Traffic Scenario | Reconciled Monthly Cost (On-Demand) | Reconciled Monthly Cost (with 3-Yr Savings Plan) |
| :--- | :--- | :--- |
| **Conservative** | ~ $6,800 | **~ $4,900** |
| **Nominal** | ~ $12,376 | **~ $9,900** |
| **Aggressive** | ~ $24,500 | **~ $20,000** |

**Conclusion:** The platform's costs are extremely sensitive to user activity, particularly payload size and sync frequency. A Savings Plan is a powerful lever, but it cannot fix a fundamentally expensive architecture. The **only** way to control costs is to aggressively implement the application-level optimizations.

## 5. Cost Optimization Levers & Governance

The following levers are essential for managing costs. They are categorized by implementation timeline.

#### Quick Wins (Application & Infrastructure Logic)
These are the highest priority and should be implemented before public launch.

*   **Tiered & Sampled Logging:** **(High Impact)** This is primarily an application logic change and is the most effective way to control observability costs.
*   **Metadata-First Data Hydration:** **(High Impact)** This application logic change is mandatory to control network egress costs.
*   **Enforce VPC Endpoints:** **(Medium Impact)** This is a straightforward infrastructure change that provides immediate cost savings on NAT Gateway data transfer.

#### Medium-Term Levers (Commercial & Tuning)
These should be pursued post-beta, once traffic patterns are better understood.

*   **Purchase Savings Plans:** **(High Impact)** The single most effective way to reduce compute costs. A 3-year plan offers the best discount. This should be purchased for a baseline of observed usage after 1-2 months of stable traffic.
*   **Right-size All Resources:** **(Medium Impact)** Continuously use tools like AWS Lambda Power Tuning and Cost Explorer Rightsizing Recommendations to eliminate waste.
*   **S3 Intelligent-Tiering:** **(Low Impact)** Configure this for log archive buckets to automatically optimize storage costs.

### Cost Allocation, Tagging & Reporting

*   **Tagging Policy:** The cost allocation tagging strategy proposed in `66-costs-model.md` is excellent and is adopted as a **mandatory policy**. All cloud resources **must** be tagged with:
    *   `sw:cost-center`
    *   `sw:environment`
    *   `sw:service-name`
    *   `sw:feature`
    *   `sw:owner`
*   **Enforcement:** This policy must be enforced automatically using an **AWS Service Control Policy (SCP)** applied at the root of the AWS Organization.
*   **Reporting:** The finance lead and engineering manager are jointly responsible for creating and reviewing a monthly cost report in AWS Cost Explorer, grouped by the `sw:service-name` and `sw:feature` tags to track spend against budget.
