# WRM Timeline Brownfield Enhancement Architecture

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-08-01 | 1.0 | Initial│   ├── components/ai-assistant/ (NEW)
│   │   ├── ChatInterface.tsx        # AI chat UI
│   │   ├── VoiceInput.tsx          # Voice command interface
│   │   └── SuggestionPanel.tsx     # Proactive ticket suggestions
│   ├── store/slices/ (ENHANCE)
│   │   ├── timelineSlice.ts         # NEW - Timeline state management
│   │   ├── ticketTypesSlice.ts      # NEW - Custom ticket types state
│   │   └── aiAssistantSlice.ts      # NEW - AI assistant state
│   └── testing/ (ENHANCE)
│       ├── components/              # NEW - Component test utilities
│       ├── integration/             # NEW - Frontend integration tests
│       └── utils/                   # ENHANCE - Frontend test helperseld analysis for timeline enhancements | Winston (Architect) |

## Introduction

This document captures the CURRENT STATE of the WRM (Timeline) codebase and outlines the architectural changes needed to implement the dynamic timeline functionality as specified in the PRD. It serves as a reference for AI agents working on the timeline enhancement features.

### Document Scope

**Focused on areas relevant to:** Implementing Epic 1 (Dynamic Timeline), Epic 2 (Intelligent & Customizable Tickets), and foundations for Epic 3 (AI Personal Assistant) as defined in the PRD.

### Critical Integration Requirements

This enhancement builds upon an existing authentication system and basic ticket infrastructure. All new features must integrate seamlessly with the current Deno + NestJS + Next.js architecture.

## Quick Reference - Key Files and Entry Points

### Critical Files for Understanding the System

- **Backend Entry**: `packages/backend/src/main.ts` - NestJS application bootstrap
- **Frontend Entry**: `packages/frontend/src/app/page.tsx` - Next.js app router root
- **Database Schema**: `packages/backend/prisma/schema.prisma` - Prisma models
- **Shared Types**: `packages/types/src/index.ts` - Cross-package type definitions
- **Timeline Components**: `packages/frontend/src/components/timeline/` - Current timeline implementation
- **API Documentation**: `packages/backend/src/open-api.yaml` - Swagger specification
- **Testing Infrastructure**: `packages/testing/` - Comprehensive testing suite with auth, integration, E2E, and performance tests

### Enhancement Impact Areas (Per PRD Analysis)

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

## Recent Major Changes (August 2, 2025)

### Epic 1 Implementation Complete ✅

**Timeline System Architecture:**
- **Complete Timeline Component Suite**: Fully implemented timeline grid with drag-and-drop, resizing, and multi-view support
- **Advanced Hook Architecture**: Modular design with specialized hooks for dragging, panning, auto-centering, and tooltip management
- **Performance-Optimized State Management**: Redux-based timeline state with optimistic updates and conflict detection
- **Comprehensive Type System**: Enhanced `@wrm/types` package with timeline-specific types and validation tooling

**Key Technical Achievements:**
1. **Drag-and-Drop Implementation**: Three distinct drag operations (move, resize-start, resize-end) with 5-minute minimum duration enforcement
2. **Real-time Performance**: Sub-50ms visual feedback, smooth 60fps interactions, optimized for 500+ tickets
3. **Multi-View Timeline**: Seamless switching between hourly, daily, weekly, and monthly views with proper time calculations
4. **Type Safety Enhancement**: Complete type system overhaul with `TYPE_SYSTEM.md` documentation and validation scripts

**Frontend Structure Transformation:**
```typescript
// Before: Basic timeline foundation
packages/frontend/src/components/timeline/
├── Timeline.tsx (basic)
└── types.ts (minimal)

// After: Complete Epic 1 Implementation
packages/frontend/src/components/timeline/
├── components/          # Complete UI component suite
│   ├── Timeline.tsx               # ✅ Main orchestrator
│   ├── TimelineHeader.tsx         # ✅ Controls & navigation
│   ├── TimeMarkers.tsx           # ✅ Time grid & markers
│   ├── TicketComponent.tsx       # ✅ Draggable tickets
│   └── TimelineTooltip.tsx       # ✅ Interactive feedback
├── hooks/              # Advanced hook architecture
│   ├── useTimeline.ts            # ✅ Main state orchestration
│   ├── useTimelineDrag.ts        # ✅ Drag & drop logic
│   ├── useTimelinePanning.ts     # ✅ Navigation & scrolling
│   ├── useTimelineAutoCenter.ts  # ✅ Auto-centering features
│   └── useTimelineTooltip.ts     # ✅ Tooltip management
├── utils/
│   └── timelineUtils.ts          # ✅ Time & position calculations
├── constants.ts                  # ✅ Configuration constants
├── types.ts                      # ✅ Re-exports from @wrm/types
└── sampleData.ts                # ✅ Development fixtures
```

**Testing Infrastructure Enhancement:**
- **Comprehensive Drag-Drop Testing**: Complete test suite at `packages/testing/frontend/timeline-drag-drop.test.ts`
- **Performance Validation**: Automated testing for 50ms feedback requirements
- **Type System Validation**: New validation tooling with `packages/types/scripts/validate-types.ts`
- **Integration Testing**: Full drag-drop workflow testing with Deno test runner

### Type System Overhaul ✅

**Enhanced Type Architecture:**
- **Centralized Type Package**: Complete consolidation in `@wrm/types` with proper imports across all packages
- **Timeline-Specific Types**: Comprehensive Epic 1 types including `DragState`, `TicketWithPosition`, `TimelineProps`
- **Type Documentation**: Added `TYPE_SYSTEM.md` with detailed guidelines and best practices
- **Validation Tooling**: Automated type consistency checking with `validate-types.ts` script

