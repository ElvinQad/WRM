import { describe, it, expect } from 'vitest';
import timelineReducer, { setView, TimelineView } from '@/store/slices/timelineSlice.ts';

describe('timelineSlice', () => {
  // Mock a consistent initial state for testing
  const mockInitialState = {
    currentView: 'daily' as TimelineView,
    startDate: new Date('2025-01-01T00:00:00.000Z'),
    endDate: new Date('2025-01-07T00:00:00.000Z'),
    heatMapEnabled: true,
    selectedHeatMapDate: null,
    activityCacheVersion: 0,
  };

  it('should handle initial state with date range', () => {
    const actual = timelineReducer(undefined, { type: 'unknown' });
    expect(actual).toHaveProperty('currentView');
    expect(actual).toHaveProperty('startDate');
    expect(actual).toHaveProperty('endDate');
    expect(actual.currentView).toBe('daily');
    expect(actual.startDate).toBeInstanceOf(Date);
    expect(actual.endDate).toBeInstanceOf(Date);
  });

  it('should handle setView to daily and adjust date range', () => {
    const actual = timelineReducer(mockInitialState, setView('daily'));
    expect(actual.currentView).toBe('daily');
    
    // Daily view should have a 48-hour range (12h yesterday + 24h today + 12h tomorrow)
    const rangeDuration = actual.endDate.getTime() - actual.startDate.getTime();
    const expectedDuration = 48 * 60 * 60 * 1000; // 48 hours
    expect(rangeDuration).toBe(expectedDuration);
  });

  it('should handle setView to daily and adjust date range', () => {
    const actual = timelineReducer(mockInitialState, setView('daily'));
    expect(actual.currentView).toBe('daily');
    
    // Daily view should have a 48-hour range (12h yesterday + 24h today + 12h tomorrow)
    const rangeDuration = actual.endDate.getTime() - actual.startDate.getTime();
    const expectedDuration = 48 * 60 * 60 * 1000; // 48 hours
    expect(rangeDuration).toBe(expectedDuration);
  });

  it('should handle setView to weekly and adjust date range', () => {
    const actual = timelineReducer(mockInitialState, setView('weekly'));
    expect(actual.currentView).toBe('weekly');
    
    // Weekly view should have a 7-day range (current week only)
    const rangeDuration = actual.endDate.getTime() - actual.startDate.getTime();
    const expectedDuration = 7 * 24 * 60 * 60 * 1000; // 7 days
    expect(rangeDuration).toBe(expectedDuration);
  });

  it('should ensure all views have valid date ranges', () => {
    const views: TimelineView[] = ['daily', 'weekly'];
    
    views.forEach(view => {
      const actual = timelineReducer(mockInitialState, setView(view));
      
      expect(actual.endDate.getTime()).toBeGreaterThan(actual.startDate.getTime());
      expect(actual.startDate).toBeInstanceOf(Date);
      expect(actual.endDate).toBeInstanceOf(Date);
    });
  });

  it('should maintain state structure consistency', () => {
    const actual = timelineReducer(mockInitialState, setView('weekly'));
    
    expect(actual).toHaveProperty('currentView');
    expect(actual).toHaveProperty('startDate');
    expect(actual).toHaveProperty('endDate');
    expect(actual).toHaveProperty('heatMapEnabled');
    expect(actual).toHaveProperty('selectedHeatMapDate');
    expect(actual).toHaveProperty('activityCacheVersion');
  });

  it('should calculate daily view time ranges correctly across different hours', () => {
    // Test that daily view calculation works correctly regardless of current time
    const mockStateAfternoon = {
      ...mockInitialState,
      startDate: new Date('2025-01-01T14:00:00.000Z'), // 2 PM
    };
    
    const actual = timelineReducer(mockStateAfternoon, setView('daily'));
    
    // Should still be 48 hours total
    const rangeDuration = actual.endDate.getTime() - actual.startDate.getTime();
    const expectedDuration = 48 * 60 * 60 * 1000; // 48 hours
    expect(rangeDuration).toBe(expectedDuration);
  });

  it('should calculate weekly view to start on Sunday', () => {
    const actual = timelineReducer(mockInitialState, setView('weekly'));
    
    // Weekly view should start on Sunday (day 0)
    expect(actual.startDate.getDay()).toBe(0);
    
    // Should be exactly 7 days
    const rangeDuration = actual.endDate.getTime() - actual.startDate.getTime();
    const expectedDuration = 7 * 24 * 60 * 60 * 1000; // 7 days
    expect(rangeDuration).toBe(expectedDuration);
  });
});
