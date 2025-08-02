// Core shared types for WRM application
// These types should be used across frontend, backend, and any other packages

/**
 * Epic 1 & 2: Time-aware ticket states for timeline visualization
 */
export type TicketStatus = 'FUTURE' | 'ACTIVE' | 'PAST_UNTOUCHED' | 'PAST_CONFIRMED';

/**
 * Base ticket interface - core properties that exist across all layers
 * Enhanced for Timeline functionality (Epic 1 & 2)
 */
export interface BaseTicket {
  id: string;
  userId: string;
  title: string;
  description?: string;
  startTime: string; // ISO string format for serialization
  endTime: string;   // ISO string format for serialization
  typeId: string;
  customProperties: Record<string, unknown>;
  
  // Epic 1: Time-aware state management
  status: TicketStatus;
  lastInteraction?: string; // ISO string format
  
  // Epic 3: AI assistant integration (foundation)
  aiGenerated: boolean;
  aiContext?: string;
  priority?: number;
  
  createdAt: string;
  updatedAt: string;
}

/**
 * Frontend-specific ticket interface with UI properties
 * Enhanced for Timeline UI (Epic 1)
 */
export interface FrontendTicket extends BaseTicket {
  // Convert string dates to Date objects for frontend use
  start: Date;
  end: Date;
  
  // UI-specific properties for timeline rendering
  color?: string;
  category?: string;
  lane?: number;
  
  // Type information for UI display
  typeName?: string;
  typeColor?: string;
  
  // Epic 1: Time-aware visual states
  borderColor?: string; // Computed from status
  isActive?: boolean;   // Computed from status and current time
  isPast?: boolean;     // Computed from status
  
  // Epic 1: Drag-and-drop properties
  isDragging?: boolean;
  isResizing?: boolean;
}

/**
 * Ticket with calculated position for timeline rendering
 * Enhanced for Epic 1 (Dynamic Timeline)
 */
export interface TicketWithPosition extends FrontendTicket {
  startX: number;
  endX: number;
  width: number;
  lane: number;
  statusBorderColor: string;
  statusBackgroundColor: string;
  isSelected?: boolean;
  isHovered?: boolean;
  hasConflict?: boolean;
  conflictLevel?: 'warning' | 'error';
}

/**
 * Backend DTO interfaces for API communication
 * Enhanced for Timeline operations (Epic 1)
 */
export interface CreateTicketDto {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  typeId: string;
  customProperties?: Record<string, unknown>;
  priority?: number;
}

export interface UpdateTicketDto {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  typeId?: string;
  customProperties?: Record<string, unknown>;
  status?: TicketStatus;
  lastInteraction?: string;
  priority?: number;
}

// Epic 1: Timeline-specific DTOs
export interface MoveTicketDto {
  startTime: string;
  endTime: string;
}

export interface ResizeTicketDto {
  endTime: string;
}

export interface TimelineQueryDto {
  view: 'hourly' | 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
}

export interface TimelineResponse {
  tickets: TicketWithPosition[];
  conflicts: TimelineConflict[];
  view: string;
  dateRange: { start: string; end: string };
}

export interface TimelineConflict {
  ticketIds: string[];
  timeRange: { start: string; end: string };
  type: 'overlap' | 'double-booking';
}

/**
 * Database entity interface (matches SQL schema)
 * Enhanced for Timeline functionality
 */
export interface TicketEntity {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  type_id: string;
  custom_properties: Record<string, unknown>;
  
  // Epic 1: Time-aware state fields
  status: TicketStatus;
  last_interaction: string | null;
  
  // Epic 3: AI assistant fields
  ai_generated: boolean;
  ai_context: string | null;
  priority: number | null;
  
  created_at: string;
  updated_at: string;
}

/**
 * Ticket Type definitions
 * Enhanced for Epic 2 (Custom Properties)
 */
export interface TicketType {
  id: string;
  name: string;
  description?: string;
  propertiesSchema: Record<string, unknown>;
  
  // Epic 2: Enhanced ticket type features
  defaultDuration?: number; // Duration in minutes
  color?: string;          // Hex color for visual identification
  userId?: string;         // User-specific ticket types
  
  createdAt: string;
  updatedAt: string;
}

export interface TicketTypeEntity {
  id: string;
  name: string;
  description: string | null;
  properties_schema: Record<string, unknown>;
  
  // Epic 2: Enhanced fields
  default_duration: number | null;
  color: string | null;
  user_id: string | null;
  
  created_at: string;
  updated_at: string;
}

// Epic 2: Custom field definitions for ticket types
export interface CustomFieldDefinition {
  name: string;
  type: 'text' | 'number' | 'checkbox' | 'date' | 'dropdown' | 'textarea';
  label?: string;
  required?: boolean;
  defaultValue?: unknown;
  options?: string[]; // For dropdown type
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface CreateTicketTypeDto {
  name: string;
  description?: string;
  customFieldSchema?: CustomFieldDefinition[];
  defaultDuration?: number;
  color?: string;
}

export interface UpdateTicketTypeDto {
  name?: string;
  description?: string;
  customFieldSchema?: CustomFieldDefinition[];
  defaultDuration?: number;
  color?: string;
}

/**
 * Agent and Collaboration types
 */
export interface Agent {
  id: string;
  name: string;
  description?: string;
  systemPrompt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentEntity {
  id: string;
  name: string;
  description: string | null;
  system_prompt: string;
  created_at: string;
  updated_at: string;
}

export interface AgentCollaboration {
  id: string;
  ticketId: string;
  agentId: string;
  status: 'active' | 'completed' | 'cancelled';
  startedAt: string;
  endedAt?: string;
  results: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AgentCollaborationEntity {
  id: string;
  ticket_id: string;
  agent_id: string;
  status: 'active' | 'completed' | 'cancelled';
  started_at: string;
  ended_at: string | null;
  results: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/**
 * Utility type to convert snake_case to camelCase
 */
export type SnakeToCamel<T extends string> = T extends `${infer A}_${infer B}`
  ? `${A}${Capitalize<SnakeToCamel<B>>}`
  : T;

/**
 * Utility type to convert camelCase to snake_case  
 */
export type CamelToSnake<T extends string> = T extends `${infer A}${infer B}`
  ? B extends Uncapitalize<B>
    ? `${Lowercase<A>}${CamelToSnake<B>}`
    : `${Lowercase<A>}_${CamelToSnake<Uncapitalize<B>>}`
  : T;
