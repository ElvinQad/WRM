import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createElement } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useTicketsPool } from './useTicketsPool.ts';
import timelineReducer from '../../../store/slices/timelineSlice.ts';
import { FrontendTicket } from '@wrm/types';
import type { ReactNode } from 'react';

// Mock Redux store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      timeline: timelineReducer,
    },
    preloadedState: {
      timeline: {
        currentView: 'daily' as const,
        startDate: new Date(),
        endDate: new Date(),
        selectiveLoadingEnabled: true,
        prefetchEnabled: true,
        loadedDateRanges: [],
        heatMapEnabled: true,
        selectedHeatMapDate: null,
        activityCacheVersion: 0,
        poolTickets: [],
        poolExpanded: true,
        ...initialState,
      },
    },
  });
};

// Wrapper component for hook testing
const createWrapper = (store: ReturnType<typeof createMockStore>) => {
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
};

// Mock ticket for testing
const mockTicket: FrontendTicket = {
  id: 'test-ticket-1',
  userId: 'user1',
  title: 'Test Ticket',
  description: 'Test description',
  start: new Date('2025-08-08T10:00:00Z'),
  end: new Date('2025-08-08T11:00:00Z'),
  startTime: '2025-08-08T10:00:00Z',
  endTime: '2025-08-08T11:00:00Z',
  typeId: 'type1',
  customProperties: {},
  status: 'FUTURE',
  lastInteraction: undefined,
  aiGenerated: false,
  aiContext: undefined,
  priority: undefined,
  createdAt: '2025-08-08T09:00:00Z',
  updatedAt: '2025-08-08T09:00:00Z',
};

describe('useTicketsPool', () => {
  it('returns initial empty pool state', () => {
    const store = createMockStore();
    const wrapper = createWrapper(store);

    const { result } = renderHook(() => useTicketsPool(), { wrapper });

    expect(result.current.poolTickets).toEqual([]);
    expect(result.current.poolExpanded).toBe(true);
    expect(result.current.isPoolEmpty).toBe(true);
    expect(result.current.nextTicketToSchedule).toBe(null);
    expect(result.current.poolCount).toBe(0);
  });

  it('adds tickets to pool using FIFO order', () => {
    const store = createMockStore();
    const wrapper = createWrapper(store);

    const { result } = renderHook(() => useTicketsPool(), { wrapper });

    act(() => {
      result.current.moveTicketToPool(mockTicket);
    });

    const state = store.getState();
    expect(state.timeline.poolTickets).toHaveLength(1);
    expect(state.timeline.poolTickets[0]).toEqual(mockTicket);
  });

  it('removes tickets from pool when scheduling', () => {
    const initialPoolTickets = [mockTicket];
    const store = createMockStore({
      poolTickets: initialPoolTickets,
    });
    const wrapper = createWrapper(store);

    const { result } = renderHook(() => useTicketsPool(), { wrapper });

    expect(result.current.poolTickets).toHaveLength(1);
    expect(result.current.nextTicketToSchedule).toEqual(mockTicket);

    act(() => {
      result.current.scheduleTicketFromPool(mockTicket);
    });

    const state = store.getState();
    expect(state.timeline.poolTickets).toHaveLength(0);
  });

  it('handles pool reordering', () => {
    const ticket1 = { ...mockTicket, id: 'ticket-1', title: 'Ticket 1' };
    const ticket2 = { ...mockTicket, id: 'ticket-2', title: 'Ticket 2' };
    const initialPoolTickets = [ticket1, ticket2];
    
    const store = createMockStore({
      poolTickets: initialPoolTickets,
    });
    const wrapper = createWrapper(store);

    const { result } = renderHook(() => useTicketsPool(), { wrapper });

    // Reorder ticket2 to position 0 (move to front)
    act(() => {
      result.current.reorderPoolTicket('ticket-2', 0);
    });

    const state = store.getState();
    expect(state.timeline.poolTickets[0].id).toBe('ticket-2');
    expect(state.timeline.poolTickets[1].id).toBe('ticket-1');
  });

  it('correctly identifies next ticket to schedule', () => {
    const ticket1 = { ...mockTicket, id: 'ticket-1', title: 'First Ticket' };
    const ticket2 = { ...mockTicket, id: 'ticket-2', title: 'Second Ticket' };
    const initialPoolTickets = [ticket1, ticket2];
    
    const store = createMockStore({
      poolTickets: initialPoolTickets,
    });
    const wrapper = createWrapper(store);

    const { result } = renderHook(() => useTicketsPool(), { wrapper });

    expect(result.current.nextTicketToSchedule).toEqual(ticket1);
    expect(result.current.poolCount).toBe(2);
    expect(result.current.isPoolEmpty).toBe(false);
  });

  it('reflects pool expansion state', () => {
    const store = createMockStore({
      poolExpanded: false,
    });
    const wrapper = createWrapper(store);

    const { result } = renderHook(() => useTicketsPool(), { wrapper });

    expect(result.current.poolExpanded).toBe(false);
  });
});
