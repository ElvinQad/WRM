# **Epic 2: Intelligent & Customizable Tickets** 🚧 **IN PROGRESS**
*This epic covers the creation, customization, and state management of tickets.*

*   **User Story 2.1 (Ticket Type Creation):**
    *   **As a user,** I want to navigate to a 'Ticket Settings' page and create a new ticket type with a unique name.
    *   **So that** I can organize my activities into my own custom categories.
    *   **Acceptance Criteria:**
        *   There is a dedicated "Settings" area in the application.
        *   Within Settings, there is an option to "Create New Ticket Type."
        *   The user can enter a name for the new type and save it.
        *   The system prevents the creation of duplicate ticket type names with clear error messaging.
        *   **Local Testing:** CLI command `deno test packages/testing/backend/ticket-types.test.ts` validates CRUD operations.
        *   **Validation:** Ticket type names must be 3-50 characters, alphanumeric plus spaces.
        *   **Performance:** Type creation saves within 300ms, updates UI immediately.

*   **User Story 2.2 (Custom Property Definition):**
    *   **As a user,** when I create or edit a ticket type, I want to add custom properties to it.
    *   **So that** I can capture all the relevant information for that type of activity.
    *   **Acceptance Criteria:**
        *   In the "Ticket Settings" for a specific type, there is an "Add Property" button.
        *   The user can define a property name and select a property field type (e.g., Text, Number, Checkbox, Date, Dropdown).
        *   These defined properties will appear as fields on all tickets of that type.
        *   **Local Testing:** CLI command `deno test packages/testing/backend/custom-properties.test.ts` validates property schemas.
        *   **Validation:** Property names unique per ticket type, support 5 field types minimum.
        *   **Data Integrity:** Existing tickets of the type automatically gain new properties with default values.

*   **User Story 2.3 (Time-Aware State Visualization):**
    *   **As a user,** I want to instantly see the status of my tickets based on their border color.
    *   **So that** I can quickly assess my schedule and what needs attention.
    *   **Acceptance Criteria:**
        *   Tickets scheduled in the future have a standard border color.
        *   A ticket whose scheduled time is happening *now* has a distinct "Active" border color (e.g., green).
        *   A ticket whose time has passed and has had *no interaction* has a distinct "Untouched" border color (e.g., red).
        *   A ticket whose time has passed but *was interacted with* has a distinct "Confirmed" border color (e.g., amber).

*   **User Story 2.4 (Repeatable Tickets):**
    *   **As a user,** I want to mark tickets as repeatable with customizable recurrence patterns.
    *   **So that** I can automatically schedule recurring activities without manual duplication.
    *   **Acceptance Criteria:**
        *   Tickets have a "Repeat" toggle option in their settings.
        *   Users can configure repeat patterns (daily, weekly, monthly, custom intervals).
        *   The system automatically creates future instances based on the pattern.
        *   Users can modify individual instances without affecting the entire series.
        *   **Local Testing:** CLI command `deno test packages/testing/backend/recurring-tickets.test.ts` validates recurrence logic.
        *   **Validation:** Recurrence patterns support end dates, occurrence limits, and skip dates.
        *   **Performance:** Batch creation of recurring instances completes within 1 second for 100 occurrences.

*   **User Story 2.5 (Child Tickets & Hierarchical Structure):**
    *   **As a user,** I want to create child tickets under parent tickets to break down complex tasks.
    *   **So that** I can organize related sub-tasks and track progress hierarchically.
    *   **Acceptance Criteria:**
        *   Tickets have an "Add Child Ticket" option that creates a sub-ticket.
        *   Parent tickets visually indicate the number of child tickets (e.g., badge, expand/collapse).
        *   Child tickets inherit some properties from parent but can be customized independently.
        *   Parent ticket completion status reflects child ticket progress (optional auto-complete when all children done).
        *   **Local Testing:** CLI command `deno test packages/testing/backend/ticket-hierarchy.test.ts` validates parent-child relationships.
        *   **Validation:** Support up to 3 levels of nesting, prevent circular dependencies.
        *   **Performance:** Hierarchical views load within 500ms for tickets with up to 20 children.
