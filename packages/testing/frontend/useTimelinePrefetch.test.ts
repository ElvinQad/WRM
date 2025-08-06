import { describe, it, expect, vi, beforeEach, afterEach } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import timelineSlice from '../../../frontend/src/store/slices/timelineSlice.ts';
import { useTimelinePrefetch } from '../../../frontend/src/components/timeline/hooks/useTimelinePrefetch.ts';

// Mock store setup
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      timeline: timelineSlice,
    },
    preloadedState: {
      timeline: {
        currentView: 'daily',
        startDate: new Date('2025-08-06T00:00:00.000Z'),
        endDate: new Date('2025-08-08T00:00:00.000Z'),
        selectiveLoadingEnabled: true,
        prefetchEnabled: true,
        loadedDateRanges: [],
        heatMapEnabled: true,
        selectedHeatMapDate: null,
        activityCacheVersion: 0,
        ...initialState,
      },
    },
  });
};

const wrapper = ({ children, store }: { children: React.ReactNode; store: any }) => (
  <Provider store={store}>{children}</Provider>
);

describe('useTimelinePrefetch', () => {
  let mockLoadTimelineData: ReturnType<typeof vi.fn>;
  let store: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    mockLoadTimelineData = vi.fn().mockResolvedValue(undefined);
    store = createMockStore();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('isDateRangeLoaded', () => {
    it('should return false when no ranges are loaded', () => {
      const { result } = renderHook(
        () => useTimelinePrefetch(mockLoadTimelineData, 100),
        { wrapper: ({ children }) => wrapper({ children, store }) }
      );

      const isLoaded = result.current.isDateRangeLoaded(
        new Date('2025-08-01T00:00:00.000Z'),
        new Date('2025-08-02T00:00:00.000Z')
      );

      expect(isLoaded).toBe(false);
    });

    it('should return true when range is already loaded', () => {
      const storeWithLoadedRanges = createMockStore({
        loadedDateRanges: [
          {
            start: new Date('2025-08-01T00:00:00.000Z'),
            end: new Date('2025-08-03T00:00:00.000Z'),
          },
        ],
      });

      const { result } = renderHook(
        () => useTimelinePrefetch(mockLoadTimelineData, 100),
        { wrapper: ({ children }) => wrapper({ children, store: storeWithLoadedRanges }) }
      );

      const isLoaded = result.current.isDateRangeLoaded(
        new Date('2025-08-01T12:00:00.000Z'),
        new Date('2025-08-02T12:00:00.000Z')
      );

      expect(isLoaded).toBe(true);
    });
  });

  describe('prefetch functionality', () => {
    it('should not prefetch when prefetchEnabled is false', async () => {
      const storeWithPrefetchDisabled = createMockStore({
        prefetchEnabled: false,
      });

      renderHook(
        () => useTimelinePrefetch(mockLoadTimelineData, 100),
        { wrapper: ({ children }) => wrapper({ children, store: storeWithPrefetchDisabled }) }
      );

      // Fast forward past debounce time
      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(mockLoadTimelineData).not.toHaveBeenCalled();
    });

    it('should debounce prefetch calls', async () => {
      const { result } = renderHook(
        () => useTimelinePrefetch(mockLoadTimelineData, 500),
        { wrapper: ({ children }) => wrapper({ children, store }) }
      );

      // Trigger multiple prefetch calls rapidly
      act(() => {
        result.current.triggerPrefetch();
        result.current.triggerPrefetch();
        result.current.triggerPrefetch();
      });

      // Should not have called yet (debounced)
      expect(mockLoadTimelineData).not.toHaveBeenCalled();

      // Fast forward past debounce time
      act(() => {
        vi.advanceTimersByTime(600);
      });

      // Should have called load function for adjacent ranges
      expect(mockLoadTimelineData).toHaveBeenCalled();
    });

    it('should calculate correct adjacent ranges for daily view', async () => {
      const { result } = renderHook(
        () => useTimelinePrefetch(mockLoadTimelineData, 100),
        { wrapper: ({ children }) => wrapper({ children, store }) }
      );

      act(() => {
        result.current.triggerPrefetch();
      });

      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Should call load function twice (previous and next periods)
      expect(mockLoadTimelineData).toHaveBeenCalledTimes(2);

      // Check the called date ranges
      const calls = mockLoadTimelineData.mock.calls;
      
      // Previous period: should start 48 hours before current start
      const prevCall = calls.find(call => call[0] < new Date('2025-08-06T00:00:00.000Z'));
      expect(prevCall).toBeTruthy();
      
      // Next period: should start after current end
      const nextCall = calls.find(call => call[0] >= new Date('2025-08-08T00:00:00.000Z'));
      expect(nextCall).toBeTruthy();
    });

    it('should calculate correct adjacent ranges for weekly view', async () => {
      const weeklyStore = createMockStore({
        currentView: 'weekly',
        startDate: new Date('2025-08-03T00:00:00.000Z'), // Sunday
        endDate: new Date('2025-08-17T00:00:00.000Z'),   // 2 weeks later
      });

      const { result } = renderHook(
        () => useTimelinePrefetch(mockLoadTimelineData, 100),
        { wrapper: ({ children }) => wrapper({ children, store: weeklyStore }) }
      );

      act(() => {
        result.current.triggerPrefetch();
      });

      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Should call load function twice (previous and next 2-week periods)
      expect(mockLoadTimelineData).toHaveBeenCalledTimes(2);

      const calls = mockLoadTimelineData.mock.calls;
      
      // Previous period: should start 14 days before current start
      const prevCall = calls.find(call => call[0] < new Date('2025-08-03T00:00:00.000Z'));
      expect(prevCall).toBeTruthy();
      
      // Next period: should start after current end
      const nextCall = calls.find(call => call[0] >= new Date('2025-08-17T00:00:00.000Z'));
      expect(nextCall).toBeTruthy();
    });

    it('should not prefetch already loaded ranges', async () => {
      const storeWithLoadedRanges = createMockStore({
        loadedDateRanges: [
          // Previous range already loaded
          {
            start: new Date('2025-08-04T00:00:00.000Z'),
            end: new Date('2025-08-06T00:00:00.000Z'),
          },
          // Next range already loaded
          {
            start: new Date('2025-08-08T00:00:00.000Z'),
            end: new Date('2025-08-10T00:00:00.000Z'),
          },
        ],
      });

      const { result } = renderHook(
        () => useTimelinePrefetch(mockLoadTimelineData, 100),
        { wrapper: ({ children }) => wrapper({ children, store: storeWithLoadedRanges }) }
      );

      act(() => {
        result.current.triggerPrefetch();
      });

      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Should not have called load function since ranges are already loaded
      expect(mockLoadTimelineData).not.toHaveBeenCalled();
    });

    it('should handle load errors gracefully', async () => {
      mockLoadTimelineData.mockRejectedValue(new Error('Network error'));
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const { result } = renderHook(
        () => useTimelinePrefetch(mockLoadTimelineData, 100),
        { wrapper: ({ children }) => wrapper({ children, store }) }
      );

      act(() => {
        result.current.triggerPrefetch();
      });

      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Should have attempted to load
      expect(mockLoadTimelineData).toHaveBeenCalled();
      
      // Should log warning for failed prefetch
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to prefetch'),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('performPrefetch', () => {
    it('should execute prefetch immediately without debouncing', async () => {
      const { result } = renderHook(
        () => useTimelinePrefetch(mockLoadTimelineData, 500),
        { wrapper: ({ children }) => wrapper({ children, store }) }
      );

      await act(async () => {
        await result.current.performPrefetch();
      });

      // Should have called immediately without waiting for debounce
      expect(mockLoadTimelineData).toHaveBeenCalled();
    });
  });
});
