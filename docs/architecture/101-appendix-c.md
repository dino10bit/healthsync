# Appendix C: Future-State Data Models

This appendix contains canonical data models that are defined in the codebase for future use but are not processed by any sync job in the MVP. They are included here to show forward-looking architectural thought but are separated to avoid cluttering the primary PRD.

## `CanonicalSleepSession`

Represents a period of sleep. The definitive schema is implemented as a Kotlin `data class` in the KMP shared module.

```kotlin
import kotlinx.serialization.Serializable

@Serializable
data class CanonicalSleepSession(
    val sourceId: String,
    val sourceProvider: String,

    // Timestamps in ISO 8601 format (UTC). While stored in UTC, the original timezone is essential for correct interpretation of sleep cycles.
    val startTimestamp: String,
    val endTimestamp: String,

    // The IANA timezone identifier (e.g., "America/New_York") in which the sleep session occurred.
    val timezone: String? = null,

    // Total time in bed, in seconds.
    val timeInBedSeconds: Long,

    // Total time asleep (timeInBed - awake time), in seconds.
    val timeAsleepSeconds: Long,

    // Time spent in different sleep stages, in seconds.
    val deepSleepSeconds: Long? = null,
    val lightSleepSeconds: Long? = null,
    val remSleepSeconds: Long? = null,
    val awakeSeconds: Long? = null
)
```
