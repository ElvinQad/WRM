import { 
  calculateTicketState, 
  calculateTicketStateWithColors,
  markTicketAsInteracted,
  TicketState,
  TICKET_STATE_COLORS
} from '../../frontend/src/components/timeline/utils/ticketState.ts';
import { FrontendTicket } from '@wrm/types';
import { assertEquals, assertExists } from 'https://deno.land/std@0.203.0/assert/mod.ts';

// Test data setup
function createBaseTicket(): FrontendTicket {
  return {
    id: 'test-ticket-1',
    userId: 'user-1',
    title: 'Test Ticket',
    description: 'Test description',
    startTime: '2025-08-06T10:00:00Z',
    endTime: '2025-08-06T11:00:00Z',
    start: new Date('2025-08-06T10:00:00Z'),
    end: new Date('2025-08-06T11:00:00Z'),
    typeId: 'type-1',
    customProperties: {},
    status: 'FUTURE',
    aiGenerated: false,
    createdAt: '2025-08-06T09:00:00Z',
    updatedAt: '2025-08-06T09:00:00Z'
  };
}

const currentTime = new Date('2025-08-06T12:00:00Z');

Deno.test('calculateTicketState - FUTURE for tickets scheduled in the future', () => {
  const futureTicket = {
    ...createBaseTicket(),
    startTime: '2025-08-06T14:00:00Z',
    endTime: '2025-08-06T15:00:00Z',
    start: new Date('2025-08-06T14:00:00Z'),
    end: new Date('2025-08-06T15:00:00Z')
  };

  const state = calculateTicketState(futureTicket, currentTime);
  assertEquals(state, TicketState.FUTURE);
});

Deno.test('calculateTicketState - ACTIVE for tickets currently happening', () => {
  const activeTicket = {
    ...createBaseTicket(),
    startTime: '2025-08-06T11:30:00Z',
    endTime: '2025-08-06T12:30:00Z',
    start: new Date('2025-08-06T11:30:00Z'),
    end: new Date('2025-08-06T12:30:00Z')
  };

  const state = calculateTicketState(activeTicket, currentTime);
  assertEquals(state, TicketState.ACTIVE);
});

Deno.test('calculateTicketState - UNTOUCHED for past tickets without interaction', () => {
  const untouchedTicket = {
    ...createBaseTicket(),
    startTime: '2025-08-06T08:00:00Z',
    endTime: '2025-08-06T09:00:00Z',
    start: new Date('2025-08-06T08:00:00Z'),
    end: new Date('2025-08-06T09:00:00Z'),
    lastInteraction: undefined, // No interaction
    createdAt: '2025-08-06T07:00:00Z'
  };

  const state = calculateTicketState(untouchedTicket, currentTime);
  assertEquals(state, TicketState.UNTOUCHED);
});

Deno.test('calculateTicketState - CONFIRMED for past tickets with valid interaction', () => {
  const confirmedTicket = {
    ...createBaseTicket(),
    startTime: '2025-08-06T08:00:00Z',
    endTime: '2025-08-06T09:00:00Z',
    start: new Date('2025-08-06T08:00:00Z'),
    end: new Date('2025-08-06T09:00:00Z'),
    lastInteraction: '2025-08-06T10:00:00Z', // After creation
    createdAt: '2025-08-06T07:00:00Z'
  };

  const state = calculateTicketState(confirmedTicket, currentTime);
  assertEquals(state, TicketState.CONFIRMED);
});

Deno.test('calculateTicketStateWithColors - returns correct colors for each state', () => {
  const futureTicket = {
    ...createBaseTicket(),
    startTime: '2025-08-06T14:00:00Z',
    endTime: '2025-08-06T15:00:00Z',
    start: new Date('2025-08-06T14:00:00Z'),
    end: new Date('2025-08-06T15:00:00Z')
  };

  const result = calculateTicketStateWithColors(futureTicket, currentTime);
  
  assertEquals(result.state, TicketState.FUTURE);
  assertEquals(result.borderColor, TICKET_STATE_COLORS.FUTURE.border);
  assertEquals(result.isFuture, true);
  assertEquals(result.isActive, false);
  assertEquals(result.isPast, false);
});

Deno.test('markTicketAsInteracted - updates interaction timestamps', () => {
  const baseTicket = createBaseTicket();
  const result = markTicketAsInteracted(baseTicket);

  // Check that timestamps were updated
  assertExists(result.lastInteraction);
  assertExists(result.updatedAt);

  // Check that other properties are preserved
  assertEquals(result.id, baseTicket.id);
  assertEquals(result.title, baseTicket.title);
  assertEquals(result.startTime, baseTicket.startTime);
});
