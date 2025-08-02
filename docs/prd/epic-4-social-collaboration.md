# **Epic 4: Social & Collaboration**
*This epic covers sharing timelines, projects, and tickets between users.*

*   **User Story 4.1 (Timeline Sharing):**
    *   **As a user,** I want to share my entire timeline with selected friends or collaborators.
    *   **So that** they can view my schedule and coordinate with me.
    *   **Acceptance Criteria:**
        *   There is a "Share Timeline" option in the main interface.
        *   The user can select specific contacts or generate a shareable link.
        *   Shared timelines are read-only for viewers unless explicitly given edit permissions.
        *   **Local Testing:** CLI command `deno test packages/testing/backend/timeline-sharing.test.ts` validates sharing permissions.
        *   **Validation:** Sharing permissions are granular (view-only, comment, edit).
        *   **Performance:** Shared timeline loads within 2 seconds for viewers.

*   **User Story 4.2 (Single Ticket Sharing):**
    *   **As a user,** I want to share a specific ticket with others.
    *   **So that** I can collaborate on individual tasks or activities.
    *   **Acceptance Criteria:**
        *   Each ticket has a "Share" button or context menu option.
        *   Recipients can view ticket details and add comments.
        *   The original owner maintains control over ticket modifications.
        *   **Local Testing:** CLI command `deno test packages/testing/backend/ticket-sharing.test.ts` validates individual ticket sharing.
        *   **Validation:** Shared tickets maintain real-time sync with original.
        *   **Data Integrity:** Comments and updates are properly attributed to users.

*   **User Story 4.3 (Project Creation & Sharing):**
    *   **As a user,** I want to create a "Project" by grouping multiple related tickets.
    *   **So that** I can share and collaborate on complex initiatives with others.
    *   **Acceptance Criteria:**
        *   There is a "Create Project" option that allows selecting multiple tickets.
        *   Projects have a name, description, and list of associated tickets.
        *   Projects can be shared with specific users with different permission levels.
        *   **Local Testing:** CLI command `deno test packages/testing/backend/projects.test.ts` validates project CRUD operations.
        *   **Validation:** Project members can view progress and add tickets with permission.
        *   **Performance:** Project views load within 1.5 seconds with up to 50 tickets.

*   **User Story 4.4 (Ticket Assignment):**
    *   **As a user,** I want to assign tickets to other users.
    *   **So that** I can delegate tasks and track their completion.
    *   **Acceptance Criteria:**
        *   Tickets have an "Assign to" field where users can select from their contacts.
        *   Assigned tickets appear "greyed out" on the assignor's timeline until accepted.
        *   Recipients receive notifications and can accept, reject, or negotiate the assignment.
        *   **Local Testing:** CLI command `deno test packages/testing/backend/ticket-assignment.test.ts` validates assignment flow.
        *   **Validation:** Assignment notifications are delivered reliably via email/in-app.
        *   **User Control:** Recipients can modify ticket details before accepting.

*   **User Story 4.5 (Friend Management):**
    *   **As a user,** I want to add and manage friends/collaborators.
    *   **So that** I can easily share content and collaborate with my network.
    *   **Acceptance Criteria:**
        *   There is a "Friends" or "Contacts" section in the application.
        *   Users can send friend requests via email or username.
        *   Friend requests require acceptance from both parties.
        *   **Local Testing:** CLI command `deno test packages/testing/backend/friend-management.test.ts` validates social connections.
        *   **Validation:** Friend lists are private and cannot be accessed without permission.
        *   **Performance:** Friend search and invitation system responds within 1 second.
