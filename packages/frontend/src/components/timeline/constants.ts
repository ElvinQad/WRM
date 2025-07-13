import { TimeScale } from './types';

export const TICKET_HEIGHT = 48; // Increased for better readability
export const LANE_HEIGHT = 56; // Tight spacing between lanes (ticket height + 8px margin)
export const HEADER_HEIGHT = 60; // Reduced header space
export const MIN_TIMELINE_HEIGHT = 200; // Reduced minimum height

// Improved zoom system with better scale distribution
export const ZOOM_LEVELS = [
  { scale: 'weeks' as TimeScale, zoom: 0.1, label: 'Weeks' },
  { scale: 'weeks' as TimeScale, zoom: 0.25, label: 'Weeks+' },
  { scale: 'days' as TimeScale, zoom: 0.5, label: 'Days' },
  { scale: 'days' as TimeScale, zoom: 0.8, label: 'Days+' },
  { scale: 'hours' as TimeScale, zoom: 1.0, label: 'Hours' },
  { scale: 'hours' as TimeScale, zoom: 1.5, label: 'Hours+' },
  { scale: 'hours' as TimeScale, zoom: 2.0, label: 'Hours++' },
];
