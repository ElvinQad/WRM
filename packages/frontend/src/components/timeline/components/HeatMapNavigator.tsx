import { useState, useCallback, useMemo } from 'react';
import { ActivityData } from '../utils/heatMapUtils.ts';
import { useHeatMapNavigation } from '../hooks/useHeatMapNavigation.ts';
import type { FrontendTicket } from '@wrm/types';
import type { TimelineView } from '../../../store/slices/timelineSlice.ts';

// Date utility functions (using native Date methods)
function formatDate(date: Date, format: string): string {
  if (format === 'MMM dd, yyyy') {
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  }
  if (format === 'MMM dd') {
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  }
  if (format === 'd') {
    return date.getDate().toString();
  }
  return date.toLocaleDateString();
}

function startOfWeek(date: Date, weekStartsOn: number): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  result.setDate(result.getDate() - diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function endOfWeek(date: Date, weekStartsOn: number): Date {
  const result = startOfWeek(date, weekStartsOn);
  result.setDate(result.getDate() + 6);
  result.setHours(23, 59, 59, 999);
  return result;
}

function eachDayOfInterval(interval: { start: Date; end: Date }): Date[] {
  const days: Date[] = [];
  const current = new Date(interval.start);
  
  while (current <= interval.end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return days;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

function addWeeks(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount * 7);
  return result;
}

function addMonths(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + amount);
  return result;
}

function subMonths(date: Date, amount: number): Date {
  return addMonths(date, -amount);
}

function startOfMonth(date: Date): Date {
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
}

function endOfMonth(date: Date): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1, 0);
  result.setHours(23, 59, 59, 999);
  return result;
}

function getWeeksInMonth(date: Date): Date[][] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  
  // Start from the first day of the week containing the first day of the month
  const calendarStart = startOfWeek(monthStart, 1);
  // End at the last day of the week containing the last day of the month
  const calendarEnd = endOfWeek(monthEnd, 1);
  
  const weeks: Date[][] = [];
  let currentWeekStart = new Date(calendarStart);
  
  while (currentWeekStart <= calendarEnd) {
    const weekEnd = endOfWeek(currentWeekStart, 1);
    const daysInWeek = eachDayOfInterval({ start: currentWeekStart, end: weekEnd });
    weeks.push(daysInWeek);
    currentWeekStart = addWeeks(currentWeekStart, 1);
  }
  
  return weeks;
}

interface HeatMapNavigatorProps {
  /** Tickets to calculate activity from */
  tickets: FrontendTicket[] | undefined;
  /** Current timeline view to determine heat map mode */
  currentView: TimelineView;
  /** Optional className for styling */
  className?: string;
}