**Key Type Improvements:**
1. **Eliminated Type Duplication**: Removed duplicate type definitions across packages
2. **Enhanced Timeline Types**: Added comprehensive drag-and-drop and positioning types
3. **Proper Import Structure**: All packages now import from `@wrm/types` consistently
4. **Validation Pipeline**: Automated checking for type consistency and import patterns

### Redux State Management Enhancement ✅

**Timeline State Management:**
- **New TimelineSlice**: Complete state management for view, date range, and navigation
- **Ticket Types State**: Foundation for Epic 2 with `ticketTypesSlice` and async thunks
- **Performance Optimization**: Efficient state updates with proper memoization and selectors

### Documentation Structure Transformation ✅

**PRD Modularization:**
```
docs/
├── prd.md (comprehensive legacy version)
└── prd/ (new modular structure)
    ├── index.md
    ├── 1-goals-and-background-context.md
    ├── 2-requirements.md
    ├── 3-user-interface-design-goals.md
    ├── 4-technical-assumptions.md
    ├── 5-epic-list.md
    ├── 6-checklist-results-report.md
    ├── 7-next-steps.md
    ├── epic-1-the-dynamic-timeline-completed.md  # ✅ Completed
    ├── epic-2-intelligent-customizable-tickets-in-progress.md
    ├── epic-3-the-ai-personal-assistant.md
    └── epic-4-social-collaboration.md
```

### Next Phase Readiness (Epic 2) 🚧

**Foundation Prepared for Epic 2:**
- **Backend Structure**: Ready for ticket-types module implementation
- **Frontend Foundation**: Settings page structure and ticket type Redux state prepared
- **Type System**: Enhanced to support custom properties and dynamic schemas
- **Testing Framework**: Comprehensive testing infrastructure ready for Epic 2 features

## High Level Architecture

### Technical Summary

**Project Type:** Deno Monorepo with NestJS backend and Next.js frontend
**Current Implementation Status:** ~65% - ✅ **Epic 1 Complete**, Epic 2 in progress, AI and Social features planned
**Enhancement Complexity:** High - Real-time timeline manipulation with drag-and-drop, custom data models, and AI integration

### Epic 1 Completion Status ✅

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

### Actual Tech Stack (Verified from deno.json files)

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

### Repository Structure Reality Check

- **Type:** Deno Workspace Monorepo  
- **Package Manager:** Deno native with npm compatibility
- **Workspace Structure:** `/packages/{backend,frontend,types}` pattern
- **Notable:** Clean separation of concerns, shared types package for type safety

## Source Tree and Module Organization

### Current Project Structure (Updated August 2025)

```text
WRM/
├── packages/
│   ├── backend/                 # NestJS API server
│   │   ├── src/
│   │   │   ├── app/            # Feature modules
│   │   │   │   ├── auth/       # ✅ JWT authentication (implemented)
│   │   │   │   ├── tickets/    # ✅ Enhanced ticket CRUD with Epic 1 features
│   │   │   │   └── app.module.ts
│   │   │   ├── main.ts         # ✅ Bootstrap with Swagger
│   │   │   └── open-api.yaml   # ✅ API documentation
│   │   ├── prisma/
│   │   │   └── schema.prisma   # ✅ User, Ticket, TicketType models
│   │   └── deno.json           # Backend tasks and dependencies
│   ├── frontend/               # Next.js web application
│   │   ├── src/
│   │   │   ├── app/           # ✅ App router pages
│   │   │   ├── components/    # UI components
│   │   │   │   ├── auth/      # ✅ Authentication UI
│   │   │   │   ├── tickets/   # ✅ Enhanced ticket components
│   │   │   │   ├── timeline/  # ✅ COMPLETE Epic 1 Timeline implementation
│   │   │   │   │   ├── components/  # Complete timeline UI components
│   │   │   │   │   │   ├── Timeline.tsx           # ✅ Main timeline component
│   │   │   │   │   │   ├── TimelineHeader.tsx     # ✅ View controls & navigation
│   │   │   │   │   │   ├── TimeMarkers.tsx        # ✅ Time grid & markers
│   │   │   │   │   │   ├── TicketComponent.tsx    # ✅ Draggable ticket UI
│   │   │   │   │   │   └── TimelineTooltip.tsx    # ✅ Interactive tooltips
│   │   │   │   │   ├── hooks/       # Complete timeline logic
│   │   │   │   │   │   ├── useTimeline.ts         # ✅ Main timeline orchestration
│   │   │   │   │   │   ├── useTimelineDrag.ts     # ✅ Drag & drop functionality
│   │   │   │   │   │   ├── useTimelinePanning.ts  # ✅ Timeline navigation
│   │   │   │   │   │   ├── useTimelineAutoCenter.ts # ✅ Auto-centering logic
│   │   │   │   │   │   └── useTimelineTooltip.ts  # ✅ Tooltip management
│   │   │   │   │   ├── utils/       # Timeline calculations
│   │   │   │   │   │   └── timelineUtils.ts       # ✅ Time & position calculations
│   │   │   │   │   ├── constants.ts # ✅ Timeline configuration
│   │   │   │   │   ├── types.ts     # ✅ Timeline-specific types
│   │   │   │   │   └── sampleData.ts # ✅ Development data
│   │   │   │   └── ui/        # ✅ Radix UI components
│   │   │   ├── store/         # ✅ Redux Toolkit setup
│   │   │   │   ├── slices/
│   │   │   │   │   ├── timelineSlice.ts     # ✅ Timeline state management
│   │   │   │   │   └── ticketTypesSlice.ts  # ✅ Ticket types state
│   │   │   │   └── thunks/
│   │   │   │       └── ticketTypeThunks.ts  # ✅ Async ticket type actions
│   │   │   └── lib/           # ✅ API client, utilities
│   │   └── deno.json          # Frontend tasks and dependencies
│   ├── types/                 # ✅ Enhanced shared TypeScript definitions
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── timeline.types.ts  # ✅ Complete timeline types
│   │   │   │   └── types.ts           # ✅ Enhanced common types
│   │   │   ├── index.ts               # ✅ Centralized exports
│   │   │   └── TYPE_SYSTEM.md         # ✅ Type system documentation
│   │   ├── scripts/
│   │   │   └── validate-types.ts      # ✅ Type validation tooling
│   │   └── deno.json                  # Types build configuration with validation
│   └── testing/               # ✅ Comprehensive testing infrastructure
│       ├── auth/              # Authentication-specific tests
│       │   ├── backend/       # Backend auth unit tests
│       │   └── frontend/      # Frontend auth component tests
│       ├── frontend/          # ✅ Frontend-specific tests
│       │   └── timeline-drag-drop.test.ts  # ✅ Complete drag-drop testing
│       ├── integration/       # Cross-system integration tests
│       ├── e2e/              # End-to-end user journey tests
│       ├── performance/      # Performance and load testing
│       ├── utils/            # Shared testing utilities
│       ├── fixtures/         # Test data and fixtures
│       ├── scripts/          # Test execution and automation
│       └── deno.json         # Testing package configuration
├── docs/
│   ├── prd/                           # ✅ Modular PRD structure
│   │   ├── index.md                   # PRD table of contents
│   │   ├── 1-goals-and-background-context.md
│   │   ├── 2-requirements.md
│   │   ├── 3-user-interface-design-goals.md
│   │   ├── 4-technical-assumptions.md
│   │   ├── 5-epic-list.md
│   │   ├── 6-checklist-results-report.md
│   │   ├── 7-next-steps.md
│   │   ├── epic-1-the-dynamic-timeline-completed.md  # ✅ Completed Epic 1
│   │   ├── epic-2-intelligent-customizable-tickets-in-progress.md
│   │   ├── epic-3-the-ai-personal-assistant.md
│   │   └── epic-4-social-collaboration.md
│   ├── stories/                       # ✅ Individual user stories
│   │   ├── 1.5.Monthly-Data-Aggregation.story.md
│   │   ├── 2.1.Ticket-Type-Creation.story.md     # ✅ Epic 2 foundation
│   │   └── 2.3.Time-Aware-State-Visualization.story.md
│   ├── prd.md                         # ✅ Comprehensive PRD (legacy)
│   └── brownfield-architecture.md     # 📄 This document
└── deno.json                          # ✅ Workspace configuration
```

