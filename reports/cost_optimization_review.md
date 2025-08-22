# Cloud Cost-Optimization & Architectural Review: SyncWell Mobile App

**To:** SyncWell Leadership & Engineering Teams
**From:** Jules, Cloud Architect & Cost-Optimization Consultant
**Date:** 2025-08-22
**Version:** 1.0

## 1. Executive Summary

This report provides a cost-optimization analysis of the SyncWell mobile application based on the `06-technical-architecture.md` and `66-costs-model.md` documents. The existing architecture is modern and well-considered, but the reconciled monthly on-demand cost of **~€12,000** for 1M Daily Active Users (DAU) can be significantly reduced.

*   **Primary Cost Hotspots:** The dominant recurring costs are **AWS Lambda compute (~48%)** and **CloudWatch observability (~27%)**, which together account for roughly 75% of the monthly spend. API Gateway, WAF, and NAT Gateway egress fees are also significant secondary drivers.
*   **Primary Recommendation:** We recommend a two-phase strategy. First, **immediately implement the application-level cost controls** (e.g., tiered logging) already designed in the architecture to realize quick wins. Second, **aggressively pursue a strategic shift to an edge-native architecture**, using Cloudflare Workers and R2 to fundamentally lower compute and egress costs for the "Hot Path" sync workload.
*   **Estimated Monthly Savings:** By implementing the recommendations in this report, we estimate potential savings of **€1,600–€4,700 EUR per month** (~13–39% of the current on-demand forecast), while improving performance and reliability.

## 2. Prioritized Recommendations

| Recommendation | Description | Est. Monthly Impact (EUR) | Complexity | Effort | Risks & Mitigations |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Enforce Tiered & Sampled Logging** | Implement the mandatory tiered logging strategy defined in `06-technical-architecture.md`. Reduce log verbosity for `FREE` tier users and sample `PRO` user logs. | **-€1,600** (50% of CloudWatch cost) | Low | 1 week | **Risk:** Reduced visibility into `FREE` tier issues. **Mitigation:** Allow dynamically changing log levels via AWS AppConfig for specific users during support incidents. |
| **2. PoC & Migrate API to Cloudflare Edge** | Migrate the API Gateway, Authorizer, and "Hot Path" Lambda workers to Cloudflare Workers. Use Cloudflare R2 for storing any temporary data to eliminate egress fees. | **-€2,500 to -€4,500** | High | 6-12 weeks | **Risk:** New vendor dependency; potential for unknown unknowns. **Mitigation:** A phased migration plan (PoC -> Shadow -> Canary) is essential. Maintain the AWS deployment for fast rollback. |
| **3. Purchase Compute Savings Plan** | After validating usage patterns in a private beta, purchase a 3-year, all-upfront Compute Savings Plan for the baseline Lambda and Fargate usage. | **-€2,500** (~40% of compute) | Low | <1 week | **Risk:** Committing to the wrong usage level. **Mitigation:** Wait for 1-2 months of stable production data before purchasing. Start with a conservative commitment. |
| **4. Implement Client-Side Batching** | Modify the mobile client to batch multiple state changes (e.g., updating sync configs) into a single API call to a new `/v1/.../batch` endpoint. | **-€300 to -€500** | Medium | 3-4 weeks | **Risk:** Increased client-side complexity. **Mitigation:** Use a robust local database queue (already in place with SQLDelight) and ensure the KMP module handles batching logic reliably. |
| **5. Enforce Per-User Rate Limiting** | Implement the **BLOCKER** security control from the architecture doc using API Gateway Usage Plans to prevent cost-overruns from a single abusive user. | **Cost Prevention** (High) | Low | 1 week | **Risk:** Setting limits too low could impact legitimate power users. **Mitigation:** Make the rate limit configurable per-tier (e.g., higher limits for `PRO` users). |
| **6. Implement Metadata-First Hydration** | Implement the mandatory metadata-first data fetching pattern defined in `06-technical-architecture.md` to reduce NAT Gateway egress costs. | **-€500** (~70% of NAT cost) | Medium | 4 weeks | **Risk:** Requires updating every `DataProvider` implementation. **Mitigation:** Prioritize updating providers that handle the largest data payloads first (e.g., workouts with GPX tracks). |

## 3. Top 3 Alternative Architectures