export function HeatMapNavigator({
  tickets,
  currentView,
  className = '',
}: HeatMapNavigatorProps) {
  // Use the heat map navigation hook
  const {
    activityData,
    isEnabled,
    navigateToDate,
    isDateSelected,
  } = useHeatMapNavigation({ tickets, granularity: 'daily' });

  // Current period being displayed in the heat map
  const [currentPeriod, setCurrentPeriod] = useState(new Date());

  // Determine display mode based on timeline view
  const isWeeklyMode = currentView === 'weekly';
  
  // Calculate the display data based on view mode
  const { displayData, periodStart, navigationUnit } = useMemo(() => {
    if (isWeeklyMode) {
      // Monthly view for weekly timeline
      const weeks = getWeeksInMonth(currentPeriod);
      return {
        displayData: weeks,
        periodStart: startOfMonth(currentPeriod),
        navigationUnit: 'month' as const,
      };
    } else {
      // Single week view for daily timeline
      const weekStart = startOfWeek(currentPeriod, 1);
      const weekEnd = endOfWeek(currentPeriod, 1);
      const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
      return {
        displayData: [daysInWeek], // Wrap in array to match weeks format
        periodStart: weekStart,
        navigationUnit: 'week' as const,
      };
    }
  }, [currentPeriod, isWeeklyMode]);

  // Navigation handlers
  const navigateToPrevious = useCallback(() => {
    setCurrentPeriod(prev => 
      isWeeklyMode ? subMonths(prev, 1) : addWeeks(prev, -1)
    );
  }, [isWeeklyMode]);

  const navigateToNext = useCallback(() => {
    setCurrentPeriod(prev => 
      isWeeklyMode ? addMonths(prev, 1) : addWeeks(prev, 1)
    );
  }, [isWeeklyMode]);

  const navigateToCurrent = useCallback(() => {
    setCurrentPeriod(new Date());
  }, []);

  // Get activity data for a specific date
  const getActivityForDate = useCallback((date: Date): ActivityData | null => {
    return activityData.find(activity => isSameDay(activity.date, date)) || null;
  }, [activityData]);

  // Get color intensity based on productivity level - GitHub style dark theme
  const getHeatMapColor = useCallback((activity: ActivityData | null): string => {
    if (!activity || activity.totalTickets === 0) {
      return 'bg-gray-800 hover:bg-gray-700 border-gray-700'; // No activity - dark gray
    }

    const completionRate = activity.completionCount / activity.totalTickets;
    
    switch (activity.productivity) {
      case 'high':
        return completionRate >= 0.8 
          ? 'bg-green-400 hover:bg-green-300 border-green-500' // Bright green
          : 'bg-green-500 hover:bg-green-400 border-green-600'; // Medium green
      case 'medium':
        return completionRate >= 0.6 
          ? 'bg-green-600 hover:bg-green-500 border-green-700' // Dark green
          : 'bg-green-700 hover:bg-green-600 border-green-800'; // Darker green
      case 'low':
        return completionRate >= 0.4 
          ? 'bg-green-800 hover:bg-green-700 border-green-900' // Very dark green
          : 'bg-green-900 hover:bg-green-800 border-gray-800'; // Darkest green
      default:
        return 'bg-gray-800 hover:bg-gray-700 border-gray-700';
    }
  }, []);

  // Handle date click
  const handleDateClick = useCallback((date: Date) => {
    navigateToDate(date);
  }, [navigateToDate]);

  // Get tooltip text for a date
  const getTooltipText = useCallback((date: Date, activity: ActivityData | null): string => {
    const dateStr = formatDate(date, 'MMM dd, yyyy');
    if (!activity || activity.totalTickets === 0) {
      return `${dateStr}: No activity`;
    }
    
    const completionRate = Math.round((activity.completionCount / activity.totalTickets) * 100);
    return `${dateStr}: ${activity.completionCount}/${activity.totalTickets} completed (${completionRate}%)`;
  }, []);

  if (!isEnabled) {
    return null;
  }

  // Show loading state if tickets are not yet available
  if (!tickets) {
    return (
      <div className={`heat-map-navigator ${className}`}>
        <div className="flex items-center justify-center p-4">
          <span className="text-sm text-gray-500">Loading activity data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`heat-map-navigator bg-gray-900 rounded-lg border border-gray-700 ${className}`}>
      {/* Header - Dynamic Navigation */}
      <div className="px-4 py-3 border-b border-gray-700 bg-gray-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-sm font-medium text-gray-200">
              Activity in {navigationUnit === 'month' ? formatDate(periodStart, 'MMM yyyy') : formatDate(periodStart, 'MMM dd, yyyy')}
            </h3>
            <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
              {isWeeklyMode ? 'Weekly View' : 'Daily View'}
            </span>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={navigateToPrevious}
              className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded transition-colors"
              title={`Previous ${navigationUnit}`}
            >
              <span className="text-xs">←</span>
            </button>
            <button
              type="button"
              onClick={navigateToCurrent}
              className="px-2 py-1 text-xs text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title={`Go to current ${navigationUnit}`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={navigateToNext}
              className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded transition-colors"
              title={`Next ${navigationUnit}`}
            >
              <span className="text-xs">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Heat map content */}
      <div className="px-4 py-4">
        {isWeeklyMode ? (
          // Monthly calendar view for weekly timeline
          <>
            {/* Day of week headers */}
            <div className="grid grid-cols-7 gap-2 mb-3">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                <div key={index} className="text-center">
                  <div className="text-xs text-gray-500 font-medium">{day}</div>
                </div>
              ))}
            </div>
            
            {/* Monthly heat map grid */}
            <div className="space-y-2">
              {displayData.map((weekDays: Date[], weekIndex: number) => (
                <div key={weekIndex} className="grid grid-cols-7 gap-2">
                  {weekDays.map((date: Date) => {
                    const activity = getActivityForDate(date);
                    const heatMapColor = getHeatMapColor(activity);
                    const isSelected = isDateSelected(date);
                    const isTodayDate = isToday(date);
                    const tooltipText = getTooltipText(date, activity);
                    const isCurrentMonth = date.getMonth() === periodStart.getMonth();
                    
                    return (
                      <button
                        type="button"
                        key={date.toISOString()}
                        onClick={() => handleDateClick(date)}
                        className={`
                          relative w-8 h-8 text-xs rounded-md transition-all duration-200 border flex items-center justify-center
                          ${heatMapColor}
                          ${isSelected ? 'ring-2 ring-blue-400' : ''}
                          ${isTodayDate ? 'ring-2 ring-orange-400' : ''}
                          ${!isCurrentMonth ? 'opacity-40' : ''}
                          focus:outline-none focus:ring-2 focus:ring-blue-400
                        `}
                        title={tooltipText}
                      >
                        <span className={`font-mono text-xs ${isCurrentMonth ? 'text-white' : 'text-gray-500'}`}>
                          {formatDate(date, 'd')}
                        </span>
                        
                        {/* Today indicator - small dot */}
                        {isTodayDate && (
                          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-400 rounded-full"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </>
        ) : (
          // Compact week view for daily timeline
          <>
            {/* Day headers for week view */}
            <div className="grid grid-cols-7 gap-3 mb-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                <div key={index} className="text-center">
                  <div className="text-sm text-gray-400 font-medium">{day}</div>
                </div>
              ))}
            </div>
            
            {/* Single week heat map */}
            <div className="grid grid-cols-7 gap-3">
              {displayData[0].map((date: Date) => {
                const activity = getActivityForDate(date);
                const heatMapColor = getHeatMapColor(activity);
                const isSelected = isDateSelected(date);
                const isTodayDate = isToday(date);
                const tooltipText = getTooltipText(date, activity);
                
                return (
                  <button
                    type="button"
                    key={date.toISOString()}
                    onClick={() => handleDateClick(date)}
                    className={`
                      relative w-12 h-12 text-sm rounded-lg transition-all duration-200 border flex flex-col items-center justify-center
                      ${heatMapColor}
                      ${isSelected ? 'ring-2 ring-blue-400' : ''}
                      ${isTodayDate ? 'ring-2 ring-orange-400' : ''}
                      focus:outline-none focus:ring-2 focus:ring-blue-400
                    `}
                    title={tooltipText}
                  >
                    <span className="font-mono text-sm text-white font-medium">
                      {formatDate(date, 'd')}
                    </span>
                    
                    {/* Today indicator - small dot */}
                    {isTodayDate && (
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-400 rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Legend and stats */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700">
          <div className="flex items-center space-x-3">
            <span className="text-xs text-gray-400">Less</span>
            <div className="flex items-center space-x-1">
              <div className={`${isWeeklyMode ? 'w-3 h-3' : 'w-4 h-4'} bg-gray-800 rounded-sm border border-gray-700`} title="No activity"></div>
              <div className={`${isWeeklyMode ? 'w-3 h-3' : 'w-4 h-4'} bg-green-900 rounded-sm`} title="Low activity"></div>
              <div className={`${isWeeklyMode ? 'w-3 h-3' : 'w-4 h-4'} bg-green-700 rounded-sm`} title="Medium activity"></div>
              <div className={`${isWeeklyMode ? 'w-3 h-3' : 'w-4 h-4'} bg-green-500 rounded-sm`} title="High activity"></div>
              <div className={`${isWeeklyMode ? 'w-3 h-3' : 'w-4 h-4'} bg-green-400 rounded-sm`} title="Very high activity"></div>
            </div>
            <span className="text-xs text-gray-400">More</span>
          </div>
          
          {/* Dynamic stats */}
          <div className="flex items-center space-x-4 text-xs text-gray-400">
            {(() => {
              const allActivities = displayData
                .flat()
                .filter(date => isWeeklyMode ? date.getMonth() === periodStart.getMonth() : true)
                .map(date => getActivityForDate(date))
                .filter(Boolean);
              const totalTickets = allActivities.reduce((sum: number, activity) => sum + (activity?.totalTickets || 0), 0);
              const completedTickets = allActivities.reduce((sum: number, activity) => sum + (activity?.completionCount || 0), 0);
              
              return (
                <>
                  <span className="font-mono">{totalTickets} tasks this {navigationUnit}</span>
                  {totalTickets > 0 && (
                    <span className="font-mono text-green-400">{completedTickets} completed</span>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}