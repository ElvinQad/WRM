# Data Models and Schema Integration

## Existing Data Models (Current State)

**Current Prisma Schema Analysis:**
- ✅ `User` model - Basic user management with authentication
- ✅ `Ticket` model - Basic ticket structure with user relationship
- ✅ `TicketType` model - Foundation for custom ticket types
- ✅ `Agent` model - Foundation for AI assistant functionality
- ✅ `AgentCollaboration` model - Multi-user collaboration prep

## Required Schema Enhancements for Timeline Features

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

## Database Migration Strategy

**Critical Compatibility Requirements:**
- All changes must be additive (no breaking changes to existing data)
- Existing tickets must automatically get `PAST_UNTOUCHED` or `PAST_CONFIRMED` status based on timestamps
- Custom properties for existing ticket types default to empty JSON
- Migration must preserve all user data and relationships
