# Brownfield Architecture Document: Timeline Project

**version**: 2.0
**date**: 2025-07-21
**author**: Winston, AI Architect

## 1. Introduction

This document outlines the architectural approach for enhancing the "Timeline" project with an AI-powered life dashboard. Its primary goal is to serve as the guiding architectural blueprint for AI-driven development of new features while ensuring seamless integration with the existing system.

This document supplements the existing project architecture by defining how new components will integrate with current systems. Where conflicts arise between new and existing patterns, this document provides guidance on maintaining consistency while implementing enhancements.

### 1.1. Existing Project Analysis

My analysis of your project confirms the following:

*   **Primary Purpose**: A full-stack application for managing a personal timeline.
*   **Current Tech Stack**:
    *   **Frontend**: Next.js, React, TypeScript, Redux Toolkit, shadcn/ui, Tailwind CSS.
    *   **Backend**: NestJS, TypeScript, Supabase (for Auth).
    *   **Shared**: A dedicated `@wrm/types` package for type safety.
*   **Architecture Style**: Monorepo with a package-based structure (frontend, backend, types). The frontend uses the Next.js App Router, and the backend is modular.
*   **Deployment Method**: The deno.json file contains build scripts for each package, suggesting a multi-step build process.

### 1.2. Change Log

| Change | Date | Version | Description | Author |
| :--- | :--- | :--- | :--- | :--- |
| Initial Document | 2025-07-21 | 1.0 | First draft based on PRD | BMad Master |
| Brownfield Enhancement | 2025-07-21 | 2.0 | Updated architecture for new epics | Winston |

## 2. Architectural Goals & Constraints

### Goals

*   **Scalability**: The system must support a growing number of users and collaborative features.
*   **Modularity**: Decouple features (Timeline, Tickets, AI Assistant) to allow for independent development and deployment.
*   **Real-time Interaction**: Support real-time updates for features like ticket manipulation and future collaborative editing.
*   **AI Integration**: Seamlessly integrate the AI Personal Assistant into the user workflow.

### Constraints

*   Must use the existing NestJS backend and Next.js frontend.
*   Authentication must continue to be handled by Supabase Auth.
*   The architecture must support the epics defined in the PRD.

## 3. Proposed Architecture

This architecture extends the existing components to support the full feature set defined in the PRD.

### 3.1. Backend Architecture (backend)

The NestJS backend will be expanded with new modules to handle the business logic for each epic.

#### New Modules

*   **`TicketsModule`**: Handles all CRUD operations for tickets and ticket types.
    *   **Controllers**:
        *   `TicketsController`: Exposes endpoints for creating, reading, updating, and deleting tickets.
        *   `TicketTypesController`: Exposes endpoints for managing custom ticket types.
    *   **Services**:
        *   `TicketsService`: Contains the core business logic for ticket manipulation.
        *   `TicketTypesService`: Manages the creation and validation of custom ticket types.
    *   **Database Schema**:
        *   `tickets`: `{id, user_id, title, start_time, end_time, type_id, custom_properties:jsonb}`
        *   `ticket_types`: `{id, user_id, name, properties_schema:jsonb}`

*   **`AgentModule`**: Handles the logic for the AI Personal Assistant. This module will integrate with a third-party AI service (e.g., OpenAI).
    *   **Controllers**:
        *   `AgentController`: Provides an endpoint for the frontend to send user commands.
    *   **Services**:
        *   `AgentService`: Orchestrates interactions with the AI model, parsing user intent, and calling other services (e.g., `TicketsService`) to fulfill requests.
        *   `SchedulingService`: A sub-service responsible for agent-to-agent negotiation and checking for calendar conflicts.

*   **`CollaborationModule`**: Manages the logic for sharing timelines, projects, and tickets.
    *   **Controllers**:
        *   `SharingController`: Exposes endpoints for creating and managing shared links or permissions.
    *   **Services**:
        *   `SharingService`: Handles the business logic for sharing and access control.

### 3.2. Frontend Architecture (frontend)

The frontend will be responsible for rendering the dynamic timeline, managing user interactions, and communicating with the backend API and AI services.

#### New Components

*   **`TimelineView`**: A container component that orchestrates the rendering of the timeline. It will manage view switching (Hourly, Daily, etc.) and the date range slider.
*   **`TicketComponent`**: Represents a single ticket on the timeline. It will handle its own rendering based on its state and manage drag-and-drop and resizing interactions.
*   **`AIAssistantUI`**: A chat/voice interface component that communicates with the AI backend service.

#### State Management (Redux Store)

The Redux store will be updated with new slices to manage the state of the new features.

*   **`timelineSlice`**: Manages the state of the timeline, including the visible date range.
*   **`ticketSlice`**: Manages the state for individual tickets, including custom types and properties. (This appears to be partially implemented as `ticketsSlice`).
*   **`agentSlice`**: Manages the state of the AI assistant, including chat history and configuration.

#### Services

*   **`APIService`**: A dedicated module to handle all HTTP requests to the backend API, abstracting away the fetch logic from the components.

### 3.3. Data Flow

Here are two examples of how data will flow through the system for key user actions.

#### User Reschedules a Ticket

1.  User drags and drops a `TicketComponent` on the `TimelineView` in the frontend.
2.  The component's `onDrop` handler dispatches an action to the Redux `ticketsSlice`.
3.  A thunk in the slice calls the `APIService` to send a `PATCH` request to `/api/tickets/{id}`.
4.  The backend's `TicketsController` receives the request and calls the `TicketsService`.
5.  The `TicketsService` updates the ticket's start/end time in the database.
6.  The backend returns a success response, and the Redux store is updated, re-rendering the component in its new position.

#### User Creates a Ticket via AI

1.  User types "Schedule a meeting for tomorrow at 2pm" into the `AIAssistantUI`.
2.  The UI sends the request to the backend's `AgentController` at `/api/agent/command`.
3.  The `AgentController` passes the request to the `AgentService`.
4.  The `AgentService` sends the text to an AI model to extract intent and entities (title, time).
5.  The `AgentService` calls the `TicketsService` to create the new ticket in the database.
6.  The backend sends a success response to the frontend, which updates the Redux store and displays the new ticket on the timeline.

## 4. Source Tree Integration

The new files will be placed in the existing project structure to maintain consistency.

```plaintext
packages/
├── backend/
│   └── src/
│       └── app/
│           ├── tickets/          # New Module
│           │   ├── tickets.module.ts
│           │   ├── tickets.controller.ts
│           │   └── tickets.service.ts
│           ├── agent/            # New Module
│           │   ├── agent.module.ts
│           │   ├── agent.controller.ts
│           │   └── agent.service.ts
│           └── collaboration/    # New Module
│               ├── collaboration.module.ts
│               ├── collaboration.controller.ts
│               └── collaboration.service.ts
└── frontend/
    └── src/
        ├── components/
        │   ├── agent/            # New Component
        │   │   └── AIAssistantUI.tsx
        │   └── timeline/
        │       └── TimelineView.tsx # New Component
        ├── services/             # New Folder
        │   └── APIService.ts
        └── store/
            └── slices/
                └── agentSlice.ts # New Slice
```

## 5. Next Steps

1.  Define the detailed API specification (OpenAPI/Swagger) for the new endpoints in the `TicketsModule`, `AgentModule`, and `CollaborationModule`.
2.  Create user stories for the new backend modules and frontend components.
3.  Begin implementation, starting with the `TicketsModule` in the backend and the corresponding UI in the frontend.