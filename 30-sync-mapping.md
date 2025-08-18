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

This document provides the definitive technical specification for SyncWell's data mapping and transformation engine. This engine is the core of SyncWell's intellectual property and is responsible for accurately translating health data between disparate platform-specific formats. The system is built around a **versioned, canonical data model** that serves as a universal intermediary.

This specification is a critical blueprint for the **solo developer**. It details the precise structure of the canonical models and provides a "cookbook" of rules and patterns for handling the complex nuances of data mapping. A robust and well-tested mapping engine is the foundation of a reliable product and user trust.

## 2. The Canonical Data Schema (v1)

All data moving through the SyncWell engine is converted to and from this standardized schema. All timestamps are in ISO 8601 format and are normalized to UTC.

```typescript
// All models are versioned for future migrations.
const SCHEMA_VERSION = 1;

// Base interface for all data points
interface CanonicalBase {
  type: 'ACTIVITY' | 'SLEEP' | 'WEIGHT' | 'HEART_RATE_SUMMARY';
  // A unique hash of the source data to help prevent duplicates
  sourceDataHash: string;
}

// --- ACTIVITY ---
enum ActivityType { RUNNING, CYCLING, WALKING, SWIMMING, STRENGTH, OTHER }
interface GpsPoint { lat: number; lon: number; elevation?: number; timestamp: string; }
interface Activity extends CanonicalBase {
  type: 'ACTIVITY';
  startTime: string;
  endTime: string;
  durationActiveSeconds: number;
  activityType: ActivityType;
  distanceMeters?: number;
  caloriesKcal?: number;
  averageHeartRate?: number;
  maxHeartRate?: number;
  gpsRoute?: GpsPoint[];
}

// --- SLEEP ---
enum SleepStage { AWAKE, LIGHT, DEEP, REM, UNKNOWN }
interface SleepSegment { stage: SleepStage; startTime: string; endTime: string; }
interface Sleep extends CanonicalBase {
  type: 'SLEEP';
  startTime: string;
  endTime: string;
  totalDurationSeconds: number;
  durationInBedSeconds: number;
  durationAsleepSeconds: number;
  segments: SleepSegment[];
}

// --- WEIGHT ---
interface Weight extends CanonicalBase {
  type: 'WEIGHT';
  timestamp: string;
  weightKg: number;
  fatPercentage?: number;
  bmi?: number;
}

// And so on for all other supported data types...
```

## 3. The Data Mapping Cookbook

Each `DataProvider` must implement `mapToCanonical()` and `mapFromCanonical()` methods. These methods will contain the complex business logic for transformation.

### Example 1: Normalizing Activity Enums

The `mapToCanonical()` function in a provider must contain a mapping of the source platform's activity types to the canonical `ActivityType` enum.

```typescript
// Pseudo-code within a GarminProvider
function mapGarminActivity(garminType: string): ActivityType {
  switch (garminType.toLowerCase()) {
    case 'running': return ActivityType.RUNNING;
    case 'street_running': return ActivityType.RUNNING;
    case 'cycling': return ActivityType.CYCLING;
    case 'lap_swimming': return ActivityType.SWIMMING;
    default: return ActivityType.OTHER;
  }
}
```

### Example 2: Reconciling Sleep Stages

The `mapFromCanonical()` function must gracefully handle cases where the destination supports fewer sleep stages than the source.

```typescript
// Pseudo-code within a provider for a simple destination app
function mapSleepToSimpleDevice(canonicalSleep: Sleep): SimpleSleep {
  let asleepSeconds = 0;
  for (const segment of canonicalSleep.segments) {
    if (segment.stage !== SleepStage.AWAKE) {
      asleepSeconds += (new Date(segment.endTime) - new Date(segment.startTime)) / 1000;
    }
  }
  return { startTime: canonicalSleep.startTime, totalTimeAsleep: asleepSeconds };
}
```

### Example 3: Timezone Normalization

All providers **must** convert source data timestamps to UTC before creating the canonical model. The canonical model is always in UTC. When writing to a destination, the `mapFromCanonical()` function is responsible for providing the timestamp in the format expected by the destination API (which may or may not include timezone offsets).

## 4. Mapper Unit Testing

*   **Requirement:** Every `mapToCanonical` and `mapFromCanonical` function in every provider **must** have a corresponding suite of unit tests.
*   **Fixtures:** The tests will use static `.json` files stored in the repository. These files will be real-world, anonymized API responses from the third-party platforms.
*   **Process:** The unit test will load the JSON fixture, pass it to the mapping function, and then assert that the resulting canonical model (or destination model) has the correct structure and values.
*   **Benefit:** This creates a powerful regression suite. If a provider's API changes its response format, these unit tests will fail immediately, pinpointing the exact location of the required change.

## 5. Schema Versioning & Migration

The canonical schema itself is versioned. This is critical for long-term maintenance.
*   **Scenario:** In v2.0 of SyncWell, we decide to add `restingHeartRate` to the `Sleep` model.
*   **Process:**
    1.  The `Sleep` interface is updated with the new optional field.
    2.  The `SCHEMA_VERSION` constant is incremented to `2`.
    3.  The app's data loading logic will now check the version of any stored data. If it finds `v1` data, it will apply a simple migration function (e.g., `migrateV1toV2(data)`) before using it.
    4.  This prevents new versions of the app from crashing when encountering old data structures.

## 6. Optional Visuals / Diagram Placeholders
*   **[Diagram] Complete Canonical Schema:** A class diagram or ERD showing all canonical data models and their relationships.
*   **[Diagram] Mapping Flow with Unit Tests:** A flowchart showing a source API response being fed into a mapping function, with the output being validated against a set of unit test assertions.
*   **[Table] Cross-Platform Activity Mapping:** A detailed table showing how activity types from all supported platforms (Fitbit, Garmin, Strava, etc.) map to the canonical `ActivityType` enum.
*   **[Code Snippet] Mapper Test Case:** A complete, working example of a Jest test case for a data mapping function, including loading the JSON fixture.
