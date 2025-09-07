# Timeline Intelligence System - Technical Architecture v5.0

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-08-01 | 1.0 | Initial architecture | Winston (Architect) |
| 2025-09-03 | 2.0 | FocusFlow Integration | Team Update |
| 2025-09-03 | 3.0 | AI Protocols Addition | Team Update |
| 2025-09-07 | 4.0 | PRD-Aligned Epic 2-5 Implementation | Team Update |
| 2025-09-07 | 5.0 | PRD-Architecture Alignment & Realistic Intelligence Amplification | Winston (Architect) |

## Introduction

This document captures the CURRENT STATE of the WRM (Timeline) codebase and provides a **realistic, implementable architecture** for transforming it into the Intelligence Amplification System as defined in the PRD. 

**CRITICAL ARCHITECTURAL SHIFT**: Moving from "timeline with AI features" to "AI-native Intelligence Amplification System that uses timeline as interface".

## System Architecture Overview

### Intelligence Amplification System Architecture

**ARCHITECTURAL PARADIGM**: AI-Native Intelligence Amplification with Timeline as Primary Interface

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Intelligence Interface Layer                     │
│  Next.js + React + Timeline + AI Chat + Knowledge Capture UI       │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────────┐
│                Intelligence Orchestration Layer                     │
│        NestJS + AI Agent + Knowledge Processor + MCP Hub           │
│    ┌─────────────┬─────────────────┬─────────────────┬─────────────┐ │
│    │ AI Agent    │ Knowledge       │ Pattern         │ MCP         │ │
│    │ Manager     │ Processor       │ Recognition     │ Coordinator │ │
│    └─────────────┴─────────────────┴─────────────────┴─────────────┘ │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────────┐
│                  Intelligence Storage Layer                         │
│  ┌─────────────┬─────────────────┬─────────────────┬─────────────┐  │
│  │ PostgreSQL  │ Vector Database │ Pattern Cache   │ Context     │  │
│  │ (Structure) │ (Semantics)     │ (Learning)      │ Memory      │  │
│  └─────────────┴─────────────────┴─────────────────┴─────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Core Intelligence Components

**1. AI Agent Manager**: Central orchestration of all AI interactions
**2. Knowledge Processor**: RAG pipeline for capture → embed → retrieve → apply  
**3. Pattern Recognition**: Historical analysis for time estimation & optimization
**4. MCP Coordinator**: Multi-tool orchestration and external system integration
**5. Vector Database**: Semantic storage for all knowledge and context
**6. Context Memory**: Conversational and behavioral context management

## Intelligence Amplification Technology Stack

### Core Intelligence Infrastructure

| Component | Technology | Purpose | Implementation Priority | Complexity |
|-----------|------------|---------|-------------------------|------------|
| **Vector Database** | Qdrant/Pinecone | Semantic knowledge storage | HIGH | High |
| **Embedding Service** | OpenAI Embeddings/Local | Text → Vector conversion | HIGH | Medium |
| **LLM Integration** | OpenAI GPT-4/Claude | Natural language processing | HIGH | Medium |
| **RAG Pipeline** | LangChain/Custom | Knowledge retrieval & application | HIGH | High |
| **MCP Protocol** | TypeScript MCP SDK | Tool orchestration | MEDIUM | High |
| **Pattern Recognition** | Custom ML/Stats | Historical behavior analysis | MEDIUM | High |

### Existing Foundation (Leverage)

| Component | Technology | Current Status | Enhancement Need |
|-----------|------------|----------------|------------------|
| **Frontend Framework** | Next.js + React + TypeScript | ✅ SOLID | Add AI-native components |
| **Backend Framework** | NestJS + Fastify | ✅ SOLID | Add intelligence services |
| **Database** | PostgreSQL + Prisma ORM | ✅ SOLID | Add semantic indexing |
| **Authentication** | JWT | ✅ SOLID | Extend for AI contexts |
| **State Management** | Redux Toolkit | ✅ SOLID | Add knowledge state |
| **UI Components** | shadcn/ui + Tailwind CSS | ✅ SOLID | Add intelligence UI |

### Critical New Services

| Service | Purpose | External Dependencies | Risk Level |
|---------|---------|----------------------|------------|
| **Knowledge Ingestion** | Capture & process input | LLM API | Medium |
| **Semantic Search** | Vector similarity search | Vector DB | High |
| **Context Builder** | Maintain conversation state | Redis/Memory | Low |
| **Action Generator** | Convert insights to tickets | None | Low |
| **Pattern Analyzer** | Learn from user behavior | ML Libraries | High |

## Intelligence Amplification Data Architecture

### Knowledge-Centric Data Model

The database architecture shifts from ticket-centric to knowledge-centric, with tickets becoming manifestations of captured knowledge and intelligent planning.

```prisma
// Core Intelligence Models
model KnowledgeItem {
  id          String @id @default(uuid())
  userId      String
  
  // Content
  originalText String @db.Text         // Raw input
  processedContent String @db.Text     // Cleaned/structured
  summary     String?                  // AI-generated summary
  
  // Semantic data
  embedding   Float[]                  // Vector representation
  topics      String[]                 // Extracted topics
  actionables String[]                 // Identified actions
  
  // Context
  source      KnowledgeSource          // How it was captured
  context     Json?                    // Situational context
  confidence  Float @default(0.5)      // Processing confidence
  
  // Application tracking
  applied     Boolean @default(false)
  effectiveness Float?                 // User feedback 0-1
  appliedAt   DateTime?
  appliedTickets TicketKnowledgeLink[]
  
  // Metadata
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user        User @relation(fields: [userId], references: [id])
  
  @@index([userId, applied])
  @@index([embedding]) // Vector similarity search
  @@map("knowledge_items")
}

model TicketKnowledgeLink {
  id            String @id @default(uuid())
  ticketId      String
  knowledgeId   String
  relevanceScore Float  // How relevant this knowledge was
  
  ticket        Ticket @relation(fields: [ticketId], references: [id])
  knowledge     KnowledgeItem @relation(fields: [knowledgeId], references: [id])
  
  @@unique([ticketId, knowledgeId])
  @@map("ticket_knowledge_links")
}

enum KnowledgeSource {
  MANUAL_INPUT    // User manually entered
  DOCUMENT_UPLOAD // File upload
  URL_CAPTURE     // Web page capture
  CONVERSATION    // AI conversation
  VOICE_NOTE      // Voice input
}
```