**Legend:** ✅ Implemented | 🟡 Partial/Needs Enhancement | ❌ Missing

### New File Organization Required for Enhancement

```text
packages/
├── backend/src/app/
│   ├── timeline/                    # NEW - Timeline-specific APIs
│   │   ├── timeline.controller.ts   # Timeline manipulation endpoints
│   │   ├── timeline.service.ts      # Business logic for timeline operations
│   │   ├── timeline.module.ts       # Timeline feature module
│   │   └── dto/                     # Timeline-specific DTOs
│   ├── ticket-types/                # NEW - Custom ticket type management
│   │   ├── ticket-types.controller.ts
│   │   ├── ticket-types.service.ts
│   │   └── dto/
│   ├── ai-assistant/                # NEW - AI integration (Epic 3 foundation)
│   │   ├── ai-assistant.controller.ts
│   │   ├── ai-assistant.service.ts
│   │   └── dto/
│   └── tickets/ (ENHANCE)
│       ├── tickets.controller.ts    # Extend for drag-and-drop APIs
│       └── tickets.service.ts       # Add time-aware state logic
├── frontend/src/
│   ├── components/timeline/ (ENHANCE)
│   │   ├── components/
│   │   │   ├── TimelineGrid.tsx     # NEW - Main timeline display
│   │   │   ├── TicketCard.tsx       # NEW - Draggable ticket component  
│   │   │   ├── ViewControls.tsx     # NEW - Hourly/Daily/Weekly/Monthly
│   │   │   ├── DateSlider.tsx       # NEW - Date range selector
│   │   │   └── TicketDetailModal.tsx # ENHANCE - Custom properties
│   │   ├── hooks/
│   │   │   ├── useDragAndDrop.ts    # NEW - Drag-and-drop logic
│   │   │   ├── useTimelineView.ts   # NEW - View state management
│   │   │   └── useRealTimeUpdates.ts # NEW - WebSocket integration
│   │   └── utils/
│   │       ├── timelineCalculations.ts # NEW - Time slot calculations
│   │       └── stateColors.ts       # NEW - Time-aware visual states
│   ├── components/ai-assistant/ (NEW)
│   │   ├── ChatInterface.tsx        # AI chat UI
│   │   ├── VoiceInput.tsx          # Voice command interface
│   │   └── SuggestionPanel.tsx     # Proactive ticket suggestions
│   └── store/slices/ (ENHANCE)
│       ├── timelineSlice.ts         # NEW - Timeline state management
│       ├── ticketTypesSlice.ts      # NEW - Custom ticket types state
│       └── aiAssistantSlice.ts      # NEW - AI assistant state
```

## Data Models and Schema Integration

### Existing Data Models (Current State)

**Current Prisma Schema Analysis:**
- ✅ `User` model - Basic user management with authentication
- ✅ `Ticket` model - Basic ticket structure with user relationship
- ✅ `TicketType` model - Foundation for custom ticket types
- ✅ `Agent` model - Foundation for AI assistant functionality
- ✅ `AgentCollaboration` model - Multi-user collaboration prep

### Required Schema Enhancements for Timeline Features

