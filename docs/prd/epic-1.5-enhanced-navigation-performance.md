# **Epic 1.5: Enhanced Navigation & Performance** 🚧 **IN PROGRESS**
*This epic enhances the timeline interface with heat map navigation, selective loading, improved scrolling behavior, and tickets pool staging.*

*   **User Story 1.5.1 (Heat Map Navigation):**
    *   **As a user,** I want to see a heat map showing my activity completion status across dates.
    *   **So that** I can quickly identify productive periods and navigate to specific dates.
    *   **Acceptance Criteria:**
        *   Heat map displays completion status using color intensity/coding.
        *   Clicking any date in the heat map navigates to that period.
        *   Selected date ranges are visually highlighted.
        *   Heat map updates in real-time as tickets are completed/modified.
        *   **Performance:** Heat map renders within 300ms, updates within 100ms.

*   **User Story 1.5.2 (Selective Data Loading):**
    *   **As a user,** I want the timeline to load only relevant dates for better performance.
    *   **So that** I can navigate quickly without waiting for unnecessary data.
    *   **Acceptance Criteria:**
        *   Daily mode loads 3-day window (yesterday, today, tomorrow).
        *   Weekly mode loads 2-week window (current week + next week).
        *   Hourly mode loads current day + 6 hours before/after.
        *   Background loading prefetches adjacent periods.
        *   **Performance:** Initial load under 1 second, navigation under 200ms.

*   **User Story 1.5.3 (Timeline Scrolling Enhancement):**
    *   **As a user,** I want to scroll the timeline horizontally using mouse wheel and touch.
    *   **So that** I can navigate through time periods naturally without dragging.
    *   **Acceptance Criteria:**
        *   Mouse wheel over timeline scrolls horizontally through time.
        *   Touch devices support horizontal swipe scrolling.
        *   Scroll behavior respects selective loading boundaries.
        *   Smooth scrolling animation with momentum on touch devices.
        *   **Performance:** Scroll response within 16ms for 60fps smoothness.

*   **User Story 1.5.4 (Tickets Pool):**
    *   **As a user,** I want a FIFO tickets pool where I can queue tickets that I'm not ready to schedule on the timeline.
    *   **So that** I can organize my tickets in a first-in, first-out queue before committing them to specific time slots.
    *   **Acceptance Criteria:**
        *   Tickets pool panel is positioned below the main timeline interface and is foldable/collapsible.
        *   Pool operates as a FIFO queue - newest tickets are added to the end, oldest are retrieved from the front.
        *   Users can move tickets from timeline to pool via button/menu action (unscheduling them).
        *   Users can move tickets from pool to timeline via button/menu action (scheduling them).
        *   Within the pool, users can drag-drop to reorder tickets for priority management.
        *   Pool tickets use existing visual design but indicate "unscheduled/queued" status.
        *   Pool panel can be collapsed/expanded to save screen space.
        *   Existing timeline-to-timeline drag-drop functionality continues unchanged.
        *   **Local Testing:** Extended `./packages/testing/test-timeline-drag-drop.sh` validates pool operations and FIFO behavior.
        *   **Performance:** Pool operations maintain 50ms response time, backend updates within 500ms.