## Epic 1: Dynamic Timeline - COMPLETED ✅

### Current Implementation Status

**Epic 1 is fully operational** with sophisticated timeline manipulation capabilities:

**✅ Implemented Features:**
- **Dynamic Timeline Grid**: Complete timeline visualization with daily/weekly views
- **Drag-and-Drop System**: Three distinct operations (move, resize-start, resize-end) with 5-minute minimum duration
- **Real-time Updates**: Live "now" marker with time-aware state visualization
- **Multi-View Support**: Seamless switching between hourly, daily, weekly views
- **Performance Optimized**: Sub-50ms visual feedback, optimized for 500+ tickets

**Current Architecture (Working):**
```typescript
// Timeline Component Architecture - OPERATIONAL
packages/frontend/src/components/timeline/
├── components/
│   ├── Timeline.tsx               # ✅ Main orchestrator
│   ├── TimelineHeader.tsx         # ✅ Controls & navigation  
│   ├── TimeMarkers.tsx           # ✅ Time grid & markers
│   ├── TicketComponent.tsx       # ✅ Draggable tickets
│   └── TimelineTooltip.tsx       # ✅ Interactive feedback
├── hooks/
│   ├── useTimeline.ts            # ✅ Main state orchestration
│   ├── useTimelineDrag.ts        # ✅ Drag & drop logic
│   ├── useTimelinePanning.ts     # ✅ Navigation & scrolling
│   └── useTimelineAutoCenter.ts  # ✅ Auto-centering features
└── utils/
    └── timelineUtils.ts          # ✅ Time & position calculations
```

### How Intelligence Integrates with Existing Timeline

**The timeline becomes the primary interface for intelligence amplification:**

### 1. Knowledge-Informed Ticket Creation

**Current**: User manually creates tickets on timeline
**Enhanced**: AI suggests tickets based on captured knowledge

```typescript
// Timeline Integration Points
interface IntelligentTicketSuggestion {
  // Derived from knowledge items
  title: string;
  estimatedDuration: number;    // AI-learned from patterns
  suggestedTimeSlot: DateTime;  // Optimal placement
  relevantKnowledge: string[];  // Supporting knowledge items
  confidence: number;           // AI confidence 0-1
  
  // Timeline integration
  timelinePosition: {
    x: number;  // Timeline grid position
    y: number;
    width: number;  // Visual width based on duration
  };
}
```

### 2. Enhanced Timeline UI with Intelligence

**Timeline Header Enhancement**:
```typescript
// Enhanced TimelineHeader.tsx
<TimelineHeader>
  {/* Existing controls */}
  <ViewControls />
  <DateNavigation />
  
  {/* NEW: Intelligence features */}
  <KnowledgeCaptureButton />     // Quick knowledge input
  <AIAssistantToggle />          // Show/hide AI suggestions
  <TodaysTrioPanel />           // Priority task selection
</TimelineHeader>
```

**Ticket Cards with Intelligence**:
```typescript
// Enhanced TicketComponent.tsx  
<TicketCard>
  {/* Existing drag/resize handles */}
  
  {/* NEW: Intelligence indicators */}
  <KnowledgeIndicator count={linkedKnowledge.length} />
  <AIConfidenceBar level={aiEstimation.confidence} />
  <PatternMatchIcon show={hasSimilarPast} />
  
  {/* NEW: Contextual suggestions */}
  {showAISuggestions && <RelatedKnowledgeTooltip />}
</TicketCard>
```

### 3. Timeline Intelligence Overlay

**New Component**: `TimelineIntelligenceOverlay.tsx`
```typescript
// Shows AI insights directly on timeline
const TimelineIntelligenceOverlay = () => {
  return (
    <>
      {/* Suggested time blocks for focus work */}
      <OptimalFocusBlocks />
      
      {/* Patterns from historical data */}
      <EnergyLevelIndicators />
      
      {/* Knowledge-based suggestions */}
      <SuggestedTicketGhosts />
      
      {/* Real-time AI coaching */}
      <ProductivityInsights />
    </>
  );
};
```

### Intelligence-Enhanced Ticket Model

**Building on existing ticket structure**:
```prisma
// EXISTING Ticket model (from Epic 1) - ENHANCED
model Ticket {
  // Epic 1 fields - ALREADY WORKING
  id          String   @id @default(uuid())
  title       String
  description String?
  startTime   DateTime
  endTime     DateTime
  userId      String
  
  // NEW: Intelligence enhancements
  knowledgeLinks    TicketKnowledgeLink[]  // Connected knowledge
  aiGenerated       Boolean @default(false) // AI-suggested ticket
  estimatedDuration Int?                     // AI time estimate
  actualDuration    Int?                     // Actual completion time
  patternMatches    Json?                    // Similar historical tickets
  
  // Epic 1 relationships - PRESERVE
  user        User @relation(fields: [userId], references: [id])
  
  @@map("tickets")
}
```

