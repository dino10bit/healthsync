---
title: "Glossary of Terms"
migrated: true
---
# Glossary of Terms

This document is the single source of truth for all business and technical terminology used in the SyncWell project.

| Term | Definition |
| :--- | :--- |
| **Canonical Data Model** | A standardized, internal data structure (e.g., `CanonicalWorkout`) that represents a piece of health data. Data from all Providers is transformed into a canonical model before being processed by the sync engine. |
| **Circuit Breaker** | A resilience pattern used to prevent a network or service failure from cascading. It monitors for failures and "opens" the circuit to stop sending requests to a failing service for a period of time. |
| **Cold Path** | A post-MVP architectural pattern designed for long-running, low-priority, high-volume workflows, such as historical data backfills. It is designed to be robust and observable, likely using AWS Step Functions. |
| **Connection** | A user's authenticated link to a third-party health platform (e.g., their Fitbit account). It is uniquely identified by a `connectionId` and stores the necessary credentials (or a pointer to them) to interact with the provider on the user's behalf. |
| **DataProvider** | The software component (a class implementing the `DataProvider` interface) that encapsulates all the logic for interacting with a specific Provider's API, including authentication, data fetching, and data pushing. |
| **Event-Driven Architecture (EDA)** | A software architecture paradigm that promotes the production, detection, consumption of, and reaction to events. In SyncWell, this is primarily implemented with Amazon EventBridge. |
| **Hot Path** | The architectural pattern for handling the MVP's core sync functionality. It is optimized for low-latency, high-volume, short-lived sync jobs for recent data. It is built on API Gateway, SQS, and AWS Fargate. |
| **Idempotency-Key** | A unique, client-generated key (usually a UUID) included in the header of state-changing API requests. The backend uses this key to ensure that a retried operation is not processed more than once, preventing data duplication. For the Hot Path, this is used as the SQS Message Deduplication ID. |
| **PKCE (Proof Key for Code Exchange)** | An extension to the OAuth 2.0 Authorization Code flow that helps prevent authorization code interception attacks. It is a modern security best practice. |
| **Provider** | A specific third-party health platform that SyncWell can integrate with, such as Strava, Garmin, or Fitbit. |
| **Sync Job** | A single, discrete unit of work processed by a Worker Fargate Task. For example, "sync steps from Fitbit to Google Fit for user X on date Y". |
| **User Story** | A small, self-contained unit of development work articulated from the perspective of an end user. It is the primary artifact for defining feature requirements. |
| **User** | A human interacting with the SyncWell system. To avoid ambiguity, this term should be qualified with one of the following roles: |
| | **End-User:** A customer who uses the SyncWell mobile application to sync their health data. |
| | **Developer / Engineer:** A software engineer who builds and maintains the SyncWell application and infrastructure. |
| | **Support Engineer:** A member of the customer support team who assists End-Users and operates internal support tools. |
| **Worker Fargate Task** | The core containerized service in the SyncWell backend that contains the business logic for performing a sync job. |
