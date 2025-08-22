# SyncWell Financial Model & FinOps Framework (v2)

## 0. Document Management

| Version | Date       | Author(s)                 | Summary of Changes                                                              |
| :------ | :--------- | :------------------------ | :------------------------------------------------------------------------------ |
| 2.0     | 2025-08-22 | Jules, Solutions Architect | Initial draft of the V2 financial model, aligning with the phased compute strategy. |

---

## 1. Executive Summary

This document presents a 24-month financial forecast for the SyncWell platform, directly reflecting the strategic decision to employ a phased compute architecture. The model is built on a core assumption: launching with AWS Lambda for speed and operational simplicity, then migrating the primary workload to AWS Fargate as we scale past 100,000 Daily Active Users (DAU) to optimize for cost at high, sustained volumes.

**The key financial takeaway is that this hybrid approach is significantly more capital-efficient than a single-platform strategy.**

*   **Phase 1 (Launch to 100k DAU):** The Lambda-based model minimizes idle costs and operational overhead, perfectly aligning with the unpredictable usage patterns of a new product. We pay purely for what we use.
*   **Phase 2 (100k to 1M DAU):** The Fargate-based model provides superior cost-performance for the high-throughput, predictable workload of a scaled user base. The cost per-request drops significantly, leading to substantial savings.

This forecast demonstrates that the planned transition at the 100k DAU mark is the correct strategic decision, avoiding premature optimization while ensuring long-term cost efficiency. The accompanying FinOps framework provides the governance and tools necessary to monitor and control these costs as we grow.

---

## 2. Core Assumptions & Growth Model

The accuracy of this forecast depends on a set of core assumptions about user behavior and system performance. These will be monitored and refined post-launch.

### Core Assumptions

*   **User Activity:**
    *   Average API requests per DAU per day: **5** (sync checks, profile updates, etc.)
    *   Average P99 Lambda function duration: **300 ms**
    *   Average P99 Fargate task response time: **250 ms**
*   **Data Storage:**
    *   Data stored per user in DynamoDB: **5 MB/year**
    *   Data stored per user in S3 (for large objects/backups): **10 MB/year**
*   **Service Usage:**
    *   API Gateway requests: Equal to total user API requests.
    *   Cognito MAUs: Equal to DAU x 2 (assuming some monthly users are not daily).
    *   SQS Messages: 2 messages per user API request (request and response).
    *   Data Transfer: Estimated as 10% of total service costs.
*   **Compute Sizing:**
    *   Lambda Memory Allocation: **1024 MB**
    *   Fargate Task Size: **0.5 vCPU / 1 GB Memory**

### 24-Month User Growth Model

This model shows a steady growth curve, accelerating after finding product-market fit. The critical **100,000 DAU** transition point is reached in **Month 9**.

| Month | DAU     | Phase     |
| :---- | :------ | :-------- |
| 1     | 1,000   | Lambda    |
| 3     | 10,000  | Lambda    |
| 6     | 50,000  | Lambda    |
| **9** | **100,000** | **Transition** |
| 12    | 250,000 | Fargate   |
| 18    | 600,000 | Fargate   |
| 24    | 1,000,000 | Fargate |

---

## 3. Two-Phase Cost Projection

The following table presents a monthly cost forecast, broken down by AWS service. The model clearly switches from Lambda-based compute costs to Fargate-based costs in Month 9.

*(Note: All costs are estimates based on `us-east-1` pricing as of August 2025 and are for illustrative purposes.)*

| Metric / Service        | Month 6 (50k DAU) | Month 9 (100k DAU) | Month 12 (250k DAU) | Month 24 (1M DAU) | Calculation Basis (Phase 2)                                |
| :---------------------- | :---------------- | :----------------- | :------------------ | :---------------- | :--------------------------------------------------------- |
| **User Base**           | **50,000 DAU**    | **100,000 DAU**    | **250,000 DAU**     | **1,000,000 DAU** | -                                                          |
| **Compute Phase**       | **Lambda**        | **Fargate**        | **Fargate**         | **Fargate**         | -                                                          |
| ---                     | ---               | ---                | ---                 | ---               | ---                                                        |
| **Compute Costs**       |                   |                    |                     |                   |                                                            |
| AWS Lambda              | $545              | *$1,090 (Crossover)* | -                   | -                 | `(Invocations + GB-seconds)`                               |
| AWS Fargate             | -                 | **$835**           | **$2,088**          | **$8,352**          | `(vCPU-hours + GB-hours) * Task Count`                     |
| **Other Services**      |                   |                    |                     |                   |                                                            |
| API Gateway             | $263              | $525               | $1,313             | $5,250            | `Requests * $3.50/M`                                       |
| DynamoDB (On-Demand)    | $625              | $1,250             | $3,125             | $12,500           | `(Write Units + Read Units + Storage)`                     |
| Amazon S3 (Standard)    | $12               | $23                | $58                | $230              | `Storage GB + PUT/GET Requests`                            |
| Amazon SQS              | $60               | $120               | $300               | $1,200            | `Requests * $0.40/M`                                       |
| Amazon Cognito          | $165              | $413               | $1,238             | $5,375            | `MAU Tiered Pricing`                                       |
| AWS Secrets Manager     | $40               | $40                | $40                | $40               | `Fixed per Secret`                                         |
| AWS KMS                 | $20               | $20                | $20                | $20               | `Fixed per CMK`                                            |
| CloudWatch              | $150              | $300               | $750               | $3,000            | `(Logs Ingested + Metrics + Alarms)`                       |
| **Subtotal**            | **$1,880**        | **$3,526**         | **$8,932**          | **$35,987**         | -                                                          |
| Data Transfer (Est. 10%)| $188              | $353               | $893               | $3,599            | `10% of Service Costs`                                     |
| **Total Monthly Cost**  | **$2,068**        | **$3,879**         | **$9,825**          | **$39,586**         | -                                                          |

