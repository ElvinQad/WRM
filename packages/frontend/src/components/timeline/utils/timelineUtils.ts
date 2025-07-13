import { Ticket, TicketWithPosition, TimeMarker, TimeScale } from '../types';

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
 */
export function calculateTimeBounds(currentScale: TimeScale, currentZoom: number) {
  const now = new Date();
  let start: Date, end: Date;
  
  switch (currentScale) {
    case 'hours': {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() - 19);
      // Cut off at midnight (12 AM) of the current day
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
      const normalEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 12);
      end = normalEnd <= midnight ? normalEnd : midnight;
      break;
    }
    case 'days':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4);
      break;
    case 'weeks':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 21); // Show 3 weeks before
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 21);   // Show 3 weeks after
      break;
  }

  const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
  const basePixelsPerMinute = 2 * currentZoom;
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
  currentScale: TimeScale,
  currentZoom: number,
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
    case 'hours':
      majorInterval = 60 * 60 * 1000; // 1 hour
      minorInterval = 0; // No minor markers for hours view
      format = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      minorFormat = () => ''; // Not used
      break;
    case 'days':
      majorInterval = 24 * 60 * 60 * 1000; // 1 day
      minorInterval = 60 * 60 * 1000; // 1 hour (changed from 6 hours)
      format = (date) => date.toLocaleDateString([], { weekday: 'short', day: 'numeric' });
      minorFormat = (date) => date.toLocaleTimeString([], { hour: '2-digit' }) + 'h';
      break;
    case 'weeks':
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

  // Generate minor markers if enabled and zoom level is sufficient
  if (minorInterval > 0) {
    let showMinorMarkers = false;
    
    // Different zoom thresholds for different scales
    switch (currentScale) {
      case 'hours':
        showMinorMarkers = currentZoom >= 1.2;
        break;
      case 'days':
        showMinorMarkers = currentZoom >= 0.5; // Show hourly markers at lower zoom levels
        break;
      case 'weeks':
        showMinorMarkers = currentZoom >= 0.1; // Always show day markers in weekly view
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
      case 'hours':
        nowLabel = 'Now';
        break;
      case 'days':
        nowLabel = `Now (${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
        break;
      case 'weeks':
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
