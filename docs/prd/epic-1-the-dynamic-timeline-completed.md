# **Epic 1: The Dynamic Timeline** ✅ **COMPLETED**
*This epic covers the core interface for viewing and navigating the user's schedule.*

*   **User Story 1.1 (View Switching):** ✅ **COMPLETE**
    *   **As a user,** I want to select 'Hourly', 'Daily', or 'Weekly' from a dropdown menu.
    *   **So that** I can view my timeline at my preferred level of detail.
    *   **Acceptance Criteria:**
        *   A dropdown menu is present in the main UI.
        *   Selecting an option from the dropdown immediately re-renders the timeline view to the corresponding scale.
        *   The timeline grid and ticket displays adjust logically for each view.

*   **User Story 1.2 (Date Navigation):** 🔄 **ENHANCED IN EPIC 1.5**
    *   **As a user,** I want to use a heat map interface to select dates and see activity completion status.
    *   **So that** I can quickly navigate to any period and understand my activity patterns.
    *   **Acceptance Criteria:**
        *   The heat map displays dates with visual indicators of completion status.
        *   Clicking a date updates the timeline view to the selected period.
        *   Selected date ranges are clearly highlighted on the heat map.
        *   Daily mode loads 3-day window (yesterday-today-tomorrow).
        *   Weekly mode loads 2-week window (current + next week).

*   **User Story 1.3 (Ticket Manipulation):** ✅ **COMPLETE** 🔄 **ENHANCED IN EPIC 1.5**
    *   **As a user,** I want to drag and drop a ticket to a new time slot.
    *   **So that** I can easily reschedule my activities.
    *   **Acceptance Criteria:**
        *   Clicking and holding a ticket "lifts" it from the timeline with visual elevation effect.
        *   Dropping the ticket in a new valid time slot updates its scheduled time.
        *   The ticket's data (start and end time) is updated in the backend.
        *   **Timeline Navigation:** Timeline scrolls horizontally via mouse wheel and touch (Epic 1.5).
        *   **Local Testing:** CLI command `./packages/testing/test-timeline-drag-drop.sh` verifies drag-drop functionality.
        *   **Validation:** Invalid drop zones (overlapping tickets, past dates) show error feedback.
        *   **Performance:** Drag operation responds within 50ms, backend update within 500ms.

*   **User Story 1.4 (Ticket Resizing):** ✅ **COMPLETE**
    *   **As a user,** I want to click and drag the edge of a ticket.
    *   **So that** I can change its duration.
    *   **Acceptance Criteria:**
        *   Hovering over the start or end edge of a ticket changes the cursor to a resize icon.
        *   Dragging the edge modifies the ticket's start or end time with real-time preview.
        *   The ticket's duration is updated in the backend.
        *   **Local Testing:** CLI command `./packages/testing/test-timeline-drag-drop.sh` validates resize functionality.
        *   **Validation:** Minimum duration enforced (5 minutes in implementation), conflicts prevented.
        *   **Performance:** Resize preview updates within 50ms, backend save within 500ms.
