import React from 'react';
import { TimelineProps } from '../types';
import { useTimeline } from '../hooks/useTimeline';
import { HEADER_HEIGHT, LANE_HEIGHT } from '../constants';
import { TimelineHeader } from './TimelineHeader';
import { TimeMarkers } from './TimeMarkers';
import { SunTimesOverlay } from './SunTimesOverlay';
import { TicketComponent } from './TicketComponent';
import { TimelineTooltip } from './TimelineTooltip';

export function Timeline({ 
  sunTimes, 
  tickets = [], 
  onTicketUpdate, 
  onTicketClick, 
  useInfiniteTickets = false, 
  autoCenterOnNow = false 
}: TimelineProps) {
  const {
    containerRef,
    selectedTicket,
    hoveredTicket,
    setHoveredTicket,
    mousePosition,
    hoveredTime,
    isPanning,
    autoCenter,
    selectedDate,
    setSelectedDate,
    currentZoomConfig,
    currentScale,
    totalWidth,
    totalHeight,
    ticketsWithPositions,
    timeMarkers,
    startTime,
    endTime,
    handleWheel,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleTimelineMouseDown,
    handleTicketMouseDown,
    handleTicketClick,
    handleScroll,
    handleToggleAutoCenter,
    handleDateChange,
    timeToPixels,
    laneToY,
  } = useTimeline(tickets, useInfiniteTickets, onTicketUpdate, onTicketClick, autoCenterOnNow);

  return (
    <div className="flex-1 flex flex-col">
      <TimelineHeader
        currentZoomConfig={currentZoomConfig}
        autoCenter={autoCenter}
        selectedDate={selectedDate}
        onToggleAutoCenter={handleToggleAutoCenter}
        onDateChange={handleDateChange}
        onClearDate={() => setSelectedDate(null)}
      />

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
            width: `${totalWidth}px`,
            height: `${totalHeight}px`,
            minHeight: '100%',
          }}
        >
          {/* Lane backgrounds */}
          {ticketsWithPositions.length > 0 && Array.from({ 
            length: Math.max(1, ticketsWithPositions.reduce((max, item) => Math.max(max, item.lane), 0) + 1) 
          }, (_, index) => (
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

          {/* Time markers */}
          <TimeMarkers 
            markers={timeMarkers} 
            headerHeight={HEADER_HEIGHT} 
            totalHeight={totalHeight} 
          />

          {/* Sun times overlay */}
          <SunTimesOverlay
            sunTimes={sunTimes || null}
            startTime={startTime}
            endTime={endTime}
            currentScale={currentScale}
            timeToPixels={timeToPixels}
          />

          {/* Tickets */}
          {ticketsWithPositions.map((ticketWithPosition) => (
            <TicketComponent
              key={ticketWithPosition.ticket.id}
              ticketWithPosition={ticketWithPosition}
              isSelected={selectedTicket === ticketWithPosition.ticket.id}
              isHovered={hoveredTicket === ticketWithPosition.ticket.id}
              onMouseDown={(e) => handleTicketMouseDown(e, ticketWithPosition.ticket, ticketWithPosition.lane)}
              onClick={(e) => handleTicketClick(e, ticketWithPosition.ticket)}
              onMouseEnter={() => setHoveredTicket(ticketWithPosition.ticket.id)}
              onMouseLeave={() => setHoveredTicket(null)}
              laneToY={laneToY}
            />
          ))}
        </div>
      </div>

      {/* Tooltip */}
      <TimelineTooltip 
        mousePosition={mousePosition} 
        hoveredTime={hoveredTime} 
      />
    </div>
  );
}