**1. Enhanced Ticket Model for Timeline Functionality:**
```prisma
model Ticket {
  // Existing fields...
  id          String   @id @default(uuid())
  title       String
  description String?
  userId      String
  typeId      String
  
  // NEW - Timeline-specific fields
  startTime   DateTime                    # Epic 1: Drag-and-drop scheduling
  endTime     DateTime                    # Epic 1: Duration management
  status      TicketStatus @default(FUTURE) # Epic 2: Time-aware states
  priority    Int?                        # Epic 3: AI prioritization
  
  // NEW - Custom properties support (Epic 2)
  customProperties Json?                  # Flexible property storage
  
  // NEW - AI assistant integration (Epic 3)
  aiGenerated Boolean @default(false)     # Track AI-created tickets
  aiContext   String?                     # Context for AI decisions
  
  // Relationships
  user        User       @relation(fields: [userId], references: [id])
  type        TicketType @relation(fields: [typeId], references: [id])
  
  @@map("tickets")
}

enum TicketStatus {
  FUTURE        # Scheduled for future (standard border)
  ACTIVE        # Currently happening (green border)  
  PAST_UNTOUCHED # Past with no interaction (red border)
  PAST_CONFIRMED # Past with user interaction (amber border)
}
```

**2. Enhanced TicketType Model for Custom Properties:**
```prisma
model TicketType {
  // Existing fields...
  id     String @id @default(uuid())
  name   String
  userId String
  
  // NEW - Custom property definitions (Epic 2)
  customFieldSchema Json?  # Define custom fields for this type
  defaultDuration   Int?   # Default duration in minutes
  color            String? # Visual identification
  
  // Relationships
  user    User     @relation(fields: [userId], references: [id])
  tickets Ticket[]
  
  @@map("ticket_types")
}
```

**3. New Models for AI Assistant (Epic 3 Foundation):**
```prisma
model AIInteraction {
  id          String   @id @default(uuid())
  userId      String
  type        AIInteractionType
  input       String   # User query/command
  output      String   # AI response
  createdAt   DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id])
  
  @@map("ai_interactions")
}

enum AIInteractionType {
  CHAT_TEXT
  CHAT_VOICE  
  PROACTIVE_SUGGESTION
  TICKET_GENERATION
}
```

### Database Migration Strategy

**Critical Compatibility Requirements:**
- All changes must be additive (no breaking changes to existing data)
- Existing tickets must automatically get `PAST_UNTOUCHED` or `PAST_CONFIRMED` status based on timestamps
- Custom properties for existing ticket types default to empty JSON
- Migration must preserve all user data and relationships

## Component Architecture Integration

### Epic 1 Achievement Summary ✅

**Successfully Implemented Components:**
- **Timeline Core**: Complete timeline visualization with multi-view support (hourly/daily/weekly/monthly)
- **Drag-and-Drop System**: Sophisticated drag-drop with move, resize-start, and resize-end operations
- **Navigation Controls**: Date range management, auto-centering, and view switching
- **Real-time Features**: Live "now" marker, time-aware state visualization, optimistic updates
- **Performance Optimization**: Smooth 60fps interactions, sub-50ms feedback, efficient state management

**Component Architecture (Epic 1 Complete):**
```
Timeline (Main Orchestrator)
├── TimelineHeader (View Controls & Navigation)
├── TimeMarkers (Time Grid & Current Time)
├── TicketComponent (Draggable Tickets)
├── TimelineTooltip (Interactive Feedback)
└── SunTimesOverlay (Optional Time Context)

Hook Architecture:
├── useTimeline (Main State Orchestration)
├── useTimelineDrag (Drag & Drop Logic)
├── useTimelinePanning (Navigation & Scrolling)
├── useTimelineAutoCenter (Auto-centering Features)
└── useTimelineTooltip (Tooltip Management)
```

### Current Component State Analysis

**✅ Fully Implemented Components (Epic 1):**
- Timeline visualization and interaction system
- Drag-and-drop with conflict detection
- Multi-view timeline rendering
- Real-time state updates and visual feedback
- Comprehensive Redux state management

**🚧 Components In Progress (Epic 2):**
- Ticket type management system (Redux slice implemented)
- Custom properties form generation
- Settings page infrastructure

**❌ Missing Components for Future Epics:**
- AI assistant integration components
- Social sharing and collaboration UI
- Advanced custom property management

### New Components Required (Epic 1 - Dynamic Timeline)

**1. TimelineGrid Component**
```typescript
// packages/frontend/src/components/timeline/components/TimelineGrid.tsx
interface TimelineGridProps {
  view: 'hourly' | 'daily' | 'weekly' | 'monthly';
  dateRange: { start: Date; end: Date };
  tickets: TicketWithPosition[];
  onTicketMove: (ticketId: string, newStartTime: Date) => void;
  onTicketResize: (ticketId: string, newEndTime: Date) => void;
}
```

**Integration with Existing System:**
- Must integrate with current Redux store in `packages/frontend/src/store/`
- Use existing API client in `packages/frontend/src/lib/api.ts`
- Follow current component patterns established in `packages/frontend/src/components/ui/`

**2. Drag-and-Drop Integration**
```typescript
// packages/frontend/src/components/timeline/hooks/useDragAndDrop.ts
export const useDragAndDrop = () => {
  // Integration requirements:
  // - Use existing ticket APIs from backend
  // - Update Redux state optimistically
  // - Handle conflicts with real-time updates
  // - Respect existing authentication middleware
};
```

### Integration Points with Existing Architecture

**Backend API Integration:**
- Extend existing `packages/backend/src/app/tickets/tickets.controller.ts`
- Add new endpoints following current NestJS patterns
- Maintain existing JWT authentication middleware
- Use existing Prisma service patterns

