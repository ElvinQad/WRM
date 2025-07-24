# Timeline Product Requirements Document (PRD)

| Date       | Version | Description              | Author       |
| :--------- | :------ | :----------------------- | :----------- |
| 2025-07-21 | 1.0     | Initial Draft            | BMad Master  |
| 2025-07-21 | 2.0     | Completed missing sections | BMad Master |

## **1. Goals and Background Context**

#### **Goals**

*   Empower individuals to manage their time with a hyper-personalized timeline tool.
*   Provide intelligent assistance via a personal AI agent to reduce manual planning.
*   Create a seamless transition from personal management to social collaboration.
*   Build a dynamic, timeline-based application for managing activities with customizable "tickets."

#### **Background Context**

Individuals currently lack a deeply personal and intelligent tool to track their daily activities and goals. Existing solutions are often rigid, demand constant manual input, and fail to proactively assist the user. This project aims to solve that by creating a flexible, AI-powered life dashboard that serves as a foundation for both personal organization and future social collaboration.

## **2. Requirements**

#### **Functional Requirements**

*   **FR1:** Users must be able to view the timeline in 'Hourly', 'Daily', 'Weekly', and 'Monthly' scales.
*   **FR2:** Users must be able to select a custom date range for the timeline using a slider.
*   **FR3:** Users must be able to move tickets to new time slots via drag-and-drop.
*   **FR4:** Users must be able to change a ticket's duration by resizing its edges.
*   **FR5:** Users must be able to create custom ticket types with unique names and properties (e.g., Text, Number, Checkbox).
*   **FR6:** The system must visually distinguish tickets based on their time-aware state (Future, Active, Past-Untouched, Past-Confirmed).
*   **FR7:** Users must be able to interact with an AI assistant via chat or voice commands.
*   **FR8:** The AI assistant must be able to proactively create tickets based on user goals.
*   **FR9:** The AI assistant must be able to provide daily/weekly briefings and proactive reminders.
*   **FR10:** The AI assistant must be able to negotiate scheduling with other users/agents on the user's behalf.
*   **FR11:** Users must be able to configure the AI assistant's autonomy and communication tone.

#### **Non-Functional Requirements**

*   **NFR1:** The system must be scalable to support a growing number of users.
*   **NFR2:** The architecture must be modular to allow for independent feature development.
*   **NFR3:** The user interface must support real-time updates for ticket manipulation.
*   **NFR4:** The system must be secure, leveraging the existing Supabase authentication.
*   **NFR5:** The user interface must be responsive and accessible on modern web browsers.

## **3. User Interface Design Goals**

*   **Overall UX Vision:** A clean, intuitive, and highly visual interface that makes schedule management feel effortless and fluid. The UI should feel like a personal dashboard, not a rigid calendar.
*   **Key Interaction Paradigms:** Direct manipulation (drag-and-drop, resize), conversational UI (chat/voice with AI), and clear visual state indicators (color-coded borders).
*   **Core Screens and Views:**
    1.  **Timeline View:** The main dashboard displaying tickets on a dynamic grid.
    2.  **Ticket Detail Modal:** A popup for viewing and editing a ticket's custom properties.
    3.  **Settings Page:** A dedicated area for managing ticket types and configuring the AI assistant.
*   **Accessibility:** WCAG AA
*   **Branding:** Modern, clean, and professional with a user-selectable light/dark mode.
*   **Target Device and Platforms:** Web Responsive

## **4. Technical Assumptions**

*   **Repository Structure:** Monorepo
*   **Service Architecture:** The existing system is a full-stack application composed of a Next.js frontend and a NestJS backend. This structure will be extended.
*   **Technology Stack:**
    *   **Frontend:** Next.js, React, TypeScript, Redux Toolkit, shadcn/ui, Tailwind CSS.
    *   **Backend:** NestJS, TypeScript.
    *   **Authentication:** Supabase Auth.
    *   **Shared Types:** A dedicated `packages/types` directory will continue to be used.
*   **Testing Requirements:** The testing strategy will include unit tests for business logic, integration tests for API endpoints, and end-to-end tests for critical user flows.

## **5. Epic List**

*   **Epic 1: The Dynamic Timeline:** Covers the core interface for viewing and navigating the user's schedule.
*   **Epic 2: Intelligent & Customizable Tickets:** Covers the creation, customization, and state management of tickets.
*   **Epic 3: The AI Personal Assistant:** Covers the functionality of the embedded AI agent that assists the user.
*   **Epic 4: Social & Collaboration:** Covers sharing timelines, projects, and tickets between users.

---

## **Epic 1: The Dynamic Timeline**
*This epic covers the core interface for viewing and navigating the user's schedule.*

*   **User Story 1.1 (View Switching):**
    *   **As a user,** I want to select 'Hourly', 'Daily', 'Weekly', or 'Monthly' from a dropdown menu.
    *   **So that** I can view my timeline at my preferred level of detail.
    *   **Acceptance Criteria:**
        *   A dropdown menu is present in the main UI.
        *   Selecting an option from the dropdown immediately re-renders the timeline view to the corresponding scale.
        *   The timeline grid and ticket displays adjust logically for each view.

*   **User Story 1.2 (Date Navigation):**
    *   **As a user,** I want to use a slider with two handles to select a start and end date.
    *   **So that** I can quickly navigate to any period in my timeline.
    *   **Acceptance Criteria:**
        *   The slider updates the timeline view in real-time as it's adjusted.
        *   The current date range selected by the slider is clearly displayed.
        *   The timeline view zooms in or out to fit the selected date range.

