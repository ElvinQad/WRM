# **4. Technical Assumptions**

*   **Repository Structure:** Monorepo
*   **Service Architecture:** The existing system is a full-stack application composed of a Next.js frontend and a NestJS backend. This structure will be extended.
*   **Technology Stack:**
    *   **Frontend:** Next.js, React, TypeScript, Redux Toolkit, shadcn/ui, Tailwind CSS.
    *   **Backend:** NestJS, TypeScript.
    *   **Authentication:** Supabase Auth.
    *   **Shared Types:** A dedicated `packages/types` directory will continue to be used.
*   **Testing Requirements:** The testing strategy will include unit tests for business logic, integration tests for API endpoints, and end-to-end tests for critical user flows.
