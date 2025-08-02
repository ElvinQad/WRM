# Source Tree and Module Organization

## Current Project Structure (Updated August 2025)

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

## New File Organization Required for Enhancement

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