### User Interaction Flow

**1. Knowledge Capture → Timeline Integration**
```
User Input: "I learned about React performance optimization"
↓
AI Processing: Extract actionables, estimate time needed
↓  
Timeline Suggestion: "2-hour slot suggested for 'Implement React.memo'"
↓
User Approval: Drag suggested ticket to preferred time slot
↓
Enhanced Timeline: Ticket shows knowledge link indicator
```

**2. Timeline-Driven Intelligence**
```
User drags ticket to new time
↓
AI Analysis: "Similar tasks work better in morning" 
↓
Gentle Suggestion: Timeline highlights optimal time slots
↓
User Choice: Accept AI suggestion or override
↓
Learning Loop: AI learns from user's preference
```

## Epic 2: Intelligent Tickets & Focus System

### Enhanced Ticket Creation Workflow

**Current Epic 1**: Click → Manual form → Timeline placement
**Enhanced**: Knowledge-driven → AI suggestions → Timeline integration

### 1. Intelligent Ticket Creation Interface

**Timeline Integration**: Right-click on timeline opens enhanced creation modal

```typescript
// Enhanced TicketCreationModal.tsx
const TicketCreationModal = () => {
  return (
    <Modal>
      {/* Traditional fields */}
      <TitleInput />
      <DescriptionInput />
      <DurationSelector />
      
      {/* NEW: Intelligence features */}
      <KnowledgeLinker />           // Link to existing knowledge
      <AITicketSuggestions />       // AI-generated similar tickets
      <TimeEstimationAI />          // AI-learned duration estimates
      <OptimalTimingAdvice />       // Best time slots for this type
      
      {/* Enhanced with custom properties */}
      <DynamicCustomFields />       // Based on ticket type
      <FocusModeSelector />         // Light/Focus/Zen modes
    </Modal>
  );
};
```

### 2. Custom Ticket Types System

**Building on Epic 1's solid foundation**:

```prisma
model TicketType {
  id          String @id @default(uuid())
  userId      String
  name        String
  description String?
  color       String? // Visual timeline distinction
  
  // Intelligence enhancements
  defaultFocusMode    FocusMode @default(NONE)
  typicalDuration     Int?      // Learned from usage
  optimalTimeOfDay    String?   // Morning/Afternoon/Evening
  knowledgeCategories String[]  // Auto-link knowledge types
  
  // Custom properties schema
  customFields Json? // Dynamic field definitions
  
  // Epic 1 compatibility - PRESERVE
  user        User @relation(fields: [userId], references: [id])
  tickets     Ticket[]
  
  @@map("ticket_types")
}

enum FocusMode {
  NONE    // Normal timeline view
  LIGHT   // Gentle focus indicators
  FOCUS   // Hide distractions, show timer
  ZEN     // Full-screen focus mode
}
```

### 3. Timeline Visual Enhancements

**Timeline shows intelligence visually**:

```typescript
// Enhanced TicketComponent.tsx with intelligence
const TicketCard = ({ ticket }: { ticket: EnhancedTicket }) => {
  return (
    <div className={`ticket-card ${ticket.type.color}`}>
      {/* Existing Epic 1 drag handles - PRESERVE */}
      <DragHandle />
      <ResizeHandles />
      
      {/* NEW: Intelligence indicators */}
      <div className="intelligence-indicators">
        {ticket.knowledgeLinks.length > 0 && (
          <KnowledgeBadge count={ticket.knowledgeLinks.length} />
        )}
        
        {ticket.aiGenerated && (
          <AIGeneratedIcon confidence={ticket.confidence} />
        )}
        
        {ticket.focusMode !== 'NONE' && (
          <FocusModeIndicator mode={ticket.focusMode} />
        )}
        
        {ticket.hasPatternMatch && (
          <PatternMatchIcon accuracy={ticket.patternAccuracy} />
        )}
      </div>
      
      {/* Enhanced content with custom properties */}
      <TicketContent>
        <Title>{ticket.title}</Title>
        <CustomPropertiesDisplay fields={ticket.customProperties} />
        <TimeEstimate 
          aiPredicted={ticket.aiEstimatedDuration}
          userEstimate={ticket.userEstimatedDuration}
        />
      </TicketContent>
    </div>
  );
};
```

## Epic 3: Active Knowledge System Integration

### Knowledge Capture Within Timeline Context

**Contextual Knowledge Capture**: Users capture knowledge while working on timeline

```typescript
// Knowledge capture integrated into timeline flow
const TimelineKnowledgeCapture = () => {
  return (
    <>
      {/* Floating knowledge input */}
      <FloatingKnowledgeInput 
        trigger="Double-click empty timeline space"
        context={{
          currentTime: selectedTimeSlot,
          nearbyTickets: getContextTickets(),
          recentActivity: getRecentUserActivity()
        }}
      />
      
      {/* Quick capture toolbar */}
      <QuickCaptureToolbar>
        <TextNoteCapture />
        <VoiceNoteCapture />
        <URLCapture />
        <DocumentUpload />
      </QuickCaptureToolbar>
    </>
  );
};
```

### Timeline-Driven Knowledge Application

**How knowledge becomes tickets on timeline**:

```typescript
// Knowledge → Ticket transformation
interface KnowledgeToTicketFlow {
  // User captures: "Learned about Redis caching strategies"
  knowledge: {
    text: "Redis can improve API performance by 60%...",
    extractedActions: [
      "Research Redis implementation",
      "Set up Redis locally", 
      "Implement caching for user API"
    ]
  };
  
  // AI suggests timeline placement
  suggestedTickets: [
    {
      title: "Research Redis implementation",
      duration: 90, // minutes - AI learned estimate
      optimalTime: "2024-01-15T09:00:00Z", // morning focus time
      reasoning: "Similar research tasks completed 40% faster in mornings"
    }
  ];
  
  // Timeline integration
  timelineIntegration: {
    showAsGhostTickets: true,
    highlightOptimalSlots: true,
    allowUserModification: true
  };
}
```

### Real User Workflow Example

**Complete Intelligence Amplification Flow**:

```
1. USER CONTEXT
   - Working on timeline at 2pm
   - Has "API optimization" ticket scheduled for tomorrow
   - Reads article about Redis caching

2. KNOWLEDGE CAPTURE
   - Double-clicks empty timeline space
   - Quick capture: "Redis can improve API performance by 60%"
   - AI extracts: 3 actionable items + time estimates

3. INTELLIGENCE PROCESSING
   - Links to existing "API optimization" ticket
   - Suggests breaking it into sub-tasks
   - Recommends optimal scheduling based on patterns

4. TIMELINE INTEGRATION  
   - Shows ghost tickets for suggestions
   - Highlights morning slots (better for research)
   - User drags to accept or adjusts timing

5. ENHANCED TIMELINE VIEW
   - Original ticket now shows knowledge link badge
   - New tickets have AI confidence indicators
   - Focus mode suggestions for deep work

6. LEARNING LOOP
   - User accepts morning slot → AI learns preference
   - Task completion time → improves future estimates
   - Knowledge effectiveness → prioritizes similar insights
```

### Focus System Timeline Integration

**Focus modes change timeline interface**:

```typescript
// Timeline adapts to focus mode
const FocusEnhancedTimeline = ({ focusMode }: { focusMode: FocusMode }) => {
  switch(focusMode) {
    case 'LIGHT':
      return <Timeline showSuggestions={false} dimNonActive={true} />;
      
    case 'FOCUS': 
      return <Timeline 
        showOnlyActive={true} 
        hideUI={true}
        showTimer={true}
        blockDistractions={true}
      />;
      
    case 'ZEN':
      return <FullScreenFocus 
        currentTicket={activeTicket}
        hideAllOthers={true}
        enableBreakReminders={true}
      />;
      
    default:
      return <Timeline />; // Standard Epic 1 timeline
  }
};
```

This shows exactly how the intelligence features integrate with your existing timeline interface while preserving Epic 1's working functionality.
  color       String? // Hex color for UI
  icon        String? // Icon identifier
  
  // Focus mode defaults (Epic 2.6)
  defaultFocusMode FocusMode @default(NONE)
  
  // Relationships
  properties  TicketTypeProperty[]
  tickets     Ticket[]
  user        User @relation(fields: [userId], references: [id])
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([userId, name])
  @@map("ticket_types")
}

// Custom properties for ticket types (Epic 2.2)
model TicketTypeProperty {
  id            String @id @default(uuid())
  ticketTypeId  String
  name          String
  fieldType     PropertyFieldType // TEXT, NUMBER, CHECKBOX, DATE, DROPDOWN
  required      Boolean @default(false)
  defaultValue  String?
  options       Json?   // For dropdown types
  validation    Json?   // Validation rules
  
  ticketType    TicketType @relation(fields: [ticketTypeId], references: [id], onDelete: Cascade)
  
  @@unique([ticketTypeId, name])
  @@map("ticket_type_properties")
}

// Enhanced Ticket model with hierarchy & recurrence (Epic 2.4, 2.5)
model Ticket {
  // ... existing fields ...
  
  // Custom type integration
  ticketTypeId    String?
  customProperties Json? // Dynamic properties based on type
  
  // Hierarchical structure (Epic 2.5)
  parentTicketId  String?
  parentTicket    Ticket? @relation("TicketHierarchy", fields: [parentTicketId], references: [id])
  childTickets    Ticket[] @relation("TicketHierarchy")
  
  // Recurrence (Epic 2.4)
  isRecurring     Boolean @default(false)
  recurrenceRule  Json?   // RRULE or custom pattern
  recurrenceEndDate DateTime?
  originalTicketId String? // For recurring instances
  
  // Focus integration (Epic 5)
  focusMode       FocusMode @default(NONE)
  isTodaysTrio    Boolean @default(false)
  
  // Relationships
  ticketType      TicketType? @relation(fields: [ticketTypeId], references: [id])
  focusSessions   FocusSession[]
  
  @@map("tickets")
}

enum PropertyFieldType {
  TEXT
  NUMBER
  CHECKBOX
  DATE
  DROPDOWN
}

enum FocusMode {
  NONE
  LIGHT
  FOCUS
  ZEN
}
```

### Epic 3: AI Assistant Integration

```prisma
// Simple AI conversation tracking
model AIConversation {
  id          String @id @default(uuid())
  userId      String
  sessionId   String // For grouping related exchanges
  
  // Conversation data
  userMessage String @db.Text
  aiResponse  String @db.Text
  context     Json?  // Current user context (tickets, schedule, etc.)
  
  // AI processing
  processingTime Int? // Milliseconds
  aiModel     String? // GPT-4, Claude, etc.
  
  // User feedback
  helpful     Boolean?
  feedback    String?
  
  createdAt   DateTime @default(now())
  user        User @relation(fields: [userId], references: [id])
  
  @@index([userId, sessionId])
  @@map("ai_conversations")
}

