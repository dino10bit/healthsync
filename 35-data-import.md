## Dependencies

### Core Dependencies
- `30-sync-mapping.md` - Source-Destination Sync Mapping
- `34-data-export.md` - Data Export Feature
- `05-data-sync.md` - Data Sync & Conflict Resolution

### Strategic / Indirect Dependencies
- `14-qa-testing.md` - QA & Testing Strategy
- `17-error-handling.md` - Error Handling, Logging & Monitoring
- `32-platform-limitations.md` - Platform-Specific Limitations

---

# PRD Section 35: Data Import Feature

## 1. Executive Summary

This document provides the detailed technical and functional specification for the **Data Import** feature in SyncWell. This feature allows users to import activity files (FIT, TCX, GPX) from their device, enabling them to bring in data from unsupported devices or migrate their workout history. This positions SyncWell as a true central hub for health data.

The architecture is designed to be a natural extension of the existing sync engine, reusing the canonical data model. This specification details the parsing architecture, the user experience for handling data mapping and duplicates, and the validation process.

## 2. Data Import Architecture

The import feature will be built on a modular `Parser` architecture.

*   **`ImportManager`:** The high-level service that is invoked when the OS passes a file to the app. It identifies the file type and delegates the parsing to the appropriate `Parser` module.
*   **`Parser` (Interface):** A standardized interface for all file parsers.
    ```typescript
    interface Parser {
      // Returns a list of file extensions it supports (e.g., ["fit"])
      getSupportedExtensions(): string[];

      // Parses a file into an array of canonical data objects
      // (An activity file might contain multiple activities)
      parseFile(filePath: string): Promise<CanonicalData[]>;
    }
    ```
*   **Concrete Implementations:** `FitFileParser`, `TcxParser`, `GpxParser`. Each will encapsulate the logic and any third-party libraries needed to parse its specific format into the `CanonicalActivity` model.

## 3. User Experience & Workflow

1.  **Initiation:** A user selects a `.fit`, `.tcx`, or `.gpx` file in an external app (e.g., Files) and chooses "Open with SyncWell."
2.  **Parsing & Validation:** The `ImportManager` receives the file and invokes the correct `Parser`. The parser validates the file; if it's corrupt, an error message is shown ("This file appears to be corrupt and cannot be read.").
3.  **Preview & Configure Screen:**
    *   The app displays a summary of the parsed activity (e.g., "Running, 5.2 miles").
    *   **Data Mapping:** If the activity type is unrecognized (e.g., "Kitesurfing"), a dropdown will appear: "Map 'Kitesurfing' to a known activity type." The user can then map it to a canonical type like `OTHER`. The app will remember this mapping for future imports.
    *   **Destination Selection:** The user selects one or more destination apps to sync the activity to. Invalid destinations (like Garmin) are disabled.
4.  **Duplicate Check:**
    *   Before queueing the sync, the `ImportManager` queries the destination app(s) for activities with a similar start time (+/- 2 minutes).
    *   If a potential duplicate is found, a new screen appears showing the imported activity and the existing activity side-by-side. The user is presented with two options: "Import Anyway" or "Skip Import."
5.  **Queueing:** If there are no duplicates (or the user chooses to import anyway), the `CanonicalActivity` object is added to the `P0_REALTIME_QUEUE` for syncing. The user is shown a confirmation message.

## 4. Import Limitations & User Communication

*   **Activities Only:** The feature is exclusively for activity files. The app will show an error if the user attempts to open an unsupported file type (e.g., a `.csv`).
*   **Data Completeness:** The Preview screen must clearly indicate what data was found in the file. If a GPX file is imported, the UI will show the GPS map but will have labels like "Heart Rate: Not available in file."
*   **Destination Limitations:** The destination selection UI will be identical to the main sync configuration UI, meaning read-only platforms like Garmin will be automatically disabled.

## 5. Validation & Error Handling

*   **File Corrupt:** If a parser throws an exception because the file is malformed, the user is shown a "File Corrupt or Unreadable" error.
*   **Missing Key Data:** If a file is parsed successfully but is missing data required to create a valid `CanonicalActivity` (e.g., a start time), the user is shown an error: "This file is missing key information (like a start time) and cannot be imported."
*   **Parser Unit Tests:** Each `Parser` module must have a comprehensive suite of unit tests that use a "golden set" of sample files to verify that they are parsed into the correct canonical representation. This is the primary defense against parsing regressions.

## 6. Risk Analysis & Mitigation

(This section remains largely the same but is included for completeness.)

| Risk ID | Risk Description | Probability | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **R-94** | A user tries to import a malformed file, causing the app to crash. | **Low** | **High** | The `ImportManager` will wrap all calls to the `Parser` modules in a top-level try/catch block. A failure at any point in the parsing process will result in a user-friendly error message, not a crash. |
| **R-95** | The imported data appears incorrectly in the destination app due to a flaw in the parser. | **Medium** | **Medium** | The unit tests for the parsers, using a wide variety of real-world sample files, are the key mitigation. The Preview screen also allows the user to sanity-check the data before it's synced. |
| **R-96**| The duplicate detection logic is either too aggressive or not aggressive enough. | **Medium** | **Low** | The side-by-side duplicate comparison screen is the mitigation. It empowers the user to make the final call, preventing the app from making an incorrect decision on their behalf. |

## 7. Optional Visuals / Diagram Placeholders
*   **[Diagram] Import Architecture:** A component diagram showing the `ImportManager` and the different `Parser` interface implementations.
*   **[User Flow Diagram] Data Import Journey:** A detailed flowchart showing the entire import process, including the file parsing, preview screen, user-guided mapping, duplicate check, and final queueing.
*   **[Mockup] Import Preview Screen:** A mockup of the preview screen, showing the activity summary and the destination app selection.
*   **[Mockup] Duplicate Resolution UI:** A mockup of the side-by-side comparison screen for resolving potential duplicates.
