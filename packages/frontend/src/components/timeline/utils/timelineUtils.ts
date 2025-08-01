import { FrontendTicket as Ticket, TicketWithPosition, TimeMarker } from '@wrm/types';
import { TimelineView } from '../../../store/slices/timelineSlice.ts';

/**
 * Converts time to pixel position
 */
export function timeToPixels(time: number, startTime: number, pixelsPerMinute: number): number {
  return ((time - startTime) / (1000 * 60)) * pixelsPerMinute;
}

/**
 * Converts pixel position to time
 */
export function pixelsToTime(pixels: number, startTime: number, pixelsPerMinute: number): number {
  return startTime + (pixels / pixelsPerMinute) * (1000 * 60);
}

/**
 * Converts Y coordinate to lane number
 */
export function yToLane(y: number, headerHeight: number, laneHeight: number): number {
  return Math.max(0, Math.floor((y - headerHeight) / laneHeight));
}

/**
 * Converts lane number to Y coordinate
 */
export function laneToY(lane: number, headerHeight: number, laneHeight: number): number {
  return headerHeight + lane * laneHeight;
}

/**
 * Checks if two time ranges overlap
 */
export function timeRangesOverlap(
  start1: number,
  end1: number,
  start2: number,
  end2: number
): boolean {
  return start1 < end2 && start2 < end1;
}

/**
 * Calculates time bounds and pixel ratio for different scales
 * Note: This function is deprecated and no longer used. Time bounds are now managed by Redux state.
 */
export function calculateTimeBounds(currentScale: TimelineView) {
  const now = new Date();
  let start: Date;
  let end: Date;
  
  switch (currentScale) {
    case 'daily':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4);
      break;
    case 'weekly':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 21); // Show 3 weeks before
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 21);   // Show 3 weeks after
      break;
    case 'monthly':
      // Show 6 months: 3 before current month + current month + 2 after
      start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      end = new Date(now.getFullYear(), now.getMonth() + 3, 0); // Last day of 2 months ahead
      break;
    default:
      // Default to days view
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4);
      break;
  }

  const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
  const basePixelsPerMinute = 2; // Fixed at 2, no zoom scaling
  const width = durationMinutes * basePixelsPerMinute;

  return {
    startTime: start.getTime(),
    endTime: end.getTime(),
    pixelsPerMinute: basePixelsPerMinute,
    totalWidth: width,
  };
}

/**
 * Calculates ticket positioning with lane assignment
 */
export function calculateTicketPositions(
  tickets: Ticket[],
  startTime: number,
  pixelsPerMinute: number
): TicketWithPosition[] {
  const positioned: TicketWithPosition[] = [];
  
  // Sort tickets by start time
  const sortedTickets = [...tickets].sort((a, b) => a.start.getTime() - b.start.getTime());
  
  for (const ticket of sortedTickets) {
    const startX = timeToPixels(ticket.start.getTime(), startTime, pixelsPerMinute);
    const endX = timeToPixels(ticket.end.getTime(), startTime, pixelsPerMinute);
    const width = Math.max(endX - startX, 20); // Minimum width
    
    // Find the lowest available lane
    let lane = ticket.lane ?? 0;
    let foundConflict = true;
    
    // If no lane is assigned, find the first available lane
    if (ticket.lane === undefined) {
      lane = 0;
      while (foundConflict) {
        foundConflict = false;
        for (const positioned_ticket of positioned) {
          if (positioned_ticket.lane === lane && 
              timeRangesOverlap(
                ticket.start.getTime(), 
                ticket.end.getTime(),
                positioned_ticket.ticket.start.getTime(),
                positioned_ticket.ticket.end.getTime()
              )) {
            foundConflict = true;
            break;
          }
        }
        if (foundConflict) {
          lane++;
        }
      }
    }
    
    positioned.push({
      ticket: { ...ticket, lane },
      startX,
      endX,
      width,
      lane,
    });
  }
  
  return positioned;
}

/**
 * Generates time markers for the timeline
 */
export function generateTimeMarkers(
  startTime: number,
  endTime: number,
  currentScale: TimelineView,
  pixelsPerMinute: number,
  currentTime: number = Date.now()
): TimeMarker[] {
  const markers: TimeMarker[] = [];
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  let majorInterval: number;
  let minorInterval: number;
  let format: (date: Date) => string;
  let minorFormat: (date: Date) => string;
  
  switch (currentScale) {
    case 'daily':
      majorInterval = 24 * 60 * 60 * 1000; // 1 day
      minorInterval = 60 * 60 * 1000; // 1 hour (changed from 6 hours)
      format = (date) => date.toLocaleDateString([], { weekday: 'short', day: 'numeric' });
      minorFormat = (date) => date.toLocaleTimeString([], { hour: '2-digit' }) + 'h';
      break;
    case 'weekly':
    default:
      majorInterval = 7 * 24 * 60 * 60 * 1000; // 1 week
      minorInterval = 24 * 60 * 60 * 1000; // 1 day
      format = (date) => {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
        return `Week of ${weekStart.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
      };
      minorFormat = (date) => date.toLocaleDateString([], { weekday: 'short', day: 'numeric' });
      break;
  }

  // Generate major markers
  let current = new Date(Math.ceil(start.getTime() / majorInterval) * majorInterval);
  while (current <= end) {
    markers.push({
      time: current.getTime(),
      label: format(current),
      x: timeToPixels(current.getTime(), startTime, pixelsPerMinute),
      type: 'major' as const,
    });
    current = new Date(current.getTime() + majorInterval);
  }

  // Generate minor markers if enabled
  if (minorInterval > 0) {
    let showMinorMarkers = false;
    
    // Show minor markers based on view type and pixel density
    switch (currentScale) {
      case 'daily':
        showMinorMarkers = pixelsPerMinute >= 0.5; // Show hourly markers at reasonable density
        break;
      case 'weekly':
        showMinorMarkers = pixelsPerMinute >= 0.1; // Always show day markers in weekly view
        break;
    }
    
    if (showMinorMarkers) {
    current = new Date(Math.ceil(start.getTime() / minorInterval) * minorInterval);
    while (current <= end) {
      // Don't add minor markers that coincide with major markers
      const isMajorMarker = markers.some(marker => Math.abs(marker.time - current.getTime()) < minorInterval / 2);
      if (!isMajorMarker) {
        markers.push({
          time: current.getTime(),
          label: minorFormat(current),
          x: timeToPixels(current.getTime(), startTime, pixelsPerMinute),
          type: 'minor' as const,
        });
      }
      current = new Date(current.getTime() + minorInterval);
    }
    } // Close the showMinorMarkers condition
  }

  // Add "now" marker if current time is within the visible range
  const nowTime = currentTime;
  if (nowTime >= startTime && nowTime <= endTime) {
    const now = new Date(nowTime);
    let nowLabel: string;
    
    switch (currentScale) {
      case 'daily':
        nowLabel = `Now (${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
        break;
      case 'weekly':
        nowLabel = `Now (${now.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })})`;
        break;
      default:
        nowLabel = 'Now';
    }
    
    markers.push({
      time: nowTime,
      label: nowLabel,
      x: timeToPixels(nowTime, startTime, pixelsPerMinute),
      type: 'now' as const,
    });
  }

  return markers.sort((a, b) => a.time - b.time);
}
