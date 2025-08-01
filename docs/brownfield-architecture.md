# WRM Timeline Brownfield Enhancement Architecture

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-08-01 | 1.0 | Initial brownfield analysis for timeline enhancements | Winston (Architect) |

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

## High Level Architecture

### Technical Summary

**Project Type:** Deno Monorepo with NestJS backend and Next.js frontend
**Current Implementation Status:** ~30% - Authentication and basic ticket infrastructure exist
**Enhancement Complexity:** High - Real-time timeline manipulation with drag-and-drop, custom data models, and AI integration

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

### Current Project Structure

```text
WRM/
├── packages/
│   ├── backend/                 # NestJS API server
│   │   ├── src/
│   │   │   ├── app/            # Feature modules
│   │   │   │   ├── auth/       # ✅ JWT authentication (implemented)
│   │   │   │   ├── tickets/    # ✅ Basic ticket CRUD (implemented)  
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
│   │   │   │   ├── tickets/   # 🟡 Basic ticket components
│   │   │   │   ├── timeline/  # 🟡 Timeline foundation (needs enhancement)
│   │   │   │   └── ui/        # ✅ Radix UI components
│   │   │   ├── store/         # ✅ Redux Toolkit setup
│   │   │   └── lib/           # ✅ API client, utilities
│   │   └── deno.json          # Frontend tasks and dependencies
│   └── types/                 # Shared TypeScript definitions
│       ├── src/
│       │   ├── timeline.types.ts  # 🟡 Basic timeline types
│       │   └── types.ts           # ✅ Common types
│       └── deno.json              # Types build configuration
├── docs/
│   ├── prd.md                     # ✅ Comprehensive PRD
│   └── brownfield-architecture.md # 📄 This document
└── deno.json                      # ✅ Workspace configuration
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

### Current Component State Analysis

**✅ Implemented Components:**
- Authentication flow with JWT
- Basic ticket CRUD operations
- Rudimentary timeline structure
- Redux store foundation

**🟡 Components Needing Major Enhancement:**
- Timeline visualization and interaction
- Ticket detail management
- Real-time state updates

**❌ Missing Components for PRD Implementation:**
- Drag-and-drop timeline interface
- Time-aware visual states
- Custom ticket property management
- AI assistant integration

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

**Integration Requirements:**
- Maintain existing authentication flow
- Preserve current ticket CRUD functionality
- Ensure backward compatibility with existing data

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

### Developer Handoff Guidelines

**Critical Integration Points:**
1. **Existing Authentication**: All new features must integrate with current JWT system
2. **Database Compatibility**: Schema changes must preserve existing user data
3. **API Consistency**: New endpoints must follow established NestJS patterns
4. **Frontend Patterns**: Timeline components must use existing Redux and UI patterns
5. **Performance Requirements**: Meet PRD-specified response times and user experience targets

**Risk Mitigation:**
- Implement timeline features behind feature flags for gradual rollout
- Create comprehensive integration tests for drag-and-drop operations
- Set up performance monitoring for timeline rendering
- Plan database migration rollback procedures

**Success Validation:**
- Epic 1: Users can successfully manipulate timeline via drag-and-drop with <50ms feedback
- Epic 2: Users can create custom ticket types with properties and use them effectively  
- Epic 3: Basic AI assistant can respond to text queries and create tickets proactively

This brownfield architecture document provides the foundation for implementing the timeline enhancement while respecting the existing system constraints and maintaining data integrity throughout the development process.
