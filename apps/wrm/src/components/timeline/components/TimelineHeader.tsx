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
    <div className="p-3 border-b bg-white flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600 font-medium">Timeline View</span>
        <div className="bg-gray-100 px-3 py-1 rounded-lg text-sm font-medium text-gray-700">
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
          <label htmlFor="date-selector" className="text-sm text-gray-600 font-medium">
            📅 Go to Date:
          </label>
          <input
            id="date-selector"
            type="date"
            value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
            onChange={onDateChange}
            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {selectedDate && (
            <button
              onClick={onClearDate}
              className="text-gray-400 hover:text-gray-600 text-sm"
              title="Clear date selection"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      <div className="text-sm text-gray-600">
        Scroll to zoom, drag tickets to move/resize. Drag vertically to change lanes.
      </div>
    </div>
  );
}
