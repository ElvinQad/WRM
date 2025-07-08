"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { generateTicketsForTimeRange } from './sampleData';
import { Ticket, TimelineProps, TicketWithPosition, TimeMarker, DragState } from './types';
import { ZOOM_LEVELS, TICKET_HEIGHT, LANE_HEIGHT, HEADER_HEIGHT, MIN_TIMELINE_HEIGHT } from './constants';


// Get zoom configuration for current zoom level index
const getZoomConfig = (zoomIndex: number) => {
  const clampedIndex = Math.max(0, Math.min(ZOOM_LEVELS.length - 1, zoomIndex));
  return ZOOM_LEVELS[clampedIndex];
};

export function Timeline({ sunTimes, tickets = [], onTicketUpdate, onTicketClick, useInfiniteTickets = false, autoCenterOnNow = false }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState(0); // Start at Weekly view (index 0)
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hoveredTicket, setHoveredTicket] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [isZooming, setIsZooming] = useState(false);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [hoveredTime, setHoveredTime] = useState<Date | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; scrollLeft: number } | null>(null);
  const [autoCenter, setAutoCenter] = useState(autoCenterOnNow); // Local state for auto-center toggle
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); // Selected date for date picker
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

  // Get current zoom configuration from zoomLevel
  const currentZoomConfig = useMemo(() => getZoomConfig(zoomLevel), [zoomLevel]);
  const currentScale = currentZoomConfig.scale;
  const currentZoom = currentZoomConfig.zoom;

  // Calculate time bounds and pixel ratio
  const { startTime, endTime, pixelsPerMinute, totalWidth } = useMemo(() => {
    const now = new Date();
    let start: Date, end: Date;
    
    switch (currentScale) {
      case 'hours': {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() - 1);
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
  }, [currentScale, currentZoom]);

  // Generate tickets based on visible time range when useInfiniteTickets is enabled
  const allTickets = useMemo(() => {
    if (useInfiniteTickets) {
      return generateTicketsForTimeRange(startTime, endTime);
    }
    return tickets;
  }, [useInfiniteTickets, startTime, endTime, tickets]);

  // Convert time to pixels
  const timeToPixels = useCallback((time: number) => {
    return ((time - startTime) / (1000 * 60)) * pixelsPerMinute;
  }, [startTime, pixelsPerMinute]);

  // Convert pixels to time
  const pixelsToTime = useCallback((pixels: number) => {
    return startTime + (pixels / pixelsPerMinute) * (1000 * 60);
  }, [startTime, pixelsPerMinute]);

  // Convert Y coordinate to lane
  const yToLane = useCallback((y: number) => {
    return Math.max(0, Math.floor((y - HEADER_HEIGHT) / LANE_HEIGHT));
  }, []);

  // Convert lane to Y coordinate
  const laneToY = useCallback((lane: number) => {
    return HEADER_HEIGHT + lane * LANE_HEIGHT;
  }, []);

  // Check if two time ranges overlap
  const timeRangesOverlap = useCallback((start1: number, end1: number, start2: number, end2: number) => {
    return start1 < end2 && start2 < end1;
  }, []);

  // Calculate ticket positioning with lane assignment
  const ticketsWithPositions = useMemo((): TicketWithPosition[] => {
    const positioned: TicketWithPosition[] = [];
    
    // Sort tickets by start time
    const sortedTickets = [...allTickets].sort((a, b) => a.start.getTime() - b.start.getTime());
    
    for (const ticket of sortedTickets) {
      const startX = timeToPixels(ticket.start.getTime());
      const endX = timeToPixels(ticket.end.getTime());
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
  }, [allTickets, timeToPixels, timeRangesOverlap]);

  // Calculate total height based on maximum lane used
  const totalHeight = useMemo(() => {
    const maxLane = ticketsWithPositions.reduce((max, item) => Math.max(max, item.lane), -1);
    const numLanes = maxLane + 1;
    const contentHeight = HEADER_HEIGHT + numLanes * LANE_HEIGHT + 20; // Minimal padding
    return Math.max(MIN_TIMELINE_HEIGHT, contentHeight);
  }, [ticketsWithPositions]);

  // Generate time markers with both major and minor intervals
  const timeMarkers = useMemo((): TimeMarker[] => {
    const markers = [];
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
        minorInterval = 6 * 60 * 60 * 1000; // 6 hours
        format = (date) => date.toLocaleDateString([], { weekday: 'short', day: 'numeric' });
        minorFormat = (date) => date.toLocaleTimeString([], { hour: '2-digit' }) + 'h';
        break;
      case 'weeks':
      default:
        majorInterval = 7 * 24 * 60 * 60 * 1000; // 1 week
        minorInterval = 24 * 60 * 60 * 1000; // 1 day
        format = (date) => `Week ${Math.ceil(date.getDate() / 7)}`;
        minorFormat = (date) => date.toLocaleDateString([], { weekday: 'short', day: 'numeric' });
        break;
    }

    // Generate major markers
    let current = new Date(Math.ceil(start.getTime() / majorInterval) * majorInterval);
    while (current <= end) {
      markers.push({
        time: current.getTime(),
        label: format(current),
        x: timeToPixels(current.getTime()),
        type: 'major' as const,
      });
      current = new Date(current.getTime() + majorInterval);
    }

    // Generate minor markers (only for days and weeks view, and if zoom level is sufficient)
    if (minorInterval > 0 && currentZoom >= 0.8) {
      current = new Date(Math.ceil(start.getTime() / minorInterval) * minorInterval);
      while (current <= end) {
        // Don't add minor markers that coincide with major markers
        const isMajorMarker = markers.some(marker => Math.abs(marker.time - current.getTime()) < minorInterval / 2);
        if (!isMajorMarker) {
          markers.push({
            time: current.getTime(),
            label: minorFormat(current),
            x: timeToPixels(current.getTime()),
            type: 'minor' as const,
          });
        }
        current = new Date(current.getTime() + minorInterval);
      }
    }

    return markers.sort((a, b) => a.time - b.time);
  }, [startTime, endTime, currentScale, currentZoom, timeToPixels]);

  // Center scroll on "Now" when zoom changes (only if autoCenter is enabled)
  useEffect(() => {
    if (!autoCenter) return;
    
    const container = containerRef.current;
    if (!container || isZooming) return;

    const centerOnNow = () => {
      const nowX = timeToPixels(Date.now());
      const containerWidth = container.clientWidth;
      const maxScrollLeft = Math.max(0, totalWidth - containerWidth);
      const newScrollLeft = Math.max(0, Math.min(maxScrollLeft, nowX - containerWidth / 2));
      
      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    };

    // Small delay to ensure DOM has updated - longer delay for smoother animation
    const timeoutId = setTimeout(centerOnNow, 200);
    return () => clearTimeout(timeoutId);
  }, [autoCenter, currentZoom, currentScale, timeToPixels, isZooming, totalWidth]);

  // Don't auto-center on load anymore - let user control the view

  // Handle zoom level change with simplified discrete levels
  const handleZoomChange = useCallback((direction: 'in' | 'out') => {
    setIsZooming(true);
    
    if (direction === 'in') {
      // Zoom in: move to next higher zoom level
      setZoomLevel(prev => Math.min(ZOOM_LEVELS.length - 1, prev + 1));
    } else {
      // Zoom out: move to next lower zoom level  
      setZoomLevel(prev => Math.max(0, prev - 1));
    }
    
    // Reset zooming flag after animation completes
    setTimeout(() => setIsZooming(false), 150);
  }, []);

  // Handle wheel zoom - simplified to discrete zoom levels
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault(); // Always prevent default scroll behavior
    
    // Both regular wheel and Ctrl+Wheel now work the same way - discrete level changes
    if (e.deltaY > 0) {
      // Scroll down = zoom out
      handleZoomChange('out');
    } else {
      // Scroll up = zoom in
      handleZoomChange('in');
    }
  }, [handleZoomChange]);

  // Handle ticket mouse events
  const handleTicketMouseDown = useCallback((e: React.MouseEvent, ticket: Ticket, currentLane: number) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left + scrollLeft;
    const y = e.clientY - rect.top;
    const ticketStart = timeToPixels(ticket.start.getTime());
    const ticketEnd = timeToPixels(ticket.end.getTime());
    
    let dragType: 'move' | 'resize-start' | 'resize-end' = 'move';
    
    // Determine drag type based on position
    if (x - ticketStart < 8) {
      dragType = 'resize-start';
    } else if (ticketEnd - x < 8) {
      dragType = 'resize-end';
    }

    setDragState({
      ticketId: ticket.id,
      isDragging: true,
      dragType,
      startX: x,
      startY: y,
      startTime: pixelsToTime(x),
      startLane: currentLane,
      originalStart: ticket.start.getTime(),
      originalEnd: ticket.end.getTime(),
      originalLane: currentLane,
    });
  }, [timeToPixels, pixelsToTime, scrollLeft]);

  // Handle mouse move for dragging and panning
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const currentX = e.clientX - rect.left + scrollLeft;
    const currentY = e.clientY - rect.top;

    // Update mouse position and hovered time for tooltip
    setMousePosition({ x: e.clientX, y: e.clientY });
    const timeAtCursor = pixelsToTime(currentX);
    setHoveredTime(new Date(timeAtCursor));

    // Handle panning if active
    if (isPanning && panStart && containerRef.current) {
      const deltaX = e.clientX - panStart.x;
      const maxScrollLeft = Math.max(0, totalWidth - containerRef.current.clientWidth);
      const newScrollLeft = Math.max(0, Math.min(maxScrollLeft, panStart.scrollLeft - deltaX));
      containerRef.current.scrollLeft = newScrollLeft;
      setScrollLeft(newScrollLeft);
      return;
    }

    if (!dragState.isDragging || !dragState.ticketId) return;

    const deltaTime = pixelsToTime(currentX) - dragState.startTime;
    const newLane = dragState.dragType === 'move' ? yToLane(currentY) : dragState.originalLane;
    
    const ticket = allTickets.find(t => t.id === dragState.ticketId);
    if (!ticket) return;

    let newStart = ticket.start.getTime();
    let newEnd = ticket.end.getTime();

    switch (dragState.dragType) {
      case 'move':
        newStart = dragState.originalStart + deltaTime;
        newEnd = dragState.originalEnd + deltaTime;
        break;
      case 'resize-start':
        newStart = Math.min(dragState.originalStart + deltaTime, dragState.originalEnd - 60000); // Min 1 minute
        break;
      case 'resize-end':
        newEnd = Math.max(dragState.originalEnd + deltaTime, dragState.originalStart + 60000); // Min 1 minute
        break;
    }

    const updatedTicket = {
      ...ticket,
      start: new Date(newStart),
      end: new Date(newEnd),
      lane: newLane,
    };

    onTicketUpdate?.(updatedTicket);
  }, [dragState, pixelsToTime, scrollLeft, allTickets, onTicketUpdate, yToLane, isPanning, panStart, totalWidth]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setPanStart(null);
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

  // Handle mouse leave to hide tooltip and stop panning
  const handleMouseLeave = useCallback(() => {
    setMousePosition(null);
    setHoveredTime(null);
    setIsPanning(false);
    setPanStart(null);
    handleMouseUp(); // Also handle any ongoing drag
  }, [handleMouseUp]);

  // Handle mouse down on timeline container (for panning)
  const handleTimelineMouseDown = useCallback((e: React.MouseEvent) => {
    // Only start panning if clicking on empty space (not on tickets)
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.timeline-content')) {
      setIsPanning(true);
      setPanStart({
        x: e.clientX,
        scrollLeft: containerRef.current?.scrollLeft || 0,
      });
    }
  }, []);

  // Handle ticket click
  const handleTicketClick = useCallback((e: React.MouseEvent, ticket: Ticket) => {
    if (dragState.isDragging) return;
    e.stopPropagation();
    setSelectedTicket(selectedTicket === ticket.id ? null : ticket.id);
    onTicketClick?.(ticket);
  }, [dragState.isDragging, selectedTicket, onTicketClick]);

  // Toggle auto-center and center on "Now"
  const toggleAutoCenter = useCallback(() => {
    const newAutoCenter = !autoCenter;
    setAutoCenter(newAutoCenter);
    
    // If enabling auto-center, immediately center on "Now"
    if (newAutoCenter) {
      const container = containerRef.current;
      if (!container) return;

      const nowX = timeToPixels(Date.now());
      const containerWidth = container.clientWidth;
      const maxScrollLeft = Math.max(0, totalWidth - containerWidth);
      const newScrollLeft = Math.max(0, Math.min(maxScrollLeft, nowX - containerWidth / 2));
      
      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  }, [autoCenter, timeToPixels, totalWidth]);

  // Center on selected date
  const centerOnDate = useCallback((date: Date) => {
    const container = containerRef.current;
    if (!container) return;

    const dateX = timeToPixels(date.getTime());
    const containerWidth = container.clientWidth;
    const maxScrollLeft = Math.max(0, totalWidth - containerWidth);
    const newScrollLeft = Math.max(0, Math.min(maxScrollLeft, dateX - containerWidth / 2));
    
    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  }, [timeToPixels, totalWidth]);

  // Handle date selector change
  const handleDateChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDateValue = event.target.value;
    if (selectedDateValue) {
      const date = new Date(selectedDateValue);
      setSelectedDate(date);
      centerOnDate(date);
    } else {
      setSelectedDate(null);
    }
  }, [centerOnDate]);

  // Handle container scroll (horizontal panning)
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    // Only update scroll position for horizontal scrolling
    setScrollLeft(e.currentTarget.scrollLeft);
  }, []);

  // Render sun times overlay
  const renderSunTimes = () => {
    if (!sunTimes) return null;

    // For longer time periods, we need to calculate sun times for multiple days
    const sunTimeOverlays = [];
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    // Generate sun times for each day in the visible range
    const current = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const dayCount = Math.ceil((end.getTime() - current.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    
    for (let i = 0; i < dayCount; i++) {
      const day = new Date(current.getTime() + i * 24 * 60 * 60 * 1000);
      
      // Skip if coordinates are not available
      if (!sunTimes.sunrise || !sunTimes.sunset) continue;
      
      // For now, use the provided sun times for today, but in a real app you'd calculate for each day
      // This is a simplified version - in production you'd want to calculate sun times for each specific day
      let daySunrise, daySunset;
      
      if (currentScale === 'hours') {
        // For hours view, use the actual provided sun times
        daySunrise = sunTimes.sunrise;
        daySunset = sunTimes.sunset;
      } else {
        // For other scales, approximate sun times for each day
        const todaySunrise = sunTimes.sunrise;
        const todaySunset = sunTimes.sunset;
        
        // Create sunrise/sunset for this day using the same time as today
        daySunrise = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 
          todaySunrise.getHours(), todaySunrise.getMinutes());
        daySunset = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 
          todaySunset.getHours(), todaySunset.getMinutes());
      }
      
      const sunriseX = timeToPixels(daySunrise.getTime());
      const sunsetX = timeToPixels(daySunset.getTime());
      
      // Only add overlays if they're within the visible timeline
      if (sunriseX >= 0 || sunsetX >= 0) {
        const dayStart = timeToPixels(day.getTime());
        const dayEnd = timeToPixels(day.getTime() + 24 * 60 * 60 * 1000);
        
        // Night time overlay - start of day until sunrise
        if (dayStart < sunriseX) {
          sunTimeOverlays.push(
            <div
              key={`night-start-${i}`}
              className="absolute bg-slate-800 opacity-20 pointer-events-none z-100"
              style={{
                left: `${Math.max(0, dayStart)}px`,
                top: 0,
                width: `${Math.max(0, sunriseX - Math.max(0, dayStart))}px`,
                height: '100%',
              }}
            />
          );
        }
        
        // Night time overlay - sunset until end of day
        if (sunsetX < dayEnd) {
          sunTimeOverlays.push(
            <div
              key={`night-end-${i}`}
              className="absolute bg-slate-800 opacity-20 pointer-events-none z-100"
              style={{
                left: `${sunsetX}px`,
                top: 0,
                width: `${Math.max(0, dayEnd - sunsetX)}px`,
                height: '100%',
              }}
            />
          );
        }
        
        // Dawn/Dusk transition zones (only for hours view to avoid clutter)
        if (currentScale === 'hours') {
          sunTimeOverlays.push(
            <div
              key={`dawn-${i}`}
              className="absolute bg-gradient-to-r from-slate-700 to-transparent opacity-15 pointer-events-none z-10"
              style={{
                left: `${Math.max(0, sunriseX - 30)}px`,
                top: 0,
                width: '60px',
                height: '100%',
              }}
            />
          );
          
          sunTimeOverlays.push(
            <div
              key={`dusk-${i}`}
              className="absolute bg-gradient-to-r from-transparent to-slate-700 opacity-15 pointer-events-none"
              style={{
                left: `${Math.max(0, sunsetX - 30)}px`,
                top: 0,
                width: '60px',
                height: '100%',
              }}
            />
          );
        }
        
        // Sunrise and sunset markers (only show for current day or when in hours view)
        if (currentScale === 'hours' || i === 0) {
          sunTimeOverlays.push(
            <div
              key={`sunrise-marker-${i}`}
              className="absolute w-1 bg-gradient-to-b from-orange-300 to-orange-500 pointer-events-none shadow-sm z-100"
              style={{ 
                left: `${sunriseX}px`,
                top: 0,
                height: '100%',
              }}
            />
          );
          
          sunTimeOverlays.push(
            <div
              key={`sunset-marker-${i}`}
              className="absolute w-1 bg-gradient-to-b from-orange-500 to-red-600 pointer-events-none shadow-sm z-100"
              style={{ 
                left: `${sunsetX}px`,
                top: 0,
                height: '100%',
              }}
            />
          );
          
          // Sun time labels (only for current day or hours view)
          if (currentScale === 'hours' || (i === 0 && currentScale === 'days')) {
            sunTimeOverlays.push(
              <div
                key={`sunrise-label-${i}`}
                className="absolute bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded shadow-sm border border-orange-200 whitespace-nowrap"
                style={{
                  left: `${sunriseX + 6}px`,
                  top: '8px',
                }}
              >
                🌅 Sunrise {daySunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            );
            
            sunTimeOverlays.push(
              <div
                key={`sunset-label-${i}`}
                className="absolute bg-red-100 text-red-800 text-xs px-2 py-1 rounded shadow-sm border border-red-200 whitespace-nowrap z-100"
                style={{
                  left: `${sunsetX + 6}px`,
                  top: '8px',
                }}
              >
                🌇 Sunset {daySunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            );
          }
        }
      }
    }

    return <>{sunTimeOverlays}</>;
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Simplified Header */}
      <div className="p-3 border-b bg-white flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 font-medium">Timeline View</span>
          <div className="bg-gray-100 px-3 py-1 rounded-lg text-sm font-medium text-gray-700">
            {currentZoomConfig.label} ({currentZoomConfig.zoom.toFixed(1)}x)
          </div>
          <button
            onClick={toggleAutoCenter}
            className={`px-3 py-1 rounded-lg text-sm transition-colors flex items-center space-x-1 ${
              autoCenter 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            title={autoCenter ? "Auto-centering ON - Click to disable" : "Auto-centering OFF - Click to enable and center"}
          >
            <span>📍</span>
            <span>{autoCenter ? 'Auto-Center ON' : 'Center Now'}</span>
          </button>
          {/* Date Selector */}
          <div className="flex items-center space-x-2">
            <label htmlFor="date-selector" className="text-sm text-gray-600 font-medium">
              📅 Go to Date:
            </label>
            <input
              id="date-selector"
              type="date"
              value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
              onChange={handleDateChange}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {selectedDate && (
              <button
                onClick={() => {
                  setSelectedDate(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-sm"
                title="Clear date selection"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        <div className="text-sm text-gray-600">
          Scroll to zoom, drag tickets to move/resize. Drag vertically to change lanes.
        </div>
      </div>

      {/* Timeline container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto relative bg-gray-50 timeline-container"
        onWheel={handleWheel}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseDown={handleTimelineMouseDown}
        onMouseLeave={handleMouseLeave}
        onScroll={handleScroll}
        style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
      >
        {/* Timeline content */}
        <div
          className="relative timeline-content"
          style={{
            width: `${totalWidth}px `,
            height: `${totalHeight}px`,
            minHeight: '100%',
          }}
        >
          {/* Hour background segments (only for hours view) */}
          {currentScale === 'hours' && (() => {
            const hourSegments = [];
            const start = new Date(startTime);
            const end = new Date(endTime);
            
            // Generate hour segments
            let current = new Date(start.getFullYear(), start.getMonth(), start.getDate(), start.getHours());
            while (current < end) { // Changed <= to < to prevent going beyond endTime
              const segmentStart = timeToPixels(current.getTime());
              const nextHour = new Date(current.getTime() + 60 * 60 * 1000);
              // Ensure we don't go beyond the adjusted endTime
              const segmentEndTime = Math.min(nextHour.getTime(), end.getTime());
              const segmentEnd = timeToPixels(segmentEndTime);
              const segmentWidth = segmentEnd - segmentStart;
              
              // Only create segment if it has positive width
              if (segmentWidth > 0) {
                // Alternate between two subtle background colors for each hour
                const isEvenHour = current.getHours() % 2 === 0;
                
                hourSegments.push(
                  <div
                    key={`hour-${current.getTime()}`}
                    className={`absolute w-full ${
                      isEvenHour ? 'bg-gray-50' : 'bg-gray-100'
                    } opacity-30`}
                    style={{
                      left: `${segmentStart}px`,
                      top: 0,
                      width: `${segmentWidth}px`,
                      height: '100%',
                    }}
                  />
                );
              }
              
              current = nextHour;
            }
            
            return hourSegments;
          })()}

          {/* Lane backgrounds */}
          {ticketsWithPositions.length > 0 && Array.from({ length: Math.max(1, ticketsWithPositions.reduce((max, item) => Math.max(max, item.lane), 0) + 1) }, (_, index) => (
            <div
              key={index}
              className={`absolute w-full border-b border-gray-200 ${
                index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
              }`}
              style={{
                top: `${HEADER_HEIGHT + index * LANE_HEIGHT}px`,
                height: `${LANE_HEIGHT}px`,
              }}
            />
          ))}

          {/* Time grid */}
          <div className="absolute inset-0">
            {timeMarkers.map((marker, index) => {
              const isMajor = marker.type === 'major';
              return (
                <div key={`${marker.type}-${index}`} className="absolute">
                  {/* Vertical line */}
                  <div
                    className={`${
                      isMajor 
                        ? 'w-0.5 bg-gray-500 opacity-80' 
                        : 'w-px bg-gray-300 opacity-50'
                    }`}
                    style={{ 
                      left: `${marker.x}px`,
                      top: 0,
                      height: '100%',
                    }}
                  />
                  {/* Time label */}
                  <div
                    className={`absolute whitespace-nowrap ${
                      isMajor
                        ? 'text-sm text-gray-800 font-semibold bg-white/95 backdrop-blur-sm px-3 py-1.5 border border-gray-400 rounded shadow-md'
                        : 'text-xs text-gray-600 font-medium bg-gray-50/90 backdrop-blur-sm px-2 py-1 border border-gray-300 rounded shadow-sm'
                    }`}
                    style={{ 
                      left: `${marker.x + (isMajor ? 6 : 4)}px`,
                      top: isMajor ? '4px' : '32px',
                    }}
                  >
                    {marker.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sun times overlay */}
          {renderSunTimes()}

          {/* Current time indicator */}
          <div
            className="absolute w-1 bg-red-500 z-20 pointer-events-none shadow-lg"
            style={{ 
              left: `${timeToPixels(Date.now())}px`,
              top: 0,
              height: '100%',
            }}
          >
            {/* Current time label */}
            <div className="absolute bg-red-500 text-white text-xs px-3 py-1 rounded-r whitespace-nowrap shadow-md border-l-2 border-red-600"
                 style={{ top: '2px' }}>
              ⏰ Now
            </div>
            {/* Pulse effect */}
            <div className="absolute w-3 bg-red-400 opacity-50 animate-pulse"
                 style={{ 
                   left: '-1px',
                   top: 0,
                   height: '100%',
                 }}>
            </div>
          </div>

          {/* Selected date indicator */}
          {selectedDate && (
            <div
              className="absolute w-1 bg-blue-500 z-20 pointer-events-none shadow-lg"
              style={{ 
                left: `${timeToPixels(selectedDate.getTime())}px`,
                top: 0,
                height: '100%',
              }}
            >
              {/* Selected date label */}
              <div className="absolute bg-blue-500 text-white text-xs px-3 py-1 rounded-r whitespace-nowrap shadow-md border-l-2 border-blue-600"
                   style={{ top: '32px' }}>
                📅 {selectedDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </div>
              {/* Glow effect */}
              <div className="absolute w-3 bg-blue-400 opacity-50 animate-pulse"
                   style={{ 
                     left: '-1px',
                     top: 0,
                     height: '100%',
                   }}>
              </div>
            </div>
          )}

          {/* Tickets */}
          {ticketsWithPositions.map(({ ticket, startX, width, lane }) => {
            const isHovered = hoveredTicket === ticket.id;
            const isSelected = selectedTicket === ticket.id;
            const isDragging = dragState.ticketId === ticket.id;
            const ticketY = laneToY(lane);

            return (
              <div key={ticket.id} className="absolute">
                {/* Ticket */}
                <div
                  className={`absolute rounded-md shadow-md border cursor-pointer transition-all duration-150 overflow-hidden ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 z-20 shadow-xl ring-2 ring-blue-200'
                      : isHovered
                      ? 'border-gray-500 bg-white z-10 shadow-lg'
                      : 'border-gray-400 bg-white/95 backdrop-blur-sm hover:shadow-lg hover:bg-white'
                  } ${isDragging ? 'opacity-80 z-30 shadow-2xl scale-105' : ''}`}
                  style={{
                    left: `${startX}px`,
                    top: `${ticketY + 4}px`, // Small margin from lane top
                    width: `${width}px`,
                    height: `${TICKET_HEIGHT}px`,
                    backgroundColor: ticket.color || '#ffffff',
                  }}
                  onMouseDown={(e) => handleTicketMouseDown(e, ticket, lane)}
                  onClick={(e) => handleTicketClick(e, ticket)}
                  onMouseEnter={() => setHoveredTicket(ticket.id)}
                  onMouseLeave={() => setHoveredTicket(null)}
                >
                  <div className="px-3 py-2 h-full flex flex-col justify-center">
                    <div className="text-sm font-semibold truncate leading-tight">{ticket.title}</div>
                    {width > 100 && (
                      <div className="text-xs text-gray-600 truncate mt-1 leading-tight">{ticket.description}</div>
                    )}
                  </div>

                  {/* Resize handles */}
                  {isSelected && (
                    <>
                      <div className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize bg-blue-500 opacity-50 hover:opacity-75" />
                      <div className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize bg-blue-500 opacity-50 hover:opacity-75" />
                    </>
                  )}

                  {/* Lane indicator */}
                  <div className="absolute top-1 right-2 text-xs text-gray-400 bg-gray-100 px-1 rounded">
                    L{lane}
                  </div>
                </div>

                {/* Tooltip */}
                {isHovered && !isDragging && (
                  <div
                    className="absolute bg-gray-900 text-white text-xs p-3 rounded-lg shadow-2xl z-50 pointer-events-none border border-gray-700"
                    style={{
                      left: `${Math.max(0, startX)}px`,
                      top: `${Math.max(HEADER_HEIGHT, ticketY - 8)}px`,
                      maxWidth: '280px',
                      transform: 'translateY(-100%)',
                    }}
                  >
                    <div className="font-semibold text-sm text-blue-300">{ticket.title}</div>
                    <div className="text-gray-300 mt-1 text-xs">{ticket.description}</div>
                    <div className="text-gray-400 mt-2 space-y-1 text-xs">
                      <div>⏰ Start: {ticket.start.toLocaleString()}</div>
                      <div>⏰ End: {ticket.end.toLocaleString()}</div>
                      <div>📍 Lane: {lane}</div>
                      {ticket.category && <div>🏷️ Category: {ticket.category}</div>}
                    </div>
                    {/* Tooltip arrow */}
                    <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Floating time tooltip */}
          {mousePosition && hoveredTime && (
            <div
              className="fixed bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-2xl z-50 pointer-events-none border border-gray-700"
              style={{
                left: `${mousePosition.x + 10}px`,
                top: `${mousePosition.y - 10}px`,
                transform: 'translateY(-100%)',
              }}
            >
              <div className="font-semibold text-blue-300">
                {hoveredTime.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="text-gray-300 mt-1">
                {hoveredTime.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </div>
              {/* Tooltip arrow */}
              <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
