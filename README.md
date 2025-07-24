
# Project Documentation: WRM

## 1. High-Level Overview

This project is a monorepo containing a full-stack web application. It is structured using a packages directory, which houses the `frontend`, `backend`, and shared types packages. The setup utilizes Deno for scripting and dependency management at the root level, while individual packages may use their own package managers (e.g., npm/pnpm for the frontend).

- **frontend**: A Next.js application for the user interface.
- **backend**: A NestJS application serving as the API.
- **types**: A shared package for TypeScript types used across the frontend and backend.

## 2. Backend (backend)

The backend is a NestJS application responsible for business logic and data management.

-   **Framework**: [NestJS](https://nestjs.com/) (a progressive Node.js framework for building efficient, reliable and scalable server-side applications).
-   **Language**: TypeScript.
-   **Authentication**: Authentication is handled using [Supabase Auth](https://supabase.com/docs/guides/auth), as detailed in SUPABASE_AUTH.md. This includes a `SupabaseStrategy` for `passport`.
-   **API Documentation**: [Swagger (OpenAPI)](https://swagger.io/) is used to generate interactive API documentation, available at the `/docs` endpoint.
-   **Key Dependencies**:
    -   `@nestjs/core`, `@nestjs/common`: Core NestJS libraries.
    -   `nestjs-supabase-auth`: For Supabase authentication.
    -   `@nestjs/swagger`: For API documentation.
-   **Structure**:
    -   main.ts: The application entry point.
    -   app.module.ts: The root module of the application.
    -   `src/app/auth.module.ts`: The module handling authentication logic.
    -   `src/app/supabase.service.ts`: A service to interact with the Supabase client.
    -   `src/app/guards/jwt-auth.guard.ts`: A guard to protect routes.

## 3. Frontend (frontend)

The frontend is a modern React application built with Next.js.

-   **Framework**: [Next.js](https://nextjs.org/) (a React framework for production).
-   **Language**: TypeScript.
-   **UI Components**:
    -   [**shadcn/ui**](https://ui.shadcn.com/): A collection of re-usable components. The configuration is in components.json.
    -   [**Tailwind CSS**](https://tailwindcss.com/): A utility-first CSS framework for styling. The configuration is in tailwind.config.js.
    -   [**Radix UI**](https://www.radix-ui.com/): Provides unstyled, accessible components that `shadcn/ui` is built upon.
    -   [**Lucide React**](https://lucide.dev/): For icons.
-   **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) is used for global state management, with the store setup in `src/store`.
-   **Key Components**:
    -   page.tsx: The main page of the application.
    -   `src/components/timeline`: A key feature of the UI, for displaying events or tickets over time.
    -   `src/components/tickets/TicketDetailModal.tsx`: A modal for displaying ticket details.
-   **Structure**:
    -   `src/app`: Contains the pages and layouts of the application, following the Next.js App Router structure.
    -   `src/components`: Contains reusable React components.
    -   `src/store`: Contains the Redux store, slices, and hooks.
    -   `src/lib`: Contains utility functions.

## 4. Shared Types (types)

This package contains shared TypeScript type definitions used by both the frontend and backend to ensure type safety across the monorepo.

-   **Purpose**: To provide a single source of truth for data structures.
-   **Build Process**: A build.ts script using `dnt` (Deno to Node Transform) compiles the Deno-based TypeScript into a Node.js-compatible package.
-   **Key Files**:
    -   index.ts: Main entry point for all shared types.
    -   `src/lib/timeline.types.ts`: Types related to the timeline feature.

