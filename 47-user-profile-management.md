## Dependencies

### Core Dependencies
- `46-user-authentication.md` - User Authentication
- `48-data-deletion-policy.md` - Data Deletion Policy

### Strategic / Indirect Dependencies
- `36-user-privacy-settings.md` - User Privacy Settings
- `54-social-sharing.md` - Social Sharing
- `57-app-analytics.md` - App Analytics

---

# PRD Section 47: User Profile Management (Deep Dive)

## 1. Introduction
User profile management is a key feature that allows users to personalize their SyncWell experience. A user's profile will store basic information and preferences that can be used to customize the app and communications. This document outlines the requirements for creating, viewing, and updating user profiles at a granular level.

## 2. Detailed User Flows

### 2.1. View Profile Details
1.  **Entry Point:** User navigates to the 'Settings' tab and taps on their name/email at the top of the screen.
2.  **UI:** The 'Profile' screen is displayed, showing the user's current profile picture, display name, and email address. All fields are read-only initially.
3.  **CTA:** A prominent "Edit Profile" button is displayed.

### 2.2. Edit Display Name Flow
1.  **Entry Point:** From the 'Profile' screen, user taps "Edit Profile."
2.  **UI:** The fields become editable. The user taps the display name field.
3.  **User Action:** User types a new display name.
4.  **Validation (Client-Side):** The name is validated against the rules in **Section 3**.
5.  **User Action:** User taps "Save."
6.  **API Call:** `PUT /v1/user/profile` with `{"displayName": "New Name"}`.
7.  **Backend:** The backend validates the new name, updates the user record, and returns a `200 OK` with the updated user profile.
8.  **UI:** The screen returns to the read-only state, displaying the new name. A success toast message "Profile updated" is shown.

### 2.3. Profile Picture Upload & Cropping Flow
1.  **Entry Point:** From the 'Edit Profile' screen, user taps the camera icon or existing profile picture.
2.  **UI:** A native action sheet appears with two options: "Take Photo" and "Choose from Library."
3.  **User Action:** User selects an option and either takes a new photo or selects one from their device gallery.
4.  **UI:** An image cropping interface is presented, enforcing a 1:1 aspect ratio.
5.  **User Action:** User adjusts the crop and taps "Confirm."
6.  **Client Action:** The client resizes the cropped image to a max dimension (e.g., 512x512) and compresses it to a JPEG format.
7.  **API Call:** The client uploads the image data to a dedicated endpoint, e.g., `POST /v1/user/profile/avatar`.
8.  **Backend:** The backend saves the image to a cloud storage bucket (e.g., S3) and updates the `profilePictureUrl` in the user's database record.
9.  **UI:** The new profile picture is displayed on the profile screen.

### 2.4. Change Email Address Flow
1.  **Security:** This is a sensitive action and requires re-authentication.
2.  **Entry Point:** From the 'Edit Profile' screen, user taps the email field.
3.  **UI:** A dialog appears asking the user to re-enter their password to proceed.
4.  **User Action:** User enters password. After successful verification, the app displays a "Change Email" screen.
5.  **UI:** Form with "New Email" and "Confirm New Email" fields.
6.  **API Call:** `POST /v1/user/email/change-request` with the new email.
7.  **Backend:** Generates a secure, time-sensitive token and sends a verification email to the **new** address.
8.  **User Action:** User opens the email and clicks the verification link.
9.  **Backend:** The link's endpoint validates the token and finalizes the email address change in the database. The user is notified of the successful change via an email to their old address.

### 2.5. Account Deletion Flow
1.  **Entry Point:** From 'Settings', user navigates to 'Account' > 'Delete Account'.
2.  **UI (Warning Level 1):** A screen explains that this action is permanent and will delete all their settings and configuration. It lists what will be deleted. The user must type the word "DELETE" into a text field to enable the "Proceed" button.
3.  **UI (Warning Level 2):** A native alert dialog appears: "Are you absolutely sure? This cannot be undone." with "Cancel" and "Delete Permanently" buttons.
4.  **User Action:** User taps "Delete Permanently."
5.  **API Call:** `DELETE /v1/user/account`.
6.  **Backend:** The backend initiates the data deletion process as defined in `48-data-deletion-policy.md`.
7.  **Client Action:** The app logs the user out, clears all local data, and returns to the initial sign-up/login screen.

