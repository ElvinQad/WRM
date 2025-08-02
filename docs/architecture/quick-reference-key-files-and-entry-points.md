# Quick Reference - Key Files and Entry Points

## Critical Files for Understanding the System

- **Backend Entry**: `packages/backend/src/main.ts` - NestJS application bootstrap
- **Frontend Entry**: `packages/frontend/src/app/page.tsx` - Next.js app router root
- **Database Schema**: `packages/backend/prisma/schema.prisma` - Prisma models
- **Shared Types**: `packages/types/src/index.ts` - Cross-package type definitions
- **Timeline Components**: `packages/frontend/src/components/timeline/` - Current timeline implementation
- **API Documentation**: `packages/backend/src/open-api.yaml` - Swagger specification
- **Testing Infrastructure**: `packages/testing/` - Comprehensive testing suite with auth, integration, E2E, and performance tests

## Enhancement Impact Areas (Per PRD Analysis)

**Epic 1 - Dynamic Timeline Implementation:**
- `packages/frontend/src/components/timeline/` - Main timeline interface
- `packages/frontend/src/store/slices/` - Redux state management for timeline
- `packages/backend/src/app/tickets/` - Ticket CRUD and manipulation APIs

**Epic 2 - Ticket Customization:**
- `packages/backend/prisma/schema.prisma` - TicketType and custom properties schema
- `packages/frontend/src/components/tickets/` - Ticket management UI
- `packages/backend/src/app/tickets/` - Ticket type management APIs

**Epic 3 - AI Assistant Foundation:**
- `packages/backend/src/app/` - New AI service module (to be created)
- `packages/frontend/src/components/` - AI chat interface (to be created)
