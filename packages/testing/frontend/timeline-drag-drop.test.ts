import { assertEquals, assertExists } from "https://deno.land/std@0.208.0/assert/mod.ts";
import type { FrontendTicket } from "@wrm/types";

// Test data
const createMockTicket = (id: string, startHour: number, endHour: number): FrontendTicket => ({
  id,
  title: `Test Ticket ${id}`,
  description: `Test description for ${id}`,
  userId: 'user-123',
  startTime: new Date(`2024-01-01T${startHour.toString().padStart(2, '0')}:00:00Z`).toISOString(),
  endTime: new Date(`2024-01-01T${endHour.toString().padStart(2, '0')}:00:00Z`).toISOString(),
  typeId: 'work',
  customProperties: {},
  status: 'FUTURE',
  aiGenerated: false,
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date('2024-01-01').toISOString(),
  start: new Date(`2024-01-01T${startHour.toString().padStart(2, '0')}:00:00Z`),
  end: new Date(`2024-01-01T${endHour.toString().padStart(2, '0')}:00:00Z`),
  category: 'work',
});

const mockTickets: FrontendTicket[] = [
  createMockTicket('ticket-1', 10, 12),
  createMockTicket('ticket-2', 14, 16),
];

// Mock drag state interface
interface DragState {
  isDragging: boolean;
  ticketId: string | null;
  dragType: 'move' | 'resize-start' | 'resize-end' | null;
  startX: number;
  startY: number;
  originalStart?: number;
  originalEnd?: number;
}

// Simplified drag logic for testing
class TimelineDragHandler {
  private dragState: DragState = {
    isDragging: false,
    ticketId: null,
    dragType: null,
    startX: 0,
    startY: 0,
  };

  constructor(
    private scrollLeft: number,
    private allTickets: FrontendTicket[],
    private pixelsPerMinute: number,
    private startTime: number,
    private onTicketUpdate: (ticket: FrontendTicket) => void
  ) {}

  getDragState(): DragState {
    return { ...this.dragState };
  }

  handleTicketMouseDown(
    clientX: number,
    clientY: number,
    ticket: FrontendTicket,
    _ticketIndex: number
  ): void {
    const ticketStartTime = new Date(ticket.startTime).getTime();
    const ticketEndTime = new Date(ticket.endTime).getTime();
    const ticketStart = this.getTicketPosition(ticketStartTime);
    const ticketEnd = this.getTicketPosition(ticketEndTime);
    const relativeX = clientX - ticketStart;
    const ticketWidth = ticketEnd - ticketStart;

    let dragType: 'move' | 'resize-start' | 'resize-end';
    
    if (relativeX < 10) {
      dragType = 'resize-start';
    } else if (relativeX > ticketWidth - 10) {
      dragType = 'resize-end';
    } else {
      dragType = 'move';
    }

    this.dragState = {
      isDragging: true,
      ticketId: ticket.id,
      dragType,
      startX: clientX,
      startY: clientY,
      originalStart: ticketStartTime,
      originalEnd: ticketEndTime,
    };
  }

  private getTicketPosition(timestamp: number): number {
    const minutesFromStart = (timestamp - this.startTime) / (1000 * 60);
    return minutesFromStart * this.pixelsPerMinute;
  }

  handleMouseMove(clientX: number, _clientY: number): FrontendTicket | null {
    if (!this.dragState.isDragging || !this.dragState.ticketId) return null;

    const ticket = this.allTickets.find(t => t.id === this.dragState.ticketId);
    if (!ticket) return null;

    const deltaX = clientX - this.dragState.startX;
    const deltaMinutes = deltaX / this.pixelsPerMinute;
    const deltaMs = deltaMinutes * 60 * 1000;

    let newStart = this.dragState.originalStart!;
    let newEnd = this.dragState.originalEnd!;

    switch (this.dragState.dragType) {
      case 'move':
        newStart += deltaMs;
        newEnd += deltaMs;
        break;
      case 'resize-start':
        newStart += deltaMs;
        break;
      case 'resize-end':
        newEnd += deltaMs;
        break;
    }

    return {
      ...ticket,
      startTime: new Date(newStart).toISOString(),
      endTime: new Date(newEnd).toISOString(),
      start: new Date(newStart),
      end: new Date(newEnd),
    };
  }

  handleMouseUp(): void {
    this.dragState = {
      isDragging: false,
      ticketId: null,
      dragType: null,
      startX: 0,
      startY: 0,
    };
  }
}

Deno.test("TimelineDrag - should initialize with default state", () => {
  const handler = new TimelineDragHandler(
    0, // scrollLeft
    mockTickets,
    2, // pixelsPerMinute  
    new Date('2024-01-01T00:00:00Z').getTime(),
    () => {}
  );

  const dragState = handler.getDragState();
  assertEquals(dragState.isDragging, false);
  assertEquals(dragState.ticketId, null);
  assertEquals(dragState.dragType, null);
});

Deno.test("TimelineDrag - should detect move operation in middle of ticket", () => {
  const handler = new TimelineDragHandler(
    0,
    mockTickets,
    2,
    new Date('2024-01-01T00:00:00Z').getTime(),
    () => {}
  );

  // Ticket starts at 10:00 = 600 minutes = 1200 pixels
  // Click in middle of 2-hour ticket (1220 pixels)
  handler.handleTicketMouseDown(1220, 100, mockTickets[0], 0);

  const dragState = handler.getDragState();
  assertEquals(dragState.isDragging, true);
  assertEquals(dragState.ticketId, 'ticket-1');
  assertEquals(dragState.dragType, 'move');
});

