import React, { useCallback, useRef } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { Resizable, ResizeCallbackData } from 'react-resizable';
import { TicketWithPosition } from '../types';
import { TICKET_HEIGHT, LANE_HEIGHT, HEADER_HEIGHT } from '../constants';
import 'react-resizable/css/styles.css';

interface EnhancedTicketComponentProps {
  ticketWithPosition: TicketWithPosition;
  isSelected: boolean;
  isHovered: boolean;
  onClick: (e: React.MouseEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onUpdateTicket: (updates: {
    newStart?: number;
    newEnd?: number;
    newLane?: number;
  }) => void;
  pixelsPerMinute: number;
  startTime: number;
  timelineHeight: number;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export function EnhancedTicketComponent({
  ticketWithPosition,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onUpdateTicket,
  pixelsPerMinute,
  startTime,
  timelineHeight,
  onDragStart,
  onDragEnd,
}: EnhancedTicketComponentProps) {
  const { ticket, startX, width, lane } = ticketWithPosition;
  const dragRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartTime = useRef(0);

  // Calculate lane from Y position
  const yToLane = useCallback((y: number) => {
    return Math.max(0, Math.floor((y - HEADER_HEIGHT) / LANE_HEIGHT));
  }, []);

  // Calculate Y position from lane
  const laneToY = useCallback((laneNum: number) => {
    return HEADER_HEIGHT + laneNum * LANE_HEIGHT;
  }, []);

  // Convert pixels to time (for future use)
  // const pixelsToTime = useCallback((pixels: number) => {
  //   return startTime + (pixels / pixelsPerMinute) * (1000 * 60);
  // }, [startTime, pixelsPerMinute]);

  // Convert time to pixels (for future use)
  // const timeToPixels = useCallback((time: number) => {
  //   return ((time - startTime) / (1000 * 60)) * pixelsPerMinute;
  // }, [startTime, pixelsPerMinute]);

  // Handle drag events
  const handleDragStart = useCallback((e: DraggableEvent, data: DraggableData) => {
    isDragging.current = true;
    dragStartTime.current = Date.now();
    onDragStart?.();
  }, [onDragStart]);

  const handleDrag = useCallback((e: DraggableEvent, data: DraggableData) => {
    // Update position in real-time if needed
    // For now, we'll only update on drag stop for better performance
  }, []);

  const handleDragStop = useCallback((e: DraggableEvent, data: DraggableData) => {
    const dragEndTime = Date.now();
    const dragDuration = dragEndTime - dragStartTime.current;
    
    // Only process as drag if it was actually dragged (not just a click)
    if (isDragging.current && dragDuration > 100) {
      const newLane = yToLane(data.y);
      const timeShift = (data.x - startX) / pixelsPerMinute * (1000 * 60);
      
      const newStart = ticket.start.getTime() + timeShift;
      const newEnd = ticket.end.getTime() + timeShift;
      
      onUpdateTicket({
        newStart,
        newEnd,
        newLane,
      });
    }
    
    isDragging.current = false;
    onDragEnd?.();
  }, [ticket, startX, pixelsPerMinute, yToLane, onUpdateTicket, onDragEnd]);

  // Handle resize events
  const handleResize = useCallback((e: React.SyntheticEvent, data: ResizeCallbackData) => {
    const newWidth = data.size.width;
    const duration = (newWidth / pixelsPerMinute) * (1000 * 60);
    const newEnd = ticket.start.getTime() + duration;
    
    // Minimum duration of 15 minutes
    const minDuration = 15 * 60 * 1000;
    if (duration >= minDuration) {
      onUpdateTicket({
        newEnd,
      });
    }
  }, [ticket.start, pixelsPerMinute, onUpdateTicket]);

  // Handle click events
  const handleClick = useCallback((e: React.MouseEvent) => {
    // Only trigger click if it wasn't a drag operation
    if (!isDragging.current) {
      onClick(e);
    }
  }, [onClick]);

  // Constrain drag to timeline bounds
  const dragBounds = {
    left: -startX,
    right: 10000, // Allow dragging far to the right
    top: -laneToY(lane),
    bottom: timelineHeight - laneToY(lane) - TICKET_HEIGHT,
  };

  return (
    <Draggable
      nodeRef={dragRef}
      bounds={dragBounds}
      position={{ x: 0, y: 0 }} // Always start at 0,0 since we're using absolute positioning
      onStart={handleDragStart}
      onDrag={handleDrag}
      onStop={handleDragStop}
      disabled={!isSelected} // Only allow dragging when selected
      handle=".ticket-drag-handle"
    >
      <div
        ref={dragRef}
        className={`absolute transition-all duration-200 ${
          isDragging.current ? 'z-50' : isSelected ? 'z-30' : isHovered ? 'z-20' : 'z-10'
        }`}
        style={{
          left: `${startX}px`,
          top: `${laneToY(lane)}px`,
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <Resizable
          width={width}
          height={TICKET_HEIGHT}
          onResize={handleResize}
          minConstraints={[60, TICKET_HEIGHT]} // Minimum width of 60px
          maxConstraints={[2000, TICKET_HEIGHT]} // Maximum width
          resizeHandles={isSelected ? ['e'] : []} // Only show resize handle on right when selected
        >
          <div
            className={`w-full h-full rounded-lg shadow-sm border transition-all duration-200 ${
              isSelected
                ? 'border-blue-500 shadow-lg ring-2 ring-blue-200'
                : isHovered
                ? 'border-gray-500 shadow-md'
                : 'border-gray-300 hover:border-gray-400'
            } ${isDragging.current ? 'opacity-80 scale-105 shadow-xl' : ''}`}
            style={{
              backgroundColor: ticket.color || '#ffffff',
              minWidth: '60px',
            }}
            onClick={handleClick}
          >
            {/* Drag handle - covers most of the ticket */}
            <div className="ticket-drag-handle absolute inset-0 cursor-move" />
            
            {/* Left resize handle (visual only, actual resize is handled by react-resizable) */}
            {isSelected && (
              <div
                className="absolute left-0 top-0 w-2 h-full bg-blue-500 opacity-30 rounded-l-lg cursor-ew-resize"
                style={{ zIndex: 1 }}
              />
            )}
            
            {/* Ticket content */}
            <div className="relative px-3 py-2 h-full flex flex-col justify-center overflow-hidden pointer-events-none">
              <div className="text-sm font-medium text-gray-900 truncate leading-tight">
                {ticket.title}
              </div>
              {width > 100 && (
                <div className="text-xs text-gray-600 truncate mt-1">
                  {ticket.category}
                </div>
              )}
            </div>
            
            {/* Lane indicator */}
            <div className="absolute top-1 right-1 text-xs text-gray-400 bg-white/80 px-1 rounded text-center leading-none">
              L{lane}
            </div>
          </div>
        </Resizable>
      </div>
    </Draggable>
  );
}
