# 66: Costs Model & Financial Alignment

> **DOCUMENT STATUS: SINGLE SOURCE OF TRUTH**
> This document is the single, authoritative source of truth for the SyncWell financial model. It has been reconciled with the production architecture defined in `06-technical-architecture.md`.

## 1. Executive Summary

This document provides a reconciled, bottom-up financial analysis for the SyncWell backend architecture. The model is based on the production-ready architecture specified in `06-technical-architecture.md`, which uses **AWS Lambda for the "Hot Path"** sync workload.

The reconciled model estimates a total monthly on-demand cost of **~$7,914** for supporting 1 million Daily Active Users. This figure is approximately **7 times higher** than previous estimates, which were based on an incorrect compute model (Fargate) and misaligned traffic assumptions.

This document provides:
*   A detailed, service-by-service cost breakdown for the production architecture.
*   A sensitivity analysis showing how costs react to changes in user activity.
*   A list of actionable cost-optimization levers to govern and reduce operational expenditure.

## 2. Verification of Cost Assumptions

The following table highlights the critical mismatches between the original cost model and the production architecture that have now been resolved.

| Assumption Area | Original Assumption | Production Reality & Recommendation | Status |
| :--- | :--- | :--- | :--- |
| **Hot-Path Compute** | AWS Fargate (`~95/mo`) | **AWS Lambda** is the correct service for this workload. | **[DONE]** |
| **Network Egress** | 1.6 TB / month | **~9.1 TB / month** based on the Nominal traffic model. | **[DONE]** |
| **Caching Cluster** | 2x `cache.t4g.medium` (`~$101/mo`) | **2x `cache.m6g.large` Multi-AZ** is required for HA. | **[DONE]** |
| **Database DR** | Not explicitly costed. | **DynamoDB Global Tables** are recommended, which doubles write costs. | **[DONE]** |
| **Total Monthly Cost**| **~$1,130 / month** | The estimate was based on fundamentally incorrect inputs. | **[DONE]** |

## 3. Reconciled Production Monthly Cost Estimate (Nominal Scenario)

This table presents the re-calculated, bottom-up cost estimate based on the **recommended production architecture** and the **Nominal traffic model** (1M DAU, 7.6M syncs/day).

| Component | Service | Unit Cost | Units (Monthly) | Reconciled Cost |
| :--- | :--- | :--- | :--- | :--- |
| **Compute** | AWS Lambda (Graviton) | `$0.00001333/GB-s` | 228M invocations, 1024MB, 1.5s avg duration | **$4,561** |
| | | `$0.20/M invokes` | 228M invocations | **$46** |
| **Database** | DynamoDB (On-Demand) | `$1.25/M WCU` | 456M WCUs (Global Table x2) | **$570** |
| | | `$0.25/M RCU` | 456M RCUs | **$114** |
| **Caching** | ElastiCache for Redis | `$0.266/hr` | 2x `cache.m6g.large` nodes | **$383** |
| **Network/Egress**| NAT Gateway | `$0.045/GB` | 9,100 GB processed | **$410** |
| | | `$0.045/hr` | 2x NAT Gateways (Multi-AZ) | **$65** |
| **Messaging** | Amazon SQS (Standard) | `$0.40/M requests` | ~500M requests | **$200** |
| | API Gateway | `$1.00/M requests` | 228M requests | **$228** |
| **Observability**| CloudWatch | (Logs, Metrics, Alarms) | Based on Lambda/API volume | **$1,250** |
| **Security** | AWS WAF | `$0.60/M requests` | 228M requests | **$137** |
| **Other** | (S3, Secrets Manager, etc.) | - | - | **$50** |
| **TOTAL** | | | | **~$7,914 / month** |

**Analysis:** The reconciled monthly cost is **~$7,914**. The primary drivers of this increase are using the correct compute service (Lambda) for the event-driven workload and using a more realistic network egress data volume based on validated traffic models.

## 4. Cost Metrics & Sensitivity Analysis

### Reconciled Cost Metrics
*   **Cost-per-DAU (Monthly):** `$7,914 / 1,000,000 =` **$0.0079 per user per month**.
*   **Cost-per-1M-DAU (Annualized):** `$7,914 * 12 =` **$94,968 per year**.

### T-Shirt Cost Estimate (Reconciled)
Based on the detailed analysis, the estimated monthly on-demand costs for the recommended production configuration at 1M DAU are:
*   **Low (Conservative Traffic):** **~$4,500 / month**
*   **Mid (Nominal Traffic):** **~$7,900 / month**
*   **High (Aggressive Traffic):** **~$15,500 / month**

### Sensitivity Analysis
This analysis shows how the reconciled monthly cost shifts based on traffic and commercial levers. The platform's costs are highly sensitive to user activity.

| Scenario | Monthly Cost (On-Demand) | Monthly Cost (3-Yr Savings Plan, 40% off compute) |
| :--- | :--- | :--- |
| **Conservative Traffic** | **~$4,500** | **~$2,700** |
| **Nominal Traffic** | **~$7,914** | **~$6,090** |
| **Aggressive Traffic** | **~$15,500**| **~$12,400**|

**Conclusion:** A 3-year Compute Savings Plan is the most effective lever for reducing costs, offering a **~23% reduction** in the nominal scenario by committing to a baseline of Lambda usage.

## 5. Cost Optimization Levers & Governance

### Recommended Cost-Optimization Levers

| Lever | Impact | Implementation Effort | Description |
| :--- | :--- | :--- | :--- |
| **Purchase Savings Plans** | **High** | Low | Commit to a 1 or 3-year Compute Savings Plan to receive a significant discount (up to 66%) on Lambda and Fargate usage. |
| **Implement Tiered Logging** | **High** | Medium | Implement logic in the application to sample logs from `FREE` tier users at a much lower rate than `PRO` users. This directly attacks the largest cost center (CloudWatch). |
| **Optimize Data Hydration**| **Medium**| Medium | Fully implement the "metadata-first" data fetching pattern to reduce network egress, which is a significant variable cost. Every 10% reduction in payload size saves over **$40/month**. |
| **Adopt ARM/Graviton** | **Medium**| Low | Ensure all applicable services (Lambda, Fargate, ElastiCache) are using the `arm64` architecture for a baseline ~20% price-performance improvement. |
| **S3 Intelligent-Tiering** | **Low** | Low | Use S3 Intelligent-Tiering for log archives to automatically move them to cheaper storage classes. |

### Cost Allocation & Tagging Strategy

To enable effective cost governance, all provisioned AWS resources **must** be tagged with the following keys. This policy should be enforced via an AWS Service Control Policy (SCP) at the Organization level.

*   `sw:cost-center`: The business unit or team responsible for the cost (e.g., `engineering-syncwell`).
*   `sw:environment`: The environment the resource belongs to (`production`, `staging`, `dev`).
*   `sw:service-name`: The name of the microservice the resource supports (e.g., `hot-path-worker`, `auth-lambda`).
*   `sw:feature`: The specific product feature this resource primarily supports (e.g., `core-sync`, `historical-backfill`, `ai-insights`).
*   `sw:owner`: The email alias of the team responsible for the resource's lifecycle (e.g., `sre-team@syncwell.com`).

These tags will allow for the creation of granular reports in AWS Cost Explorer, enabling the finance and engineering teams to track spend by service, feature, and environment.
