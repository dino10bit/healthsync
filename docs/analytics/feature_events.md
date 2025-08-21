# Feature & Analytics Events

This document will serve as the single source of truth for all analytics events tracked in the SyncWell application. It is a living document that must be updated whenever a new event is added or an existing one is changed.

## Event Naming Convention

All events should follow the `noun_verb` convention (e.g., `sync_completed`, `paywall_viewed`).

## Event Catalog

| Event Name | Description | Properties |
| :--- | :--- | :--- |
| **`app_opened`** | Fired when the user opens the app from a closed state. | `is_first_open` (boolean) |
| **`onboarding_completed`** | Fired when a user successfully completes the onboarding flow. | - |
| **`paywall_viewed`** | Fired when the user is shown the paywall screen. | `source` (string, e.g., "trial_expired", "feature_gate") |
| **`subscription_purchased`** | Fired when a user successfully purchases a subscription. | `plan_type` (string, e.g., "yearly") |
| **`sync_completed`** | Fired when a sync job completes successfully. | `source_provider` (string), `destination_provider` (string) |
| **`sync_failed`** | Fired when a sync job fails. | `source_provider` (string), `destination_provider` (string), `error_type` (string) |
| **`achievement_unlocked`** | Fired when a user unlocks a gamification achievement. | `achievement_id` (string) |
