# High Level Architecture

## Technical Summary

**Project Type:** Deno Monorepo with NestJS backend and Next.js frontend
**Current Implementation Status:** ~65% - ✅ **Epic 1 Complete**, Epic 2 in progress, AI and Social features planned
**Enhancement Complexity:** High - Real-time timeline manipulation with drag-and-drop, custom data models, and AI integration

## Epic 1 Completion Status ✅

**Fully Implemented Features:**
- **Dynamic Timeline Grid**: Complete timeline visualization with hourly/daily/weekly/monthly views
- **Drag-and-Drop System**: Full ticket manipulation with real-time feedback and conflict detection
- **Ticket Resizing**: Edge-based duration modification with 5-minute minimum duration
- **View Management**: Comprehensive view switching and date range navigation
- **Real-time Updates**: Live "now" marker and time-aware state visualization
- **Performance Optimization**: Sub-50ms drag feedback, optimized rendering for 500+ tickets

**Technical Implementation Details:**
- **Frontend Architecture**: Modular hook-based design with `useTimeline`, `useTimelineDrag`, `useTimelinePanning`
- **State Management**: Redux Toolkit with `timelineSlice` for view and date range management
- **Type System**: Comprehensive type safety with `@wrm/types` package and validation tooling
- **Testing Coverage**: Complete drag-drop testing suite with Deno test runner

## Actual Tech Stack (Verified from deno.json files)

| Category | Technology | Version | Current Usage | Enhancement Usage |
|----------|------------|---------|---------------|-------------------|
| Runtime | Deno | Latest | Monorepo management, task runner | Continue as runtime |
| Backend Framework | NestJS | Latest | API, auth, basic CRUD | Extend for timeline APIs |
| Database ORM | Prisma | ^5.22.0 | User/Ticket models | Extend for custom properties |
| Database | PostgreSQL | Latest | Basic schema | Add timeline-specific indexes |
| Frontend Framework | Next.js | ^15.1.6 | App router, basic pages | Timeline UI, real-time updates |
| UI Framework | React | 19.1.0 | Component foundation | Complex timeline interactions |
| State Management | Redux Toolkit | ^2.8.2 | Basic setup | Timeline state, drag-and-drop |
| UI Components | Radix UI | Various | Basic components | Timeline controls, modals |
| Styling | Tailwind CSS | ^4.1.11 | Component styling | Timeline visual states |
| API Documentation | Swagger/OpenAPI | Latest | Static YAML | Dynamic API docs |

## Repository Structure Reality Check

- **Type:** Deno Workspace Monorepo  
- **Package Manager:** Deno native with npm compatibility
- **Workspace Structure:** `/packages/{backend,frontend,types}` pattern
- **Notable:** Clean separation of concerns, shared types package for type safety
