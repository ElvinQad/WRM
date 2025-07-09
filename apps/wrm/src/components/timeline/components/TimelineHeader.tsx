import React from 'react';
import { Button } from '../../ui';

interface TimelineHeaderProps {
  currentZoomConfig: { label: string; zoom: number };
  autoCenter: boolean;
  selectedDate: Date | null;
  onToggleAutoCenter: () => void;
  onDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearDate: () => void;
}

export function TimelineHeader({
  currentZoomConfig,
  autoCenter,
  selectedDate,
  onToggleAutoCenter,
  onDateChange,
  onClearDate,
}: TimelineHeaderProps) {
  return (
    <div className="p-3 border-b border-border bg-card flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <span className="text-sm text-muted-foreground font-medium">Timeline View</span>
        <div className="bg-secondary px-3 py-1 rounded-lg text-sm font-medium text-secondary-foreground">
          {currentZoomConfig.label} ({currentZoomConfig.zoom.toFixed(1)}x)
        </div>
        <Button
          variant={autoCenter ? 'primary' : 'secondary'}
          size="sm"
          onClick={onToggleAutoCenter}
          title={autoCenter ? "Auto-centering ON - Click to disable" : "Auto-centering OFF - Click to enable and center"}
        >
          📍 {autoCenter ? 'Auto-Center ON' : 'Center Now'}
        </Button>
        {/* Date Selector */}
        <div className="flex items-center space-x-2">
          <label htmlFor="date-selector" className="text-sm text-muted-foreground font-medium">
            📅 Go to Date:
          </label>
          <input
            id="date-selector"
            type="date"
            value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
            onChange={onDateChange}
            className="px-2 py-1 border border-input rounded text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
          {selectedDate && (
            <button
              onClick={onClearDate}
              className="text-muted-foreground hover:text-foreground text-sm"
              title="Clear date selection"
            >
              ✕
            </button>
          )}
        </div>
        
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
        <span>Scroll to zoom, drag tickets to move/resize. Drag vertically to change lanes.</span>
      </div>
    </div>
  );
}