| Aspect | Current Architecture (AWS Lambda-centric) | Alternative 1 (AWS Fargate-centric) | **Alternative 2 (Cloudflare Edge - Recommended)** |
| :--- | :--- | :--- | :--- |
| **Workload Fit** | **Good.** Ideal for short-lived, event-driven, spiky workloads. Scales to zero, which is cost-effective. | **Poor fit for "Hot Path".** Better for long-running, predictable workloads. Slower to scale and more expensive for short tasks. The existing architecture correctly relegates Fargate to the "Cold Path" (historical syncs). | **Excellent.** Designed for low-latency, high-volume, short-lived tasks like API requests and real-time syncs. No cold starts. |
| **Cost Drivers** | - Lambda GB-second duration<br>- CloudWatch Logs/Metrics<br>- API Gateway per-request fees<br>- NAT Gateway egress fees | - vCPU/memory per hour<br>- Idle capacity costs<br>- Slower scaling can lead to over-provisioning | - Worker CPU time (cheaper than Lambda)<br>- Worker requests (cheaper than API GW)<br>- **Zero egress fees with R2 storage** |
| **Pros** | - Deep integration with AWS ecosystem<br>- Mature tooling & observability<br>- Scales to zero | - No execution time limits<br>- Predictable performance for heavy jobs<br>- Can handle very high memory/CPU needs | - **Drastically lower egress costs**<br>- **Lower compute cost**<br>- **Improved performance (edge latency)**<br>- Simpler security model (WAF included) |
| **Cons** | - **High egress costs via NAT Gateway**<br>- High observability costs<br>- Cold starts (mitigated by Provisioned Concurrency at a cost) | - **Expensive for spiky workloads**<br>- More operational overhead<br>- Doesn't scale to zero | - Less mature ecosystem than AWS<br>- Introduces a new primary vendor<br>- Runtime limitations (less of a concern now) |
| **Best-Fit Components**| - Event-driven syncs<br>- Asynchronous jobs | - Historical data backfills<br>- Bulk data export/import jobs | - **API Gateway replacement**<br>- **Authorizer replacement**<br>- **"Hot Path" sync workers**<br>- Static asset hosting (Pages)<br>- Staging data for Cloud-to-Device syncs (R2) |

## 4. Concrete Cost-Model Corrections

The cost model in `66-costs-model.md` is a good start but is incomplete. The following line items and corrections are required for an accurate financial forecast.

*   **Missing Line Items:**
    *   **Historical Sync ("Cold Path"):** This is a major omission. A rough estimate for 5% of users performing one 1-hour historical sync per month on Fargate adds **~€1,800/month**.
    *   **App Store Fees:** While not an operational cost, a 15-30% commission on revenue is a critical business cost that must be factored into the overall financial model.
    *   **Third-Party Services:** Costs for essential tooling like PagerDuty, a customer support suite (e.g., Zendesk), and CI/CD runners (e.g., GitHub Actions) are missing. Estimate **~€500–€1,000/month**.
*   **Recommended Retention/TTL Changes:**
    *   **CloudWatch Logs:** The default "Never Expire" retention is a primary cause of high costs. **Recommendation:** Set a **30-day retention** for all log groups and configure an automated archival process to S3 Glacier for long-term storage if required for compliance.
*   **Commitment Strategy Correction:**
    *   The model correctly identifies Savings Plans as a key lever. However, it should be explicitly stated that **no Savings Plan should be purchased until a private beta has run for at least one month** to establish a predictable baseline of usage. Committing prematurely based on flawed assumptions is a significant financial risk.

## 5. Mobile-Specific Optimizations

The mobile client can be made significantly more efficient to reduce server load and associated costs.

1.  **Intelligent Request Batching:** Instead of the client making numerous individual API calls for configuration changes or manual sync triggers, implement a batching mechanism. The client can queue actions locally (leveraging the existing offline queue) and send them in a single request to a new `POST /v1/.../batch` endpoint. This reduces the total number of requests to API Gateway and WAF, directly lowering costs.
2.  **Adaptive Background Sync Triggering:** The client should be smarter about when it initiates background syncs. It can use on-device signals to become more efficient:
    *   **Reduce Frequency:** If the user hasn't opened the app in a several days, the client can exponentially back off its background sync frequency.
    *   **Defer on Low Battery/Data:** Use platform APIs to detect "Low Power Mode" or "Data Saver Mode" and defer optional syncs until conditions are better.
