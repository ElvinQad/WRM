import { TimeScale } from './types';

export const TICKET_HEIGHT = 48; // Increased for better readability
export const LANE_HEIGHT = 56; // Tight spacing between lanes (ticket height + 8px margin)
export const HEADER_HEIGHT = 60; // Reduced header space
export const MIN_TIMELINE_HEIGHT = 200; // Reduced minimum height

// Simplified zoom system with discrete points
export const ZOOM_LEVELS = [
  { scale: 'weeks' as TimeScale, zoom: 0.1, label: 'Weekly' },
  { scale: 'days' as TimeScale, zoom: 0.5, label: 'Daily' },
  { scale: 'hours' as TimeScale, zoom: 0.8, label: 'Hourly' },
  { scale: 'hours' as TimeScale, zoom: 1.5, label: 'Hourly+' },
];
