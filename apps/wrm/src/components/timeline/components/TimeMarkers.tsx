import React from 'react';
import { TimeMarker } from '../types';

interface TimeMarkersProps {
  markers: TimeMarker[];
  headerHeight: number;
  totalHeight: number;
}

export function TimeMarkers({ markers, headerHeight, totalHeight }: TimeMarkersProps) {
  return (
    <>
      {markers.map((marker, index) => (
        <div key={`${marker.time}-${index}`}>
          {/* Vertical line */}
          <div
            className={`absolute ${
              marker.type === 'now'
                ? 'border-l-2 border-red-500'
                : marker.type === 'major' 
                ? 'border-l-2 border-gray-400' 
                : 'border-l border-gray-300'
            } ${marker.type === 'now' ? 'opacity-90' : 'opacity-80'}`}
            style={{
              left: `${marker.x}px`,
              top: `0px`, // Start from the very top
              height: `${totalHeight}px`, // Full height including header
              zIndex: marker.type === 'now' ? 15 : 5, // Higher z-index for markers
            }}
          />
          {/* Time label - positioned above the timeline */}
          <div
            className={`absolute select-none ${
              marker.type === 'now'
                ? 'text-sm font-bold text-red-600 bg-red-50 border-red-200'
                : marker.type === 'major' 
                ? 'text-sm font-semibold text-gray-800' 
                : 'text-xs font-medium text-gray-600'
            } bg-white px-2 py-1 rounded-md border border-gray-200 shadow-sm whitespace-nowrap`}
            style={{
              left: `${marker.x}px`,
              top: `${headerHeight - 60}px`, // Position above the timeline header
              zIndex: marker.type === 'now' ? 20 : 15, // Higher z-index for labels
              transform: 'translateX(-50%)', // Center the label on the line
            }}
          >
            {marker.label}
          </div>
        </div>
      ))}
    </>
  );
}