**Frontend State Management:**
- Extend current Redux Toolkit setup in `packages/frontend/src/store/`
- Follow existing slice patterns for timeline state
- Integrate with current API middleware for caching
- Maintain existing error handling patterns

## API Design and Integration

### Current API Analysis

**✅ Existing Endpoints (Implemented):**
- `POST /api/auth/login` - JWT authentication
- `POST /api/auth/register` - User registration  
- `GET /api/tickets` - Basic ticket listing
- `POST /api/tickets` - Ticket creation
- `PUT /api/tickets/:id` - Ticket updates
- `DELETE /api/tickets/:id` - Ticket deletion

**API Pattern Analysis:**
- Uses NestJS controllers with OpenAPI documentation
- JWT middleware for authentication
- Validation pipes for request validation
- Prisma service layer for database operations

### Required New Endpoints for Timeline Features

**Epic 1 - Dynamic Timeline APIs:**

```typescript
// GET /api/timeline?view=daily&start=2025-08-01&end=2025-08-07
// Response: Tickets positioned for timeline view
interface TimelineResponse {
  tickets: TicketWithPosition[];
  conflicts: TimelineConflict[];
  view: TimelineView;
  dateRange: { start: string; end: string };
}

// PUT /api/tickets/:id/move
// Move ticket to new time slot (drag-and-drop)
interface MoveTicketRequest {
  startTime: string; // ISO 8601
  endTime: string;
}

// PUT /api/tickets/:id/resize  
// Change ticket duration (resize)
interface ResizeTicketRequest {
  endTime: string; // ISO 8601
}
```

**Epic 2 - Custom Ticket Type APIs:**

```typescript
// POST /api/ticket-types
// Create custom ticket type with properties
interface CreateTicketTypeRequest {
  name: string;
  customFieldSchema: CustomFieldDefinition[];
  defaultDuration?: number;
  color?: string;
}

// GET /api/ticket-types/:id/schema
// Get custom field schema for ticket type
interface TicketTypeSchemaResponse {
  fields: CustomFieldDefinition[];
  defaultValues: Record<string, any>;
}
```

### Integration with Existing API Patterns

**Must Follow Current Patterns:**
- Use existing JWT authentication middleware
- Follow current validation pipe patterns
- Maintain existing error response format
- Use current Prisma service injection patterns
- Follow OpenAPI documentation standards established

**Performance Requirements (Per PRD):**
- Timeline loading: under 2 seconds initial, 500ms navigation
- Drag-and-drop operations: 50ms visual feedback, 300ms save
- API response times: 95th percentile under 500ms

## Technical Debt and Known Issues

### Current Technical Debt Analysis

**✅ Well-Architected Areas:**
- Clean monorepo structure with proper workspace configuration
- Type-safe API contracts with shared types package
- Modern tech stack with good development experience
- Proper separation of concerns between frontend/backend

**🟡 Areas Requiring Attention for Timeline Enhancement:**
1. **Real-time Updates**: No WebSocket infrastructure exists yet
2. **Complex State Management**: Timeline drag-and-drop will require sophisticated state coordination
3. **Performance Optimization**: No caching strategy for timeline data
4. **Error Handling**: Need robust conflict resolution for concurrent timeline edits

**❌ Missing Infrastructure for Enhancement:**
1. **WebSocket Connection**: Required for real-time timeline updates
2. **Optimistic Updates**: Frontend needs to handle optimistic state changes
3. **Conflict Resolution**: Timeline conflicts need resolution strategy
4. **Performance Monitoring**: Timeline rendering performance needs tracking

### Critical Implementation Constraints

**Database Performance:**
- Timeline queries will require proper indexing on `startTime`, `endTime`, `userId`
- Custom properties JSON queries need optimization strategy
- Concurrent ticket updates need proper locking mechanism

**Frontend Performance:**
- Timeline with 500+ tickets needs virtualization
- Drag-and-drop operations need smooth 60fps performance
- Real-time updates need efficient Redux state updates

**Browser Compatibility (Per PRD):**
- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Drag-and-drop API needs consistent cross-browser behavior
- Voice input integration requires Web Speech API compatibility

## Integration Points and External Dependencies

### Current External Services Integration

**✅ Database Integration:**
- PostgreSQL via Prisma ORM
- Connection pooling configured
- Migration system in place

**❌ Missing External Services for Enhancement:**
- AI/LLM service for Epic 3 (assistant functionality)
- WebSocket service for real-time updates
- Voice processing service (Web Speech API)

### New Integration Requirements

**1. Real-time Updates (Epic 1):**
```typescript
// WebSocket integration for live timeline updates
interface TimelineUpdateEvent {
  type: 'TICKET_MOVED' | 'TICKET_CREATED' | 'TICKET_DELETED';
  ticket: Ticket;
  userId: string;
  timestamp: string;
}
```

**2. AI Service Integration (Epic 3 Foundation):**
```typescript
// External AI API integration
interface AIServiceRequest {
  context: string;
  userGoal: string;
  currentTimeline: Ticket[];
  userPreferences: UserPreferences;
}
```

### Integration Constraints

**Security Requirements (Per PRD):**
- All external API calls must use JWT authentication
- AI service communications need encryption in transit
- WebSocket connections need authentication validation
- External service failures need graceful degradation

## Development and Deployment Integration

### Current Development Setup Reality

**✅ Working Development Environment:**
- `deno task dev` starts all services concurrently
- Hot reload working for both frontend and backend
- Type checking across all packages
- Prisma migrations and database management

**✅ Build System:**
- Deno-native build pipeline
- TypeScript compilation for all packages
- Shared types build before dependent packages

### Enhancement Development Requirements