---

## 4. Cost Crossover Analysis

This analysis is critical to justifying the phased compute strategy. It identifies the point at which running the workload on AWS Fargate becomes more economical than continuing to scale with AWS Lambda.

Our model, based on the assumptions in Section 2, shows that the **cost crossover point occurs at approximately 85,000-90,000 DAU**. At this level, the monthly cost for the Lambda-based compute service is projected to be around **$950-$1000**. The cost for a constantly running, auto-scaling Fargate service to handle the same load is projected to be around **$800**.

We have chosen **100,000 DAU** as the official trigger point for migration. This provides a conservative buffer and ensures the migration happens when the economic benefits are unambiguous and substantial.

```mermaid
graph TD
    subgraph "Compute Cost vs. User Scale"
        A[Cost per Month] --> B(Users);
        LambdaCost---FargateCost;
    end

    subgraph Legend
        L[-- Lambda Cost]
        F[-- Fargate Cost]
        C[Crossover Point]
    end

    %% This is a conceptual representation of the chart data.
    %% Mermaid doesn't support real line charts, so this is illustrative.
    stateDiagram-v2
        direction LR
        state "Start (0 DAU)" as S
        state "100k DAU" as T
        state "1M DAU" as E

        S --> T
        T --> E

        state "Lambda Cost Curve" as LC {
            direction LR
            [*] --> C1 : Rises linearly
            C1 --> C2 : Continues rising
        }

        state "Fargate Cost Curve" as FC {
            direction LR
            [*] --> C3 : Higher initial cost
            C3 --> C4 : Flatter scaling
        }

        note right of T : Crossover Point (~90k DAU)
```

**Justification:**

*   **Below 100k DAU:** Lambda is cheaper. Its pay-per-invocation model means we don't pay for idle compute, which is common with early-stage products. The cost scales linearly with usage.
*   **Above 100k DAU:** Fargate becomes cheaper. While Fargate has a higher baseline cost (for the minimum number of running tasks), its ability to handle millions of requests on a fixed set of resources makes the per-request cost significantly lower than Lambda's at high volume. The cost scales more slowly as usage grows, as the existing tasks simply absorb more traffic before scaling up.

---

## 5. TCO & FinOps Framework

### Total Cost of Ownership (TCO)

A simple TCO analysis must include not only direct AWS service costs but also operational and development overhead.

*   **Phase 1 (Lambda):**
    *   **Direct Costs:** Lower, as detailed above.
    *   **Operational Overhead:** Extremely low. No patching, no server management. Developers focus purely on application code.
    *   **TCO:** Low. Ideal for the MVP phase where developer velocity is the priority.

*   **Phase 2 (Fargate):**
    *   **Direct Costs:** Lower at scale, as detailed above.
    *   **Operational Overhead:** Higher than Lambda. Requires management of containers, task definitions, and VPC networking. However, using Fargate (serverless containers) abstracts away the underlying EC2 instances, keeping this overhead manageable.
    *   **TCO:** Higher operational cost is justified by the significant reduction in direct service costs, leading to a lower overall TCO at scale.

The phased strategy allows us to have the lowest possible TCO at each stage of our growth.

### FinOps Framework for AWS

To ensure we maintain financial discipline, we will implement a FinOps framework from day one.

**1. Visibility & Tagging:**

*   **Resource Tagging:** All provisioned resources (via CDK) will be mandatorily tagged with `CostCenter`, `Service`, and `Environment`. This is the foundation of cost attribution.
*   **Cost Explorer:** The finance and engineering leads will use AWS Cost Explorer to visualize spending, identify trends, and analyze costs based on our tagging strategy.
*   **Dashboards:** We will create shared dashboards in Cost Explorer to monitor the monthly spend of each microservice.

**2. Governance & Control:**

*   **AWS Budgets:** We will set up monthly budgets for the entire AWS account, as well as for specific services (e.g., the `Sync Service`).
*   **Budget Actions:** Budgets will be configured with AWS Budget Actions to automatically trigger alerts via SNS to a dedicated Slack channel when spend reaches 50%, 80%, and 100% of the forecast. At 110%, it will trigger an action to notify the engineering lead for immediate review.
*   **Cost Anomaly Detection:** We will enable AWS Cost Anomaly Detection to automatically identify unusual spending patterns, allowing us to catch potential issues (e.g., a bug causing an infinite loop in a Lambda function) before they become significant.

**3. Optimization & Planning:**

*   **Rightsizing:** We will conduct quarterly reviews of our Fargate task and Lambda function sizing using data from CloudWatch and the AWS Compute Optimizer. This ensures we are not overprovisioning resources.
*   **Savings Plans:** Once we have a predictable baseline of Fargate usage (around Month 12), we will purchase a **Compute Savings Plan**. A 1-year plan can provide a **15-25%** discount on our Fargate spend in exchange for a commitment to a certain level of usage, further reducing our costs.
*   **Storage Tiering:** We will implement S3 Lifecycle Policies to automatically transition older data (e.g., backups older than 90 days) to cheaper storage classes like S3 Standard-IA or Glacier Instant Retrieval.
