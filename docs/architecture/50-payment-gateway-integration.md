## Dependencies

### Core Dependencies
- `11-monetization.md` - Monetization, Pricing & Business Model
- `19-security-privacy.md` - Security & Privacy
- `49-subscription-management.md` - Subscription Management (Deep Dive)

### Strategic / Indirect Dependencies
- `06-technical-architecture.md` - Technical Architecture

---

# PRD Section 50: Native Payment Gateway Integration (Deep Dive)

## 1. Introduction & Core Responsibilities

### 1.1. Document Purpose
This document provides a detailed technical guide for integrating with the native Apple App Store and Google Play payment gateways. It covers product setup, client-side implementation, backend validation, and operational best practices.

### 1.2. Role of the Native Gateway
It is critical to understand that the native gateways handle the most sensitive parts of the transaction lifecycle. SyncWell will **never** handle or have access to user credit card information.
-   **Gateway's Responsibility:** Displaying payment UI, processing payments, handling payment method security, providing purchase receipts.
-   **SyncWell's Responsibility:** Displaying products, initiating the purchase flow, validating receipts with the gateway's API, and managing feature entitlements based on valid receipts.

## 2. Platform-Specific Setup

### 2.1. Product Setup in App Store Connect (iOS)
1.  **Agreements, Tax, and Banking:** Ensure all financial agreements with Apple are signed.
2.  **Create Subscription Group:** Create a group (e.g., "SyncWell Premium") to house the different subscription levels (e.g., monthly, annual).
3.  **Create Subscription Products:**
    -   Define a **Product ID** for each subscription (e.g., `com.syncwell.premium.monthly`, `com.syncwell.premium.yearly`). This ID is used in the code.
    -   Set the price, trial period (7 days), and duration.
    -   Configure localization for different currencies and languages.
4.  **App Store Server Notifications:** Configure a URL for Apple to send V2 server-to-server notifications.

### 2.2. Product Setup in Google Play Console (Android)
1.  **Payments Profile:** Ensure a Google Payments Merchant Account is set up.
2.  **Create Subscriptions:**
    -   Define a **Product ID** for each subscription (e.g., `syncwell_premium_monthly`, `syncwell_premium_yearly`).
    -   Create a "base plan" for each product.
    -   Create an "offer" for each base plan (e.g., the 7-day free trial).
    -   Set pricing and trial duration.
3.  **Real-time developer notifications (RTDN):** Configure a Google Pub/Sub topic to receive server-to-server notifications.

## 3. Technical Implementation Details

### 3.1. Client-Side Integration (iOS - StoreKit)
-   **Fetch Products:** Use `Product.products(for:)` to fetch available subscription products from the App Store.
-   **Initiate Purchase:** Use `product.purchase()` to show the native payment sheet.
-   **Listen for Transactions:** Implement a `Transaction.updates` listener to receive new transactions, including purchases and renewals.
-   **Receipt Handling:** The `Transaction` object contains the `jwsRepresentation`, which is the signed receipt data to be sent to our backend for validation.

### 3.2. Client-Side Integration (Android - Play Billing Library)
-   **Connect to BillingClient:** Establish a connection to the billing service.
-   **Query Products:** Use `BillingClient.queryProductDetails()` to get available subscription products.
-   **Launch Purchase Flow:** Use `BillingClient.launchBillingFlow()` to show the native payment sheet.
-   **Handle Purchases:** Implement `onPurchasesUpdated()` listener to receive purchase tokens.
-   **Acknowledge Purchases:** All new purchases must be acknowledged within 3 days using `BillingClient.acknowledgePurchase()` to prevent them from being automatically refunded.

### 3.3. Server-to-Server Notifications
This is a critical mechanism for keeping our entitlement system in sync with the platforms.
-   **Purpose:** The platforms send real-time notifications to our backend for events like:
    -   `SUBSCRIBED`: A new subscription has started.
    -   `DID_RENEW`: A subscription has successfully renewed.
    -   `EXPIRED`: A subscription has expired (e.g., after a grace period).
    -   `DID_FAIL_TO_RENEW`: A renewal has failed, and the user has entered a grace period.
    -   `CANCELED`: A user has voluntarily canceled, but the subscription is still active until the end of the period.
