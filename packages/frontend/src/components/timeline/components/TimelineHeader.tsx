import React from 'react';
import { Button, Select, SelectOption, ViewRelativeNavigator } from '../../ui/index.ts';
import { TimelineView } from '../../../store/slices/timelineSlice.ts';
import { QuickRangeOption } from '../../ui/ViewRelativeNavigator.tsx';

interface TimelineHeaderProps {
  autoCenter: boolean;
  currentView: TimelineView;
  startDate: Date;
  endDate: Date;
  onToggleAutoCenter: () => void;
  onViewChange: (view: TimelineView) => void;
  onNavigate: (direction: 'previous' | 'next') => void;
  onQuickRange: (range: QuickRangeOption) => void;
}

export function TimelineHeader({
  autoCenter,
  currentView,
  startDate,
  endDate,
  onToggleAutoCenter,
  onViewChange,
  onNavigate,
  onQuickRange,
}: TimelineHeaderProps) {
  const viewOptions: SelectOption[] = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

  return (
    <div className="p-3 border-b border-border bg-card flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <span className="text-sm text-muted-foreground font-medium">Timeline View</span>
        
        {/* View Selector Dropdown */}
        <div className="flex items-center space-x-2">
          <label htmlFor="view-selector" className="text-sm text-muted-foreground font-medium">
            View:
          </label>
          <Select
            options={viewOptions}
            value={currentView}
            onChange={(value) => onViewChange(value as TimelineView)}
          />
        </div>
        <Button
          variant={autoCenter ? 'primary' : 'secondary'}
          size="sm"
          onClick={onToggleAutoCenter}
          title={autoCenter ? "Auto-centering ON - Click to disable" : "Auto-centering OFF - Click to enable and center"}
        >
          📍 {autoCenter ? 'Auto-Center ON' : 'Center Now'}
        </Button>
        
        {/* View Relative Navigator */}
        <ViewRelativeNavigator
          currentView={currentView}
          startDate={startDate}
          endDate={endDate}
          onNavigate={onNavigate}
          onQuickRange={onQuickRange}
        />
        
       
        
        {/* Day/Night Legend */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-muted-foreground">Legend:</span>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-3 bg-yellow-200 opacity-40 rounded border border-yellow-300"></div>
            <span className="text-muted-foreground">Day</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-3 bg-slate-900 opacity-40 rounded border border-slate-700"></div>
            <span className="text-muted-foreground">Night</span>
          </div>
        </div>
      </div>
      <div className="text-sm text-muted-foreground flex items-center space-x-4">
        <span>Use dropdown to change view. Drag tickets to move/resize. Drag vertically to change lanes.</span>
      </div>
    </div>
  );
}
