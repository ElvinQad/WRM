// Type transformation utilities for converting between different representations
import {
  BaseTicket,
  FrontendTicket,
  TicketEntity,
  TicketType,
  TicketTypeEntity,
  TicketStatus,
  Agent,
  AgentEntity,
  AgentCollaboration,
  AgentCollaborationEntity,
} from './types.ts';

/**
 * Transform database entity to API format (snake_case -> camelCase)
 * Enhanced for Timeline features
 */
export function entityToTicket(entity: TicketEntity): BaseTicket {
  return {
    id: entity.id,
    userId: entity.user_id,
    title: entity.title,
    description: entity.description || undefined,
    startTime: entity.start_time,
    endTime: entity.end_time,
    typeId: entity.type_id,
    customProperties: entity.custom_properties,
    
    // Epic 1: Time-aware state fields
    status: entity.status,
    lastInteraction: entity.last_interaction || undefined,
    
    // Epic 3: AI assistant fields
    aiGenerated: entity.ai_generated,
    aiContext: entity.ai_context || undefined,
    priority: entity.priority || undefined,
    
    createdAt: entity.created_at,
    updatedAt: entity.updated_at,
  };
}

/**
 * Transform API format to database entity (camelCase -> snake_case)
 * Enhanced for Timeline features
 */
export function ticketToEntity(ticket: BaseTicket): TicketEntity {
  return {
    id: ticket.id,
    user_id: ticket.userId,
    title: ticket.title,
    description: ticket.description || null,
    start_time: ticket.startTime,
    end_time: ticket.endTime,
    type_id: ticket.typeId,
    custom_properties: ticket.customProperties,
    
    // Epic 1: Time-aware state fields
    status: ticket.status,
    last_interaction: ticket.lastInteraction || null,
    
    // Epic 3: AI assistant fields
    ai_generated: ticket.aiGenerated,
    ai_context: ticket.aiContext || null,
    priority: ticket.priority || null,
    
    created_at: ticket.createdAt,
    updated_at: ticket.updatedAt,
  };
}

/**
 * Transform base ticket to frontend ticket with Date objects and UI properties
 * Enhanced for Epic 1 (Time-aware states and timeline UI)
 */
export function baseToFrontendTicket(
  base: BaseTicket, 
  typeName?: string, 
  typeColor?: string
): FrontendTicket {
  const customProps = base.customProperties || {};
  
  // Epic 1: Calculate time-aware visual properties
  const now = new Date();
  const startTime = new Date(base.startTime);
  const endTime = new Date(base.endTime);
  
  const isActive = startTime <= now && endTime >= now;
  const isPast = endTime < now;
  
  // Epic 1: Status-based border colors (per PRD requirements)
  const borderColor = getStatusBorderColor(base.status);
  
  return {
    ...base,
    start: startTime,
    end: endTime,
    color: customProps.color as string | undefined,
    category: customProps.category as string | undefined,
    lane: customProps.lane as number | undefined,
    typeName,
    typeColor,
    
    // Epic 1: Time-aware visual states
    borderColor,
    isActive,
    isPast,
    
    // Epic 1: Initialize interaction states
    isDragging: false,
    isResizing: false,
  };
}

/**
 * Epic 1: Get border color based on ticket status (per PRD)
 */
function getStatusBorderColor(status: TicketStatus): string {
  switch (status) {
    case 'FUTURE':
      return '#6B7280';      // Standard gray border
    case 'ACTIVE':
      return '#10B981';      // Green border
    case 'PAST_UNTOUCHED':
      return '#EF4444';      // Red border
    case 'PAST_CONFIRMED':
      return '#F59E0B';      // Amber border
    default:
      return '#6B7280';      // Default gray
  }
}

/**
 * Transform frontend ticket back to base ticket (Date -> ISO string)
 * Enhanced for Epic 1 timeline features
 */
