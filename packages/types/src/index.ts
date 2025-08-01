// Main exports for @wrm/types package
export * from './lib/types.ts';
export * from './lib/timeline.types.ts';
export * from './lib/transformers.ts';

// Re-export commonly used types for convenience
export type {
  BaseTicket,
  FrontendTicket,
  CreateTicketDto,
  UpdateTicketDto,
  MoveTicketDto,
  ResizeTicketDto,
  TimelineQueryDto,
  TimelineResponse,
  TimelineConflict,
  TicketEntity,
  TicketType,
  TicketTypeEntity,
  CreateTicketTypeDto,
  UpdateTicketTypeDto,
  CustomFieldDefinition,
  TicketWithPosition,
  TicketStatus,
  Agent,
  AgentEntity,
  AgentCollaboration,
  AgentCollaborationEntity,
} from './lib/types.ts';

export type {
  TimelineView,
  TimelineProps,
  DragState,
  TimeMarker,
  TimelineViewport,
  TimelineEvents,
  TimelineGridConfig,
  TimelineState,
} from './lib/timeline.types.ts';

// Re-export transformer functions for convenience
export {
  baseToFrontendTicket,
  frontendToBaseTicket,
} from './lib/transformers.ts';
