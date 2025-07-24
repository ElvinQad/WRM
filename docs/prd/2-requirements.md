# **2. Requirements**

### **Functional Requirements**

*   **FR1:** Users must be able to view the timeline in 'Hourly', 'Daily', 'Weekly', and 'Monthly' scales.
    *   **Data Model Note:** Hourly/Daily/Weekly views use detailed ticket data; Monthly view uses aggregated summary data with different API endpoints and data structures.
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
*   **FR12:** The system must provide data aggregation capabilities to generate summary views for monthly timeline scales, distinct from detailed ticket data used in hourly/daily/weekly views.

### **Non-Functional Requirements**

*   **NFR1:** The system must be scalable to support a growing number of users.
*   **NFR2:** The architecture must be modular to allow for independent feature development.
*   **NFR3:** The user interface must support real-time updates for ticket manipulation.
*   **NFR4:** The system must be secure, leveraging the existing Supabase authentication.
*   **NFR5:** The user interface must be responsive and accessible on modern web browsers.
