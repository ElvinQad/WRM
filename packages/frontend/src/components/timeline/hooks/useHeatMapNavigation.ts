/**
 * Hook for managing heat map navigation integration with timeline
 */

import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { navigateToHeatMapDate, clearHeatMapSelection, setHeatMapEnabled } from '../../../store/slices/timelineSlice.ts';
import { useOptimizedActivityCalculation } from '../utils/heatMapUtils.ts';
import type { RootState } from '../../../store/index.ts';
import type { FrontendTicket } from '@wrm/types';

interface UseHeatMapNavigationOptions {
  tickets: FrontendTicket[] | undefined;
  granularity?: 'daily' | 'weekly';
}

export function useHeatMapNavigation({ tickets, granularity = 'daily' }: UseHeatMapNavigationOptions) {
  const dispatch = useDispatch();
  const { 
    startDate, 
    endDate, 
    selectedHeatMapDate, 
    heatMapEnabled,
    activityCacheVersion 
  } = useSelector((state: RootState) => state.timeline);

  // Calculate activity data for heat map with caching
  const activityData = useOptimizedActivityCalculation(
    tickets,
    { startDate, endDate },
    granularity,
    activityCacheVersion
  );

  // Extended date range for heat map display (show more context)
  const heatMapDateRange = useMemo(() => {
    const extendedStart = new Date(startDate);
    const extendedEnd = new Date(endDate);
    
    // Extend range by 2 weeks in each direction for heat map context
    extendedStart.setDate(extendedStart.getDate() - 14);
    extendedEnd.setDate(extendedEnd.getDate() + 14);
    
    return { startDate: extendedStart, endDate: extendedEnd };
  }, [startDate, endDate]);

  // Extended activity data for heat map display with caching
  const heatMapActivityData = useOptimizedActivityCalculation(
    tickets,
    heatMapDateRange,
    granularity,
    activityCacheVersion
  );

  // Navigation handlers
  const navigateToDate = useCallback((date: Date) => {
    dispatch(navigateToHeatMapDate(date));
  }, [dispatch]);

  const clearSelection = useCallback(() => {
    dispatch(clearHeatMapSelection());
  }, [dispatch]);

  const toggleHeatMap = useCallback(() => {
    dispatch(setHeatMapEnabled(!heatMapEnabled));
  }, [dispatch, heatMapEnabled]);

  // Handle date range selection (for future enhancement)
  const selectDateRange = useCallback((startDate: Date, _endDate: Date) => {
    // For now, just navigate to the start date
    // Future enhancement could support range selection
    dispatch(navigateToHeatMapDate(startDate));
  }, [dispatch]);

  // Check if a date is currently selected
  const isDateSelected = useCallback((date: Date): boolean => {
    if (!selectedHeatMapDate) return false;
    
    const selectedDay = new Date(
      selectedHeatMapDate.getFullYear(),
      selectedHeatMapDate.getMonth(),
      selectedHeatMapDate.getDate()
    );
    
    const targetDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    
    return selectedDay.getTime() === targetDay.getTime();
  }, [selectedHeatMapDate]);

  // Check if a date is in the current timeline range
  const isDateInTimeline = useCallback((date: Date): boolean => {
    return date >= startDate && date <= endDate;
  }, [startDate, endDate]);

  return {
    // Data
    activityData: heatMapActivityData,
    timelineActivityData: activityData,
    selectedDate: selectedHeatMapDate,
    isEnabled: heatMapEnabled,
    cacheVersion: activityCacheVersion,
    
    // Navigation
    navigateToDate,
    clearSelection,
    selectDateRange,
    toggleHeatMap,
    
    // Utilities
    isDateSelected,
    isDateInTimeline,
    
    // Date ranges
    timelineRange: { startDate, endDate },
    heatMapRange: heatMapDateRange,
  };
}
