import { useState, useMemo, useCallback, useEffect } from 'react';
import { Ticket, TimeMarker, TicketWithPosition } from '../types';
import { generateTicketsForTimeRange } from '../sampleData';
import { useTimelineZoom } from './useTimelineZoom';
import { useTimelineDrag } from './useTimelineDrag';
import { useTimelinePanning } from './useTimelinePanning';
import { useTimelineAutoCenter } from './useTimelineAutoCenter';
import { useTimelineTooltip } from './useTimelineTooltip';
import { 
  calculateTimeBounds, 
  calculateTicketPositions, 
  generateTimeMarkers,
  pixelsToTime,
  timeToPixels,
  laneToY 
} from '../utils/timelineUtils';
import { HEADER_HEIGHT, LANE_HEIGHT, MIN_TIMELINE_HEIGHT } from '../constants';

export function useTimeline(
  tickets: Ticket[],
  useInfiniteTickets: boolean,
  onTicketUpdate?: (ticket: Ticket) => void,
  onTicketClick?: (ticket: Ticket) => void,
  autoCenterOnNow = false
) {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [hoveredTicket, setHoveredTicket] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update current time every 30 seconds for real-time "now" marker
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Zoom functionality
  const {
    currentZoomConfig,
    currentScale,
    currentZoom,
    isZooming,
    handleWheel,
  } = useTimelineZoom();

  // Calculate time bounds and pixel ratio
  const { startTime, endTime, pixelsPerMinute, totalWidth } = useMemo(() => {
    return calculateTimeBounds(currentScale, currentZoom);
  }, [currentScale, currentZoom]);

  // Generate tickets based on visible time range when useInfiniteTickets is enabled
  const allTickets = useMemo(() => {
    if (useInfiniteTickets) {
      return generateTicketsForTimeRange(startTime, endTime);
    }
    return tickets;
  }, [useInfiniteTickets, startTime, endTime, tickets]);

  // Calculate ticket positioning with lane assignment
  const ticketsWithPositions = useMemo((): TicketWithPosition[] => {
    return calculateTicketPositions(allTickets, startTime, pixelsPerMinute);
  }, [allTickets, startTime, pixelsPerMinute]);

  // Calculate total height based on maximum lane used
  const totalHeight = useMemo(() => {
    const maxLane = ticketsWithPositions.reduce((max, item) => Math.max(max, item.lane), -1);
    const numLanes = maxLane + 1;
    const contentHeight = HEADER_HEIGHT + numLanes * LANE_HEIGHT + 20; // Minimal padding
    return Math.max(MIN_TIMELINE_HEIGHT, contentHeight);
  }, [ticketsWithPositions]);

  // Generate time markers (includes real-time "now" marker)
  const timeMarkers = useMemo((): TimeMarker[] => {
    return generateTimeMarkers(startTime, endTime, currentScale, currentZoom, pixelsPerMinute, currentTime);
  }, [startTime, endTime, currentScale, currentZoom, pixelsPerMinute, currentTime]);

  // Panning functionality
  const {
    isPanning,
    scrollLeft,
    handleTimelineMouseDown,
    handleMouseMove: handlePanningMouseMove,
    handleMouseUp: handlePanningMouseUp,
    handleMouseLeave: handlePanningMouseLeave,
    handleScroll,
  } = useTimelinePanning(totalWidth);

  // Drag functionality
  const {
    containerRef,
    dragState,
    handleTicketMouseDown,
    handleMouseMove: handleDragMouseMove,
    handleMouseUp: handleDragMouseUp,
  } = useTimelineDrag(scrollLeft, allTickets, pixelsPerMinute, startTime, onTicketUpdate);

  // Auto-center functionality
  const {
    autoCenter,
    selectedDate,
    toggleAutoCenter,
    handleDateChange,
    setSelectedDate,
    centerOnNow,
  } = useTimelineAutoCenter(startTime, pixelsPerMinute, totalWidth, isZooming, autoCenterOnNow);

  // Auto-center on now when currentTime changes (if auto-center is enabled)
  useEffect(() => {
    if (autoCenter && containerRef.current) {
      centerOnNow(containerRef, currentTime);
    }
  }, [autoCenter, currentTime, centerOnNow, containerRef]);

  // Tooltip functionality
  const {
    mousePosition,
    hoveredTime,
    handleMouseMove: handleTooltipMouseMove,
    handleMouseLeave: handleTooltipMouseLeave,
  } = useTimelineTooltip();

  // Utility functions
  const timeToPixelsFn = useCallback((time: number) => {
    return timeToPixels(time, startTime, pixelsPerMinute);
  }, [startTime, pixelsPerMinute]);

  const pixelsToTimeFn = useCallback((pixels: number) => {
    return pixelsToTime(pixels, startTime, pixelsPerMinute);
  }, [startTime, pixelsPerMinute]);

  const laneToYFn = useCallback((lane: number) => {
    return laneToY(lane, HEADER_HEIGHT, LANE_HEIGHT);
  }, []);

  // Combined mouse move handler
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // Handle tooltip
    handleTooltipMouseMove(e, scrollLeft, pixelsToTimeFn);
    
    // Handle panning
    const panningHandled = handlePanningMouseMove(e, containerRef);
    
    // Handle dragging if panning is not active
    if (!panningHandled) {
      handleDragMouseMove(e);
    }
  }, [handleTooltipMouseMove, handlePanningMouseMove, handleDragMouseMove, scrollLeft, pixelsToTimeFn, containerRef]);

  // Combined mouse up handler
  const handleMouseUp = useCallback(() => {
    handlePanningMouseUp();
    handleDragMouseUp();
  }, [handlePanningMouseUp, handleDragMouseUp]);

  // Combined mouse leave handler
  const handleMouseLeave = useCallback(() => {
    handleTooltipMouseLeave();
    handlePanningMouseLeave();
    handleMouseUp();
  }, [handleTooltipMouseLeave, handlePanningMouseLeave, handleMouseUp]);

  // Handle ticket click
  const handleTicketClick = useCallback((e: React.MouseEvent, ticket: Ticket) => {
    if (dragState.isDragging) return;
    e.stopPropagation();
    setSelectedTicket(selectedTicket === ticket.id ? null : ticket.id);
    onTicketClick?.(ticket);
  }, [dragState.isDragging, selectedTicket, onTicketClick]);

  // Handle timeline mouse down
  const handleTimelineMouseDownFn = useCallback((e: React.MouseEvent) => {
    handleTimelineMouseDown(e, containerRef);
  }, [handleTimelineMouseDown, containerRef]);

  // Handle auto-center toggle
  const handleToggleAutoCenter = useCallback(() => {
    toggleAutoCenter(containerRef);
  }, [toggleAutoCenter, containerRef]);

  // Handle date change
  const handleDateChangeFn = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    handleDateChange(event, containerRef);
  }, [handleDateChange, containerRef]);

  return {
    // Refs
    containerRef,
    
    // State
    selectedTicket,
    hoveredTicket,
    setHoveredTicket,
    mousePosition,
    hoveredTime,
    isPanning,
    scrollLeft,
    dragState,
    autoCenter,
    selectedDate,
    setSelectedDate,
    
    // Calculated values
    currentZoomConfig,
    currentScale,
    startTime,
    endTime,
    totalWidth,
    totalHeight,
    ticketsWithPositions,
    timeMarkers,
    
    // Event handlers
    handleWheel,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleTimelineMouseDown: handleTimelineMouseDownFn,
    handleTicketMouseDown,
    handleTicketClick,
    handleScroll,
    handleToggleAutoCenter,
    handleDateChange: handleDateChangeFn,
    
    // Utility functions
    timeToPixels: timeToPixelsFn,
    laneToY: laneToYFn,
  };
}