// AI-generated suggestions
model AISuggestion {
  id          String @id @default(uuid())
  userId      String
  type        SuggestionType // TICKET_CREATION, SCHEDULE_OPTIMIZATION, FOCUS_TIME, etc.
  
  // Suggestion content
  title       String
  description String @db.Text
  actionData  Json   // Data needed to execute suggestion
  confidence  Float  // AI confidence score (0-1)
  
  // User response
  status      SuggestionStatus @default(PENDING)
  userResponse String?
  appliedAt   DateTime?
  
  createdAt   DateTime @default(now())
  expiresAt   DateTime?
  user        User @relation(fields: [userId], references: [id])
  
  @@index([userId, status])
  @@map("ai_suggestions")
}

// Simple agent configuration (Epic 3.5)
model AIAgentConfig {
  id              String @id @default(uuid())
  userId          String @unique
  
  // Agent personality
  autonomyLevel   Int @default(3)    // 1-5 scale
  communicationTone String @default("friendly") // friendly, professional, casual
  proactiveness   Int @default(3)    // 1-5 scale
  
  // Capabilities
  canCreateTickets Boolean @default(true)
  canModifySchedule Boolean @default(false)
  canSendReminders Boolean @default(true)
  
  user            User @relation(fields: [userId], references: [id])
  customCommands  AICustomCommand[]
  
  @@map("ai_agent_configs")
}

// Custom AI commands (Epic 3.6)
model AICustomCommand {
  id          String @id @default(uuid())
  configId    String
  
  // Command definition
  phrase      String // "start my morning routine"
  description String
  actions     Json   // Array of actions to execute
  
  // Usage tracking
  isActive    Boolean @default(true)
  useCount    Int @default(0)
  lastUsed    DateTime?
  
  config      AIAgentConfig @relation(fields: [configId], references: [id], onDelete: Cascade)
  
  @@map("ai_custom_commands")
}

enum SuggestionType {
  TICKET_CREATION
  SCHEDULE_OPTIMIZATION
  FOCUS_TIME
  REMINDER
}

enum SuggestionStatus {
  PENDING
  ACCEPTED
  REJECTED
  EXPIRED
}
```

### Epic 4: Social & Collaboration

```prisma
// User connections (Epic 4.5)
model UserConnection {
  id          String @id @default(uuid())
  requesterId String
  recipientId String
  status      ConnectionStatus @default(PENDING)
  
  requester   User @relation("ConnectionRequester", fields: [requesterId], references: [id])
  recipient   User @relation("ConnectionRecipient", fields: [recipientId], references: [id])
  
  createdAt   DateTime @default(now())
  acceptedAt  DateTime?
  
  @@unique([requesterId, recipientId])
  @@map("user_connections")
}

// Shared content (Epic 4.1, 4.2, 4.3)
model SharedContent {
  id          String @id @default(uuid())
  ownerId     String
  contentType SharedContentType // TIMELINE, TICKET, PROJECT
  contentId   String // ID of the shared content
  
  // Sharing configuration
  shareId     String @unique // Public share identifier
  permissions Json   // View, comment, edit permissions per user
  isPublic    Boolean @default(false)
  expiresAt   DateTime?
  
  owner       User @relation(fields: [ownerId], references: [id])
  comments    SharedComment[]
  
  createdAt   DateTime @default(now())
  
  @@map("shared_content")
}

// Comments on shared content
model SharedComment {
  id              String @id @default(uuid())
  sharedContentId String
  authorId        String
  content         String @db.Text
  
  sharedContent   SharedContent @relation(fields: [sharedContentId], references: [id], onDelete: Cascade)
  author          User @relation(fields: [authorId], references: [id])
  
  createdAt       DateTime @default(now())
  
  @@map("shared_comments")
}

