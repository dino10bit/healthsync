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

## 3. Reconciled, Production-Ready Monthly Cost Table

This table presents a more realistic, bottom-up cost estimate based on the **recommended production architecture** and the **Nominal traffic model** (1M DAU, 10M syncs/day, ~16.4TB egress).

| Component | Service | Unit Cost | Units (Monthly) | **Reconciled Cost** | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Compute** | AWS Lambda (Graviton) | `$0.00001333/GB-s` | 300M invocations, 1024MB, 1.5s duration | **$6,120** | Higher invocation count based on 10 syncs/day. |
| | | `$0.20/M invokes` | 300M invocations | **$60** | |
| **Database** | DynamoDB (On-Demand) | `$1.25/M WCU` | 300M syncs * 2 (Global Table) = 600M WCUs | **$750** | |
| | | `$0.25/M RCU` | 300M syncs * 1 = 300M RCUs | **$75** | |
| | **AWS Backup** | `$0.17/GB-month`| Est. 1 TB table size | **$170** | For managing snapshots. |
| **Caching** | ElastiCache for Redis | `$0.266/hr` | 2x `cache.m6g.large` nodes | **$383** | Aligned with architecture doc. |
| **Network/Egress**| **NAT Gateway** | `$0.045/GB` | **16,400 GB** processed | **$738** | **Critical:** Based on the revised 16.4TB egress model. |
| | **Network Firewall** | `$0.065/GB` | Est. 10% of traffic (1.64TB) | **$107** | Cost for traffic to untrusted endpoints. |
| **Messaging** | API Gateway | `$1.00/M requests` | 300M requests | **$300** | |
| | Amazon SQS (Standard) | `$0.40/M requests` | ~600M requests | **$240** | |
| **Observability**| **CloudWatch Logs** | `$0.50/GB` | Est. 5 TB ingested | **$2,500** | **Critical:** Assumes tiered logging is NOT implemented. |
| | **CloudWatch Metrics**| (Varies) | - | **$750** | High volume of custom metrics. |
| | **CloudWatch Alarms** | (Varies) | - | **$250** | |
| **Security** | AWS WAF | `$0.60/M requests` | 300M requests | **$180** | |
| | AWS Inspector | `$1.25/instance` | Est. 50 Fargate tasks, etc. | **$63** | |
| **Other** | (Secrets Manager, Cognito, etc.) | - | - | **$250** | Includes DR identity provider. |
| **TOTAL** | | | | **~$12,936 / month** | *(On-Demand)* |

## 4. Reconciled Cost Metrics & Sensitivity Analysis

*   **Reconciled Cost-per-DAU (Monthly):** `$12,936 / 1,000,000 =` **$0.013 per user per month**.
*   **Reconciled Cost-per-1M-DAU (Annualized):** `$12,936 * 12 =` **$155,232 per year**.

The table below shows how this reconciled cost shifts under different traffic scenarios and with the application of a **3-year, all-upfront Compute Savings Plan (~40% discount)**.

| Traffic Scenario | Reconciled Monthly Cost (On-Demand) | Reconciled Monthly Cost (with 3-Yr Savings Plan) |
| :--- | :--- | :--- |
| **Conservative** | **~$7,000** | **~$4,800** |
| **Nominal** | **~$12,936** | **~$10,200** |
| **Aggressive** | **~$25,000** | **~$21,500** |

**Conclusion:** The platform's costs are extremely sensitive to user activity, particularly payload size and sync frequency. A Savings Plan is a powerful lever, but it cannot fix a fundamentally expensive architecture. The **only** way to control costs is to aggressively implement the application-level optimizations.

## 5. Cost Optimization Levers & Governance

### Recommended Cost-Optimization Levers (Prioritized)

| Lever | Impact | Est. Savings | Description |
| :--- | :--- | :--- | :--- |
| **Implement Tiered/Sampled Logging** | **High** | $2,000+/month | **MANDATORY.** Failing to implement the tiered logging strategy will result in CloudWatch costs exceeding $5,000/month. This is the highest-impact lever. |
| **Implement Metadata-First Hydration** | **High** | $500+/month | **MANDATORY.** This directly attacks the largest variable cost driver: network egress. Every 10% reduction in egress saves ~$75/month. |
| **Purchase Savings Plans** | **High** | $2,500+/month | Once traffic patterns are predictable (post-beta), purchase a 3-year Compute Savings Plan covering at least 50% of baseline Lambda usage. |
| **Enforce VPC Endpoints** | **Medium** | $200+/month | A simple, high-impact change that reduces NAT gateway data processing charges by keeping traffic on the AWS private network. |
| **Right-size Lambda Memory** | **Medium** | $100-500/month| Use AWS Lambda Power Tuning to find the optimal memory configuration for the worker Lambda. Over-provisioning can cost hundreds per month at scale. |
| **Adopt ARM/Graviton** | **Medium**| Varies | Ensure all applicable services (Lambda, Fargate, ElastiCache) are using the `arm64` architecture for a baseline ~20% price-performance improvement. This is assumed in the cost model but is critical to validate. |
| **S3 Intelligent-Tiering** | **Low** | Varies | Configure this for log archive buckets to automatically optimize storage costs. |

### Cost Allocation & Tagging Strategy

To enable effective cost governance, all provisioned AWS resources **must** be tagged with the following keys. This policy should be enforced via an AWS Service Control Policy (SCP) at the Organization level.

*   `sw:cost-center`: The business unit or team responsible for the cost (e.g., `engineering-syncwell`).
*   `sw:environment`: The environment the resource belongs to (`production`, `staging`, `dev`).
*   `sw:service-name`: The name of the microservice the resource supports (e.g., `hot-path-worker`, `auth-lambda`).
*   `sw:feature`: The specific product feature this resource primarily supports (e.g., `core-sync`, `historical-backfill`, `ai-insights`).
*   `sw:owner`: The email alias of the team responsible for the resource's lifecycle (e.g., `sre-team@syncwell.com`).

These tags will allow for the creation of granular reports in AWS Cost Explorer, enabling the finance and engineering teams to track spend by service, feature, and environment.
