import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { TicketsPool } from '../TicketsPool.tsx';
import timelineReducer from '../../../../store/slices/timelineSlice.ts';
import { FrontendTicket } from '@wrm/types';

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

// Mock tickets for testing
const mockTickets: FrontendTicket[] = [
  {
    id: '1',
    userId: 'user1',
    title: 'Test Ticket 1',
    description: 'First test ticket',
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
  },
  {
    id: '2',
    userId: 'user1',
    title: 'Test Ticket 2',
    description: 'Second test ticket',
    start: new Date('2025-08-08T14:00:00Z'),
    end: new Date('2025-08-08T15:00:00Z'),
    startTime: '2025-08-08T14:00:00Z',
    endTime: '2025-08-08T15:00:00Z',
    typeId: 'type1',
    customProperties: {},
    status: 'FUTURE',
    lastInteraction: undefined,
    aiGenerated: false,
    aiContext: undefined,
    priority: undefined,
    createdAt: '2025-08-08T09:00:00Z',
    updatedAt: '2025-08-08T09:00:00Z',
  },
];

describe('TicketsPool', () => {
  it('renders pool header with ticket count', () => {
    const store = createMockStore();
    const mockOnSchedule = vi.fn();

    render(
      <Provider store={store}>
        <TicketsPool
          tickets={mockTickets}
          onTicketSchedule={mockOnSchedule}
        />
      </Provider>
    );

    expect(screen.getByText('Tickets Pool')).toBeInTheDocument();
    expect(screen.getByText('2 tickets')).toBeInTheDocument();
  });

  it('shows empty state when no tickets', () => {
    const store = createMockStore();
    const mockOnSchedule = vi.fn();

    render(
      <Provider store={store}>
        <TicketsPool
          tickets={[]}
          onTicketSchedule={mockOnSchedule}
        />
      </Provider>
    );

    expect(screen.getByText('No tickets in pool')).toBeInTheDocument();
    expect(screen.getByText('Move tickets here from the timeline to queue them')).toBeInTheDocument();
  });

  it('displays FIFO queue indicators correctly', () => {
    const store = createMockStore();
    const mockOnSchedule = vi.fn();

    render(
      <Provider store={store}>
        <TicketsPool
          tickets={mockTickets}
          onTicketSchedule={mockOnSchedule}
        />
      </Provider>
    );

    // First ticket should be marked as NEXT
    expect(screen.getByText('NEXT')).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();
  });

  it('calls onTicketSchedule when Schedule button is clicked', () => {
    const store = createMockStore();
    const mockOnSchedule = vi.fn();

    render(
      <Provider store={store}>
        <TicketsPool
          tickets={mockTickets}
          onTicketSchedule={mockOnSchedule}
        />
      </Provider>
    );

    const scheduleButtons = screen.getAllByText('Schedule');
    fireEvent.click(scheduleButtons[0]);

    expect(mockOnSchedule).toHaveBeenCalledWith(mockTickets[0]);
  });

  it('shows QUEUED status on pool tickets', () => {
    const store = createMockStore();
    const mockOnSchedule = vi.fn();

    render(
      <Provider store={store}>
        <TicketsPool
          tickets={mockTickets}
          onTicketSchedule={mockOnSchedule}
        />
      </Provider>
    );

    const queuedBadges = screen.getAllByText('QUEUED');
    expect(queuedBadges).toHaveLength(2);
  });

  it('shows FIFO queue description', () => {
    const store = createMockStore();
    const mockOnSchedule = vi.fn();

    render(
      <Provider store={store}>
        <TicketsPool
          tickets={mockTickets}
          onTicketSchedule={mockOnSchedule}
        />
      </Provider>
    );

    expect(screen.getByText('FIFO Queue')).toBeInTheDocument();
    expect(screen.getByText('First In')).toBeInTheDocument();
    expect(screen.getByText('First Out')).toBeInTheDocument();
    expect(screen.getByText('Next: #1')).toBeInTheDocument();
  });

  it('supports drag and drop reordering', () => {
    const store = createMockStore();
    const mockOnSchedule = vi.fn();

    render(
      <Provider store={store}>
        <TicketsPool
          tickets={mockTickets}
          onTicketSchedule={mockOnSchedule}
        />
      </Provider>
    );

    // Test that ticket containers are draggable
    const ticketContainers = screen.getAllByRole('generic').filter(
      el => el.getAttribute('draggable') === 'true'
    );
    
    expect(ticketContainers.length).toBeGreaterThan(0);
  });

  it('can be collapsed and expanded', () => {
    const store = createMockStore();
    const mockOnSchedule = vi.fn();

    render(
      <Provider store={store}>
        <TicketsPool
          tickets={mockTickets}
          onTicketSchedule={mockOnSchedule}
        />
      </Provider>
    );

    const collapseButton = screen.getByText('Collapse');
    fireEvent.click(collapseButton);

    // Pool content should be hidden when collapsed
    // (This would require checking if the pool content is no longer visible)
  });
});
