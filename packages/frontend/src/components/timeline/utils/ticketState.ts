import { FrontendTicket } from '@wrm/types';

/**
 * Ticket state enumeration for time-aware visualization
 * Based on Story 2.3 Acceptance Criteria
 */
export enum TicketState {
  FUTURE = 'FUTURE',
  ACTIVE = 'ACTIVE', 
  UNTOUCHED = 'UNTOUCHED',
  CONFIRMED = 'CONFIRMED'
}

/**
 * Color scheme for ticket states based on time-aware visualization
 * Following accessibility guidelines and design system
 */
export const TICKET_STATE_COLORS = {
  [TicketState.FUTURE]: {
    border: '#e5e5e5', // Standard neutral border
    background: 'transparent',
    text: '#000000'
  },
  [TicketState.ACTIVE]: {
    border: '#22c55e', // Green - currently active
    background: 'rgba(34, 197, 94, 0.1)',
    text: '#000000'
  },
  [TicketState.UNTOUCHED]: {
    border: '#ef4444', // Red - past and untouched
    background: 'rgba(239, 68, 68, 0.1)',
    text: '#000000'
  },
  [TicketState.CONFIRMED]: {
    border: '#f59e0b', // Amber - past but interacted with
    background: 'rgba(245, 158, 11, 0.1)',
    text: '#000000'
  }
} as const;

/**
 * Determine ticket state based on current time and interaction history
 * @param ticket - The ticket to evaluate
 * @param currentTime - Current timestamp (defaults to now)
 * @returns TicketState enum value
 */
export function calculateTicketState(
  ticket: FrontendTicket, 
  currentTime: Date = new Date()
): TicketState {
  const now = currentTime.getTime();
  const startTime = ticket.start.getTime();
  const endTime = ticket.end.getTime();
  
  // Future: scheduled time hasn't started yet
  if (startTime > now) {
    return TicketState.FUTURE;
  }
  
  // Active: currently within the scheduled time window
  if (startTime <= now && now <= endTime) {
    return TicketState.ACTIVE;
  }
  
  // Past tickets: time has passed, check interaction history
  if (endTime < now) {
    // Check if ticket was interacted with after creation
    // Interaction means editing title, description, or custom properties
    const lastInteraction = ticket.lastInteraction ? new Date(ticket.lastInteraction) : null;
    const createdAt = new Date(ticket.createdAt);
    
    // If there's no interaction record or last interaction equals creation time,
    // then ticket is untouched
    if (!lastInteraction || lastInteraction.getTime() === createdAt.getTime()) {
      return TicketState.UNTOUCHED;
    }
    
    // Ticket was interacted with after creation
    return TicketState.CONFIRMED;
  }
  
  // Fallback to future state
  return TicketState.FUTURE;
}

/**
 * Get color scheme for a ticket based on its state
 * @param state - The ticket state
 * @returns Color scheme object with border, background, and text colors
 */
export function getTicketStateColors(state: TicketState) {
  return TICKET_STATE_COLORS[state];
}

/**
 * Enhanced ticket state calculation with color assignment
 * Returns both state and colors for immediate use in components
 * @param ticket - The ticket to evaluate
 * @param currentTime - Current timestamp (defaults to now)
 * @returns Object with state and color information
 */
export function calculateTicketStateWithColors(
  ticket: FrontendTicket,
  currentTime: Date = new Date()
) {
  const state = calculateTicketState(ticket, currentTime);
  const colors = getTicketStateColors(state);
  
  return {
    state,
    borderColor: colors.border,
    backgroundColor: colors.background,
    textColor: colors.text,
    isActive: state === TicketState.ACTIVE,
    isPast: state === TicketState.UNTOUCHED || state === TicketState.CONFIRMED,
    isFuture: state === TicketState.FUTURE
  };
}

/**
 * Check if a timestamp represents an interaction
 * Interaction means editing title, description, or custom properties
 * Moving/resizing tickets, clicking, viewing, or opening modals do NOT count
 * @param ticket - The ticket to check
 * @param interactionTime - The timestamp of the interaction
 * @returns True if this counts as a meaningful interaction
 */
export function isValidInteraction(
  ticket: FrontendTicket,
  interactionTime: Date
): boolean {
  const createdAt = new Date(ticket.createdAt);
  
  // Interaction must be after creation
  if (interactionTime.getTime() <= createdAt.getTime()) {
    return false;
  }
  
  // In a real implementation, we would check what fields were modified
  // For now, we assume any lastInteraction timestamp after creation is valid
  return true;
}

/**
 * Update ticket interaction timestamp for state calculation
 * Should be called when title, description, or custom properties are edited
 * @param ticket - The ticket being updated
 * @returns Updated ticket with new lastInteraction timestamp
 */
export function markTicketAsInteracted(ticket: FrontendTicket): FrontendTicket {
  return {
    ...ticket,
    lastInteraction: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