**New Development Commands Needed:**
```bash
# Timeline-specific testing
deno task test:timeline        # Timeline component tests
deno task test:drag-drop       # Drag-and-drop functionality tests  
deno task test:ai-integration  # AI assistant integration tests

# Performance testing (per PRD requirements)
deno task test:performance     # Timeline rendering performance
deno task test:load           # Concurrent user load testing
```

**Database Migration for Enhancement:**
```bash
# New migration commands for timeline features
deno task prisma:migrate:timeline  # Timeline-specific schema changes
deno task db:seed:timeline        # Timeline test data
```

### Deployment Integration Strategy

**Current Deployment State:** Manual deployment scripts exist

**Enhancement Deployment Requirements:**
- Database migrations must run before app deployment
- WebSocket infrastructure needs separate deployment consideration  
- AI service integration needs environment configuration
- Performance monitoring needs deployment-time setup

**Rollback Strategy:**
- Database schema changes need backward compatibility
- Frontend timeline features need feature flags for gradual rollout
- API endpoint versioning for seamless transitions

## Testing Strategy Integration

### Current Testing Infrastructure

**✅ Basic Testing Setup:**
- Deno test runner configured
- Jest configuration for frontend components
- Basic integration test structure

**🟡 Testing Gaps for Enhancement:**
- No drag-and-drop interaction testing
- No real-time update testing
- No performance/load testing
- No AI integration testing

### New Testing Requirements (Per PRD)

**1. Timeline Interaction Testing:**
```typescript
// packages/frontend/src/components/timeline/__tests__/
describe('Timeline Drag and Drop', () => {
  it('should move ticket to new time slot', () => {
    // Test requirements from PRD:
    // - 50ms visual feedback
    // - 500ms backend save
    // - Conflict resolution
  });
});
```

**2. Performance Testing (PRD Requirements):**
```bash
# Timeline loading under 2 seconds
npm run test:performance:timeline-load

# Drag-and-drop under 50ms feedback  
npm run test:performance:drag-drop

# 95th percentile API response under 500ms
npm run test:performance:api-response
```

**3. Cross-browser Testing:**
- Drag-and-drop compatibility across Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Voice input testing across supported browsers
- Timeline rendering consistency testing

### Integration with Existing Test Patterns

**Must Follow Current Patterns:**
- Use existing Jest/Deno test configuration
- Follow current test file organization
- Integrate with existing CI/CD pipeline
- Maintain current code coverage requirements

## Security Integration

### Current Security Implementation

**✅ Existing Security Measures:**
- JWT-based authentication implemented
- Password hashing with proper security
- API endpoint protection with guards
- CORS configuration for frontend integration

**✅ Database Security:**
- Prisma ORM prevents SQL injection
- User data isolation per account
- Proper relationship constraints

### Enhancement-Specific Security Requirements

**1. Timeline Security (Epic 1):**
- Drag-and-drop operations must validate user ownership
- Real-time updates must verify user permissions
- Timeline data must be properly isolated per user

**2. Custom Properties Security (Epic 2):**
- JSON custom properties need input validation
- XSS prevention for user-defined property values
- Schema validation for custom field definitions

**3. AI Assistant Security (Epic 3):**
- AI service communications need encryption
- User data sent to AI services needs anonymization options
- AI-generated content needs validation before storage

### Security Testing Requirements (Per PRD)

**OWASP Top 10 Compliance:**
- Input validation for all timeline operations
- Authentication bypass testing for timeline APIs
- Injection testing for custom property fields
- Authorization testing for cross-user data access

**Performance Security:**
- Rate limiting for drag-and-drop operations (prevent abuse)
- Timeline data caching security (no data leakage)
- AI service rate limiting and abuse prevention

## Testing Infrastructure and Quality Assurance

### Testing Package Architecture

**Comprehensive Testing Strategy:**
The `packages/testing/` package provides a robust testing infrastructure supporting all enhancement phases. It implements a multi-layered testing approach covering unit tests, integration tests, end-to-end testing, and performance validation.

**Testing Package Structure:**
```text
packages/testing/
├── auth/                           # Authentication system testing
│   ├── backend/
│   │   └── auth-core.test.ts      # ✅ JWT, validation, middleware tests
│   └── frontend/
│       └── auth-components.test.ts # ✅ Auth UI components, hooks
├── integration/                   # Cross-system integration tests
│   ├── auth-integration.test.ts   # ✅ Full-stack auth flows
│   └── auth-full-stack.test.ts    # ✅ Complete authentication scenarios
├── e2e/                          # End-to-end user journey tests
│   └── auth-user-journeys.test.ts # ✅ Complete user scenarios
├── performance/                   # Performance and load testing
│   └── auth-performance.test.ts   # ✅ Auth system performance analysis
├── utils/                        # Shared testing utilities
│   └── test-helpers.ts           # ✅ Mocks, fixtures, test utilities
├── fixtures/                     # Test data and fixtures
├── scripts/
│   └── run-tests.ts             # ✅ Comprehensive test orchestration
└── deno.json                    # ✅ Testing configuration and dependencies
```

### Current Testing Implementation Status

**✅ Implemented Testing Features:**
- **Comprehensive Test Runner**: Automated orchestration with category filtering, parallel execution, and detailed reporting
- **Authentication Testing**: Complete coverage of JWT flows, component behavior, and security validation
- **Integration Testing**: Full-stack authentication flow testing with real database interactions
- **Performance Testing**: Authentication system load testing and performance benchmarking
- **E2E Testing**: Complete user journey simulation for authentication workflows

**Testing Categories and Coverage:**

