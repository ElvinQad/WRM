import { useEffect, useCallback, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../../../store/hooks.ts';
import { addLoadedDateRange } from '../../../store/slices/timelineSlice.ts';

/**
 * Hook for background prefetching of adjacent timeline periods
 * Implements AC 3: Background loading prefetches adjacent periods
 */
export function useTimelinePrefetch(
  loadTimelineData: (startDate: Date, endDate: Date) => Promise<void>,
  debounceMs: number = 500
) {
  const dispatch = useAppDispatch();
  const currentView = useAppSelector((state) => state.timeline.currentView);
  const startDate = useAppSelector((state) => state.timeline.startDate);
  const endDate = useAppSelector((state) => state.timeline.endDate);
  const prefetchEnabled = useAppSelector((state) => state.timeline.prefetchEnabled);
  const loadedDateRanges = useAppSelector((state) => state.timeline.loadedDateRanges);

  const prefetchTimeoutRef = useRef<number | null>(null);
  const lastPrefetchedRef = useRef<string>('');

  /**
   * Checks if a date range is already loaded
   */
  const isDateRangeLoaded = useCallback((start: Date, end: Date): boolean => {
    return loadedDateRanges.some((range: { start: Date; end: Date }) => 
      range.start <= start && range.end >= end
    );
  }, [loadedDateRanges]);

  /**
   * Calculates adjacent date ranges for prefetching
   */
  const calculateAdjacentRanges = useCallback((view: typeof currentView, baseStart: Date, baseEnd: Date) => {
    const ranges: { start: Date; end: Date; type: 'previous' | 'next' }[] = [];
    
    switch (view) {
      case 'daily': {
        // For daily view: prefetch previous and next 48-hour windows
        const rangeDuration = baseEnd.getTime() - baseStart.getTime();
        
        // Previous period
        const prevStart = new Date(baseStart.getTime() - rangeDuration);
        const prevEnd = new Date(baseStart.getTime());
        ranges.push({ start: prevStart, end: prevEnd, type: 'previous' });
        
        // Next period
        const nextStart = new Date(baseEnd.getTime());
        const nextEnd = new Date(baseEnd.getTime() + rangeDuration);
        ranges.push({ start: nextStart, end: nextEnd, type: 'next' });
        break;
      }
      case 'weekly': {
        // For weekly view: prefetch previous and next 2-week windows
        const rangeDuration = baseEnd.getTime() - baseStart.getTime(); // 14 days
        
        // Previous 2-week period
        const prevStart = new Date(baseStart.getTime() - rangeDuration);
        const prevEnd = new Date(baseStart.getTime());
        ranges.push({ start: prevStart, end: prevEnd, type: 'previous' });
        
        // Next 2-week period
        const nextStart = new Date(baseEnd.getTime());
        const nextEnd = new Date(baseEnd.getTime() + rangeDuration);
        ranges.push({ start: nextStart, end: nextEnd, type: 'next' });
        break;
      }
    }
    
    return ranges;
  }, []);

  /**
   * Performs the actual prefetch operation
   */
  const performPrefetch = useCallback(async () => {
    if (!prefetchEnabled) return;

    const adjacentRanges = calculateAdjacentRanges(currentView, startDate, endDate);
    
    // Prefetch ranges that aren't already loaded
    for (const range of adjacentRanges) {
      if (!isDateRangeLoaded(range.start, range.end)) {
        try {
          await loadTimelineData(range.start, range.end);
          dispatch(addLoadedDateRange({ start: range.start, end: range.end }));
        } catch (error) {
          console.warn(`Failed to prefetch ${range.type} timeline data:`, error);
        }
      }
    }
  }, [
    prefetchEnabled,
    currentView,
    startDate,
    endDate,
    calculateAdjacentRanges,
    isDateRangeLoaded,
    loadTimelineData,
    dispatch
  ]);

  /**
   * Debounced prefetch trigger
   */
  const triggerPrefetch = useCallback(() => {
    if (!prefetchEnabled) return;

    // Clear existing timeout
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current);
    }

    // Create unique key for current view state
    const stateKey = `${currentView}-${startDate.getTime()}-${endDate.getTime()}`;
    
    // Don't prefetch if we just did for this exact state
    if (lastPrefetchedRef.current === stateKey) {
      return;
    }

    // Set debounced timeout
    prefetchTimeoutRef.current = setTimeout(() => {
      lastPrefetchedRef.current = stateKey;
      performPrefetch();
    }, debounceMs);
  }, [prefetchEnabled, currentView, startDate, endDate, debounceMs, performPrefetch]);

  /**
   * Trigger prefetch when view or date range changes
   */
  useEffect(() => {
    triggerPrefetch();
    
    return () => {
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current);
      }
    };
  }, [triggerPrefetch]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current);
      }
    };
  }, []);

  return {
    isDateRangeLoaded,
    triggerPrefetch: () => triggerPrefetch(),
    performPrefetch,
  };
}
