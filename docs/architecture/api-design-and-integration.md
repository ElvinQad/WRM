# API Design and Integration

## Current API Analysis

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

## Required New Endpoints for Timeline Features

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

## Integration with Existing API Patterns

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
