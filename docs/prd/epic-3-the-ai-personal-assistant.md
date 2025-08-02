# **Epic 3: The AI Personal Assistant**
*This epic covers the functionality of the embedded AI agent that assists the user.*

*   **User Story 3.1 (Voice/Chat Input):**
    *   **As a user,** I want to activate the AI Assistant via a chat interface or voice command.
    *   **So that** I can give it instructions in a natural and convenient way.
    *   **Acceptance Criteria:**
        *   A persistent chat icon is available on the screen.
        *   A microphone icon is present to enable voice input.
        *   The assistant processes natural language queries from both text and voice.
        *   **Local Testing:** CLI command `deno test packages/testing/backend/ai-interface.test.ts` validates chat/voice endpoints.
        *   **Performance:** Text responses within 2 seconds, voice transcription within 3 seconds.
        *   **Error Handling:** Voice recognition failures prompt retry with visual feedback.

*   **User Story 3.2 (Proactive Ticket Creation):**
    *   **As a user,** I want the AI Assistant to analyze my requests and proactively create detailed tickets.
    *   **So that** I can offload the manual work of planning.
    *   **Acceptance Criteria:**
        *   When given a goal, the agent can suggest a series of smaller, related tickets.
        *   The agent presents the suggested tickets to the user for approval before placing them on the timeline.
        *   The agent checks for existing conflicts on the timeline before suggesting times.
        *   **Local Testing:** CLI command `deno test packages/testing/backend/ai-tickets.test.ts` validates ticket generation logic.
        *   **Validation:** AI suggestions include estimated duration, priority, and dependencies.
        *   **User Control:** Bulk approve/reject suggestions, individual ticket editing before acceptance.

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

*   **User Story 3.6 (Custom AI Commands):**
    *   **As a user,** I want to create custom voice/chat commands for my AI Assistant.
    *   **So that** I can quickly trigger personalized workflows and shortcuts.
    *   **Acceptance Criteria:**
        *   The AI settings page includes a "Custom Commands" section.
        *   Users can define command phrases (e.g., "start my morning routine") linked to specific actions.
        *   Custom commands can trigger multiple actions: create tickets, modify existing tickets, send messages, or run workflows.
        *   Voice recognition accurately identifies custom commands alongside built-in commands.
        *   **Local Testing:** CLI command `deno test packages/testing/backend/custom-commands.test.ts` validates command creation and execution.
        *   **Validation:** Command phrases must be unique, support parameters (e.g., "schedule meeting with {person}").
        *   **Performance:** Custom command execution responds within 1 second, voice recognition within 2 seconds.
        *   **User Control:** Commands can be edited, disabled, or deleted; preview mode shows what actions will be taken.
