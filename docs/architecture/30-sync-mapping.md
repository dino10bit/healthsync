---
title: "PRD Section 30: Source-Destination Sync Mapping"
migrated: true
---
## Dependencies

### Core Dependencies
- `05-data-sync.md` - Data Sync & Conflict Resolution
- `06-technical-architecture.md` - Technical Architecture, Security & Compliance
- `07-apis-integration.md` - APIs & Integration Requirements
- `14-qa-testing.md` - QA & Testing Strategy

### Strategic / Indirect Dependencies
- `31-historical-data.md` - Historical Data Sync
- `32-platform-limitations.md` - Platform-Specific Limitations
- `33-third-party-integration.md` - Third-Party Integration Strategy

---

# PRD Section 30: Source-Destination Sync Mapping

## 1. Executive Summary

This document provides the definitive technical specification for SyncWell's data mapping and transformation engine. This engine is the core of SyncWell's intellectual property, responsible for accurately translating health data between disparate formats. The system is built around a **versioned, canonical data model** that serves as a universal intermediary.

This specification is a critical blueprint for the **engineering team**. It details the canonical models and provides rules for handling data mapping. This engine runs in two places depending on the sync type: on the **backend workers** for cloud-to-cloud syncs, and on the **mobile client** for device-native syncs (e.g., HealthKit).

## 2. The Canonical Data Schema (v1)

All data moving through the SyncWell engine is converted to and from this standardized schema. All timestamps are in ISO 8601 format and are normalized to UTC. The schema will be implemented as a set of `serializable` data classes in the **Kotlin Multiplatform (KMP) shared module**, allowing the exact same models to be used on the client and the backend.

```kotlin
// Example of the Kotlin implementation in the KMP module
@Serializable
data class Activity(
    val type: String = "ACTIVITY",
    val sourceDataHash: String,
    val startTime: String,
    val endTime: String,
    // ... and so on
)
```

## 3. The DataProvider SDK & Mapping Responsibility

To ensure consistency and quality, all data mapping logic is implemented within the framework of the **`DataProvider` SDK**, as defined in `07-apis-integration.md`. The SDK provides a standardized structure, including abstract base classes and utility functions, that each provider must implement.

This approach separates the boilerplate (e.g., interacting with the rate limiter, logging) from the core transformation logic. The primary responsibility of a `DataProvider` implementation is to focus on the provider-specific mapping.

### `DataProvider` Mapping Implementation

Each `DataProvider` must implement a `toCanonical()` and `fromCanonical()` method for each supported data type.

```kotlin
// Simplified example within a hypothetical FitbitProvider, extending a base class from the SDK
class FitbitProvider : BaseDataProvider() {

    override fun toCanonical(sourceData: FitbitActivity): Canonical.Activity {
        // SDK handles logging and metrics automatically
        return Canonical.Activity(
            startTime = normalizeToUtc(sourceData.startTime), // Use SDK utility for timezone
            activityType = mapFitbitActivityType(sourceData.activityName),
            // ... other fields
        )
    }

    private fun mapFitbitActivityType(fitbitType: String): Canonical.ActivityType {
        return when (fitbitType) {
            "Treadmill" -> Canonical.ActivityType.RUNNING
            "Bike" -> Canonical.ActivityType.CYCLING
            else -> Canonical.ActivityType.OTHER
        }
    }
}
```

## 4. Mapper Unit Testing

Unit testing remains a critical part of the process, but it is now enforced by the SDK structure.

*   **Requirement:** The `DataProvider` SDK will include an abstract `BaseProviderTest` class. Each provider's test suite **must** extend this base class, which provides a standardized way to load test fixtures and assert common conditions.
*   **Fixtures:** Tests will continue to use static `.json` files representing real-world, anonymized API responses.
*   **CI/CD Integration:** This test suite is a required check in the CI/CD pipeline. No code change that breaks a data mapping test will be deployed.
*   **Benefit:** This creates a powerful regression suite. If a provider's API changes its response format, these unit tests will fail immediately, pinpointing the problem.

