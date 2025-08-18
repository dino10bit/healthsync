## Dependencies

### Core Dependencies
- `04-user-stories.md` - User Stories
- `23-analytics.md` - Analytics
- `57-app-analytics.md` - App Analytics (Deep Dive)

### Strategic / Indirect Dependencies
- `51-push-notifications.md` - Push Notifications (Deep Dive)
- `54-social-sharing.md` - Social Sharing (Deep Dive)
- `60-brand-assets.md` - Brand Assets & Identity Guidelines

---

# PRD Section 53: Gamification (Deep Dive)

## 1. Introduction
Gamification aims to increase user engagement and retention by introducing game-like elements into the app experience. For SyncWell, this will be implemented through a system of badges and achievements that reward users for consistent use and for exploring the app's features.

## 2. Psychological Principles
The gamification system is designed around established motivational theories:
-   **Goal-Setting Theory:** Achievements provide clear, attainable goals for users to strive for (e.g., "Connect 5 services").
-   **Positive Reinforcement:** The unlocking animation and notification provide immediate, positive feedback for desired behaviors.
-   **Sense of Competence:** Earning badges gives users a sense of mastery over the app.
-   **Social Proof (via Sharing):** Sharing unlocked badges allows users to demonstrate their achievements to others.

## 3. Badge & Achievement Design

### 3.1. Badge Design & Tiers
-   **Visual Style:** All badges will share a consistent visual style, using the color palette from `60-brand-assets.md`.
-   **Tiered Badges:** Certain achievements will have Bronze, Silver, and Gold tiers to encourage continued engagement.
    -   **Sync Streak:** Bronze (7 days), Silver (30 days), Gold (90 days).
    -   **Power User:** Bronze (3 services), Silver (5 services), Gold (10 services).
-   Each tier will have a progressively more elaborate visual design.

### 3.2. Detailed Achievement Specifications
| Badge Name | Tier | Unlock Trigger Event | Condition |
| :--- | :--- | :--- | :--- |
| First Sync | - | `sync_completed` | `COUNT(sync_completed WHERE userId=X) == 1` |
| Power User | Bronze | `provider_connected` | `COUNT(DISTINCT provider_name WHERE userId=X) == 3` |
| Power User | Silver | `provider_connected` | `COUNT(DISTINCT provider_name WHERE userId=X) == 5` |
| Sync Streak | Bronze | `sync_completed` (daily cron) | Daily check confirms successful sync for 7 consecutive days. |
| Historian | - | `historical_sync_completed` | `COUNT(historical_sync_completed WHERE userId=X) == 1` |
| Bug Squasher | - | Manual | Support agent flags a user's feedback ticket as "Led to Bug Fix". |
| Sharer | - | `achievement_shared` | `COUNT(achievement_shared WHERE userId=X) == 1` |

## 4. User Experience & UI

### 4.1. Unlocking Animation & UI
-   When an achievement is unlocked, a non-modal overlay will appear at the top of the screen.
-   **Animation:** The badge icon will animate in, perhaps with a subtle particle effect, along with the "Achievement Unlocked" title and the badge name.
-   The overlay will automatically dismiss after 5 seconds. It can also be tapped to navigate to the Achievements Screen.

### 4.2. Achievements Screen - UI/UX Deep Dive
-   **Layout:** A grid-based layout (2 or 3 columns) showing all available badges.
-   **Unlocked Badges:** Displayed in full color. Tapping one shows the badge name, description, and the date it was unlocked. A "Share" button is prominent.
-   **Locked Badges:** Displayed in grayscale. Tapping one shows the badge name, description, and the criteria for unlocking it (e.g., "Connect 2 more services to unlock"). The progress towards the goal will be shown if applicable (e.g., "Sync Streak: 5/7 days").

## 5. Technical Implementation

### 5.1. Backend Rules Engine - Technical Design
-   **Event-Driven:** The engine will be a serverless function that subscribes to a dedicated `gamification_events` topic on a message queue (e.g., AWS SNS/SQS).
-   **State Management:** A dedicated database table, `user_achievements`, will store the `(userId, achievementId, unlockedAt)` state. This prevents duplicate awards.
-   **Idempotency:** The event handler will be idempotent. If it receives the same event twice, it will not award the achievement a second time.
-   **Rules Storage:** The rules/criteria for each achievement will be stored in a configuration file or a database table, allowing for future changes without code deployments (see **Section 5.3**).

### 5.2. Analytics for Gamification
To measure the impact of this feature, we will track the following events:
-   `gamification_achievement_unlocked {achievement_id, tier}`
-   `gamification_achievement_shared {achievement_id}`
-   `gamification_achievements_screen_viewed`

### 5.3. Extensibility
The system will be designed for future growth. Adding a new achievement will involve:
1.  Adding a new entry to the `achievements` configuration table in the database.
2.  Adding the new badge assets to the client application.
3.  No backend code changes should be required for simple, counter-based achievements.

### 5.4. Use Case: "Bug Squasher" Badge Flow
1.  A user submits helpful feedback via a support ticket.
2.  A developer fixes the bug and links the fix to the support ticket.
3.  The support agent, seeing the linked fix, has access to an internal admin tool.
4.  In the tool, they can enter the user's ID and click a "Grant Bug Squasher Badge" button.
5.  This action calls a secure internal API endpoint that manually inserts the achievement into the `user_achievements` table and triggers the unlock notification for the user.

## 6. Balancing & Economy
The initial set of achievements is designed to reward both initial onboarding actions ("First Sync") and long-term habits ("Sync Streak"). The criteria (e.g., "5 services" for Power User) have been chosen to be challenging but achievable for an engaged user. We will monitor unlock rates via analytics and may adjust the criteria in the future to ensure the system remains motivating.

## 7. Analysis & Calculations
### 7.1. Impact on User Retention
-   **Hypothesis:** The achievement system will act as a form of positive reinforcement, encouraging users to build habits around the app and thus increasing long-term retention.
-   **Measurement:** We will compare the retention of users who have earned at least one "deep engagement" badge (e.g., "Sync Streak (30-day)", "Power User") versus those who have not.
-   **Calculation/Goal:**
    -   We will track the Day 30, Day 60, and Day 90 retention cohorts for both groups.
    -   **Goal:** We aim to see a **20% higher Day 90 retention rate** for the "Engaged" cohort (users with at least one deep engagement badge).
-   **KPI:** This directly supports the "DAU/MAU Ratio" and "Churn Rate" KPIs in `01-context-vision.md` by keeping users active and subscribed longer.

### 7.2. Development Cost Analysis
-   **Hypothesis:** Building a gamification system can be complex. We need to ensure the initial implementation is lightweight.
-   **Cost Estimation (Story Points):**
    -   Backend Rules Engine (GAME-F-01): **8 points** (medium complexity, requires careful state management).
    -   Achievements Screen UI (GAME-F-02): **5 points** (straightforward UI work).
    -   Notification Hooks (GAME-F-03): **3 points** (simple integration with existing notification system).
    -   Shareable Achievements (GAME-F-04): **5 points** (requires generating images, dependent on `54-social-sharing.md`).
    -   **Total Estimated Cost:** **21 Story Points**.
-   **Conclusion:** This represents a significant feature investment. The phased rollout (initially launching without shareable achievements) can de-risk the implementation. The potential 20% retention lift for engaged users justifies this investment, as higher retention is a primary driver of subscription LTV (Lifetime Value).

## 8. Out of Scope
-   Leaderboards or competitive features.
-   A points or currency system.
-   Levels or experience points (XP).
