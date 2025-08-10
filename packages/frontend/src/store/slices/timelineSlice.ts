import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FrontendTicket } from '@wrm/types';
import { fetchTickets } from '../thunks/ticketThunks.ts';

export type TimelineView = 'daily' | 'weekly';

interface TimelineState {
  currentView: TimelineView;
  startDate: Date;
  endDate: Date;
  // Selective loading configuration
  selectiveLoadingEnabled: boolean;
  prefetchEnabled: boolean;
  loadedDateRanges: { start: Date; end: Date }[]; // Track what date ranges are already loaded
  // Heat map state
  heatMapEnabled: boolean;
  selectedHeatMapDate: Date | null;
  activityCacheVersion: number; // Increment to invalidate activity cache
  // Pool state - FIFO queue for unscheduled tickets
  poolTickets: FrontendTicket[]; // Ordered array - first element is first out
  poolExpanded: boolean; // Track pool expansion state
}

// Default to daily view range: 48 hours total (12h yesterday + 24h today + 12h tomorrow)
const today = new Date();
const defaultStartDate = new Date(today.getTime() - 12 * 60 * 60 * 1000); // 12 hours ago
const defaultEndDate = new Date(today.getTime() + 36 * 60 * 60 * 1000); // 36 hours from now

const initialState: TimelineState = {
  currentView: 'daily',
  startDate: defaultStartDate,
  endDate: defaultEndDate,
  selectiveLoadingEnabled: true,
  prefetchEnabled: true,
  loadedDateRanges: [],
  heatMapEnabled: true,
  selectedHeatMapDate: null,
  activityCacheVersion: 0,
  poolTickets: [], // Empty FIFO queue initially
  poolExpanded: true, // Start expanded by default
};