// Projects (Epic 4.3)
model Project {
  id          String @id @default(uuid())
  ownerId     String
  name        String
  description String?
  
  // Project members
  memberIds   String[] // User IDs with access
  
  owner       User @relation(fields: [ownerId], references: [id])
  tickets     ProjectTicket[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("projects")
}

// Project-ticket relationships
model ProjectTicket {
  id        String @id @default(uuid())
  projectId String
  ticketId  String
  
  project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  ticket    Ticket @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  
  @@unique([projectId, ticketId])
  @@map("project_tickets")
}

enum ConnectionStatus {
  PENDING
  ACCEPTED
  BLOCKED
}

enum SharedContentType {
  TIMELINE
  TICKET
  PROJECT
}
```

### Epic 5: Focus Enhancement System

```prisma
// Focus sessions tracking (Epic 5.1, 5.3)
model FocusSession {
  id          String @id @default(uuid())
  userId      String
  ticketId    String?
  
  // Session details
  focusMode   FocusMode
  plannedDuration Int      // Minutes
  actualDuration  Int?     // Minutes
  
  // Session data
  startedAt   DateTime
  endedAt     DateTime?
  distractions Int @default(0)
  pauseCount  Int @default(0)
  pauseTime   Int @default(0) // Total pause time in minutes
  
  // Session outcome
  completed   Boolean @default(false)
  productivity Float?  // Self-rated 1-5
  notes       String?
  
  user        User @relation(fields: [userId], references: [id])
  ticket      Ticket? @relation(fields: [ticketId], references: [id])
  
  @@map("focus_sessions")
}

// Focus preferences (Epic 5.2)
model FocusPreferences {
  id              String @id @default(uuid())
  userId          String @unique
  
  // Break settings (Epic 5.4)
  breakInterval   Int @default(25)    // Minutes (Pomodoro default)
  shortBreakDuration Int @default(5)  // Minutes
  longBreakDuration  Int @default(15) // Minutes
  
  // Distraction management
  blockedSites    String[] // URLs to block
  allowNotifications Boolean @default(false)
  
  // Analytics preferences
  weeklyGoal      Int @default(120)   // Minutes per week
  dailyGoal       Int @default(120)   // Minutes per day
  
  user            User @relation(fields: [userId], references: [id])
  templates       FocusTemplate[]
  
  @@map("focus_preferences")
}

// Focus session templates (Epic 5.5)
model FocusTemplate {
  id          String @id @default(uuid())
  preferencesId String
  
  // Template definition
  name        String
  description String?
  focusMode   FocusMode
  duration    Int      // Minutes
  breakPattern Json?   // Custom break configuration
  
  // Usage tracking
  useCount    Int @default(0)
  lastUsed    DateTime?
  
  preferences FocusPreferences @relation(fields: [preferencesId], references: [id], onDelete: Cascade)
  
  @@map("focus_templates")
}

// Today's Trio tracking (Epic 2.7)
model TodaysTrio {
  id          String @id @default(uuid())
  userId      String
  date        DateTime @db.Date
  
  // Trio tickets
  firstTicketId  String?
  secondTicketId String?
  thirdTicketId  String?
  
  // Completion tracking
  firstCompleted  Boolean @default(false)
  secondCompleted Boolean @default(false)  
  thirdCompleted  Boolean @default(false)
  completedAt     DateTime?
  
  user           User @relation(fields: [userId], references: [id])
  
  @@unique([userId, date])
  @@map("todays_trios")
}
```

## Service Architecture - Epic Implementation

### Epic 2: Custom Ticket Types & Properties

```typescript
// packages/backend/src/ticket-types/
├── ticket-types.controller.ts         // REST endpoints for ticket types
├── ticket-types.service.ts            // Business logic for types & properties
├── ticket-types.repository.ts         // Prisma data access
└── dto/
    ├── create-ticket-type.dto.ts      // Validation for type creation
    ├── create-property.dto.ts         // Validation for properties
    └── update-ticket-type.dto.ts      // Update operations

// packages/backend/src/tickets/ (Enhanced)
├── tickets.service.ts                 // Enhanced with hierarchy & recurrence
├── recurrence.service.ts              // Handle recurring ticket creation
└── hierarchy.service.ts               // Parent-child relationships
```

### Epic 3: AI Assistant Integration

```typescript
// packages/backend/src/ai/
├── ai.controller.ts                   // Chat/voice endpoints
├── ai.service.ts                      // Core AI integration
├── ai-suggestion.service.ts           // Generate and manage suggestions
├── conversation.service.ts            // Track chat history
├── custom-commands.service.ts         // User-defined commands
└── integrations/
    ├── openai.service.ts              // OpenAI API wrapper
    ├── voice.service.ts               // Voice processing
    └── context.service.ts             // Build user context
```

### Epic 4: Social & Collaboration

```typescript
// packages/backend/src/social/
├── connections.controller.ts          // Friend management endpoints
├── connections.service.ts             // User connection logic
├── sharing.controller.ts              // Content sharing endpoints
├── sharing.service.ts                 // Share permissions & access
├── projects.controller.ts             // Project management
├── projects.service.ts                // Project business logic
└── notifications/
    ├── notifications.service.ts       // Real-time notifications
    └── websocket.gateway.ts           // WebSocket handling
```

### Epic 5: Focus Enhancement System

```typescript
// packages/backend/src/focus/
├── focus.controller.ts                // Focus session endpoints
├── focus.service.ts                   // Session management
├── focus-analytics.service.ts         // Analytics & insights
├── focus-preferences.service.ts       // User preferences
├── templates.service.ts               // Focus templates
└── trio.service.ts                    // Today's Trio management
```

### Core Services (Enhanced)

```typescript
// packages/backend/src/core/
├── auth/                              // EXISTING - JWT authentication
├── users/                             // EXISTING - User management
├── database/                          // EXISTING - Prisma setup
└── websockets/                        // NEW - Real-time updates
    ├── websocket.module.ts
    ├── websocket.gateway.ts
    └── events/
        ├── ticket.events.ts           // Ticket updates
        ├── focus.events.ts            // Focus session events
        └── social.events.ts           // Collaboration events
```

## API Layer Updates - Epic Implementation

### Epic 2: Custom Ticket Types & Properties

```typescript
// Ticket Type Management
GET    /api/ticket-types            // List user's ticket types
POST   /api/ticket-types            // Create new ticket type
GET    /api/ticket-types/:id        // Get ticket type details
PUT    /api/ticket-types/:id        // Update ticket type
DELETE /api/ticket-types/:id        // Delete ticket type

// Ticket Type Properties
POST   /api/ticket-types/:id/properties    // Add property to type
PUT    /api/ticket-types/:id/properties/:propId  // Update property
DELETE /api/ticket-types/:id/properties/:propId  // Delete property

// Enhanced Tickets with Hierarchy & Recurrence
POST   /api/tickets                 // Create ticket (with type & hierarchy)
GET    /api/tickets/:id/children    // Get child tickets
POST   /api/tickets/:id/children    // Create child ticket
PUT    /api/tickets/:id/recurrence  // Set recurrence pattern
DELETE /api/tickets/:id/recurrence  // Remove recurrence
```

### Epic 3: AI Assistant Integration

```typescript
// AI Chat & Voice Interface
POST   /api/ai/chat                 // Send chat message to AI
POST   /api/ai/voice                // Process voice command
GET    /api/ai/conversations        // Get chat history
DELETE /api/ai/conversations/:sessionId  // Clear conversation

// AI Suggestions
GET    /api/ai/suggestions          // Get pending suggestions
POST   /api/ai/suggestions/:id/accept   // Accept suggestion
POST   /api/ai/suggestions/:id/reject   // Reject suggestion
PUT    /api/ai/suggestions/:id/feedback // Rate suggestion

// Agent Configuration
GET    /api/ai/config               // Get agent settings
PUT    /api/ai/config               // Update agent settings
GET    /api/ai/custom-commands      // List custom commands
POST   /api/ai/custom-commands      // Create custom command
PUT    /api/ai/custom-commands/:id  // Update custom command
DELETE /api/ai/custom-commands/:id  // Delete custom command
```

### Epic 4: Social & Collaboration

```typescript
// Friend Management
GET    /api/social/connections      // List connections
POST   /api/social/connections      // Send friend request
PUT    /api/social/connections/:id  // Accept/reject request
DELETE /api/social/connections/:id  // Remove connection

// Content Sharing
POST   /api/sharing/timeline        // Share timeline
POST   /api/sharing/tickets/:id     // Share specific ticket
GET    /api/sharing/:shareId        // View shared content
POST   /api/sharing/:shareId/comments // Add comment to shared content
DELETE /api/sharing/:shareId        // Remove share

// Project Management
GET    /api/projects                // List user's projects
POST   /api/projects                // Create new project
GET    /api/projects/:id            // Get project details
PUT    /api/projects/:id            // Update project
DELETE /api/projects/:id            // Delete project
POST   /api/projects/:id/tickets    // Add ticket to project
DELETE /api/projects/:id/tickets/:ticketId // Remove ticket from project

// Real-time Notifications
GET    /api/notifications           // Get notifications
PUT    /api/notifications/:id/read  // Mark as read
DELETE /api/notifications/:id       // Delete notification
```

### Epic 5: Focus Enhancement System

```typescript
// Focus Sessions
POST   /api/focus/sessions          // Start focus session
PUT    /api/focus/sessions/:id/pause // Pause session
PUT    /api/focus/sessions/:id/resume // Resume session
PUT    /api/focus/sessions/:id/end  // End session
GET    /api/focus/sessions/active   // Get active session
GET    /api/focus/sessions/history  // Get session history

// Focus Analytics
GET    /api/focus/analytics/daily   // Daily focus stats
GET    /api/focus/analytics/weekly  // Weekly focus stats
GET    /api/focus/analytics/patterns // Focus patterns & insights

// Focus Preferences & Templates
GET    /api/focus/preferences       // Get focus settings
PUT    /api/focus/preferences       // Update focus settings
GET    /api/focus/templates         // List focus templates
POST   /api/focus/templates         // Create focus template
PUT    /api/focus/templates/:id     // Update template
DELETE /api/focus/templates/:id     // Delete template

// Today's Trio
GET    /api/trio/today              // Get today's trio
PUT    /api/trio/today              // Set today's trio
PUT    /api/trio/today/:position/complete // Mark trio item complete
```

### Frontend Updates - Epic Implementation

```typescript
// packages/frontend/src/features/
├── ticket-types/                    // Epic 2 - Custom Types
│   ├── components/
│   │   ├── TicketTypeEditor.tsx     // Type creation/editing
│   │   ├── PropertyEditor.tsx       // Property configuration
│   │   └── TypeSelector.tsx         // Type selection dropdown
│   └── hooks/
│       ├── useTicketTypes.ts        // Type management
│       └── useCustomProperties.ts   // Property handling
│
├── ai-assistant/                    // Epic 3 - AI Integration  
│   ├── components/
│   │   ├── ChatInterface.tsx        // Chat UI
│   │   ├── VoiceInput.tsx          // Voice recognition
│   │   ├── SuggestionPanel.tsx     // AI suggestions
│   │   └── AgentConfig.tsx         // Agent settings
│   └── hooks/
│       ├── useAIChat.ts            // Chat functionality
│       ├── useVoiceCommands.ts     // Voice processing
│       └── useSuggestions.ts       // Suggestion management
│
├── social/                          // Epic 4 - Collaboration
│   ├── components/
│   │   ├── FriendsPanel.tsx        // Friend management
│   │   ├── ShareDialog.tsx         // Sharing interface
│   │   ├── ProjectManager.tsx      // Project management
│   │   └── NotificationCenter.tsx  // Notifications
│   └── hooks/
│       ├── useSocialConnections.ts // Friend system
│       ├── useSharing.ts           // Content sharing
│       └── useProjects.ts          // Project management
│
├── focus/                           // Epic 5 - Focus System
│   ├── components/
│   │   ├── FocusModeUI.tsx         // Focus session interface
│   │   ├── FocusAnalytics.tsx      // Analytics dashboard
│   │   ├── TodaysTrioPanel.tsx     // Trio selection
│   │   └── FocusSettings.tsx       // Focus preferences
│   └── hooks/
│       ├── useFocusSession.ts      // Session management
│       ├── useFocusAnalytics.ts    // Analytics data
│       └── useTodaysTrio.ts        // Trio management
│
└── enhanced-timeline/               // Enhanced Timeline (All Epics)
    ├── components/
    │   ├── TimelineView.tsx         // Enhanced with focus indicators
    │   ├── TicketCard.tsx          // Enhanced with custom types
    │   └── FocusIndicator.tsx      // Focus mode visual state
    └── hooks/
        └── useEnhancedTimeline.ts   // Integrated timeline state
```

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
3. **Multi-View Timeline**: Seamless switching between hourly, daily, weekly views with proper time calculations
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
- **Dynamic Timeline Grid**: Complete timeline visualization with daily/weekly views
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
│   │   │   ├── ViewControls.tsx     # NEW - Hourly/Daily/Weekly
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
- **Timeline Core**: Complete timeline visualization with multi-view support (daily/weekly)
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
  view: 'hourly' | 'daily' | 'weekly';
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

## Realistic Implementation Strategy

### Critical Architectural Decisions

**1. Minimum Viable Intelligence (MVI) Approach**
Rather than attempting full AGI integration, we build incrementally functional intelligence:
- **Phase 1**: Basic knowledge capture → simple keyword matching → ticket suggestions
- **Phase 2**: Vector embeddings → semantic search → contextual retrieval  
- **Phase 3**: Pattern recognition → proactive suggestions → autonomous scheduling

**2. Hybrid Intelligence Architecture**
- **Simple AI**: Rule-based logic for 80% of use cases
- **Advanced AI**: LLM integration for complex reasoning when needed
- **Human-in-Loop**: User validation for all autonomous actions

**3. Graceful Degradation Strategy** 
- **Core timeline functionality**: Works without AI services
- **Knowledge capture**: Falls back to simple tagging if vector DB fails
- **AI suggestions**: Disable gracefully if LLM services unavailable

### Implementation Phases (Realistic Timeline)

### Phase 1: Knowledge Foundation (Weeks 1-6)

**Goal**: Basic knowledge capture and retrieval without advanced AI

**Backend Implementation:**
```typescript
// Start with simple knowledge management
packages/backend/src/knowledge/
├── knowledge.controller.ts        // CRUD operations
├── knowledge.service.ts           // Basic text processing
├── simple-search.service.ts       // Keyword-based search
└── knowledge.repository.ts        // Database operations
```

**Database Changes:**
- Add `KnowledgeItem` model (without vector embeddings initially)
- Simple text-based search using PostgreSQL full-text search
- Basic ticket-knowledge linking

**Frontend Implementation:**
- Knowledge capture UI (text input, basic forms)
- Simple knowledge search interface  
- Basic knowledge → ticket suggestion workflow

**Validation Criteria:**
- ✅ Users can capture knowledge items
- ✅ Basic keyword search works
- ✅ Knowledge items can suggest ticket creation
- ✅ No external AI dependencies yet

### Phase 2: Semantic Intelligence (Weeks 7-14)

**Goal**: Add vector embeddings and semantic search

**Technical Additions:**
```typescript
// Add vector intelligence
packages/backend/src/intelligence/
├── embedding.service.ts           // Text → Vector conversion
├── vector-search.service.ts       // Semantic similarity
├── rag.service.ts                 // Retrieval-Augmented Generation
└── knowledge-processor.service.ts // Enhanced knowledge processing
```

**Infrastructure Requirements:**
- **Vector Database**: Qdrant (self-hosted) or Pinecone (managed)
- **Embedding Service**: OpenAI Embeddings API
- **Background Processing**: Queue system for embedding generation

**New Capabilities:**
- Semantic search across knowledge items
- Context-aware knowledge retrieval
- Similar situation detection
- Basic pattern recognition

**Validation Criteria:**
- ✅ Knowledge items have vector embeddings
- ✅ Semantic search finds relevant items by meaning, not just keywords
- ✅ System suggests relevant knowledge during ticket creation
- ✅ Similar past situations are automatically identified

### Phase 3: Active Intelligence (Weeks 15-24)

**Goal**: LLM integration and proactive suggestions

**Advanced AI Integration:**
```typescript
packages/backend/src/ai/
├── llm.service.ts                 // GPT-4/Claude integration
├── agent.service.ts               // AI agent coordination  
├── suggestion-engine.service.ts   // Proactive recommendations
├── pattern-analyzer.service.ts    // Historical behavior analysis
└── mcp-coordinator.service.ts     // Multi-tool orchestration
```

**Intelligence Features:**
- Natural language processing of knowledge items
- Proactive ticket creation based on patterns
- Time estimation improvement through learning
- Agent-to-agent coordination protocols

**Validation Criteria:**
- ✅ AI can process natural language inputs into structured knowledge
- ✅ System proactively suggests tickets based on past patterns
- ✅ Time estimates improve over time through learning
- ✅ Basic agent coordination works for simple scheduling

## Critical Risks and Mitigation

### High-Risk Components

**1. Vector Database Integration (HIGH RISK)**
- **Risk**: Vector similarity search performance degrades with scale
- **Mitigation**: 
  - Start with simple PostgreSQL vector extension (pgvector)
  - Implement caching layer for frequent searches
  - Plan migration path to dedicated vector DB (Qdrant/Pinecone)

**2. LLM Service Reliability (HIGH RISK)**
- **Risk**: External AI services fail or become expensive
- **Mitigation**:
  - Multiple LLM provider support (OpenAI, Anthropic, local)
  - Graceful degradation to rule-based systems
  - Cost monitoring and rate limiting

**3. Real-time Intelligence (MEDIUM RISK)**
- **Risk**: AI processing delays break real-time user experience
- **Mitigation**:
  - Asynchronous processing with immediate UI feedback
  - Background processing for non-critical intelligence
  - Local caching of frequent AI results

### Success Metrics Alignment with PRD

**Knowledge Application Rate (PRD Target: 70%)**
- Track which captured knowledge items lead to ticket creation
- Measure time from knowledge capture to application
- User feedback on knowledge effectiveness

**Productivity Improvement (PRD Target: 40% increase)**
- Compare task completion rates before/after intelligence features
- Measure time estimation accuracy improvement over time
- Track focus session success rates and duration

**Intelligence Amplification (PRD Goal: Active Intelligence)**
- Measure frequency of AI-suggested tickets being accepted
- Track pattern recognition accuracy (time estimates, optimal scheduling)
- Monitor compound learning rate (knowledge building on knowledge)

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