| Category | Current Coverage | Timeline Enhancement Requirements |
|----------|------------------|-----------------------------------|
| **Unit Tests** | ✅ Auth components, JWT logic | 🔄 Timeline components, drag-and-drop logic, AI services |
| **Integration Tests** | ✅ Auth full-stack flows | 🔄 Timeline API integration, real-time updates |
| **E2E Tests** | ✅ Auth user journeys | 🔄 Timeline manipulation workflows, AI interactions |
| **Performance Tests** | ✅ Auth load testing | 🔄 Timeline rendering performance, drag-and-drop responsiveness |

### Testing Enhancement Requirements for Timeline Features

**Epic 1 - Timeline Testing Requirements:**

```typescript
// New test files needed:
packages/testing/
├── timeline/                         # NEW - Timeline-specific testing
│   ├── backend/
│   │   ├── timeline-api.test.ts     # Timeline CRUD operations
│   │   ├── drag-drop-logic.test.ts  # Drag-and-drop business logic
│   │   └── time-calculations.test.ts # Time slot calculations
│   ├── frontend/
│   │   ├── timeline-grid.test.ts    # Timeline grid component
│   │   ├── ticket-card.test.ts      # Draggable ticket components
│   │   └── view-controls.test.ts    # Timeline view controls
│   └── integration/
│       ├── timeline-realtime.test.ts # Real-time update testing
│       └── drag-drop-flow.test.ts   # Complete drag-and-drop flows
```

**Epic 2 - Custom Properties Testing:**

```typescript
// Additional test files for custom properties:
├── ticket-types/                    # NEW - Custom ticket type testing
│   ├── backend/
│   │   ├── custom-fields.test.ts   # Custom field validation
│   │   └── schema-management.test.ts # Ticket type schema operations
│   ├── frontend/
│   │   ├── custom-forms.test.ts    # Dynamic form generation
│   │   └── property-validation.test.ts # Client-side validation
│   └── integration/
│       └── custom-properties.test.ts # Full custom property workflows
```

**Epic 3 - AI Assistant Testing:**

```typescript
// AI assistant testing infrastructure:
├── ai-assistant/                    # NEW - AI integration testing
│   ├── backend/
│   │   ├── ai-service.test.ts      # AI service integration
│   │   ├── conversation.test.ts    # Conversation management
│   │   └── suggestions.test.ts     # Proactive suggestion logic
│   ├── frontend/
│   │   ├── chat-interface.test.ts  # AI chat UI components
│   │   └── voice-input.test.ts     # Voice command testing
│   └── integration/
│       └── ai-full-flow.test.ts    # Complete AI assistant workflows
```

### Testing Tools and Framework Integration

**Current Testing Stack:**
- **Runtime**: Deno built-in testing framework
- **Test Runner**: Custom TypeScript runner with advanced orchestration
- **Mocking**: Deno-compatible mocking utilities
- **Fixtures**: JSON-based test data management
- **Reporting**: Comprehensive test result analysis and reporting

**Testing Features for Timeline Enhancements:**

**1. Timeline Component Testing:**
```typescript
// packages/testing/utils/timeline-test-helpers.ts
export class TimelineTestUtils {
  // Helper methods for testing drag-and-drop operations
  static simulateDragAndDrop(fromPosition: TimeSlot, toPosition: TimeSlot) {
    // Simulate drag events for timeline components
  }
  
  // Mock timeline state for component testing
  static createMockTimelineState(tickets: Ticket[], view: TimelineView) {
    // Generate realistic timeline state for testing
  }
  
  // Performance testing utilities
  static measureTimelineRenderTime(componentTree: ReactWrapper) {
    // Measure and validate timeline rendering performance
  }
}
```

**2. Real-time Testing Infrastructure:**
```typescript
// packages/testing/utils/realtime-test-helpers.ts
export class RealtimeTestUtils {
  // Mock WebSocket connections for real-time testing
  static createMockWebSocket() {
    // Create controllable WebSocket mock for testing
  }
  
  // Simulate concurrent user interactions
  static simulateConcurrentUpdates(updates: TimelineUpdate[]) {
    // Test conflict resolution and real-time synchronization
  }
}
```

**3. Performance Testing Framework:**
```typescript
// packages/testing/performance/timeline-performance.test.ts
export class TimelinePerformanceTests {
  // Test timeline rendering with large datasets
  async testTimelineRenderPerformance() {
    // Validate <50ms feedback requirement from PRD
  }
  
  // Test drag-and-drop responsiveness
  async testDragDropPerformance() {
    // Ensure smooth interactions under load
  }
  
  // Test memory usage during extended timeline sessions
  async testMemoryUsage() {
    // Validate memory efficiency for long-running sessions
  }
}
```

### Test Automation and CI/CD Integration

**Current Test Automation:**
- **Test Execution**: Automated test runner with category filtering
- **Parallel Testing**: Configurable parallel execution for performance
- **Test Reporting**: Detailed results with performance metrics
- **Coverage Analysis**: Built-in code coverage tracking

**Enhancement Requirements:**
- **Visual Regression Testing**: Timeline UI consistency validation
- **Cross-browser Testing**: Timeline compatibility across browsers
- **Mobile Testing**: Touch-based drag-and-drop testing
- **Accessibility Testing**: WCAG compliance for timeline components

**Test Integration Commands:**
```bash
# Run all timeline-related tests
deno run --allow-all packages/testing/scripts/run-tests.ts --category timeline

# Run performance tests for timeline
deno run --allow-all packages/testing/scripts/run-tests.ts --category performance --pattern timeline

# Run integration tests for complete timeline workflows
deno run --allow-all packages/testing/scripts/run-tests.ts --category integration --pattern timeline
```

### Quality Gates and Validation

**Testing Requirements for Each Epic:**