const timelineSlice = createSlice({
  name: 'timeline',
  initialState,
  reducers: {
    setView: (state, action: PayloadAction<TimelineView>) => {
      state.currentView = action.payload;
      
      // Adjust date range based on view
      const now = new Date();
      switch (action.payload) {
        case 'daily': {
          // Daily view: 48 hours total (12h yesterday + 24h today + 12h tomorrow)
          state.startDate = new Date(now.getTime() - 12 * 60 * 60 * 1000); // 12 hours ago
          state.endDate = new Date(now.getTime() + 36 * 60 * 60 * 1000); // 36 hours from now (12h tomorrow + 24h today)
          break;
        }
        case 'weekly': {
          const startOfWeek = new Date(now);
          const day = startOfWeek.getDay();
          const daysFromSunday = day === 0 ? 0 : day; // Sunday = 0, Monday = 1, etc.
          startOfWeek.setDate(startOfWeek.getDate() - daysFromSunday);
          startOfWeek.setHours(0, 0, 0, 0);
          
          state.startDate = startOfWeek;
          state.endDate = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days (2 weeks) from start of week
          break;
        }
      }
    },
    setDateRange: (state, action: PayloadAction<{ startDate: Date; endDate: Date }>) => {
      state.startDate = action.payload.startDate;
      state.endDate = action.payload.endDate;
    },
    navigateTimelinePrevious: (state) => {
      const currentRange = state.endDate.getTime() - state.startDate.getTime();
      const newStartDate = new Date(state.startDate.getTime() - currentRange);
      const newEndDate = new Date(state.endDate.getTime() - currentRange);
      
      state.startDate = newStartDate;
      state.endDate = newEndDate;
    },
    navigateTimelineNext: (state) => {
      const currentRange = state.endDate.getTime() - state.startDate.getTime();
      const newStartDate = new Date(state.startDate.getTime() + currentRange);
      const newEndDate = new Date(state.endDate.getTime() + currentRange);
      
      state.startDate = newStartDate;
      state.endDate = newEndDate;
    },
    setQuickRange: (state, action: PayloadAction<string>) => {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (action.payload) {
        case 'today': {
          state.startDate = startOfToday;
          state.endDate = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
          break;
        }
        case 'this-week': {
          const startOfWeek = new Date(startOfToday.getTime() - startOfToday.getDay() * 24 * 60 * 60 * 1000);
          state.startDate = startOfWeek;
          state.endDate = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        }
        case 'this-month': {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          state.startDate = startOfMonth;
          state.endDate = endOfMonth;
          break;
        }
        case 'last-7-days': {
          state.startDate = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
          state.endDate = startOfToday;
          break;
        }
        case 'last-30-days': {
          state.startDate = new Date(startOfToday.getTime() - 30 * 24 * 60 * 60 * 1000);
          state.endDate = startOfToday;
          break;
        }
        case 'next-7-days': {
          state.startDate = startOfToday;
          state.endDate = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        }
        case 'next-30-days': {
          state.startDate = startOfToday;
          state.endDate = new Date(startOfToday.getTime() + 30 * 24 * 60 * 60 * 1000);
          break;
        }
      }
    },
    // Heat map actions
    setHeatMapEnabled: (state, action: PayloadAction<boolean>) => {
      state.heatMapEnabled = action.payload;
    },
    navigateToHeatMapDate: (state, action: PayloadAction<Date>) => {
      const targetDate = action.payload;
      state.selectedHeatMapDate = targetDate;
      
      // Update timeline range to center on selected date
      if (state.currentView === 'daily') {
        // For daily view, show 48 hours total (12h yesterday + 24h today + 12h tomorrow) centered on target date
        state.startDate = new Date(targetDate.getTime() - 12 * 60 * 60 * 1000); // 12 hours before target
        state.endDate = new Date(targetDate.getTime() + 36 * 60 * 60 * 1000); // 36 hours after target
      } else if (state.currentView === 'weekly') {
        const startOfWeek = new Date(targetDate);
        const day = startOfWeek.getDay();
        const daysFromSunday = day === 0 ? 0 : day; // Sunday = 0, Monday = 1, etc.
        startOfWeek.setDate(startOfWeek.getDate() - daysFromSunday);
        startOfWeek.setHours(0, 0, 0, 0);
        
        state.startDate = startOfWeek;
        state.endDate = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days (1 week) from start of week
      }
    },
    clearHeatMapSelection: (state) => {
      state.selectedHeatMapDate = null;
    },
    invalidateActivityCache: (state) => {
      state.activityCacheVersion += 1;
    },
    // Selective loading actions
    setSelectiveLoadingEnabled: (state, action: PayloadAction<boolean>) => {
      state.selectiveLoadingEnabled = action.payload;
    },
    setPrefetchEnabled: (state, action: PayloadAction<boolean>) => {
      state.prefetchEnabled = action.payload;
    },
    addLoadedDateRange: (state, action: PayloadAction<{ start: Date; end: Date }>) => {
      state.loadedDateRanges.push(action.payload);
    },
    clearLoadedDateRanges: (state) => {
      state.loadedDateRanges = [];
    },
    
    // Pool management actions - FIFO operations
    addTicketToPool: (state, action: PayloadAction<FrontendTicket>) => {
      // Add to end of queue (FIFO - First In, First Out)
      state.poolTickets.push(action.payload);
    },
    
    removeTicketFromPool: (state, action: PayloadAction<string>) => {
      // Remove by ticket ID (can be from any position for manual scheduling)
      state.poolTickets = state.poolTickets.filter(ticket => ticket.id !== action.payload);
    },
    
    scheduleFirstTicketFromPool: (state) => {
      // Remove first ticket from pool (FIFO)
      if (state.poolTickets.length > 0) {
        state.poolTickets.shift();
      }
    },
    
    reorderPoolTickets: (state, action: PayloadAction<{ ticketId: string; newPosition: number }>) => {
      const { ticketId, newPosition } = action.payload;
      const ticketIndex = state.poolTickets.findIndex(ticket => ticket.id === ticketId);
      
      if (ticketIndex !== -1) {
        // Remove ticket from current position
        const [ticket] = state.poolTickets.splice(ticketIndex, 1);
        
        // Insert at new position (clamped to valid range)
        const targetPosition = Math.max(0, Math.min(newPosition, state.poolTickets.length));
        state.poolTickets.splice(targetPosition, 0, ticket);
      }
    },
    
    setPoolExpanded: (state, action: PayloadAction<boolean>) => {
      state.poolExpanded = action.payload;
    },
    
    clearPool: (state) => {
      state.poolTickets = [];
    },
  },
  extraReducers: (builder) => {
    // Update pool tickets when main tickets are fetched
    builder.addCase(fetchTickets.fulfilled, (state, action) => {
      // Filter tickets that are in pool and sort by pool order
      const poolTickets = action.payload
        .filter(ticket => ticket.isInPool)
        .sort((a, b) => (a.poolOrder || 0) - (b.poolOrder || 0));
      
      state.poolTickets = poolTickets;
    });
  },
});

export const { 
  setView, 
  setDateRange, 
  navigateTimelinePrevious, 
  navigateTimelineNext, 
  setQuickRange,
  setHeatMapEnabled,
  navigateToHeatMapDate,
  clearHeatMapSelection,
  invalidateActivityCache,
  setSelectiveLoadingEnabled,
  setPrefetchEnabled,
  addLoadedDateRange,
  clearLoadedDateRanges,
  // Pool actions
  addTicketToPool,
  removeTicketFromPool,
  scheduleFirstTicketFromPool,
  reorderPoolTickets,
  setPoolExpanded,
  clearPool
} = timelineSlice.actions;
export default timelineSlice.reducer;
