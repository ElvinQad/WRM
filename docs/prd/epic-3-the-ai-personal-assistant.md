# **Epic 3: The AI Personal Assistant**
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
        *   **Data Awareness:** AI considers current timeline view when suggesting tickets - detailed placement for hourly/daily/weekly views, general time blocks for monthly planning context.

*   **User Story 3.3 (Proactive Reminders & Briefings):**
    *   **As a user,** I want the AI Assistant to provide me with intelligent summaries and suggestions.
    *   **So that** I can stay organized and anticipate my schedule.
    *   **Acceptance Criteria:**
        *   The agent can deliver a daily or weekly briefing of scheduled tickets upon request.
        *   The agent can identify busy periods and proactively suggest blocking out focus time.
        *   All proactive suggestions require user confirmation.
        *   **Multi-Granularity Intelligence:** AI briefings adapt to timeline context - detailed daily briefings use individual ticket data, weekly/monthly briefings use aggregated productivity metrics and patterns.

*   **User Story 3.4 (Agent-to-Agent Scheduling):**
    *   **As an AI Assistant,** when I receive a ticket request from another user/agent, I want to check my user's availability.
    *   **So that** I can intelligently accept, reject, or propose a new time on my user's behalf.
    *   **Acceptance Criteria:**
        *   The assistant can parse incoming ticket requests from other users.
        *   The assistant checks the user's timeline for conflicts.
        *   Based on the user-defined autonomy level, the assistant can automatically respond or ask the user for a decision.
        *   **Cross-Granularity Scheduling:** AI scheduling works across different time scales - precise slot finding for immediate scheduling, broader availability assessment for future planning using monthly aggregated data.

*   **User Story 3.5 (Agent Configuration):**
    *   **As a user,** I want to go to a settings page for my AI Assistant.
    *   **So that** I can configure its level of autonomy and its communication tone.
    *   **Acceptance Criteria:**
        *   A settings panel allows the user to set autonomy levels.
        *   A settings panel allows the user to select a communication tone.
