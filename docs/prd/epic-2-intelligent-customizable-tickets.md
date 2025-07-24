# **Epic 2: Intelligent & Customizable Tickets**
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
