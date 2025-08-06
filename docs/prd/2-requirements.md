# **2. Requirements**

### **Functional Requirements**

*   **FR1:** Users must be able to view the timeline in 'Hourly', 'Daily', and 'Weekly' scales.
*   **FR2:** Users must be able to select dates using a heat map interface that visualizes activity completion status.
*   **FR2a:** Users must be able to scroll the timeline horizontally using mouse wheel and touch gestures.
*   **FR3:** Users must be able to move tickets to new time slots via drag-and-drop.
*   **FR4:** Users must be able to change a ticket's duration by resizing its edges.
*   **FR5:** Users must be able to create custom ticket types with unique names and properties (e.g., Text, Number, Checkbox).
*   **FR6:** The system must visually distinguish tickets based on their time-aware state (Future, Active, Past-Untouched, Past-Confirmed).
*   **FR7:** Users must be able to interact with an AI assistant via chat or voice commands.
*   **FR8:** The AI assistant must be able to proactively create tickets based on user goals.
*   **FR9:** The AI assistant must be able to provide daily/weekly briefings and proactive reminders.
*   **FR10:** The AI assistant must be able to negotiate scheduling with other users/agents on the user's behalf.
*   **FR11:** Users must be able to configure the AI assistant's autonomy and communication tone.
*   **FR12:** Users must be able to share their entire timeline, individual tickets, or projects with other users.
*   **FR13:** Users must be able to assign tickets to other users with acceptance/rejection workflow.
*   **FR14:** The system must support friend/collaborator management with privacy controls.
*   **FR15:** Users must be able to create repeatable tickets with customizable recurrence patterns (daily, weekly, monthly, custom).
*   **FR16:** Users must be able to create child tickets under parent tickets for hierarchical task organization.
*   **FR17:** Users must be able to create custom voice/chat commands for the AI assistant to trigger personalized workflows.

### **Non-Functional Requirements**

*   **NFR1:** The system must be scalable to support a growing number of users.
*   **NFR2:** The architecture must be modular to allow for independent feature development.
*   **NFR3:** The user interface must support real-time updates for ticket manipulation.

### **Performance Requirements**

*   **Response Time Requirements:**
    *   **Timeline Loading:** Initial load under 1 second, subsequent navigation under 200ms
    *   **Heat Map Performance:** Render within 300ms, status updates within 100ms
    *   **Selective Loading:** Daily mode 3-day window, Weekly mode 2-week window
    *   **Scroll Performance:** 60fps smooth scrolling, 16ms response time
    *   **Ticket Operations:** Drag-and-drop feedback within 50ms, save operations under 300ms
    *   **AI Processing:** Text queries respond within 2 seconds, voice transcription within 3 seconds
    *   **Real-time Updates:** WebSocket updates propagate within 500ms
*   **Scalability Requirements:**
    *   **Concurrent Users:** Support 100 concurrent users per server instance
    *   **Data Volume:** Handle up to 10,000 tickets per user efficiently
    *   **AI Processing:** Queue system supports 50 concurrent AI requests
*   **Resource Utilization:**
    *   **Client Performance:** Timeline remains responsive with 500+ tickets loaded
    *   **Memory Usage:** Frontend memory usage under 100MB for typical usage
    *   **Database:** Query response times under 100ms for 95% of operations

### **Security & Compliance Requirements**

*   **Authentication & Authorization:**
    *   **JWT Implementation:** Secure token-based authentication with 15-minute access tokens
    *   **Password Security:** Minimum 8 characters, bcrypt hashing with salt rounds ≥12
    *   **Session Management:** Automatic logout after 24 hours of inactivity
    *   **API Security:** Rate limiting (100 requests/minute per user), request validation
*   **Data Protection:**
    *   **Data Encryption:** All sensitive data encrypted at rest (AES-256) and in transit (TLS 1.3)
    *   **Privacy:** User data isolated per account, no cross-user data access
    *   **Data Retention:** User data deleted within 30 days of account deletion request
    *   **Backup Security:** Encrypted backups with 30-day retention cycle
*   **Compliance & Security Testing:**
    *   **OWASP:** Protection against top 10 security vulnerabilities
    *   **Input Validation:** All user inputs sanitized and validated server-side
    *   **Audit Logging:** Security events logged with 90-day retention
    *   **Penetration Testing:** Annual security assessment required
