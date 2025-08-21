## Dependencies

### Core Dependencies
- `06-technical-architecture.md` - Technical Architecture
- `39-performance-metrics.md` - Performance Metrics
- `65-incident-response.md` - Incident Response Plan (Deep Dive)

### Strategic / Indirect Dependencies
- `41-metrics-dashboards.md` - Metrics & Dashboards

---

# PRD Section 64: Backend Monitoring Strategy (Deep Dive)

## 1. Introduction & Principles
This document is the comprehensive operational playbook for monitoring the SyncWell backend.
-   **Observability Principles:** Our strategy is built on the "Three Pillars":
    1.  **Metrics (The Numbers):** Understanding the overall health and trends of the system.
    2.  **Logging (The Story):** Understanding the specific details of a single event or error.
    3.  **Tracing (The Path):** Understanding the lifecycle of a request as it flows through our distributed system.
-   **Alerting Philosophy:** Every alert must be actionable. We will aggressively tune alerts to eliminate noise and combat alert fatigue.

## 2. The Four Golden Signals: A Deeper Dive
This is how we apply the golden signals to our key services.
-   **Auth Service:**
    -   *Latency:* p99 latency for `/login` and `/signup`.
    -   *Traffic:* Logins per second.
    -   *Errors:* Rate of 4xx and 5xx errors.
    -   *Saturation:* Database connection pool utilization.
-   **Sync Service:**
    -   *Latency:* p95 latency for a single data sync operation.
    -   *Traffic:* Syncs completed per minute, by provider.
    -   *Errors:* Rate of failed syncs, by provider and error type.
    -   *Saturation:* Length of the sync job queue (SQS).

## 3. The Three Pillars: Technical Implementation

### 3.1. Metrics Collection Architecture
-   **Method:** We will use the AWS CloudWatch Embedded Metric Format (EMF).
-   **Process:** Our compute services (Fargate tasks, Lambda functions) will write a single, structured JSON object to standard output. This JSON object contains both the log message and the metrics to be extracted (e.g., `_aws: { "CloudWatchMetrics": [...] }`).
-   **Benefit:** This is highly efficient, as it allows us to generate custom metrics from logs with a single CloudWatch PutLogEvents call, reducing cost and code complexity.

### 3.2. Structured Logging Deep Dive
-   **Schema:** All logs written to CloudWatch will be JSON objects with the following mandatory fields:
    -   `timestamp`: ISO 8601 timestamp.
    -   `level`: 'INFO', 'WARN', 'ERROR'.
    -   `service`: The name of the microservice (e.g., 'auth-service').
    -   `requestId`: The unique ID for the request, for tracing.
    -   `userId`: The ID of the user, if authenticated.
    -   `message`: The human-readable log message.
-   **Benefit:** This allows us to use CloudWatch Logs Insights to run powerful SQL-like queries on our logs (e.g., `fields @timestamp, message | filter level = 'ERROR' and service = 'sync-service'`).

### 3.3. Distributed Tracing Deep Dive (AWS X-Ray)
-   **Propagation:** The API Gateway will generate a trace ID (`X-Amzn-Trace-Id`) for each incoming request. All downstream services (Fargate tasks, Lambda functions, etc.) must be configured to receive this header and propagate it in any subsequent network calls.
-   **Custom Annotations:** We will add custom annotations to our traces to aid debugging. For example, a sync worker will add annotations for `provider` and `dataType`. This allows us to filter traces in X-Ray for all syncs related to a specific provider.

## 4. Alerting & On-Call

### 4.1. Alerting Workflow
1.  **Metric Threshold Breach:** A CloudWatch Alarm (e.g., "p99 latency > 2s for 5 mins") enters the `ALARM` state.
2.  **SNS Notification:** The alarm triggers a notification to an AWS SNS topic.
3.  **PagerDuty Integration:** PagerDuty is subscribed to this SNS topic. It receives the notification and creates a new PagerDuty incident.
4.  **On-Call Notification:** PagerDuty notifies the current on-call engineer via push notification, SMS, and phone call, according to their configured escalation policy.
5.  **Triage:** The engineer acknowledges the page and begins diagnosis using the linked runbook.

### 4.2. On-Call Rotation & Runbooks
-   **Rotation:** We will use a weekly on-call rotation managed within PagerDuty.
-   **Runbook Template:** Every high-priority alert will have a runbook linked in its description. The runbook is a markdown document in Confluence containing:
    -   *Summary:* What this alert means.
    -   *Initial Diagnosis:* A checklist of initial steps (e.g., "Check the service's Grafana dashboard," "Look for recent ERROR logs").
    -   *Common Causes & Mitigations:* A list of known causes and how to fix them (e.g., "Cause: Recent deployment. Mitigation: Roll back to previous version.").

