# Data Model Specification

## 1. Overview
This document is the single source of truth for all data models used within the SyncWell system. It serves as the authoritative reference for API contracts, database schemas, and the canonical data formats used for synchronization. Its purpose is to ensure consistency and prevent data-related bugs.

This document is intended to be a living document, updated via pull request as the system evolves.

## 2. Canonical Data Models
This section defines the standardized, canonical format for all health and wellness data processed by the sync engine. These models are implemented as Kotlin `data class`es in the KMP shared module and their schemas are versioned in the AWS Glue Schema Registry.

*(This section should be populated with the full definitions of `CanonicalWorkout`, `CanonicalSleepSession`, `CanonicalSteps`, etc., consolidating the information from other documents.)*

### 2.1. `CanonicalWorkout`
```kotlin
@Serializable
data class CanonicalWorkout(
    val id: String,
    val startTime: String,
    val endTime: String,
    val durationSeconds: Long,
    val distanceMeters: Double?,
    val caloriesKcal: Double?,
    val notes: String?
    // ... and other fields
)
```

## 3. API Contract Schemas
This section defines the request and response schemas for all public-facing API endpoints. These are derived from the OpenAPI specification but are documented here for clarity and ease of reference.

*(This section should be populated with the JSON schemas for all API endpoints, such as `POST /v1/sync-jobs`.)*

### 3.1. `POST /v1/sync-jobs` Request Body
```json
{
  "sourceConnectionId": "string",
  "destinationConnectionId": "string",
  "dataType": "string",
  "mode": "string",
  "priority": "string",
  "dateRange": {
    "startDate": "string",
    "endDate": "string"
  }
}
```

## 4. Database Schema (DynamoDB)
This section defines the structure of the `SyncWellMetadata` DynamoDB table, including the primary key schema, all item types, and all Global Secondary Indexes (GSIs).

*(This section should be populated with the full DynamoDB table definition from `06-technical-architecture.md`.)*

### 4.1. Table Definition
- **Table Name:** `SyncWellMetadata`
- **Primary Key:**
    - **Partition Key (PK):** `USER#{userId}`
    - **Sort Key (SK):** Hierarchical string (e.g., `PROFILE`, `CONN#{connectionId}`)

### 4.2. Item Types
- **User Profile**
- **Connection**
- **Sync Config**
- **Idempotency Lock**

### 4.3. Global Secondary Indexes
- **`ReAuthStatus-gsi`**
- *(etc.)*
