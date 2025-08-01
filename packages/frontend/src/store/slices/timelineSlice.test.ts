import { describe, it, expect } from 'vitest';
import timelineReducer, { setView, setDateRange, TimelineView } from '@/store/slices/timelineSlice.ts';

describe('timelineSlice', () => {
  // Mock a consistent initial state for testing
  const mockInitialState = {
    currentView: 'daily' as TimelineView,
    startDate: new Date('2025-01-01T00:00:00.000Z'),
    endDate: new Date('2025-01-07T00:00:00.000Z'),
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
    
    // Daily view should have a 6-day range (3 days before + 3 days after)
    const rangeDuration = actual.endDate.getTime() - actual.startDate.getTime();
    const expectedDuration = 6 * 24 * 60 * 60 * 1000; // 6 days
    expect(rangeDuration).toBe(expectedDuration);
  });

  it('should handle setView to daily and adjust date range', () => {
    const actual = timelineReducer(mockInitialState, setView('daily'));
    expect(actual.currentView).toBe('daily');
    
    // Daily view should have a 6-day range (3 days each side)
    const rangeDuration = actual.endDate.getTime() - actual.startDate.getTime();
    const expectedDuration = 6 * 24 * 60 * 60 * 1000; // 6 days
    expect(rangeDuration).toBe(expectedDuration);
  });

  it('should handle setView to weekly and adjust date range', () => {
    const actual = timelineReducer(mockInitialState, setView('weekly'));
    expect(actual.currentView).toBe('weekly');
    
    // Weekly view should have a 21-day range (1.5 weeks each side = 3 weeks total)
    const rangeDuration = actual.endDate.getTime() - actual.startDate.getTime();
    const expectedDuration = 21 * 24 * 60 * 60 * 1000; // 21 days
    expect(rangeDuration).toBe(expectedDuration);
  });

  it('should handle setView to monthly and adjust date range', () => {
    const actual = timelineReducer(mockInitialState, setView('monthly'));
    expect(actual.currentView).toBe('monthly');
    
    // Monthly view should have a 180-day range (3 months each side)
    const rangeDuration = actual.endDate.getTime() - actual.startDate.getTime();
    const expectedDuration = 180 * 24 * 60 * 60 * 1000; // 180 days
    expect(rangeDuration).toBe(expectedDuration);
  });

  it('should handle setDateRange action', () => {
    const newStartDate = new Date('2025-02-01T00:00:00.000Z');
    const newEndDate = new Date('2025-02-15T00:00:00.000Z');
    
    const actual = timelineReducer(
      mockInitialState, 
      setDateRange({ startDate: newStartDate, endDate: newEndDate })
    );
    
    expect(actual.startDate).toEqual(newStartDate);
    expect(actual.endDate).toEqual(newEndDate);
    expect(actual.currentView).toBe('daily'); // Should remain unchanged
  });

  it('should ensure all views have valid date ranges', () => {
        const views: TimelineView[] = ['daily', 'weekly', 'monthly'];
    
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
    expect(Object.keys(actual)).toHaveLength(3);
  });
});