### 4.3. Dashboards
While raw logs and metrics are essential for deep diagnosis, high-level dashboards are critical for at-a-glance status checks and identifying trends.
-   **Primary Tool:** Grafana will be used as the primary tool for creating and viewing operational dashboards. It will be configured with AWS CloudWatch as its data source.
-   **Content:** Dashboards will be created for each service and will visualize the "Four Golden Signals" (Latency, Traffic, Errors, Saturation) for that service.

## 5. Proactive & Synthetic Monitoring

### 5.1. Proactive Health Checks
-   **Tool:** AWS CloudWatch Synthetics.
-   **Implementation:** We will create a "canary" - a script that runs on a schedule (e.g., every 1 minute) from multiple AWS regions.
-   **Flow:** The canary script will:
    1.  Call the `POST /login` endpoint with test credentials.
    2.  Call a `GET /user/profile` endpoint.
    3.  Call a `GET /health` endpoint on key services.
-   **Alerting:** If any of these steps fail or exceed a latency threshold, the canary will fail and trigger a high-priority PagerDuty alert. This allows us to detect outages before any real user is affected.

### 5.2. Cost Management for Observability
-   **Budgets:** We will create an AWS Budget for our observability stack (CloudWatch, X-Ray).
-   **Alerts:** The budget will be configured to send an alert to a Slack channel when we have spent 50%, 75%, and 100% of our monthly forecast.
-   **Trace Sampling:** For high-volume, non-critical endpoints, we will configure the X-Ray SDK to sample only a percentage of requests (e.g., 10%) instead of tracing every single one. This can dramatically reduce costs while still providing a representative sample of performance.

## 6. Analysis & Calculations
### 6.1. Cost of Observability Analysis
-   **Hypothesis:** A robust observability stack is a necessary operational expense. We need to estimate its cost as a percentage of the total infrastructure budget.
-   **Cost Calculation (AWS):**
    -   *Assumptions:*
        -   100,000 MAU, 1 million DAU target (as per `01-context-vision.md` for scale). Let's use 100k DAU for a more immediate calculation.
        -   Average 100 API requests per user per day.
        -   Total Requests/Day = 100,000 * 100 = 10,000,000.
        -   Each request generates 1 log entry (1 KB) and 1 trace.
    -   **CloudWatch Logs:**
        -   *Data Ingestion:* 10M logs/day * 1KB/log * 30 days = ~300 GB/month.
        -   *Cost:* First 5GB free, then $0.50/GB. (300 - 5) * $0.50 = **$147.50/month**.
    -   **CloudWatch Metrics:**
        -   Custom metrics for latency, errors, traffic. Assume 20 custom metrics.
        -   *Cost:* First 10 metrics are free. Next 10 metrics * $0.30/metric = **$3.00/month**.
    -   **AWS X-Ray (Tracing):**
        -   *Cost:* First 100,000 traces/month are free. After that, $5.00 per 1 million traces.
        -   *Traces/Month:* 10M traces/day * 30 days = 300,000,000 traces.
        -   *Cost:* (300M - 0.1M) / 1M * $5.00 ≈ 299 * $5.00 = **$1,495/month**.
    -   **PagerDuty (Alerting):**
        -   *Cost:* Standard plan is ~$21/user/month. For a small on-call rotation of 3 engineers = **$63/month**.
-   **Total Estimated Monthly Cost:** $147.50 + $3.00 + $1,495 + $63 = **~$1,708.50**.
-   **Conclusion:** Observability is a significant component of our operational expenses, with distributed tracing (X-Ray) being the largest cost driver. We must be strategic about which endpoints have tracing enabled. For less critical endpoints, we can sample traces (e.g., 10% of requests) to manage costs while still gaining visibility.

### 6.2. Uptime and Availability Calculation
-   **Goal:** Achieve >99.95% backend API uptime, as defined in `01-context-vision.md`.
-   **Calculation:**
    -   *Total Minutes in a Month:* 30 days * 24 hours/day * 60 minutes/hour = 43,200 minutes.
    -   *Allowed Downtime for 99.95% Uptime:* 43,200 * (1 - 0.9995) = 43,200 * 0.0005 = **21.6 minutes per month**.
-   **Analysis:** This is a very strict availability target. It means that the total time for all SEV-1 and SEV-2 incidents in a month cannot exceed 21.6 minutes. This reinforces the need for a high-quality monitoring and alerting system that allows for rapid detection and diagnosis, as there is very little margin for error. The incident response plan (`65-incident-response.md`) must be optimized for speed.

## 7. Out of Scope
-   Monitoring of the mobile client itself (this is handled by crash reporting tools like Firebase Crashlytics).
-   Business-level metric monitoring (this is handled by the analytics stack).