export function frontendToBaseTicket(frontend: FrontendTicket): BaseTicket {
  const { 
    start, 
    end, 
    color, 
    category, 
    lane, 
    typeName: _typeName,
    typeColor: _typeColor,
    borderColor: _borderColor,
    isActive: _isActive,
    isPast: _isPast,
    isDragging: _isDragging,
    isResizing: _isResizing,
    ...base 
  } = frontend;
  
  // Update custom properties with UI-specific values
  const customProperties = { ...base.customProperties };
  if (color !== undefined) customProperties.color = color;
  if (category !== undefined) customProperties.category = category;
  if (lane !== undefined) customProperties.lane = lane;
  
  return {
    ...base,
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    customProperties,
  };
}

/**
 * Transform ticket type entity to API format
 */
export function entityToTicketType(entity: TicketTypeEntity): TicketType {
  return {
    id: entity.id,
    name: entity.name,
    description: entity.description || undefined,
    propertiesSchema: entity.properties_schema,
    createdAt: entity.created_at,
    updatedAt: entity.updated_at,
  };
}

/**
 * Transform ticket type API format to entity
 */
export function ticketTypeToEntity(ticketType: TicketType): TicketTypeEntity {
  return {
    id: ticketType.id,
    name: ticketType.name,
    description: ticketType.description || null,
    properties_schema: ticketType.propertiesSchema,
    default_duration: ticketType.defaultDuration || null,
    color: ticketType.color || null,
    user_id: ticketType.userId || null,
    created_at: ticketType.createdAt,
    updated_at: ticketType.updatedAt,
  };
}

/**
 * Transform agent entity to API format
 */
export function entityToAgent(entity: AgentEntity): Agent {
  return {
    id: entity.id,
    name: entity.name,
    description: entity.description || undefined,
    systemPrompt: entity.system_prompt,
    createdAt: entity.created_at,
    updatedAt: entity.updated_at,
  };
}

/**
 * Transform agent API format to entity
 */
export function agentToEntity(agent: Agent): AgentEntity {
  return {
    id: agent.id,
    name: agent.name,
    description: agent.description || null,
    system_prompt: agent.systemPrompt,
    created_at: agent.createdAt,
    updated_at: agent.updatedAt,
  };
}

/**
 * Transform agent collaboration entity to API format
 */
export function entityToAgentCollaboration(entity: AgentCollaborationEntity): AgentCollaboration {
  return {
    id: entity.id,
    ticketId: entity.ticket_id,
    agentId: entity.agent_id,
    status: entity.status,
    startedAt: entity.started_at,
    endedAt: entity.ended_at || undefined,
    results: entity.results,
    createdAt: entity.created_at,
    updatedAt: entity.updated_at,
  };
}

/**
 * Transform agent collaboration API format to entity
 */
export function agentCollaborationToEntity(collaboration: AgentCollaboration): AgentCollaborationEntity {
  return {
    id: collaboration.id,
    ticket_id: collaboration.ticketId,
    agent_id: collaboration.agentId,
    status: collaboration.status,
    started_at: collaboration.startedAt,
    ended_at: collaboration.endedAt || null,
    results: collaboration.results,
    created_at: collaboration.createdAt,
    updated_at: collaboration.updatedAt,
  };
}

/**
 * Batch transform utilities
 */
export function entitiesToTickets(entities: TicketEntity[]): BaseTicket[] {
  return entities.map(entityToTicket);
}

export function ticketsToEntities(tickets: BaseTicket[]): TicketEntity[] {
  return tickets.map(ticketToEntity);
}

export function baseToFrontendTickets(
  tickets: BaseTicket[], 
  ticketTypes?: Map<string, string>
): FrontendTicket[] {
  return tickets.map(ticket => 
    baseToFrontendTicket(ticket, ticketTypes?.get(ticket.typeId))
  );
}

export function frontendToBaseTickets(tickets: FrontendTicket[]): BaseTicket[] {
  return tickets.map(frontendToBaseTicket);
}
