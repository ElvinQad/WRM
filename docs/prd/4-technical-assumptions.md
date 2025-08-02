# **4. Technical Assumptions**

*   **Repository Structure:** Monorepo
*   **Service Architecture:** The existing system is a full-stack application composed of a Next.js frontend and a NestJS backend with Fastify adapter. The backend uses Prisma ORM for type-safe database operations with PostgreSQL. This structure will be extended to support Epic 2 & 3 features.
*   **Technology Stack:**
    *   **Frontend:** Next.js, React, TypeScript, Redux Toolkit, shadcn/ui, Tailwind CSS.
    *   **Backend:** NestJS with Fastify adapter, TypeScript, Prisma ORM.
    *   **Database:** PostgreSQL with Prisma schema management.
    *   **Authentication:** NestJS JWT auth with Prisma user management.
    *   **Runtime:** Deno for both frontend and backend development.
    *   **Shared Types:** A dedicated `packages/types` directory will continue to be used.
*   **Testing Requirements:** The testing strategy will include unit tests for business logic using Deno's built-in test runner, integration tests for API endpoints with NestJS testing utilities, Prisma database testing with test database instances, and end-to-end tests for critical user flows.

### **Technical Constraints & Risk Assessment**

*   **Platform Constraints:**
    *   **Browser Support:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
    *   **Mobile Responsive:** Functional on devices 375px width and above
    *   **Offline Capability:** 24-hour offline ticket caching for core operations
    *   **Database Requirements:** PostgreSQL 13+ for Prisma compatibility
    *   **Deno Runtime:** Deno 1.40+ for development and testing
*   **Integration Dependencies:**
    *   **AI Service Integration:** External AI API for natural language processing
    *   **Voice Recognition:** Browser-based Web Speech API for voice input
    *   **Real-time Communication:** WebSocket connections for live updates
    *   **Database Connection:** Prisma Client for type-safe database access
    *   **API Performance:** Fastify adapter for high-performance HTTP handling
*   **High-Risk Technical Areas (Requiring Architectural Deep-Dive):**
    *   **Real-time Synchronization:** Multi-user timeline conflict resolution
    *   **AI Integration Reliability:** Fallback mechanisms for AI service failures
    *   **Performance at Scale:** Timeline rendering with 1000+ tickets
    *   **Cross-browser Drag-and-Drop:** Consistent behavior across browsers
    *   **Voice Processing Accuracy:** Handling accent variations and background noise
    *   **Database Migration Strategy:** Prisma schema changes with zero downtime
    *   **Fastify Integration:** NestJS + Fastify adapter compatibility and performance tuning
