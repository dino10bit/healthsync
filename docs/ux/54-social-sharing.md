## Dependencies

### Core Dependencies
- `04-user-stories.md` - User Stories
- `19-security-privacy.md` - Security & Privacy
- `53-gamification.md` - Gamification (Deep Dive)

### Strategic / Indirect Dependencies
- `47-user-profile-management.md` - User Profile Management (Deep Dive)
- `60-brand-assets.md` - Brand Assets & Identity Guidelines

---

# PRD Section 54: Social Sharing (Deep Dive)

## 1. Introduction
Social sharing provides a mechanism for users to share their positive experiences with SyncWell, acting as a form of organic marketing. This document provides a granular breakdown of the feature, focusing on the technical implementation, privacy considerations, and marketing goals.

## 2. Shareable Content Specification

### 2.1. Achievement Sharing
-   **Image:** A dynamically generated 1200x630px PNG image.
-   **Image Content:** The specific badge icon, the badge name (e.g., "Power User"), the user's display name, and the SyncWell logo. All elements will be arranged according to a template defined in `60-brand-assets.md`.
-   **Share Text:** "I just unlocked the '{Badge Name}' badge on SyncWell! #SyncWell #HealthData"
-   **Share URL:** A tracked link to the marketing website (see **Section 4.2**).

### 2.2. App Invitation Sharing
-   **Image:** A generic branded image featuring the SyncWell logo and value proposition.
-   **Share Text:** "Tired of your health data being stuck in different apps? I'm using SyncWell to bring it all together. Check it out: {URL}"
-   **Share URL:** A unique, tracked referral link per user.

## 3. Technical Implementation

### 3.1. Image Generation Service
-   **Decision:** Image generation will be performed **on the client-side**.
-   **Justification:** Server-side image generation would be expensive at scale. Client-side generation is free and fast enough for this purpose.
-   **Implementation:** The app will have pre-built image templates. When a user shares, the app will programmatically draw the badge icon and user's name onto the template canvas and export it as a PNG file to be passed to the share sheet.

### 3.2. Native Share Sheet Integration (iOS)
-   **Component:** `UIActivityViewController`.
-   **Implementation:** We will initialize the controller with an array of items: the generated `UIImage` and the pre-formatted `String` containing the text and URL.
-   **Excluded Activities:** We may exclude certain activity types that are not relevant, such as 'Print' or 'Assign to Contact'.

### 3.3. Native Share Sheet Integration (Android)
-   **Component:** An `ACTION_SEND` Intent.
-   **Implementation:** We will set the `Intent.EXTRA_TEXT` to the pre-formatted text and URL. The generated image will be saved to a temporary file, and its `Uri` will be passed in `Intent.EXTRA_STREAM`. We must grant temporary read permission for the target app to access this `Uri`.

### 3.4. Privacy-Preserving Design
-   **Core Principle:** No user data leaves the device unless explicitly shared by the user.
-   **Checklist:**
    -   [ ] The generated image must only contain the user's **display name**, not their email or any other PII.
    -   [ ] The share intent must only contain the image, the pre-formatted text, and the URL. No other data should be included.
    -   [ ] A specific QA test plan will be created to verify that no combination of actions can lead to the accidental sharing of health data.

## 4. Marketing & Growth

### 4.1. URL Shortening & Link Tracking
-   **Service:** We will use a service like Bitly or a self-hosted solution to create short, trackable URLs.
-   **Implementation:** When a user shares, the app will request a unique short URL from our backend. The backend will generate this, store the mapping to the full URL (with tracking parameters), and return the short URL to the app.
-   **Tracking Parameters:** The full URL will include UTM parameters, e.g., `?utm_source=social_share&utm_medium=twitter&utm_campaign=achievement_share&user_id=XYZ`. This allows us to attribute installs in our analytics.

### 4.2. Social Media Metadata (Open Graph)
-   The marketing website's pages must include Open Graph (`og:`) meta tags in the HTML `<head>`.
-   **Required Tags:**
    -   `og:title`: SyncWell: Your Health Data, United.
    -   `og:description`: The easiest way to sync your health and fitness data between all your apps and devices.
    -   `og:image`: A high-quality image representing the app.
    -   `og:url`: The canonical URL of the page.

### 4.3. A/B Testing Shareable Content
-   **Hypothesis:** We can improve the K-Factor by optimizing the share text and images.
-   **Method:** Using our A/B testing framework (`56-ab-testing-framework.md`), we can define remote parameters for the share text.
-   **Example:** Test `"Check it out:"` vs. `"You have to try this:"` in the App Invitation share text.
-   **Measurement:** We will measure the click-through rate on the shared links for each variant to determine the winner.

## 5. Error Handling
-   **Image Generation Fails:** If the client-side image generation fails, the share sheet will be invoked with only the text and URL.
-   **Network Error (URL Shortening):** If the app cannot reach the backend to get a short URL, it will fall back to using the full, untracked URL to the website. The share can still proceed.

## 6. Future: Referral Program
The link tracking infrastructure built for this feature is the foundation for a future referral program. We could extend it to:
-   Attribute new user sign-ups to the referring user.
-   Offer a reward (e.g., a 1-month premium extension) to the sender when a new user they referred becomes a paying subscriber.

## 7. Analysis & Calculations
### 7.1. Viral Coefficient (K-Factor) Analysis
-   **Hypothesis:** Social sharing will create a viral loop, where existing users bring in new users, reducing our reliance on paid marketing. This is measured by the K-factor.
-   **Calculation:**
    -   *K-Factor* = (Number of invites sent per user) * (Conversion rate of invites)
    -   **Goal:** To achieve a K-factor > 0.1. This means every 10 users bring in at least 1 new user.
-   **Assumptions for Calculation:**
    -   Let's assume 10% of users share an achievement or app invitation per month.
    -   Each share generates an average of 5 clicks from their social network.
    -   The conversion rate from a click to a new app install is 20%.
-   **Step-by-step:**
    1.  *Invites Sent per User* = 10% * 5 = 0.5
    2.  *Conversion Rate* = 20% = 0.2
    3.  *Calculated K-Factor* = 0.5 * 0.2 = **0.1**
-   **Conclusion:** Achieving a K-factor of 0.1 is a realistic initial goal. While this won't create exponential growth (which requires K > 1), it provides a significant, free boost to our user acquisition efforts. We will track the clicks and conversions from shared links to measure the actual K-factor.

### 7.2. Privacy Risk Analysis
-   **Risk:** A user accidentally shares sensitive information.
-   **Impact:** Very High. This would be a major breach of user trust and could have legal consequences.
-   **Mitigation:** This is the most critical consideration for this feature. The design explicitly forbids the sharing of any health data. The implementation MUST be rigorously tested to ensure that only the pre-defined, non-sensitive branded image (`SHARE-F-02`) can be shared. No other data should be attached to the share intent. The pre-formatted text (`SHARE-F-03`) must also not contain any personal data other than the name of the achievement.

## 8. Out of Scope
-   Direct integration with social media APIs (e.g., posting directly to Twitter). All sharing will be mediated by the OS's native share functionality.
-   A referral or rewards program for sharing (this could be a future enhancement).
