# PRD Section 6: Technical Architecture, Security & Compliance

## 1. Executive Summary

This document specifies the complete technical architecture for the SyncWell application. The architecture is designed to be robust, scalable, secure, and maintainable, adhering to modern software engineering principles while being pragmatic for implementation by a **solo developer**.

We will use the **C4 Model** as a framework to describe the architecture at different levels of detail, ensuring clarity for both technical and non-technical stakeholders. The core architectural principles are **modularity** (via a Provider-based pattern), **security by design**, and **privacy by default**. This document is the master blueprint for the system's construction.

## 2. Architectural Model (C4)

### Level 1: System Context

This diagram shows the system in its environment, illustrating its relationship with users and external systems.

*   **System:** The **SyncWell Application System**.
*   **Users:**
    *   **Health-Conscious User:** Interacts with the SyncWell Mobile App to configure syncs and manage their data connections.
*   **External Systems:**
    *   **Third-Party Health Platforms** (e.g., Garmin Connect, Fitbit API, Strava API): The primary systems SyncWell reads data from and writes data to.
    *   **Platform App Stores** (Apple App Store, Google Play Store): Used for application distribution and handling in-app purchases.
    *   **Platform Notification Services** (APNs, FCM): Used to send push notifications.
    *   **Platform Backup Services** (iCloud, Google Drive Auto-Backup): Used for backing up user settings.

### Level 2: Containers

This level zooms into the system boundary to show the high-level technical containers.

1.  **Mobile Application (Cross-Platform: React Native)**
    *   **Description:** The user-facing application that runs on the user's iOS or Android device. It is the primary container for all application logic.
    *   **Technology:** React Native.
    *   **Responsibilities:**
        *   Provides the entire User Interface.
        *   Executes the core data synchronization logic.
        *   Manages all communication with third-party APIs.
        *   Securely stores user credentials (OAuth tokens) on the device.
2.  **Serverless Backend (Firebase)**
    *   **Description:** A minimal set of serverless functions and services that support the mobile application. It does **not** store or process any user health data.
    *   **Technology:** Firebase (Cloud Functions, Firestore for minimal config data, Analytics, Crashlytics).
    *   **Responsibilities:**
        *   (Potentially) Handling OAuth redirect callbacks for certain web-based auth flows.
        *   (Potentially) Server-side receipt validation for in-app purchases to prevent fraud.
        *   Sending broadcast push notifications (e.g., new feature announcements).
        *   Collecting anonymous analytics and crash reports.

### Level 3: Components (Inside the Mobile Application)

This level zooms into the Mobile Application to show its key internal components.

*   **`UI`:** The React components, screens, and navigation logic that form the user interface.
*   **`State Management (Redux)`:** A centralized store that manages the application's state, ensuring predictable state transitions.
*   **`Sync Engine`:** The core business logic, as detailed in `05-data-sync.md`. Contains the `SyncScheduler`, `JobQueue`, and `SyncProcessor`.
*   **`Provider Manager`:** Responsible for loading and managing the different `DataProvider` modules.
*   **`DataProvider (Interface)`:** A standardized interface for all third-party integrations.
    *   **`FitbitProvider` (Implementation):** An example implementation for the Fitbit API.
    *   **`GarminProvider` (Implementation):** An example implementation for the Garmin API.
*   **`Secure Storage`:** A wrapper around the native Keychain/Keystore for securely storing and retrieving sensitive data like OAuth tokens.
*   **`Local Database (Realm)`:** The on-device database for storing the sync job queue and user settings.

## 3. Technology Stack & Rationale

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Cross-Platform Framework** | **React Native** | **Familiarity & Ecosystem.** Allows a solo developer to target both iOS and Android from a single codebase. The JavaScript/React ecosystem is vast, with extensive libraries and community support, which accelerates development. |
| **State Management** | **Redux Toolkit** | **Predictability & Scalability.** Provides a strict, predictable pattern for managing global app state, which is crucial for preventing bugs in a complex application. Redux DevTools offer excellent debugging capabilities. |
| **On-Device Database** | **Realm** | **Performance & Ease of Use.** Realm is a high-performance mobile database that is often faster than SQLite-based solutions. It offers reliable encryption and a simple, object-oriented API that works well with React Native. |
| **Serverless Backend** | **Firebase** | **Integrated & Low-Maintenance.** Firebase provides a suite of tools (Auth, Functions, Firestore, Analytics, Crashlytics) that are well-integrated and require minimal server management, which is ideal for a solo developer. |
| **API Client** | **Axios** | **Robust & Flexible.** A mature and widely-used HTTP client for making API requests, with good support for features like interceptors, which are useful for automatically refreshing expired OAuth tokens. |

## 4. Security & Compliance

### Security Measures

*   **Data Encryption in Transit:** All network traffic will use TLS 1.2+. **Certificate Pinning** will be implemented for all API calls made from the mobile app to our own backend services to prevent Man-in-the-Middle (MitM) attacks.
*   **Data Encryption at Rest:** Sensitive credentials will be stored exclusively in the native Keychain (iOS) and Keystore (Android). The local Realm database will be encrypted.
*   **Code Security:** Production builds will be obfuscated. A dependency scanner (Snyk) will be run in the CI/CD pipeline to check for vulnerabilities.

### Compliance
*   The architecture is designed to facilitate compliance with GDPR, CCPA, and all relevant platform policies by ensuring that no personal health data is ever stored on servers controlled by SyncWell. All user data processing happens on the user's device.

## 5. Optional Visuals / Diagram Placeholders

*   **[Diagram] C4 Level 1: System Context Diagram.** A visual representation of the system, its user, and the external systems it interacts with.
*   **[Diagram] C4 Level 2: Containers Diagram.** A diagram showing the Mobile Application and the Serverless Backend, with arrows indicating the key interactions.
*   **[Diagram] C4 Level 3: Components Diagram.** A detailed diagram of the components inside the Mobile Application, showing how the UI, State Management, Sync Engine, and Providers are structured.
*   **[Diagram] Secure Data Flow:** A diagram illustrating how an OAuth token is received from a third-party service, passed to the Secure Storage component, and then retrieved by a DataProvider, without ever being stored in plain text or leaving the device.
