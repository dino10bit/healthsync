# Cost Model Assumptions

This document lists the key assumptions used to generate the cost models and financial projections in `./66-costs-model_summary.md`.

## I. Workload & Load Assumptions

*   **Normal Load (Baseline):** The primary model is based on a workload of **1 million Daily Active Users (DAU)**, generating approximately 7.6 million sync jobs per day (~228 million per month).
*   **Peak Load:** The "peak load" scenario is defined as a sustained rate of **3,000 requests per second (RPS)**, as per the non-functional requirements.
*   **User Tier Ratio:** At 1M DAU, it is projected that there will be 200,000 "Pro" tier users and 800,000 "Free" tier users.
*   **Webhook Traffic:** It is assumed that providers supporting webhooks account for 50% of the total event volume.

## II. Infrastructure & Pricing Assumptions

*   **Compute (Fargate):** The Fargate worker fleet is assumed to run on **90% Spot instances** and 10% On-Demand instances, using the ARM-based Graviton architecture for better price/performance.
*   **Compute (Lambda):** The Lambda cost model for the alternative analysis assumes an average invocation duration of **2,000 ms** at **512 MB** of memory.
*   **EC2 Alternative:** The EC2 cost comparison assumes a fleet of **5 `t4g.medium` instances** to match the Fargate compute capacity.
*   **Networking:** The networking analysis assumes a total of **1.6 TB of data** processed by the Fargate worker fleet's egress path per month.
*   **Pro Tier Pricing:** The break-even analysis is based on a Pro Tier subscription price of **$2.99 per month**.

## III. Algorithmic & Application Logic Assumptions

*   **Log Volume & Tiered Observability:** The model assumes that tiered log sampling (aggressively sampling `FREE` users) reduces overall CloudWatch log ingestion volume by approximately **30%**.
*   **Event Coalescing:** It is assumed that the event coalescing strategy for webhooks can achieve a **60% reduction** in the number of "chatter" events processed by the backend.
*   **Pre-flight Checks:** The model assumes that polling-based syncs account for a specific portion of the workload and that pre-flight checks eliminate **~61 million** unnecessary Fargate task invocations per month.
*   **Credential Caching:** The Just-in-Time (JIT) credential caching strategy is assumed to reduce API calls to AWS Secrets Manager by **95%**.
*   **Data Hydration:** The intelligent data hydration strategy is assumed to reduce NAT Gateway data processing charges by **~$18/month**.

## IV. Non-Production Environment Assumptions

*   **Staging Environment:** The load on the staging environment is assumed to be less than **1%** of the production load.
*   **Development Environment:** Cloud infrastructure costs for local development are assumed to be **near zero** due to the use of LocalStack. The primary cost is engineer operational expense (OpEx) for licenses.
