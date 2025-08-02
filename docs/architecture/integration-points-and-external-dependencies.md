# Integration Points and External Dependencies

## Current External Services Integration

**✅ Database Integration:**
- PostgreSQL via Prisma ORM
- Connection pooling configured
- Migration system in place

**❌ Missing External Services for Enhancement:**
- AI/LLM service for Epic 3 (assistant functionality)
- WebSocket service for real-time updates
- Voice processing service (Web Speech API)

## New Integration Requirements

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

## Integration Constraints

**Security Requirements (Per PRD):**
- All external API calls must use JWT authentication
- AI service communications need encryption in transit
- WebSocket connections need authentication validation
- External service failures need graceful degradation
