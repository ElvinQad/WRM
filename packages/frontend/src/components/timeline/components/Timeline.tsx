import { useCallback } from 'react';
import { TimelineProps } from '../types.ts';
import { useTimeline } from '../hooks/useTimeline.ts';
import { HEADER_HEIGHT, LANE_HEIGHT } from '../constants.ts';
import { TimelineHeader } from './TimelineHeader.tsx';
import { TimeMarkers } from './TimeMarkers.tsx';
import { SunTimesOverlay } from './SunTimesOverlay.tsx';
import { TicketComponent } from './TicketComponent.tsx';
import { TimelineTooltip } from './TimelineTooltip.tsx';
import { HeatMapNavigator } from './HeatMapNavigator.tsx';
import { TicketsPool } from './TicketsPool.tsx';
import { FrontendTicket } from '@wrm/types';

export function Timeline({ 
  sunTimes, 
  tickets = [], 
  poolTickets = [],
  onTicketMove,
  onTicketResize: _onTicketResize,
  onTicketUpdate, 
  onTicketClick, 
  onTicketSchedule,
  onTicketMoveToPool,
  onPoolTicketReorder,
  autoCenterOnNow = false 
}: TimelineProps) {
  // Use onTicketUpdate if available (preferred for full ticket updates including lanes),
  // otherwise fall back to onTicketMove for time-only updates
  const handleTicketUpdate = useCallback((updatedTicket: FrontendTicket) => {
    if (onTicketUpdate) {
      // Use the full ticket update callback (handles lanes, time, everything)
      onTicketUpdate(updatedTicket);
    } else if (onTicketMove) {
      // Fall back to time-only update (legacy)
      onTicketMove(updatedTicket.id, updatedTicket.start, updatedTicket.end);
    }
  }, [onTicketUpdate, onTicketMove]);

  const {
    containerRef,
    selectedTicket,
    hoveredTicket,
    setHoveredTicket,
    mousePosition,
    hoveredTime,
    isPanning,
    autoCenter,
    currentView,
    startDate: _startDate,
    endDate: _endDate,
    totalWidth,
    totalHeight,
    ticketsWithPositions,
    timeMarkers,
    startTime,
    endTime,
    handleWheel,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleTimelineMouseDown,
    handleTicketMouseDown,
    handleTicketClick,
    handleScroll,
    handleToggleAutoCenter,
    handleViewChange,
    timeToPixels,
    laneToY,
  } = useTimeline(tickets, handleTicketUpdate, onTicketClick, autoCenterOnNow);

  return (
    <div className="flex-1 flex flex-col">
      <TimelineHeader
        autoCenter={autoCenter}
        currentView={currentView}
        onToggleAutoCenter={handleToggleAutoCenter}
        onViewChange={handleViewChange}
      />

      {/* Main content area with timeline and pool */}
      <div className="flex-1 flex">
        {/* Timeline container */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto relative bg-background timeline-container"
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseDown={handleTimelineMouseDown}
          onMouseLeave={handleMouseLeave}
          onScroll={handleScroll}
          style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
        >
          <div
            className="relative timeline-content"
            style={{
              width: `${totalWidth}px`,
              height: `${totalHeight}px`,
              minHeight: '100%',
              backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '60px 40px',
          }}
        >
          {/* Lane backgrounds */}
          {ticketsWithPositions.length > 0 && Array.from({ 
            length: Math.max(1, ticketsWithPositions.reduce((max, item) => Math.max(max, item.lane), 0) + 1) 
          }, (_, index) => (
            <div
              key={index}
              className={`absolute w-full border-b border-border/50 ${
                index % 2 === 0 ? 'bg-background/80' : 'bg-card/80'
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
            currentScale={currentView}
            timeToPixels={timeToPixels}
          />

          {/* Tickets */}
          {ticketsWithPositions.map((ticketWithPosition) => (
            <TicketComponent
              key={ticketWithPosition.id}
              ticketWithPosition={ticketWithPosition}
              isSelected={selectedTicket === ticketWithPosition.id}
              isHovered={hoveredTicket === ticketWithPosition.id}
              onMouseDown={(e) => handleTicketMouseDown(e, ticketWithPosition, ticketWithPosition.lane)}
              onClick={(e) => handleTicketClick(e, ticketWithPosition)}
              onMouseEnter={() => setHoveredTicket(ticketWithPosition.id)}
              onMouseLeave={() => setHoveredTicket(null)}
              laneToY={laneToY}
              onMoveToPool={onTicketMoveToPool ? (ticket) => onTicketMoveToPool(ticket) : undefined}
              showPoolAction // Timeline tickets show "Move to Pool" action
            />
          ))}
          </div>
      </div>

      </div>

      {/* Tooltip */}
      <TimelineTooltip 
        mousePosition={mousePosition} 
        hoveredTime={hoveredTime}
        hoveredTicket={hoveredTicket ? ticketsWithPositions.find(t => t.id === hoveredTicket) || null : null}
      />

      {/* Heat Map Navigator - Enhanced view below timeline */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="p-6">
          <HeatMapNavigator
            tickets={tickets}
            currentView={currentView}
            className="max-w-4xl mx-auto"
          />
        </div>
      </div>

      {/* Tickets Pool - Below heat map */}
      <TicketsPool
        tickets={poolTickets}
        onTicketSchedule={onTicketSchedule || (() => {})}
        onTicketReorder={onPoolTicketReorder}
        onTicketClick={onTicketClick}
      />
    </div>
  );
}