Deno.test("TimelineDrag - should detect resize-start operation near left edge", () => {
  const handler = new TimelineDragHandler(
    0,
    mockTickets,
    2,
    new Date('2024-01-01T00:00:00Z').getTime(),
    () => {}
  );

  // Click near left edge (1205 pixels = start + 5px)
  handler.handleTicketMouseDown(1205, 100, mockTickets[0], 0);

  const dragState = handler.getDragState();
  assertEquals(dragState.isDragging, true);
  assertEquals(dragState.ticketId, 'ticket-1');
  assertEquals(dragState.dragType, 'resize-start');
});

Deno.test("TimelineDrag - should detect resize-end operation near right edge", () => {
  const handler = new TimelineDragHandler(
    0,
    mockTickets,
    2,
    new Date('2024-01-01T00:00:00Z').getTime(),
    () => {}
  );

  // Ticket ends at 12:00 = 720 minutes = 1440 pixels
  // Click near right edge (1435 pixels = end - 5px)
  handler.handleTicketMouseDown(1435, 100, mockTickets[0], 0);

  const dragState = handler.getDragState();
  assertEquals(dragState.isDragging, true);
  assertEquals(dragState.ticketId, 'ticket-1');
  assertEquals(dragState.dragType, 'resize-end');
});

Deno.test("TimelineDrag - should handle move operation correctly", () => {
  const handler = new TimelineDragHandler(
    0,
    mockTickets,
    2,
    new Date('2024-01-01T00:00:00Z').getTime(),
    () => {}
  );

  // Start drag
  handler.handleTicketMouseDown(1220, 100, mockTickets[0], 0);
  
  // Move 60 pixels right (30 minutes)
  const updatedTicket = handler.handleMouseMove(1280, 100);

  assertExists(updatedTicket);
  
  const originalStart = new Date(mockTickets[0].startTime).getTime();
  const originalEnd = new Date(mockTickets[0].endTime).getTime();
  const expectedDelta = 30 * 60 * 1000; // 30 minutes in ms

  assertEquals(new Date(updatedTicket.startTime).getTime(), originalStart + expectedDelta);
  assertEquals(new Date(updatedTicket.endTime).getTime(), originalEnd + expectedDelta);
});

Deno.test("TimelineDrag - should handle resize-start operation correctly", () => {
  const handler = new TimelineDragHandler(
    0,
    mockTickets,
    2,
    new Date('2024-01-01T00:00:00Z').getTime(),
    () => {}
  );

  // Start resize from left edge
  handler.handleTicketMouseDown(1205, 100, mockTickets[0], 0);
  
  // Move 30 pixels right (15 minutes later start)
  const updatedTicket = handler.handleMouseMove(1235, 100);

  assertExists(updatedTicket);
  
  const originalStart = new Date(mockTickets[0].startTime).getTime();
  const originalEnd = new Date(mockTickets[0].endTime).getTime();
  const expectedDelta = 15 * 60 * 1000; // 15 minutes in ms

  assertEquals(new Date(updatedTicket.startTime).getTime(), originalStart + expectedDelta);
  assertEquals(new Date(updatedTicket.endTime).getTime(), originalEnd); // End shouldn't change
});

Deno.test("TimelineDrag - should handle resize-end operation correctly", () => {
  const handler = new TimelineDragHandler(
    0,
    mockTickets,
    2,
    new Date('2024-01-01T00:00:00Z').getTime(),
    () => {}
  );

  // Start resize from right edge
  handler.handleTicketMouseDown(1435, 100, mockTickets[0], 0);
  
  // Move 40 pixels right (20 minutes later end)
  const updatedTicket = handler.handleMouseMove(1475, 100);

  assertExists(updatedTicket);
  
  const originalStart = new Date(mockTickets[0].startTime).getTime();
  const originalEnd = new Date(mockTickets[0].endTime).getTime();
  const expectedDelta = 20 * 60 * 1000; // 20 minutes in ms

  assertEquals(new Date(updatedTicket.startTime).getTime(), originalStart); // Start shouldn't change
  assertEquals(new Date(updatedTicket.endTime).getTime(), originalEnd + expectedDelta);
});

Deno.test("TimelineDrag - should reset state on mouse up", () => {
  const handler = new TimelineDragHandler(
    0,
    mockTickets,
    2,
    new Date('2024-01-01T00:00:00Z').getTime(),
    () => {}
  );

  // Start drag
  handler.handleTicketMouseDown(1220, 100, mockTickets[0], 0);
  
  // Verify dragging
  let dragState = handler.getDragState();
  assertEquals(dragState.isDragging, true);
  
  // End drag
  handler.handleMouseUp();
  
  // Verify reset
  dragState = handler.getDragState();
  assertEquals(dragState.isDragging, false);
  assertEquals(dragState.ticketId, null);
  assertEquals(dragState.dragType, null);
});

Deno.test("TimelineDrag - should handle edge case of no ticket found", () => {
  const handler = new TimelineDragHandler(
    0,
    [],
    2,
    new Date('2024-01-01T00:00:00Z').getTime(),
    () => {}
  );

  // Start drag with empty tickets array
  handler.handleTicketMouseDown(1220, 100, mockTickets[0], 0);
  
  // Try to move
  const updatedTicket = handler.handleMouseMove(1280, 100);
  
  assertEquals(updatedTicket, null);
});
