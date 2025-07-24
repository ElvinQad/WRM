# **Epic 1: The Dynamic Timeline**
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
