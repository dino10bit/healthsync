## Dependencies

### Core Dependencies
- `23-analytics.md` - Analytics
- `41-metrics-dashboards.md` - Metrics & Dashboards
- `57-app-analytics.md` - App Analytics (Deep Dive)

### Strategic / Indirect Dependencies
- `45-future-enhancements.md` - Future Enhancements & Roadmap Expansion

---

# PRD Section 56: A/B Testing Framework (Deep Dive)

## 1. Introduction
A/B testing is our core methodology for making data-driven product decisions. This document serves as a comprehensive guide to our A/B testing framework, principles, processes, and technical implementation.

## 2. A/B Testing Principles
-   **Randomization:** Users must be randomly assigned to a control or variant group to ensure unbiased results.
-   **Control Group:** Every experiment must have a control group (Variant A) that represents the current state of the app. The performance of the variant (B) is always measured against the control.
-   **Statistical Significance:** We do not make decisions based on raw numbers alone. We use statistical tests to determine the probability that the observed results are not due to random chance.
-   **One Test at a Time:** To avoid interference effects, we will generally avoid running multiple, overlapping experiments for the same set of users.

## 3. The Experimentation Process

### 3.1. Experiment Design Document Template
Before any experiment is configured, the Product Manager must create a design document containing:
-   **Experiment Name:** A clear, descriptive name (e.g., "Paywall Headline Test - Q3 2025").
-   **Hypothesis:** A clear statement in the format: "We believe that [changing X] for [user segment Y] will [result in Z]."
-   **Primary Metric:** The single metric that will determine the winner of the test (e.g., "Trial-to-paid conversion rate").
-   **Secondary Metrics:** Other metrics to watch to ensure the change doesn't have negative side effects (e.g., "App uninstall rate," "Time to load paywall").
-   **Sample Size Calculation:** The required number of users per variant to achieve statistical significance (see **Section 5**).

### 3.2. Experiment Prioritization (ICE Framework)
To decide which experiments to run, we will use the ICE scoring framework:
-   **Impact (1-10):** How much impact will this experiment have on our KPIs if it's successful?
-   **Confidence (1-10):** How confident are we that our hypothesis is correct?
-   **Ease (1-10):** How easy is this experiment to implement, from an engineering perspective?
-   **ICE Score = Impact * Confidence * Ease**. We will prioritize experiments with the highest ICE scores.

### 3.3. Results Communication & Decision Making
1.  **Monitoring:** The experiment runs until the calculated sample size is reached. No decisions are made before this point.
2.  **Analysis:** The Product Manager analyzes the results in the Firebase console.
3.  **Communication:** A summary of the results is shared with the team, including whether a statistically significant winner was found.
4.  **Decision:**
    -   **Significant Win:** The winning variant is rolled out to 100% of users.
    -   **Significant Loss:** The variant is discarded.
    -   **Inconclusive:** The result is considered neutral. We may decide to run a follow-up test with a new hypothesis or discard the change.

## 4. Technical Implementation

### 4.1. Technical Architecture (Firebase)
-   **Remote Config:** We define parameters in the Firebase Remote Config console (e.g., `paywall_headline_text`). A default value is set.
-   **A/B Testing:** We create an A/B test that targets a subset of users and overrides the default value of a Remote Config parameter.
    -   *Variant A (Control):* Receives the default value.
    -   *Variant B:* Receives a new, different value.
-   **Activation:** The Firebase client-side SDK handles fetching the correct parameter values for each user and "activating" them for use in the app.

### 4.2. Client-Side Implementation
-   The app will use a "feature flag" or "parameter-driven" approach.
-   **Example:**
    ```swift
    // Fetch the headline text from Remote Config
    let headline = RemoteConfig.remoteConfig().configValue(forKey: "paywall_headline_text").stringValue
    // Set the label's text
    paywallHeadlineLabel.text = headline
    ```
-   This ensures the logic is simple and the UI is driven by the configuration received from Firebase.

## 5. Statistical Engine Deep Dive
-   **Methodology:** Firebase A/B Testing uses a **Bayesian statistical approach**.
-   **Key Concepts:**
    -   Instead of a p-value, it calculates the **"probability to be best"** for each variant. This is often more intuitive for making business decisions.
    -   It also provides the **confidence interval** for the expected improvement, giving a range of likely outcomes.