**Epic 1 Quality Gates:**
- ✅ All timeline drag-and-drop operations must pass automated testing
- ✅ Timeline rendering performance must meet <50ms feedback requirements
- ✅ Real-time updates must handle concurrent modifications correctly
- ✅ Timeline view transitions must be smooth and responsive

**Epic 2 Quality Gates:**
- ✅ Custom property validation must prevent XSS and injection attacks
- ✅ Dynamic form generation must handle all supported field types
- ✅ Custom property storage must maintain data integrity
- ✅ Performance must remain optimal with complex custom schemas

**Epic 3 Quality Gates:**
- ✅ AI service integration must handle failures gracefully
- ✅ Voice input must work across supported browsers
- ✅ AI-generated suggestions must be validated and safe
- ✅ Conversation context must be maintained accurately

### Testing Data Management

**Current Test Data Strategy:**
- **Fixtures**: JSON-based test data in `packages/testing/fixtures/`
- **Mocking**: Comprehensive service mocking for isolated testing
- **Database**: Separate test database with automated cleanup
- **Authentication**: Test user accounts and JWT token management

**Timeline Testing Data Requirements:**
- **Timeline Fixtures**: Realistic timeline scenarios with various ticket distributions
- **Drag-and-Drop Scenarios**: Test cases for complex drag-and-drop operations
- **Performance Data**: Large datasets for performance testing validation
- **AI Testing Data**: Mock AI responses and conversation scenarios

## Implementation Roadmap and Next Steps

### Phase 1: Epic 1 - Dynamic Timeline Foundation (Weeks 1-4)

**Backend Implementation:**
1. Enhance Prisma schema with timeline-specific fields
2. Create timeline controller and service modules
3. Implement drag-and-drop API endpoints
4. Add time-aware state logic to ticket operations

**Frontend Implementation:**
1. Build TimelineGrid component with drag-and-drop
2. Implement view controls (hourly/daily/weekly/monthly)
3. Create date range slider component
4. Add Redux state management for timeline operations

**Testing Implementation:**
1. Create timeline backend unit tests (`packages/testing/timeline/backend/`)
2. Implement timeline component tests (`packages/testing/timeline/frontend/`)
3. Build drag-and-drop integration tests (`packages/testing/timeline/integration/`)
4. Establish timeline performance testing framework
5. Create timeline-specific test fixtures and utilities

**Integration Requirements:**
- Maintain existing authentication flow
- Preserve current ticket CRUD functionality
- Ensure backward compatibility with existing data
- Integrate timeline tests with existing test runner infrastructure

### Phase 2: Epic 2 - Custom Ticket Properties (Weeks 5-8)

**Backend Implementation:**
1. Extend TicketType model for custom field schemas
2. Implement custom property validation logic
3. Create ticket type management APIs
4. Add custom property indexing for performance

**Frontend Implementation:**
1. Build custom property form components
2. Enhance ticket detail modal for custom fields
3. Create ticket type management interface
4. Add validation for user-defined properties

**Testing Implementation:**
1. Create custom properties backend tests (`packages/testing/ticket-types/backend/`)
2. Implement dynamic form component tests (`packages/testing/ticket-types/frontend/`)
3. Build custom property integration tests with validation scenarios
4. Add security testing for custom property injection attacks
5. Create complex custom property test fixtures

### Phase 3: Epic 3 - AI Assistant Foundation (Weeks 9-12)

**Backend Implementation:**
1. Create AI assistant service module
2. Implement external AI service integration
3. Add conversation tracking and context management
4. Build proactive suggestion engine

**Frontend Implementation:**
1. Build chat interface for AI interaction
2. Implement voice input using Web Speech API
3. Create AI suggestion review and approval UI
4. Add AI assistant configuration interface

**Testing Implementation:**
1. Create AI service integration tests (`packages/testing/ai-assistant/backend/`)
2. Implement AI UI component tests (`packages/testing/ai-assistant/frontend/`)
3. Build AI assistant end-to-end workflow tests
4. Add AI service failure and recovery testing
5. Create comprehensive AI conversation test scenarios

### Developer Handoff Guidelines

**Critical Integration Points:**
1. **Existing Authentication**: All new features must integrate with current JWT system
2. **Database Compatibility**: Schema changes must preserve existing user data
3. **API Consistency**: New endpoints must follow established NestJS patterns
4. **Frontend Patterns**: Timeline components must use existing Redux and UI patterns
5. **Performance Requirements**: Meet PRD-specified response times and user experience targets
6. **Testing Integration**: All new features must integrate with existing testing infrastructure in `packages/testing/`

**Testing Requirements:**
- **Test Coverage**: Maintain minimum 80% code coverage for all new features
- **Test Categories**: Implement unit, integration, E2E, and performance tests for each epic
- **Test Automation**: Integrate new tests with existing test runner (`packages/testing/scripts/run-tests.ts`)
- **Quality Gates**: Pass all testing requirements before feature completion
- **Performance Validation**: Timeline features must meet <50ms feedback requirements through automated testing

**Risk Mitigation:**
- Implement timeline features behind feature flags for gradual rollout
- Create comprehensive integration tests for drag-and-drop operations
- Set up performance monitoring for timeline rendering
- Plan database migration rollback procedures
- Establish automated testing for all timeline-related functionality
- Implement visual regression testing for timeline UI components

**Success Validation:**
- Epic 1: Users can successfully manipulate timeline via drag-and-drop with <50ms feedback (validated through automated performance tests)
- Epic 2: Users can create custom ticket types with properties and use them effectively (validated through comprehensive E2E testing)
- Epic 3: Basic AI assistant can respond to text queries and create tickets proactively (validated through AI integration testing)

This brownfield architecture document provides the foundation for implementing the timeline enhancement while respecting the existing system constraints and maintaining data integrity throughout the development process.
