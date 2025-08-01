import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimelineDrag } from './useTimelineDrag.ts';
import type { Ticket } from '../types.ts';

// Mock ticket data
const mockTickets: Ticket[] = [
  {
    id: 'ticket-1',
    title: 'Test Ticket 1',
    start: new Date('2024-01-01T10:00:00Z'),
    end: new Date('2024-01-01T12:00:00Z'),
    description: 'Test description',
    category: 'work',
  },
  {
    id: 'ticket-2',
    title: 'Test Ticket 2',
    start: new Date('2024-01-01T14:00:00Z'),
    end: new Date('2024-01-01T16:00:00Z'),
    description: 'Test description 2',
    category: 'personal',
  },
];

const defaultProps = {
  scrollLeft: 0,
  allTickets: mockTickets,
  pixelsPerMinute: 2,
  startTime: new Date('2024-01-01T00:00:00Z').getTime(),
  onTicketUpdate: vi.fn(),
};

describe('useTimelineDrag', () => {
  let mockContainer: Partial<HTMLDivElement>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create a mock container with getBoundingClientRect
    mockContainer = {
      getBoundingClientRect: vi.fn(() => ({
        left: 0,
        top: 0,
        width: 1000,
        height: 600,
        right: 1000,
        bottom: 600,
        x: 0,
        y: 0,
        toJSON: vi.fn(),
      })),
    };
  });

  it('should initialize with default drag state', () => {
    const { result } = renderHook(() => useTimelineDrag(
      defaultProps.scrollLeft,
      defaultProps.allTickets,
      defaultProps.pixelsPerMinute,
      defaultProps.startTime,
      defaultProps.onTicketUpdate
    ));

    expect(result.current.dragState.isDragging).toBe(false);
    expect(result.current.dragState.ticketId).toBe(null);
    expect(result.current.dragState.dragType).toBe(null);
  });

  it('should handle ticket mouse down for move operation', () => {
    const { result } = renderHook(() => useTimelineDrag(
      defaultProps.scrollLeft,
      defaultProps.allTickets,
      defaultProps.pixelsPerMinute,
      defaultProps.startTime,
      defaultProps.onTicketUpdate
    ));

    // Set up the container ref
    result.current.containerRef.current = mockContainer as HTMLDivElement;

    const mockEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clientX: 1220, // Middle of the ticket (ticket starts at 1200px = 10 hours * 2 pixels/min * 60 min/hour)
      clientY: 100,
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.handleTicketMouseDown(mockEvent, mockTickets[0], 0);
    });

    expect(result.current.dragState.isDragging).toBe(true);
    expect(result.current.dragState.ticketId).toBe('ticket-1');
    expect(result.current.dragState.dragType).toBe('move');
  });

  it('should handle ticket mouse down for resize-start operation', () => {
    const { result } = renderHook(() => useTimelineDrag(
      defaultProps.scrollLeft,
      defaultProps.allTickets,
      defaultProps.pixelsPerMinute,
      defaultProps.startTime,
      defaultProps.onTicketUpdate
    ));

    // Set up the container ref
    result.current.containerRef.current = mockContainer as HTMLDivElement;

    const mockEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clientX: 1205, // Near left edge of ticket (1200 + 5px)
      clientY: 100,
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.handleTicketMouseDown(mockEvent, mockTickets[0], 0);
    });

    expect(result.current.dragState.isDragging).toBe(true);
    expect(result.current.dragState.ticketId).toBe('ticket-1');
    expect(result.current.dragState.dragType).toBe('resize-start');
  });

  it('should handle ticket mouse down for resize-end operation', () => {
    const { result } = renderHook(() => useTimelineDrag(
      defaultProps.scrollLeft,
      defaultProps.allTickets,
      defaultProps.pixelsPerMinute,
      defaultProps.startTime,
      defaultProps.onTicketUpdate
    ));

    // Set up the container ref
    result.current.containerRef.current = mockContainer as HTMLDivElement;

    const mockEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clientX: 1435, // Near right edge of ticket (1440 - 5px)
      clientY: 100,
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.handleTicketMouseDown(mockEvent, mockTickets[0], 0);
    });

    expect(result.current.dragState.isDragging).toBe(true);
    expect(result.current.dragState.ticketId).toBe('ticket-1');
    expect(result.current.dragState.dragType).toBe('resize-end');
  });

  it('should handle mouse move during drag', () => {
    const { result } = renderHook(() => useTimelineDrag(
      defaultProps.scrollLeft,
      defaultProps.allTickets,
      defaultProps.pixelsPerMinute,
      defaultProps.startTime,
      defaultProps.onTicketUpdate
    ));

    // Set up the container ref
    result.current.containerRef.current = mockContainer as HTMLDivElement;

    // Start dragging
    const startEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clientX: 1220,
      clientY: 100,
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.handleTicketMouseDown(startEvent, mockTickets[0], 0);
    });

    // Move mouse
    const moveEvent = {
      clientX: 1320, // Move 100px to the right
      clientY: 150, // Move down to different lane
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.handleMouseMove(moveEvent);
    });

    expect(result.current.dragState.isDragging).toBe(true);
    expect(defaultProps.onTicketUpdate).toHaveBeenCalled();
  });

  it('should handle mouse up to end drag', () => {
    const { result } = renderHook(() => useTimelineDrag(
      defaultProps.scrollLeft,
      defaultProps.allTickets,
      defaultProps.pixelsPerMinute,
      defaultProps.startTime,
      defaultProps.onTicketUpdate
    ));

    // Set up the container ref
    result.current.containerRef.current = mockContainer as HTMLDivElement;

    // Start dragging
    const startEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clientX: 1220,
      clientY: 100,
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.handleTicketMouseDown(startEvent, mockTickets[0], 0);
    });

    expect(result.current.dragState.isDragging).toBe(true);

    // End drag
    act(() => {
      result.current.handleMouseUp();
    });

    expect(result.current.dragState.isDragging).toBe(false);
    expect(result.current.dragState.ticketId).toBe(null);
  });

  it('should not handle mouse move when not dragging', () => {
    const { result } = renderHook(() => useTimelineDrag(
      defaultProps.scrollLeft,
      defaultProps.allTickets,
      defaultProps.pixelsPerMinute,
      defaultProps.startTime,
      defaultProps.onTicketUpdate
    ));

    const moveEvent = {
      clientX: 600,
      clientY: 150,
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.handleMouseMove(moveEvent);
    });

    expect(defaultProps.onTicketUpdate).not.toHaveBeenCalled();
  });

  it('should enforce minimum duration during resize', () => {
    const { result } = renderHook(() => useTimelineDrag(
      defaultProps.scrollLeft,
      defaultProps.allTickets,
      defaultProps.pixelsPerMinute,
      defaultProps.startTime,
      defaultProps.onTicketUpdate
    ));

    // Set up the container ref
    result.current.containerRef.current = mockContainer as HTMLDivElement;

    // Start resize-end dragging
    const startEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clientX: 1435, // Near right edge
      clientY: 100,
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.handleTicketMouseDown(startEvent, mockTickets[0], 0);
    });

    // Try to make the ticket too small
    const moveEvent = {
      clientX: 1210, // Try to make it very small
      clientY: 100,
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.handleMouseMove(moveEvent);
    });

    // Verify that minimum duration is enforced
    expect(defaultProps.onTicketUpdate).toHaveBeenCalled();
    const updatedTicket = defaultProps.onTicketUpdate.mock.calls[0][0];
    const duration = updatedTicket.end.getTime() - updatedTicket.start.getTime();
    expect(duration).toBeGreaterThanOrEqual(5 * 60 * 1000); // 5 minutes minimum
  });

  it('should handle lane changes during vertical drag', () => {
    const { result } = renderHook(() => useTimelineDrag(
      defaultProps.scrollLeft,
      defaultProps.allTickets,
      defaultProps.pixelsPerMinute,
      defaultProps.startTime,
      defaultProps.onTicketUpdate
    ));

    // Set up the container ref
    result.current.containerRef.current = mockContainer as HTMLDivElement;

    // Start dragging for move
    const startEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clientX: 1220,
      clientY: 100, // Lane 0
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.handleTicketMouseDown(startEvent, mockTickets[0], 0);
    });

    // Move to different lane
    const moveEvent = {
      clientX: 1220, // Same horizontal position
      clientY: 200, // Different lane
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.handleMouseMove(moveEvent);
    });

    expect(defaultProps.onTicketUpdate).toHaveBeenCalled();
  });
});
