import { useCallback } from 'react';
import { FrontendTicket as Ticket } from '@wrm/types';

interface UseEnhancedTicketProps {
  ticket: Ticket;
  onTicketUpdate?: (ticket: Ticket) => void;
  pixelsPerMinute: number;
  startTime: number;
}

export function useEnhancedTicket({
  ticket,
  onTicketUpdate,
  pixelsPerMinute,
  startTime,
}: UseEnhancedTicketProps) {
  
  // Handle ticket updates from drag/resize operations
  const handleTicketUpdate = useCallback((updates: {
    newStart?: number;
    newEnd?: number;
    newLane?: number;
  }) => {
    if (!onTicketUpdate) return;

    const updatedTicket: Ticket = {
      ...ticket,
      start: updates.newStart ? new Date(updates.newStart) : ticket.start,
      end: updates.newEnd ? new Date(updates.newEnd) : ticket.end,
      lane: updates.newLane !== undefined ? updates.newLane : ticket.lane,
    };

    // Validate minimum duration (15 minutes)
    const minDuration = 15 * 60 * 1000;
    const duration = updatedTicket.end.getTime() - updatedTicket.start.getTime();
    
    if (duration < minDuration) {
      // Adjust end time to maintain minimum duration
      updatedTicket.end = new Date(updatedTicket.start.getTime() + minDuration);
    }

    // Snap to 15-minute intervals for better UX
    const snapInterval = 15 * 60 * 1000;
    const snappedStart = Math.round(updatedTicket.start.getTime() / snapInterval) * snapInterval;
    const snappedEnd = Math.round(updatedTicket.end.getTime() / snapInterval) * snapInterval;
    
    // Ensure end is still after start after snapping
    if (snappedEnd <= snappedStart) {
      updatedTicket.end = new Date(snappedStart + minDuration);
    } else {
      updatedTicket.start = new Date(snappedStart);
      updatedTicket.end = new Date(snappedEnd);
    }

    onTicketUpdate(updatedTicket);
  }, [ticket, onTicketUpdate]);

  // Convert pixels to time
  const pixelsToTime = useCallback((pixels: number) => {
    return startTime + (pixels / pixelsPerMinute) * (1000 * 60);
  }, [startTime, pixelsPerMinute]);

  // Convert time to pixels
  const timeToPixels = useCallback((time: number) => {
    return ((time - startTime) / (1000 * 60)) * pixelsPerMinute;
  }, [startTime, pixelsPerMinute]);

  return {
    handleTicketUpdate,
    pixelsToTime,
    timeToPixels,
  };
}
