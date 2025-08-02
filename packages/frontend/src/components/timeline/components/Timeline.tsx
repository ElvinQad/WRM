import { useCallback } from 'react';
import { TimelineProps } from '../types.ts';
import { useTimeline } from '../hooks/useTimeline.ts';
import { HEADER_HEIGHT, LANE_HEIGHT } from '../constants.ts';
import { TimelineHeader } from './TimelineHeader.tsx';
import { TimeMarkers } from './TimeMarkers.tsx';
import { SunTimesOverlay } from './SunTimesOverlay.tsx';
import { TicketComponent } from './TicketComponent.tsx';
import { TimelineTooltip } from './TimelineTooltip.tsx';
import { FrontendTicket } from '@wrm/types';

export function Timeline({ 
  sunTimes, 
  tickets = [], 
  onTicketMove,
  onTicketResize: _onTicketResize,
  onTicketUpdate, 
  onTicketClick, 
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
    startDate,
    endDate,
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
    handleViewChange,
    handleNavigate,
    handleQuickRange,
    timeToPixels,
    laneToY,
  } = useTimeline(tickets, handleTicketUpdate, onTicketClick, autoCenterOnNow);

  return (
    <div className="flex-1 flex flex-col">
      <TimelineHeader
        autoCenter={autoCenter}
        currentView={currentView}
        startDate={startDate}
        endDate={endDate}
        onToggleAutoCenter={handleToggleAutoCenter}
        onViewChange={handleViewChange}
        onNavigate={handleNavigate}
        onQuickRange={handleQuickRange}
      />

      {/* Timeline container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto relative bg-background timeline-container"
        onWheel={handleWheel}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseDown={handleTimelineMouseDown}
        onMouseLeave={handleMouseLeave}
        onScroll={handleScroll}
        style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
      >
        {currentView === 'monthly' ? (
          /* Monthly Calendar View */
          <div className="p-4">
            <div className="grid grid-cols-7 gap-1 text-center">
              {/* Calendar header */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-2 font-semibold text-muted-foreground">
                  {day}
                </div>
              ))}
              
              {/* Calendar days - simplified for now */}
              {Array.from({ length: 42 }, (_, i) => (
                <div
                  key={i}
                  className="aspect-square p-2 border border-border bg-card hover:bg-accent rounded text-sm"
                >
                  {((i % 31) + 1).toString()}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Standard Timeline View */
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
            />
          ))}
          </div>
        )}
      </div>

      {/* Tooltip */}
      <TimelineTooltip 
        mousePosition={mousePosition} 
        hoveredTime={hoveredTime} 
      />
    </div>
  );
}