## 3. Profile Data Validation Rules
| Field | Rule | Error Message |
| :--- | :--- | :--- |
| `displayName` | Max 50 characters. No special characters other than space/hyphen. | "Name must be 50 characters or less." |
| `profilePicture` | Max file size 5MB. Allowed types: JPEG, PNG. | "Image must be a JPEG or PNG and less than 5MB." |

## 4. Avatar Service Integration
-   **Fallback:** If a user has not uploaded a custom profile picture (`profilePictureUrl` is null), the client will check for a Gravatar image associated with their email address.
-   **Implementation:** The client will construct a Gravatar URL from the user's email hash and attempt to load the image. A default placeholder (e.g., user's initials on a colored background) will be shown if neither a custom avatar nor a Gravatar exists.

## 5. Data Caching Strategy
-   **Profile Info:** The user's profile data (name, email, avatar URL) will be fetched upon login and cached in the client's local database (e.g., Realm, SQLite) for the duration of the session.
-   **Avatar Image:** The avatar image itself will be downloaded and cached using the native OS image caching system (e.g., Kingfisher on iOS, Coil on Android). This prevents re-downloading the same image every time it appears.
-   **Staleness:** The cached data will be considered stale and re-fetched whenever the user actively visits the profile screen.

## 6. Accessibility (A11y) Considerations
-   All input fields on the profile screen will have clear, descriptive labels for screen readers.
-   The profile picture will have an accessibility label, e.g., "Profile picture for [User's Display Name]."
-   All buttons ("Edit", "Save", "Cancel") will have accessible names and roles.
-   The screen will support dynamic type sizes to respect the user's OS-level font size settings.

## 7. Future Enhancements
-   **User Bio:** A short text field for users to add a brief bio about themselves.
-   **Social Links:** Fields to link to external profiles like Twitter or a personal website.
-   **Profile Banner:** A larger, customizable header image for the profile screen.

## 8. User Profile Data Model (Expanded)
The user profile will contain the following fields:

| Field | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `userId` | UUID | Unique identifier for the user. | `a1b2c3d4-e5f6-7890-1234-567890abcdef` |
| `displayName` | String | The user's chosen display name. | "Jane Doe" |
| `email` | String | The user's primary email address. | `jane.doe@example.com` |
| `profilePictureUrl` | URL | A URL to the user's profile picture. | `https://syncwell.com/profiles/jane.jpg` |
| `createdAt` | Timestamp | The date and time the account was created. | `2025-08-18T12:00:00Z` |
| `updatedAt` | Timestamp | The date and time the profile was last updated. | `2025-08-18T12:30:00Z` |

## 9. Analysis & Calculations

### 9.1. Storage Cost Analysis (Profile Pictures)
-   **Hypothesis:** Allowing users to upload profile pictures will increase personalization and engagement. However, it will incur cloud storage costs.
-   **Assumptions:**
    -   Target Year 1 Active Users: 10,000
    -   Adoption Rate for Profile Pictures: 40%
    -   Average Image Size (after compression): 150 KB
-   **Calculation:**
    -   *Number of Users with Pictures* = 10,000 users * 40% = 4,000 users
    -   *Total Storage Required* = 4,000 users * 150 KB/user = 600,000 KB = 600 MB = 0.6 GB
    -   *Monthly Cost (AWS S3 Standard)*: AWS S3 pricing is ~$0.023 per GB. So, 0.6 GB * $0.023/GB-month = **$0.0138 per month**.
-   **Conclusion:** The cost of storing profile pictures is negligible at our initial scale and is a worthwhile investment for the personalization benefits it provides.

### 9.2. Engagement Analysis
-   **Hypothesis:** Users who add a profile picture are more engaged and more likely to retain long-term.
-   **Measurement:** We will track this by creating a user segment in our analytics tool (`57-app-analytics.md`) for users who have a `profilePictureUrl`.
-   **KPIs to Compare:**
    -   **Retention:** Compare 30-day and 90-day retention for users with and without profile pictures.
    -   **Sync Frequency:** Compare the average number of syncs per week for the two segments.
    -   **Subscription Rate:** Compare the trial-to-paid conversion rate.
-   **Goal:** We aim to see a **15% higher** 30-day retention rate for users with profile pictures. This will validate the feature's impact on engagement.

## 10. Out of Scope
-   Customizable profile themes or layouts.
-   Public profiles or social networking features beyond basic social sharing (`54-social-sharing.md`).
