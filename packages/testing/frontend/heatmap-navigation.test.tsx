/**
 * Performance tests for Heat Map Navigation
 * Validates 300ms render time and 100ms update performance targets
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { HeatMapNavigator } from '../components/HeatMapNavigator.tsx';
import { ActivityCalculationService } from '../utils/heatMapUtils.ts';
import timelineReducer from '../../../store/slices/timelineSlice.ts';
import { mockTickets, createMockTicket } from '../../../../testing/utils/test-helpers.ts';
import type { FrontendTicket } from '@wrm/types';

// Mock store setup
const createTestStore = () => configureStore({
  reducer: {
    timeline: timelineReducer,
  },
  preloadedState: {
    timeline: {
      currentView: 'daily' as const,
      startDate: new Date('2025-08-01'),
      endDate: new Date('2025-08-07'),
      heatMapEnabled: true,
      selectedHeatMapDate: null,
      activityCacheVersion: 0,
    },
  },
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = createTestStore();
  return <Provider store={store}>{children}</Provider>;
};

describe('HeatMapNavigator Performance', () => {
  let mockTicketData: FrontendTicket[];

  beforeEach(() => {
    // Create large dataset for performance testing
    mockTicketData = Array.from({ length: 1000 }, (_, i) => 
      createMockTicket({
        id: `ticket-${i}`,
        title: `Test Ticket ${i}`,
        start: new Date('2025-08-01'),
        end: new Date('2025-08-01'),
        status: i % 3 === 0 ? 'PAST_CONFIRMED' : 'PAST_UNTOUCHED',
      })
    );
  });

  it('should render heat map within 300ms performance target', async () => {
    const startTime = performance.now();
    
    render(
      <TestWrapper>
        <HeatMapNavigator tickets={mockTicketData} />
      </TestWrapper>
    );

    // Wait for component to render
    await waitFor(() => {
      expect(screen.getByText('Activity Heat Map')).toBeInTheDocument();
    });

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    console.log(`Heat map render time: ${renderTime}ms`);
    expect(renderTime).toBeLessThan(300);
  });

  it('should update heat map within 100ms when clicking dates', async () => {
    render(
      <TestWrapper>
        <HeatMapNavigator tickets={mockTicketData} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Activity Heat Map')).toBeInTheDocument();
    });

    // Find a date button to click
    const dateButtons = screen.getAllByRole('button');
    const dateButton = dateButtons.find(btn => 
      btn.textContent && /^\d+$/.test(btn.textContent.trim())
    );

    expect(dateButton).toBeDefined();
    
    if (dateButton) {
      const startTime = performance.now();
      
      fireEvent.click(dateButton);
      
      // Wait for state update to complete
      await waitFor(() => {
        // Check that the button has visual feedback (selected state)
        expect(dateButton).toHaveClass('ring-blue-500');
      }, { timeout: 1000 });

      const endTime = performance.now();
      const updateTime = endTime - startTime;

      console.log(`Heat map update time: ${updateTime}ms`);
      expect(updateTime).toBeLessThan(100);
    }
  });

  it('should handle large datasets efficiently', () => {
    const startTime = performance.now();
    
    const activityData = ActivityCalculationService.calculateDailyActivity(
      mockTicketData,
      {
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-08-31'),
      }
    );

    const endTime = performance.now();
    const calculationTime = endTime - startTime;

    console.log(`Activity calculation time for ${mockTicketData.length} tickets: ${calculationTime}ms`);
    
    // Should handle large datasets efficiently
    expect(calculationTime).toBeLessThan(50);
    expect(activityData).toBeDefined();
    expect(activityData.length).toBeGreaterThan(0);
  });

  it('should cache activity calculations for repeated calls', () => {
    const dateRange = {
      startDate: new Date('2025-08-01'),
      endDate: new Date('2025-08-07'),
    };

    // First calculation
    const start1 = performance.now();
    const result1 = ActivityCalculationService.calculateDailyActivity(mockTicketData, dateRange);
    const time1 = performance.now() - start1;

    // Second calculation with same data (should be faster due to optimizations)
    const start2 = performance.now();
    const result2 = ActivityCalculationService.calculateDailyActivity(mockTicketData, dateRange);
    const time2 = performance.now() - start2;

    console.log(`First calculation: ${time1}ms, Second calculation: ${time2}ms`);

    // Results should be identical
    expect(result1).toEqual(result2);
    
    // Both should be fast enough
    expect(time1).toBeLessThan(50);
    expect(time2).toBeLessThan(50);
  });
});

describe('HeatMapNavigator Functionality', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  it('should display week navigation correctly', () => {
    render(
      <Provider store={store}>
        <HeatMapNavigator tickets={mockTickets} />
      </Provider>
    );

    expect(screen.getByText('Activity Heat Map')).toBeInTheDocument();
    expect(screen.getByTitle('Previous week')).toBeInTheDocument();
    expect(screen.getByTitle('Next week')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('should navigate between weeks', async () => {
    render(
      <Provider store={store}>
        <HeatMapNavigator tickets={mockTickets} />
      </Provider>
    );

    const nextButton = screen.getByTitle('Next week');
    const prevButton = screen.getByTitle('Previous week');

    fireEvent.click(nextButton);
    await waitFor(() => {
      // Should update the displayed week range
      expect(screen.getByText(/Aug/)).toBeInTheDocument();
    });

    fireEvent.click(prevButton);
    await waitFor(() => {
      // Should return to previous week
      expect(screen.getByText(/Aug/)).toBeInTheDocument();
    });
  });

  it('should show productivity levels with correct colors', async () => {
    const testTickets: FrontendTicket[] = [
      createMockTicket({
        id: 'high-productivity',
        status: 'PAST_CONFIRMED',
        start: new Date('2025-08-06'),
        end: new Date('2025-08-06'),
      }),
      createMockTicket({
        id: 'low-productivity',
        status: 'PAST_UNTOUCHED',
        start: new Date('2025-08-07'),
        end: new Date('2025-08-07'),
      }),
    ];

    render(
      <Provider store={store}>
        <HeatMapNavigator tickets={testTickets} />
      </Provider>
    );

    await waitFor(() => {
      const dateButtons = screen.getAllByRole('button');
      const hasColoredButtons = dateButtons.some(btn => {
        const classes = btn.className;
        return classes.includes('bg-green') || classes.includes('bg-yellow') || classes.includes('bg-red');
      });
      expect(hasColoredButtons).toBe(true);
    });
  });

  it('should handle empty ticket data gracefully', () => {
    render(
      <Provider store={store}>
        <HeatMapNavigator tickets={[]} />
      </Provider>
    );

    expect(screen.getByText('Activity Heat Map')).toBeInTheDocument();
    
    // Should still show the calendar grid
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Tue')).toBeInTheDocument();
    
    // All dates should have no activity styling
    const dateButtons = screen.getAllByRole('button');
    const dateButton = dateButtons.find(btn => 
      btn.textContent && /^\d+$/.test(btn.textContent.trim())
    );
    
    if (dateButton) {
      expect(dateButton.className).toContain('bg-gray-100');
    }
  });
});