-   **Implementation:** We will create a dedicated API endpoint to receive these webhook events, validate their authenticity, and update our `EntitlementDB` accordingly.

### 3.4. Transaction Atomicity
-   **Challenge:** When our backend validates a receipt, it performs two actions: verifies with Apple/Google and updates our own database. If the database update fails after a successful verification, the user has paid but not received service.
-   **Solution:** The receipt validation endpoint will be designed as an idempotent, atomic transaction. The logic will be wrapped in a database transaction (`BEGIN`, `COMMIT`, `ROLLBACK`) to ensure that either both the validation check and our DB update succeed, or they both fail, leaving the system in a consistent state.

## 4. Operational Considerations

### 4.1. Fraud Detection & Prevention
-   **Primary Defense:** Server-side receipt validation is the best defense. A client can never be trusted. By validating every receipt with Apple/Google before granting entitlement, we prevent most forms of fraud.
-   **Replay Attacks:** Our backend will record the `transactionId` of every validated receipt to prevent the same receipt from being used twice to unlock features for two different user accounts.
-   **Jailbroken/Rooted Devices:** While we cannot prevent the app from running on these devices, server-side validation ensures they cannot spoof purchases.

### 4.2. Taxation and Compliance
-   **Benefit:** A major advantage of using native gateways is that Apple and Google act as the Merchant of Record. They are responsible for calculating, collecting, and remitting all local and international taxes (e.g., VAT, GST, Sales Tax).
-   **Impact:** This dramatically simplifies our financial operations and reduces our compliance burden, as we do not need to handle the complexity of global tax regulations.

### 4.3. Testing in Sandbox Environments
-   **Apple Sandbox:** App Store Connect allows creating Sandbox test accounts. When logged into a device with a Sandbox account, all IAPs use a test environment with no real money. The subscription lifecycle is accelerated (e.g., a 1-month subscription renews every 5 minutes) to facilitate testing.
-   **Google Play Testing:** The Play Console offers Internal Testing tracks. Testers added to this track can make test purchases without being charged. License testers can also be configured to test different scenarios.

## 5. Analysis & Calculations
### 5.1. Platform Fee Calculation
-   **Hypothesis:** Using native payment gateways is the only viable option, but it comes at a significant cost in platform fees. Understanding this cost is critical for financial planning.
-   **Fee Structure:**
    -   **Standard Fee:** Both Apple and Google charge a **30%** commission on subscription revenue.
    -   **Reduced Fee:** Both platforms reduce this fee to **15%** for a given subscription after the user has been subscribed for 12 continuous months.
    -   **Small Business Program:** Apple's App Store Small Business Program reduces the fee to **15%** for developers earning up to $1 million USD per year. We will apply for this program. Google has a similar "15% on the first $1M" program.
-   **Calculation (with Small Business Program):**
    -   *Target Year 1 MRR*: $5,000
    -   *Platform Fee (15%)* = $5,000 * 0.15 = **$750 per month**
    -   *Net Monthly Revenue* = $5,000 - $750 = **$4,250 per month**
    -   *Annual Platform Cost* = $750 * 12 = **$9,000**
-   **Conclusion:** The 15% platform fee is a significant operating expense. Our financial models must be based on net revenue, not gross revenue.

### 5.2. Technical Trade-off Analysis: Native vs. Third-Party (e.g., Stripe)
-   **Justification for Native IAP:** While a third-party gateway like Stripe offers lower fees (typically ~2.9% + $0.30), using them for mobile app subscriptions has prohibitive drawbacks:
    -   **Policy Violation:** It is a direct violation of Apple's and Google's terms of service to use a third-party payment method for digital goods and subscriptions, which would lead to app rejection.
    -   **User Experience:** Native In-App Purchases provide a much smoother, more trusted user experience. Users can pay with their stored card without leaving the app or re-entering details.
    -   **Subscription Management:** Native IAP automatically integrates with the OS-level subscription management pages, simplifying cancellations and resubscriptions for the user.
-   **Conclusion:** Despite the higher fees, using the native payment gateways is the only technically and commercially viable path for SyncWell. The benefits of compliance and superior UX outweigh the cost.

## 6. Out of Scope
-   Integration with any payment gateway other than Apple App Store and Google Play Billing.
-   Processing payments for physical goods or services outside the scope of the app's digital subscriptions.