*   **User Story 1.3 (Ticket Manipulation):**
    *   **As a user,** I want to drag and drop a ticket to a new time slot.
    *   **So that** I can easily reschedule my activities.
    *   **Acceptance Criteria:**
        *   Clicking and holding a ticket "lifts" it from the timeline.
        *   Dropping the ticket in a new valid time slot updates its scheduled time.
        *   The ticket's data (start and end time) is updated in the backend.

*   **User Story 1.4 (Ticket Resizing):**
    *   **As a user,** I want to click and drag the edge of a ticket.
    *   **So that** I can change its duration.
    *   **Acceptance Criteria:**
        *   Hovering over the start or end edge of a ticket changes the cursor to a resize icon.
        *   Dragging the edge modifies the ticket's start or end time.
        *   The ticket's duration is updated in the backend.

## **Epic 2: Intelligent & Customizable Tickets**
*This epic covers the creation, customization, and state management of tickets.*

*   **User Story 2.1 (Ticket Type Creation):**
    *   **As a user,** I want to navigate to a 'Ticket Settings' page and create a new ticket type with a unique name.
    *   **So that** I can organize my activities into my own custom categories.
    *   **Acceptance Criteria:**
        *   There is a dedicated "Settings" area in the application.
        *   Within Settings, there is an option to "Create New Ticket Type."
        *   The user can enter a name for the new type and save it.
        *   The system prevents the creation of duplicate ticket type names.

*   **User Story 2.2 (Custom Property Definition):**
    *   **As a user,** when I create or edit a ticket type, I want to add custom properties to it.
    *   **So that** I can capture all the relevant information for that type of activity.
    *   **Acceptance Criteria:**
        *   In the "Ticket Settings" for a specific type, there is an "Add Property" button.
        *   The user can define a property name and select a property field type (e.g., Text, Number, Checkbox, Date, Dropdown).
        *   These defined properties will appear as fields on all tickets of that type.

*   **User Story 2.3 (Time-Aware State Visualization):**
    *   **As a user,** I want to instantly see the status of my tickets based on their border color.
    *   **So that** I can quickly assess my schedule and what needs attention.
    *   **Acceptance Criteria:**
        *   Tickets scheduled in the future have a standard border color.
        *   A ticket whose scheduled time is happening *now* has a distinct "Active" border color (e.g., green).
        *   A ticket whose time has passed and has had *no interaction* has a distinct "Untouched" border color (e.g., red).
        *   A ticket whose time has passed but *was interacted with* has a distinct "Confirmed" border color (e.g., amber).

## **Epic 3: The AI Personal Assistant**
*This epic covers the functionality of the embedded AI agent that assists the user.*

*   **User Story 3.1 (Voice/Chat Input):**
    *   **As a user,** I want to activate the AI Assistant via a chat interface or voice command.
    *   **So that** I can give it instructions in a natural and convenient way.
    *   **Acceptance Criteria:**
        *   A persistent chat icon is available on the screen.
        *   A microphone icon is present to enable voice input.
        *   The assistant processes natural language queries from both text and voice.

*   **User Story 3.2 (Proactive Ticket Creation):**
    *   **As a user,** I want the AI Assistant to analyze my requests and proactively create detailed tickets.
    *   **So that** I can offload the manual work of planning.
    *   **Acceptance Criteria:**
        *   When given a goal, the agent can suggest a series of smaller, related tickets.
        *   The agent presents the suggested tickets to the user for approval before placing them on the timeline.
        *   The agent checks for existing conflicts on the timeline before suggesting times.

*   **User Story 3.3 (Proactive Reminders & Briefings):**
    *   **As a user,** I want the AI Assistant to provide me with intelligent summaries and suggestions.
    *   **So that** I can stay organized and anticipate my schedule.
    *   **Acceptance Criteria:**
        *   The agent can deliver a daily or weekly briefing of scheduled tickets upon request.
        *   The agent can identify busy periods and proactively suggest blocking out focus time.
        *   All proactive suggestions require user confirmation.

*   **User Story 3.4 (Agent-to-Agent Scheduling):**
    *   **As an AI Assistant,** when I receive a ticket request from another user/agent, I want to check my user's availability.
    *   **So that** I can intelligently accept, reject, or propose a new time on my user's behalf.
    *   **Acceptance Criteria:**
        *   The assistant can parse incoming ticket requests from other users.
        *   The assistant checks the user's timeline for conflicts.
        *   Based on the user-defined autonomy level, the assistant can automatically respond or ask the user for a decision.

*   **User Story 3.5 (Agent Configuration):**
    *   **As a user,** I want to go to a settings page for my AI Assistant.
    *   **So that** I can configure its level of autonomy and its communication tone.
    *   **Acceptance Criteria:**
        *   A settings panel allows the user to set autonomy levels.
        *   A settings panel allows the user to select a communication tone.

## **6. Checklist Results Report**
*(To be completed after the PM-Checklist is run.)*

## **7. Next Steps**
*   **Architect Prompt:** "Please review this completed PRD and the existing codebase. Create a detailed brownfield architecture document that outlines the necessary changes to the frontend and backend to implement all epics and stories."
*   **UX Expert Prompt:** "Please review the UI/UX goals in this PRD. Create wireframes or mockups for the core screens and components, focusing on the dynamic timeline and the AI assistant interface."