/**
 * Service for calculating heat map activity data from ticket completion status
 */

import { useMemo } from 'react';
import { FrontendTicket } from '@wrm/types';

export interface ActivityData {
  date: Date;
  completionCount: number;
  totalTickets: number;
  productivity: 'low' | 'medium' | 'high';
}

export interface ActivityCalculationOptions {
  /** Start date for activity calculation */
  startDate: Date;
  /** End date for activity calculation */
  endDate: Date;
  /** Productivity thresholds for categorization */
  thresholds?: {
    high: number; // Default: 0.8 (80% completion rate)
    medium: number; // Default: 0.5 (50% completion rate)
  };
}

/**
 * Calculates daily activity data for heat map visualization
 */
export class ActivityCalculationService {
  private static readonly DEFAULT_THRESHOLDS = {
    high: 0.8,
    medium: 0.5,
  };

  /**
   * Calculate activity data for each day in the specified range
   */
  static calculateDailyActivity(
    tickets: FrontendTicket[],
    options: ActivityCalculationOptions
  ): ActivityData[] {
    const { startDate, endDate, thresholds = this.DEFAULT_THRESHOLDS } = options;
    const activityMap = new Map<string, ActivityData>();

    // Initialize all dates in range with zero activity
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = this.getDateKey(currentDate);
      activityMap.set(dateKey, {
        date: new Date(currentDate),
        completionCount: 0,
        totalTickets: 0,
        productivity: 'low',
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Process tickets and accumulate activity data
    for (const ticket of tickets) {
      const activityDates = this.getTicketActivityDates(ticket, startDate, endDate);
      
      for (const activityDate of activityDates) {
        const dateKey = this.getDateKey(activityDate.date);
        const existing = activityMap.get(dateKey);
        
        if (existing) {
          existing.totalTickets += 1;
          if (activityDate.isCompleted) {
            existing.completionCount += 1;
          }
        }
      }
    }

    // Calculate productivity levels for each day
    const result: ActivityData[] = [];
    for (const activity of activityMap.values()) {
      if (activity.totalTickets > 0) {
        const completionRate = activity.completionCount / activity.totalTickets;
        activity.productivity = this.calculateProductivityLevel(completionRate, thresholds);
      }
      result.push(activity);
    }

    return result.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Calculate weekly aggregated activity data
   */
  static calculateWeeklyActivity(
    tickets: FrontendTicket[],
    options: ActivityCalculationOptions
  ): ActivityData[] {
    const dailyActivity = this.calculateDailyActivity(tickets, options);
    const weeklyMap = new Map<string, ActivityData>();

    for (const daily of dailyActivity) {
      const weekKey = this.getWeekKey(daily.date);
      const existing = weeklyMap.get(weekKey);

      if (existing) {
        existing.completionCount += daily.completionCount;
        existing.totalTickets += daily.totalTickets;
      } else {
        const weekStart = this.getStartOfWeek(daily.date);
        weeklyMap.set(weekKey, {
          date: weekStart,
          completionCount: daily.completionCount,
          totalTickets: daily.totalTickets,
          productivity: 'low', // Will be recalculated
        });
      }
    }

    // Recalculate productivity levels for weekly data
    const result: ActivityData[] = [];
    for (const activity of weeklyMap.values()) {
      if (activity.totalTickets > 0) {
        const completionRate = activity.completionCount / activity.totalTickets;
        activity.productivity = this.calculateProductivityLevel(completionRate, options.thresholds || this.DEFAULT_THRESHOLDS);
      }
      result.push(activity);
    }

    return result.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Get activity dates for a ticket (when it was active/completed)
   */
  private static getTicketActivityDates(
    ticket: FrontendTicket,
    rangeStart: Date,
    rangeEnd: Date
  ): Array<{ date: Date; isCompleted: boolean }> {
    const activityDates: Array<{ date: Date; isCompleted: boolean }> = [];
    
    // Determine completion status based on ticket status and timing
    const isCompleted = this.isTicketCompleted(ticket);
    const ticketDate = this.getTicketActivityDate(ticket);
    
    // Only include dates within the range
    if (ticketDate >= rangeStart && ticketDate <= rangeEnd) {
      activityDates.push({
        date: new Date(ticketDate.getFullYear(), ticketDate.getMonth(), ticketDate.getDate()),
        isCompleted,
      });
    }

    return activityDates;
  }

  /**
   * Determine if a ticket is completed based on its status
   */
  private static isTicketCompleted(ticket: FrontendTicket): boolean {
    // For now, consider PAST_CONFIRMED as completed
    // ACTIVE could be partially completed, FUTURE and PAST_UNTOUCHED are not completed
    return ticket.status === 'PAST_CONFIRMED';
  }

  /**
   * Get the primary activity date for a ticket
   * Uses lastInteraction if available, otherwise uses endTime
   */
  private static getTicketActivityDate(ticket: FrontendTicket): Date {
    if (ticket.lastInteraction) {
      return new Date(ticket.lastInteraction);
    }
    return ticket.end;
  }

  /**
   * Calculate productivity level based on completion rate
   */
  private static calculateProductivityLevel(
    completionRate: number,
    thresholds: { high: number; medium: number }
  ): 'low' | 'medium' | 'high' {
    if (completionRate >= thresholds.high) {
      return 'high';
    } else if (completionRate >= thresholds.medium) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Get a string key for a date (YYYY-MM-DD)
   */
  private static getDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Get a string key for a week (YYYY-WW)
   */
  private static getWeekKey(date: Date): string {
    const year = date.getFullYear();
    const weekStart = this.getStartOfWeek(date);
    const yearStart = new Date(year, 0, 1);
    const weekNumber = Math.ceil(((weekStart.getTime() - yearStart.getTime()) / 86400000 + yearStart.getDay() + 1) / 7);
    return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
  }

  /**
   * Get the start of the week (Monday) for a given date
   */
  private static getStartOfWeek(date: Date): Date {
    const result = new Date(date);
    const day = result.getDay();
    const diff = (day < 1 ? 7 : 0) + day - 1; // Monday = 1
    result.setDate(result.getDate() - diff);
    result.setHours(0, 0, 0, 0);
    return result;
  }
}

/**
 * Hook for calculating and managing heat map activity data with caching
 */
export function useActivityCalculation(
  tickets: FrontendTicket[] | undefined,
  dateRange: { startDate: Date; endDate: Date },
  granularity: 'daily' | 'weekly' = 'daily'
): ActivityData[] {
  // Use useMemo for performance optimization - only recalculate when dependencies change
  const activityData = useMemo(() => {
    // Handle undefined or empty tickets
    if (!tickets || tickets.length === 0) {
      return [];
    }

    return granularity === 'weekly' 
      ? ActivityCalculationService.calculateWeeklyActivity(tickets, dateRange)
      : ActivityCalculationService.calculateDailyActivity(tickets, dateRange);
  }, [tickets, dateRange.startDate, dateRange.endDate, granularity]);

  return activityData;
}

/**
 * Performance-optimized hook with caching for large datasets
 */
export function useOptimizedActivityCalculation(
  tickets: FrontendTicket[] | undefined,
  dateRange: { startDate: Date; endDate: Date },
  granularity: 'daily' | 'weekly' = 'daily',
  cacheKey?: string | number
): ActivityData[] {
  // Cache results based on cache key (e.g., from Redux cache version)
  const memoizedResult = useMemo(() => {
    // Handle undefined or empty tickets
    if (!tickets || tickets.length === 0) {
      return [];
    }

    const startTime = performance.now();
    
    const result = granularity === 'weekly' 
      ? ActivityCalculationService.calculateWeeklyActivity(tickets, dateRange)
      : ActivityCalculationService.calculateDailyActivity(tickets, dateRange);
    
    const endTime = performance.now();
    console.debug(`Heat map calculation took ${endTime - startTime}ms for ${tickets.length} tickets`);
    
    return result;
  }, [
    tickets?.length || 0, // Safe access with fallback
    tickets ? JSON.stringify(tickets.map(t => ({ id: t.id, status: t.status, endTime: t.end }))) : '[]', // Safe stringify
    dateRange.startDate.getTime(),
    dateRange.endDate.getTime(),
    granularity,
    cacheKey,
  ]);

  return memoizedResult;
}
