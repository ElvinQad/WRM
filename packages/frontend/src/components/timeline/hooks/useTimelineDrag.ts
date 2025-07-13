import { useState, useRef, useCallback } from 'react';
import { DragState, Ticket } from '../types';
import { HEADER_HEIGHT, LANE_HEIGHT } from '../constants';
import { yToLane, pixelsToTime, timeToPixels } from '../utils/timelineUtils';

export function useTimelineDrag(
  scrollLeft: number,
  allTickets: Ticket[],
  pixelsPerMinute: number,
  startTime: number,
  onTicketUpdate?: (ticket: Ticket) => void
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dragState, setDragState] = useState<DragState>({
    ticketId: null,
    isDragging: false,
    dragType: null,
    startX: 0,
    startY: 0,
    startTime: 0,
    startLane: 0,
    originalStart: 0,
    originalEnd: 0,
    originalLane: 0,
  });

  const handleTicketMouseDown = useCallback((e: React.MouseEvent, ticket: Ticket, currentLane: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = e.clientX - rect.left + scrollLeft;
    const clientY = e.clientY - rect.top;
    const ticketStart = timeToPixels(ticket.start.getTime(), startTime, pixelsPerMinute);
    const ticketEnd = timeToPixels(ticket.end.getTime(), startTime, pixelsPerMinute);
    
    let dragType: 'move' | 'resize-start' | 'resize-end' = 'move';
    
    // More precise drag type detection based on position within the ticket
    const relativeX = clientX - ticketStart;
    const ticketWidth = ticketEnd - ticketStart;
    
    if (relativeX <= 12) { // Left 12px for resize handle
      dragType = 'resize-start';
    } else if (relativeX >= ticketWidth - 12) { // Right 12px for resize handle
      dragType = 'resize-end';
    } else {
      dragType = 'move';
    }

    setDragState({
      ticketId: ticket.id,
      isDragging: true,
      dragType,
      startX: clientX,
      startY: clientY,
      startTime: pixelsToTime(clientX, startTime, pixelsPerMinute),
      startLane: currentLane,
      originalStart: ticket.start.getTime(),
      originalEnd: ticket.end.getTime(),
      originalLane: currentLane,
    });
  }, [scrollLeft, startTime, pixelsPerMinute]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragState.isDragging || !dragState.ticketId) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const currentX = e.clientX - rect.left + scrollLeft;
    const currentY = e.clientY - rect.top;
    
    const deltaTime = pixelsToTime(currentX, startTime, pixelsPerMinute) - dragState.startTime;
    const newLane = dragState.dragType === 'move' ? yToLane(currentY, HEADER_HEIGHT, LANE_HEIGHT) : dragState.originalLane;
    
    const ticket = allTickets.find(t => t.id === dragState.ticketId);
    if (!ticket) return;

    let newStart = ticket.start.getTime();
    let newEnd = ticket.end.getTime();
    
    // Minimum duration (5 minutes)
    const minDuration = 5 * 60 * 1000;

    switch (dragState.dragType) {
      case 'move':
        // Move the entire ticket
        newStart = dragState.originalStart + deltaTime;
        newEnd = dragState.originalEnd + deltaTime;
        break;
      case 'resize-start':
        // Resize from the start, ensure minimum duration
        newStart = Math.min(dragState.originalStart + deltaTime, dragState.originalEnd - minDuration);
        newEnd = dragState.originalEnd;
        break;
      case 'resize-end':
        // Resize from the end, ensure minimum duration
        newStart = dragState.originalStart;
        newEnd = Math.max(dragState.originalEnd + deltaTime, dragState.originalStart + minDuration);
        break;
    }

    // Snap to 15-minute intervals for better user experience
    const snapInterval = 15 * 60 * 1000; // 15 minutes
    newStart = Math.round(newStart / snapInterval) * snapInterval;
    newEnd = Math.round(newEnd / snapInterval) * snapInterval;
    
    // Ensure minimum duration after snapping
    if (newEnd - newStart < minDuration) {
      if (dragState.dragType === 'resize-start') {
        newStart = newEnd - minDuration;
      } else {
        newEnd = newStart + minDuration;
      }
    }

    const updatedTicket = {
      ...ticket,
      start: new Date(newStart),
      end: new Date(newEnd),
      lane: Math.max(0, newLane), // Ensure lane is not negative
    };

    onTicketUpdate?.(updatedTicket);
  }, [dragState, scrollLeft, allTickets, onTicketUpdate, startTime, pixelsPerMinute]);

  const handleMouseUp = useCallback(() => {
    setDragState({
      ticketId: null,
      isDragging: false,
      dragType: null,
      startX: 0,
      startY: 0,
      startTime: 0,
      startLane: 0,
      originalStart: 0,
      originalEnd: 0,
      originalLane: 0,
    });
  }, []);

  return {
    containerRef,
    dragState,
    handleTicketMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}
