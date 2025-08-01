import React from 'react';
import { Button } from './Button.tsx';
import { Select, SelectOption } from './Select.tsx';
import { TimelineView } from '../../store/slices/timelineSlice.ts';

export interface ViewRelativeNavigatorProps {
  currentView: TimelineView;
  startDate: Date;
  endDate: Date;
  onNavigate: (direction: 'previous' | 'next') => void;
  onQuickRange: (range: QuickRangeOption) => void;
}

export type QuickRangeOption = 
  | 'today'
  | 'this-week'
  | 'this-month'
  | 'last-7-days'
  | 'last-30-days'
  | 'next-7-days'
  | 'next-30-days';

export function ViewRelativeNavigator({
  currentView,
  startDate,
  endDate,
  onNavigate,
  onQuickRange,
}: ViewRelativeNavigatorProps) {
  // Get view-appropriate labels and increments
  const getViewLabels = () => {
    switch (currentView) {
      case 'daily':
        return { prev: '← Previous Day', next: 'Next Day →', period: 'Day' };
      case 'weekly':
        return { prev: '← Previous Week', next: 'Next Week →', period: 'Week' };
      case 'monthly':
        return { prev: '← Previous Month', next: 'Next Month →', period: 'Month' };
      default:
        return { prev: '← Previous', next: 'Next →', period: 'Period' };
    }
  };

  const labels = getViewLabels();

  // Quick range options
  const quickRangeOptions: SelectOption[] = [
    { value: 'today', label: 'Today' },
    { value: 'this-week', label: 'This Week' },
    { value: 'this-month', label: 'This Month' },
    { value: 'last-7-days', label: 'Last 7 Days' },
    { value: 'last-30-days', label: 'Last 30 Days' },
    { value: 'next-7-days', label: 'Next 7 Days' },
    { value: 'next-30-days', label: 'Next 30 Days' },
  ];

  // Format the current date range display
  const formatDateRange = () => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      ...(startDate.getFullYear() !== new Date().getFullYear() && { year: 'numeric' }),
    };

    // For same day, show just one date (compare date strings without time)
    const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    
    if (startDateOnly.getTime() === endDateOnly.getTime()) {
      return startDate.toLocaleDateString('en-US', options);
    }

    const start = startDate.toLocaleDateString('en-US', options);
    const end = endDate.toLocaleDateString('en-US', options);
    return `${start} - ${end}`;
  };

  return (
    <div className="flex items-center space-x-3">
      {/* Navigation Buttons */}
      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('previous')}
          title={labels.prev}
          className="px-3 py-1"
        >
          ←
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('next')}
          title={labels.next}
          className="px-3 py-1"
        >
          →
        </Button>
      </div>

      {/* Current Date Range Display */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-muted-foreground font-medium">
          📅 {formatDateRange()}
        </span>
      </div>

      {/* Quick Range Dropdown */}
      <div className="flex items-center space-x-2">
        <label className="text-sm text-muted-foreground font-medium">
          Quick:
        </label>
        <Select
          options={quickRangeOptions}
          value=""
          onChange={(value) => onQuickRange(value as QuickRangeOption)}
          placeholder="Select range..."
          className="w-36"
        />
      </div>
    </div>
  );
}
