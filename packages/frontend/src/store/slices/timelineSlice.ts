import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type TimelineView = 'daily' | 'weekly';

interface TimelineState {
  currentView: TimelineView;
  startDate: Date;
  endDate: Date;
}

// Default to a 7-day range centered on today
const today = new Date();
const defaultStartDate = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
const defaultEndDate = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days from now

const initialState: TimelineState = {
  currentView: 'daily',
  startDate: defaultStartDate,
  endDate: defaultEndDate,
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
        case 'daily':
          state.startDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
          state.endDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days from now
          break;
        case 'weekly':
          state.startDate = new Date(now.getTime() - 10.5 * 24 * 60 * 60 * 1000); // 1.5 weeks ago
          state.endDate = new Date(now.getTime() + 10.5 * 24 * 60 * 60 * 1000); // 1.5 weeks from now (total 3 weeks)
          break;
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
  },
});

export const { setView, setDateRange, navigateTimelinePrevious, navigateTimelineNext, setQuickRange } = timelineSlice.actions;
export default timelineSlice.reducer;