3.  **On-Device Pre-Flight Checks:** For device-to-cloud syncs (e.g., from Apple HealthKit), the KMP module can perform a "pre-flight check" before calling the backend. It can check if the destination provider (e.g., Strava, via the client's token) also has new data. If there are no changes on either side, the client can avoid making a server-side API call altogether.

## 6. Quick Wins & Strategic Changes

### Quick Wins (<2 Weeks)
*   **Enforce Tiered & Sampled Logging:** This is an application logic change that can be implemented and deployed quickly, yielding immediate and significant savings on CloudWatch costs.
*   **Enforce Per-User Rate Limiting:** This is a configuration change in API Gateway (Usage Plans) that is critical for security and cost-abuse prevention.
*   **Adjust Log Retention Periods:** This is a simple configuration change in CloudWatch or via Terraform that stops unnecessary cost accumulation.

### Strategic Changes (1–6 Months)
*   **Migrate API/Workers to Cloudflare:** This is the highest-impact strategic change, offering fundamental cost reduction and performance improvement. Requires a dedicated project with a phased rollout.
*   **Implement Client-Side Optimizations:** The batching and adaptive sync logic requires coordinated changes between the mobile client and the backend, representing a larger feature development effort.
*   **Model and Build "Cold Path":** The historical sync feature needs to be properly cost-modelled, budgeted, and then built using AWS Fargate and Step Functions as designed.

## 7. Validation Checklist

After changes are implemented, the following metrics must be tracked to validate success.

| Metric | Current Baseline (Nominal) | Target | Purpose |
| :--- | :--- | :--- | :--- |
| **Cost per Active User / Month** | ~€0.012 | **< €0.008** | Measures overall cost efficiency. |
| **CloudWatch Cost as % of Total** | ~27% | **< 15%** | Validates success of logging optimizations. |
| **NAT Gateway Egress (GB/month)** | 16,400 GB | **< 5,000 GB** | Validates success of metadata-first hydration. |
| **API Gateway p99 Latency** | < 500ms | **< 100ms** | Measures performance improvement from edge migration. |
| **Sync Success Rate** | > 99.9% | **> 99.9%** | Ensures optimizations have not harmed reliability. |
| **Error Budget Consumption** | < 50% / 7 days | **< 25% / 7 days**| Confirms system stability has improved. |

## 8. One-Page Migration Plan: Migrating to Cloudflare

This is a high-level plan for the top strategic recommendation.

**Objective:** Migrate the API Gateway and "Hot Path" Lambda workers to Cloudflare Workers and R2 to reduce monthly costs by an estimated €2,500–€4,500 and improve API latency.

| Phase | Duration | Key Activities | Go/No-Go Criteria & Rollback |
| :--- | :--- | :--- | :--- |
| **1. Proof of Concept & Validation** | 2-4 Weeks | 1. Re-implement the `AuthorizerLambda` and 2-3 core API endpoints as Cloudflare Workers.<br>2. Set up R2 for temporary data storage.<br>3. Load test the Worker endpoints and compare cost/performance against the AWS baseline.<br>4. **Team:** 1-2 Backend Engineers. | **Go/No-Go:** Does the PoC validate the projected cost savings (>30%) and performance gains? <br>**Rollback:** Discard the PoC. Document findings. |
| **2. Parallel Implementation & Shadowing** | 4-8 Weeks | 1. Implement the full suite of API endpoints and "Hot Path" workers in Cloudflare.<br>2. Place Cloudflare's proxy in front of the existing AWS API Gateway.<br>3. Configure "shadowing": route 100% of traffic to AWS, but also send it asynchronously to the new Cloudflare implementation. Log and compare results, performance, and errors.<br>4. **Team:** 2 Backend Engineers, 1 SRE. | **Go/No-Go:** Is the shadow implementation demonstrating >99.99% parity with the AWS production environment for a period of 2 weeks?<br>**Rollback:** Fix bugs in the Worker implementation. Continue shadowing. |
| **3. Canary & Full Production Rollout** | 4 Weeks | 1. **Canary:** Route 1% of production traffic to the Cloudflare implementation. Monitor closely for 24 hours.<br>2. **Ramp-Up:** Gradually increase traffic to Cloudflare (10%, 50%, 100%) over a period of 1-2 weeks.<br>3. **Full Migration:** Once at 100%, keep the AWS infrastructure running as a hot standby for 7 days.<br>4. **Decommission:** After the hot standby period, decommission the AWS API Gateway and "Hot Path" Lambda functions.<br>5. **Team:** 1 SRE, 1 Backend Engineer. | **Go/No-Go:** Does the canary deployment meet all SLOs for availability and latency?<br>**Rollback:** Immediately switch DNS or Cloudflare routing back to 100% AWS API Gateway. |

## 9. Appendix

### Files & Diagrams Inspected
*   `docs/architecture/06-technical-architecture.md`
*   `docs/costs/66-costs-model.md`
*   All `mermaid` diagrams embedded within the architecture document.

### Assumptions
*   Cost estimates are based on public AWS and Cloudflare pricing for the `us-east-1` region as of August 2025.
*   The USD to EUR exchange rate is assumed to be **0.92** for all estimations.
*   The traffic and payload assumptions from `06-technical-architecture.md` are taken as fact for the purpose of this report, though they are noted as a major project risk.
*   Migration effort is estimated in "person-weeks" and assumes a team with the required skills in AWS, Cloudflare, and Kotlin.
