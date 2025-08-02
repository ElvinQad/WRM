import { useState, useMemo, useCallback, useEffect } from 'react';
import { FrontendTicket as Ticket, TimeMarker, TicketWithPosition } from '@wrm/types';
import { useTimelineDrag } from './useTimelineDrag.ts';
import { useTimelinePanning } from './useTimelinePanning.ts';
import { useTimelineAutoCenter } from './useTimelineAutoCenter.ts';
import { useTimelineTooltip } from './useTimelineTooltip.ts';
import { useAppSelector, useAppDispatch } from '../../../store/hooks.ts';
import { setView, setDateRange, navigateTimelinePrevious, navigateTimelineNext, setQuickRange, TimelineView } from '../../../store/slices/timelineSlice.ts';
import { 
  calculateTicketPositions, 
  generateTimeMarkers,
  pixelsToTime,
  timeToPixels,
  laneToY 
} from '../utils/timelineUtils.ts';
import { HEADER_HEIGHT, LANE_HEIGHT, MIN_TIMELINE_HEIGHT } from '../constants.ts';

export function useTimeline(
  tickets: Ticket[],
  onTicketUpdate?: (ticket: Ticket) => void,
  onTicketClick?: (ticket: Ticket) => void,
  autoCenterOnNow = false
) {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [hoveredTicket, setHoveredTicket] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Redux state for view and date range management
  const currentView = useAppSelector((state) => state.timeline.currentView);
  const startDate = useAppSelector((state) => state.timeline.startDate);
  const endDate = useAppSelector((state) => state.timeline.endDate);
  const dispatch = useAppDispatch();

  // Update current time every 30 seconds for real-time "now" marker
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Calculate time bounds and pixel ratio based on date range
  // Use Redux date range state instead of fixed view bounds
  const { startTime, endTime, pixelsPerMinute, totalWidth } = useMemo(() => {
    const rangeMs = endDate.getTime() - startDate.getTime();
    const rangeMinutes = rangeMs / (1000 * 60);
    
    // Calculate appropriate pixels per minute based on range and view
    let pixelsPerMin: number;
    switch (currentView) {
      case 'daily':
        pixelsPerMin = Math.max(3, 600 / rangeMinutes);
        break;
      case 'weekly':
        pixelsPerMin = Math.max(1, 150 / rangeMinutes);
        break;

      default:
        pixelsPerMin = 5;
    }
    
    const width = rangeMinutes * pixelsPerMin;
    
    return {
      startTime: startDate.getTime(),
      endTime: endDate.getTime(),
      pixelsPerMinute: pixelsPerMin,
      totalWidth: Math.max(800, width), // Minimum width
    };
  }, [currentView, startDate, endDate]);


  // Calculate ticket positioning with lane assignment
  const ticketsWithPositions = useMemo((): TicketWithPosition[] => {
    return calculateTicketPositions(tickets, startTime, pixelsPerMinute);
  }, [tickets, startTime, pixelsPerMinute]);

  // Calculate total height based on maximum lane used
  const totalHeight = useMemo(() => {
    const maxLane = ticketsWithPositions.reduce((max, item) => Math.max(max, item.lane), -1);
    const numLanes = maxLane + 1;
    const contentHeight = HEADER_HEIGHT + numLanes * LANE_HEIGHT + 20; // Minimal padding
    return Math.max(MIN_TIMELINE_HEIGHT, contentHeight);
  }, [ticketsWithPositions]);

  // Generate time markers (includes real-time "now" marker)
  const timeMarkers = useMemo((): TimeMarker[] => {
    // No zoom scaling - using pixelsPerMinute directly for marker generation
    return generateTimeMarkers(startTime, endTime, currentView, pixelsPerMinute, currentTime);
  }, [startTime, endTime, currentView, pixelsPerMinute, currentTime]);

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
  } = useTimelineDrag(scrollLeft, tickets, pixelsPerMinute, startTime, onTicketUpdate);

  // Auto-center functionality (no longer requires zoom state)
  const {
    autoCenter,
    selectedDate,
    toggleAutoCenter,
    handleDateChange,
    setSelectedDate,
    centerOnNow,
  } = useTimelineAutoCenter(startTime, pixelsPerMinute, totalWidth, autoCenterOnNow);

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

  // Handle view change
  const handleViewChange = useCallback((view: TimelineView) => {
    dispatch(setView(view));
  }, [dispatch]);

  // Handle date range change with debouncing for performance
  const handleDateRangeChange = useCallback((newStartDate: Date, newEndDate: Date) => {
    // Immediate UI feedback
    dispatch(setDateRange({ startDate: newStartDate, endDate: newEndDate }));
  }, [dispatch]);

  // Handle navigation
  const handleNavigate = useCallback((direction: 'previous' | 'next') => {
    if (direction === 'previous') {
      dispatch(navigateTimelinePrevious());
    } else {
      dispatch(navigateTimelineNext());
    }
  }, [dispatch]);

  // Handle quick range selection
  const handleQuickRange = useCallback((range: string) => {
    dispatch(setQuickRange(range));
  }, [dispatch]);

  // Handle wheel events for vertical scrolling only (no zoom)
  const handleWheel = useCallback(() => {
    // Allow normal vertical scrolling, no zoom functionality
    // This lets the browser handle container scrolling naturally
  }, []);

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
    currentView,
    startDate,
    endDate,
    
    // Calculated values
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
    handleViewChange,
    handleDateRangeChange,
    handleNavigate,
    handleQuickRange,
    
    // Utility functions
    timeToPixels: timeToPixelsFn,
    laneToY: laneToYFn,
  };
}
