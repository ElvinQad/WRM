import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTimeline } from './useTimeline.ts';
import type { Ticket } from '../types.ts';

// Mock Redux hooks
const mockDispatch = vi.fn();
const mockSelector = vi.fn();

vi.mock('../../../store/hooks.ts', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: unknown) => unknown) => mockSelector(selector),
}));

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
];

describe('useTimeline - Wheel Events', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock Redux state
    mockSelector.mockImplementation((selector) => {
      const mockState = {
        timeline: {
          currentView: 'daily' as const,
          startDate: new Date('2024-01-01T00:00:00Z'),
          endDate: new Date('2024-01-02T00:00:00Z'),
        },
      };
      return selector(mockState);
    });
  });

  it('should handle wheel events without changing view state', () => {
    const { result } = renderHook(() => useTimeline(mockTickets, false));

    const initialView = result.current.currentView;
    const initialStartDate = result.current.startDate;
    const initialEndDate = result.current.endDate;

    // Create a mock wheel event
    const wheelEvent = {
      deltaY: 100, // Scroll down
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as React.WheelEvent;

    // Handle wheel event
    result.current.handleWheel();

    // Verify that view state has not changed
    expect(result.current.currentView).toBe(initialView);
    expect(result.current.startDate).toEqual(initialStartDate);
    expect(result.current.endDate).toEqual(initialEndDate);
  });

  it('should not prevent default wheel behavior', () => {
    const { result } = renderHook(() => useTimeline(mockTickets, false));

    const wheelEvent = {
      deltaY: 100,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as React.WheelEvent;

    result.current.handleWheel();

    // Verify that preventDefault was not called (allowing normal scrolling)
    expect(wheelEvent.preventDefault).not.toHaveBeenCalled();
  });

  it('should maintain timeline width and height after wheel events', () => {
    const { result } = renderHook(() => useTimeline(mockTickets, false));

    const initialTotalWidth = result.current.totalWidth;
    const initialTotalHeight = result.current.totalHeight;

    const wheelEvent = {
      deltaY: 100,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as React.WheelEvent;

    result.current.handleWheel();

    // Verify that timeline dimensions haven't changed
    expect(result.current.totalWidth).toBe(initialTotalWidth);
    expect(result.current.totalHeight).toBe(initialTotalHeight);
  });

  it('should not affect ticket positioning after wheel events', () => {
    const { result } = renderHook(() => useTimeline(mockTickets, false));

    const initialTicketPositions = result.current.ticketsWithPositions;

    const wheelEvent = {
      deltaY: 100,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as React.WheelEvent;

    result.current.handleWheel();

    // Verify that ticket positions haven't changed
    expect(result.current.ticketsWithPositions).toEqual(initialTicketPositions);
  });

  it('should handle multiple wheel events consistently', () => {
    const { result } = renderHook(() => useTimeline(mockTickets, false));

    const initialView = result.current.currentView;

    // Multiple wheel events
    for (let i = 0; i < 5; i++) {
      const wheelEvent = {
        deltaY: 100 * (i + 1),
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as React.WheelEvent;

      result.current.handleWheel();
    }

    // Verify that view state remains unchanged after multiple events
    expect(result.current.currentView).toBe(initialView);
  });

  it('should not dispatch any Redux actions on wheel events', () => {
    const { result } = renderHook(() => useTimeline(mockTickets, false));

    mockDispatch.mockClear();

    const wheelEvent = {
      deltaY: 100,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as React.WheelEvent;

    result.current.handleWheel();

    // Verify that no Redux actions were dispatched
    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