-   **Benefit:** The Bayesian approach often allows for reaching conclusions with smaller sample sizes compared to traditional frequentist methods and provides a more direct answer to the business question: "What is the probability that my change is better?"

### 5.1. Common Pitfalls to Avoid
-   **"Peeking":** Ending a test early just because a variant looks like it's winning. This is a common way to be fooled by randomness. The test must run until the pre-calculated sample size is reached.
-   **Ignoring Secondary Metrics:** A variant might improve the primary metric but hurt a secondary one (e.g., a confusing design increases conversions but also increases support tickets). We must look at the full picture.
-   **Confirmation Bias:** Only running tests that confirm our own beliefs. We must be willing to be proven wrong by the data.

## 6. Detailed Use Cases

### 6.1. Use Case: Onboarding Flow A/B Test
-   **Hypothesis:** We believe that a shorter, 3-step onboarding flow will have a higher completion rate than our current 5-step flow.
-   **Primary Metric:** Onboarding completion rate (event: `onboarding_completed`).
-   **Implementation:** A single Remote Config parameter, `onboarding_flow_version`, will be set to either "3_step" or "5_step". The app's code will show the corresponding UI flow based on this value.

### 6.2. Use Case: Paywall Copy A/B Test
-   **Hypothesis:** We believe that using a headline focused on "benefits" instead of "features" will increase trial starts.
-   **Primary Metric:** Trial start rate (event: `trial_started`).
-   **Implementation:**
    -   *Variant A (Control):* Headline: "Unlock Historical Sync and Auto-Syncing".
    -   *Variant B (Benefit-driven):* Headline: "See Your Full Health History, Effortlessly".
    -   The `paywall_headline_text` parameter in Remote Config will be used to control the text shown.

## 7. Analysis & Calculations
### 7.1. Sample Size Calculation
-   **Hypothesis:** To make a valid decision based on an A/B test, we must have a large enough sample size to ensure the results are statistically significant, not just due to random chance.
-   **Key Inputs for Calculation:**
    -   **Baseline Conversion Rate (p1):** The current conversion rate of the control group. Let's say it's **15%** for our paywall.
    -   **Minimum Detectable Effect (MDE):** The smallest improvement we care about detecting. Let's say we want to detect at least a **10% relative improvement**, so the target conversion rate for the variant (p2) would be 15% * 1.1 = **16.5%**.
    -   **Statistical Significance Level (α):** The probability of a false positive. Standard is **5% (or 0.05)**.
    -   **Statistical Power (1-β):** The probability of detecting a true positive. Standard is **80% (or 0.8)**.
-   **Calculation:**
    -   Using an online sample size calculator (like Evan Miller's), with the inputs above, the required sample size per variation is approximately **10,836 users**.
-   **Conclusion:** This means we need about **21,672 total users** (10,836 for control, 10,836 for variant) to enter the experiment to be confident in the results. This calculation must be performed before starting any major experiment to ensure we have enough user traffic to get a timely result.

### 7.2. Business Impact Analysis
-   **Hypothesis:** A successful A/B test can lead to significant improvements in key business metrics.
-   **Analysis:**
    -   Let's use the paywall experiment as an example. If the new design (Variant B) wins and increases the trial-to-paid conversion rate from 15% to 16.5% (our MDE), what is the financial impact?
    -   *Assumptions:*
        -   6,680 new trial starts per month (from `49-subscription-management.md`).
        -   Monthly subscription price: $4.99.
    -   *Calculation:*
        -   *Additional Subscribers per Month* = 6,680 * (16.5% - 15%) = 6,680 * 1.5% = **~100 new subscribers**.
        -   *Additional MRR* = 100 * $4.99 = **$499 per month**.
        -   *Additional Annual Revenue* = $499 * 12 = **$5,988**.
-   **Conclusion:** Even a small, statistically significant improvement of 1.5 percentage points in conversion can lead to a nearly $6,000 increase in annual revenue. This demonstrates the high ROI of a disciplined A/B testing practice.

## 8. Out of Scope
-   Multivariate testing (testing more than two variants or multiple changes at once). V1 will focus on simple A/B tests.
-   A custom-built in-house A/B testing solution.