## 5. Schema Versioning & Migration with AWS Glue Schema Registry

To govern the evolution of our canonical data models, we are adopting the **AWS Glue Schema Registry**. This provides a robust, centralized framework for versioning, validation, and safe evolution of our schemas, which is critical for system stability.

### Developer Workflow for Schema Changes

When a developer needs to modify a canonical data model (e.g., adding a new field to `CanonicalWorkout`), they will follow this process:

1.  **Update KMP Data Class:** The developer first modifies the `Serializable` Kotlin data class in the KMP shared module.
2.  **Generate Schema Definition:** A gradle task will automatically generate a JSON Schema definition from the updated Kotlin data class. This generated schema file is committed to the repository along with the code changes.
3.  **CI/CD Pipeline Validation:** When a pull request is created, the CI/CD pipeline (as defined in `06-technical-architecture.md`) executes the following critical step:
    *   The pipeline takes the generated JSON schema and sends it to the AWS Glue Schema Registry's `CheckSchemaVersionValidity` API.
    *   The registry is configured with a strict compatibility rule: **`BACKWARD_ALL`**. This means that consumers using an older version of the schema can still read data produced with the new schema.
    *   If the proposed change is not backward-compatible (e.g., a field is removed without a default value), the registry will return a failure, and the CI/CD pipeline will fail, blocking the pull request from being merged.
4.  **Schema Registration:** Upon a successful merge to the `main` branch, the CI/CD pipeline will automatically register the new schema version in the Glue Schema Registry.

### Benefits of this Approach

*   **Prevents Breaking Changes:** The automated compatibility check is a safety gate that makes it impossible to accidentally deploy a schema change that would break existing clients or backend workers.
*   **Centralized Governance:** The Schema Registry becomes the single source of truth for all versions of our canonical models.
*   **Enables Future Evolution:** This robust process allows us to safely evolve our data models over time, for example, by enabling consumers to handle multiple versions of a schema for graceful upgrades.

## 6. Visual Diagrams

### Canonical Schema (High Level)
*(Unchanged)*

### Mapping and Testing Flow within the SDK
```mermaid
graph TD
    subgraph DataProvider SDK
        A[BaseDataProvider]
        B[BaseProviderTest]
    end
    subgraph FitbitProvider Implementation
        C[FitbitProvider] -- Extends --> A
        D[FitbitProviderTest] -- Extends --> B
    end
    subgraph CI/CD Pipeline
        E[Test Fixture (Fitbit JSON)] --> D
        D -- Runs Tests --> F{Pass/Fail}
    end

    F -- Fail --> G[Block Deployment]
```

## 6. Handling Complexity and Mapping Errors

Health data formats are notoriously inconsistent across different providers. A simple `when` statement is often insufficient for robust mapping. This section acknowledges this complexity and defines a strategy for handling it.

*   **Defensive Parsing:** All `DataProvider` implementations must practice defensive parsing. This means they should never assume the incoming data conforms to the provider's documentation. All fields, especially optional ones, should be handled with null-safety and default values where appropriate.
*   **Error Handling within Mappers:**
    *   **Recoverable Errors:** If a non-essential field is missing or has an unexpected format (e.g., a `notes` field is an integer instead of a string), the mapper should log a `WARN`-level message, discard the problematic field, and continue mapping the rest of the object. The goal is to salvage as much data as possible.
    *   **Unrecoverable Errors:** If an essential field is missing or invalid (e.g., a `startTimestamp` is null or malformed), the mapper cannot proceed. In this case, it should throw a specific `MappingError` exception.
*   **System-Level Error Handling:**
    *   When a `MappingError` is thrown, the core sync engine will catch it.
    *   The specific job will be marked as `FAILED` with a detailed error message in the logs.
    *   The failed job will be moved to the Dead-Letter Queue (DLQ) for manual inspection by the developer. This is treated as a bug in our `DataProvider` that needs to be fixed, as the provider should be resilient enough to handle most data inconsistencies.
