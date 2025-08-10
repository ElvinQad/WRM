import { useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FrontendTicket } from '@wrm/types';
import { Button } from '../../ui/Button.tsx';
import { TicketComponent } from './TicketComponent.tsx';
import { TimelineTooltip } from './TimelineTooltip.tsx';
import { setPoolExpanded, reorderPoolTickets } from '../../../store/slices/timelineSlice.ts';
import type { RootState } from '../../../store/index.ts';

interface TicketsPoolProps {
  tickets: FrontendTicket[];
  onTicketSchedule: (ticket: FrontendTicket) => void;
  onTicketReorder?: (ticketId: string, newPosition: number) => void;
  onTicketClick?: (ticket: FrontendTicket) => void;
  className?: string;
}

interface DragState {
  isDragging: boolean;
  draggedTicketId: string | null;
  draggedFromIndex: number;
  dragOverIndex: number;
}

interface TooltipState {
  mousePosition: { x: number; y: number } | null;
  hoveredTicket: FrontendTicket | null;
}

export function TicketsPool({ 
  tickets, 
  onTicketSchedule, 
  onTicketReorder: _onTicketReorder,
  onTicketClick,
  className = '' 
}: TicketsPoolProps) {
  const dispatch = useDispatch();
  const poolExpanded = useSelector((state: RootState) => state.timeline.poolExpanded);
  
  // Drag state for pool reordering
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedTicketId: null,
    draggedFromIndex: -1,
    dragOverIndex: -1,
  });

  // Tooltip state for hover information
  const [tooltipState, setTooltipState] = useState<TooltipState>({
    mousePosition: null,
    hoveredTicket: null,
  });

  const handleToggleExpansion = useCallback(() => {
    dispatch(setPoolExpanded(!poolExpanded));
  }, [dispatch, poolExpanded]);  

  const handleScheduleTicket = useCallback(async (ticket: FrontendTicket) => {
    try {
      // Delegate scheduling to parent callback to avoid duplicate API calls
      await Promise.resolve(onTicketSchedule?.(ticket));
    } catch (error) {
      console.error('Failed to schedule ticket from pool:', error);
    }
  }, [onTicketSchedule]);

  // Handle ticket clicks to open modal
  const handleTicketClick = useCallback((ticket: FrontendTicket) => {
    if (onTicketClick) {
      onTicketClick(ticket);
    }
  }, [onTicketClick]);

  // Tooltip handlers
  const handleTicketMouseEnter = useCallback((e: React.MouseEvent, ticket: FrontendTicket) => {
    setTooltipState({
      mousePosition: { x: e.clientX, y: e.clientY },
      hoveredTicket: ticket,
    });
  }, []);

  const handleTicketMouseMove = useCallback((e: React.MouseEvent) => {
    setTooltipState(prev => ({
      ...prev,
      mousePosition: { x: e.clientX, y: e.clientY },
    }));
  }, []);

  const handleTicketMouseLeave = useCallback(() => {
    setTooltipState({
      mousePosition: null,
      hoveredTicket: null,
    });
  }, []);

  // Pool drag handlers
  const handleDragStart = useCallback((ticketId: string, index: number) => {
    setDragState({
      isDragging: true,
      draggedTicketId: ticketId,
      draggedFromIndex: index,
      dragOverIndex: index,
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragState.isDragging) {
      setDragState(prev => ({ ...prev, dragOverIndex: index }));
    }
  }, [dragState.isDragging]);

  const handleDragEnd = useCallback(() => {
    if (dragState.isDragging && dragState.draggedTicketId && dragState.dragOverIndex !== dragState.draggedFromIndex) {
      // Dispatch reorder action
      dispatch(reorderPoolTickets({
        ticketId: dragState.draggedTicketId,
        newPosition: dragState.dragOverIndex,
      }));
    }
    
    setDragState({
      isDragging: false,
      draggedTicketId: null,
      draggedFromIndex: -1,
      dragOverIndex: -1,
    });
  }, [dragState, dispatch]);

  // Convert pool tickets to positioned format for rendering
  const poolTicketsWithPositions = tickets.map((ticket) => ({
    ...ticket,
    startX: 0, // Pool doesn't use time-based positioning
    endX: 300, // Fixed width for pool tickets
    width: 300, 
    lane: 0, // Pool uses single lane
    statusBorderColor: '#e2e8f0', // Default border color
    statusBackgroundColor: ticket.color || '#f1f5f9', // Use ticket color or default
  }));

  return (
    <div className={`border-t border-border bg-card/50 backdrop-blur-sm relative ${className}`}>
      {/* Pool Header */}
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-medium text-foreground">Tickets Pool</h3>
          <span className="text-sm text-muted-foreground">
            {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleToggleExpansion}
          className="text-muted-foreground hover:text-foreground"
        >
          {poolExpanded ? 'Collapse' : 'Expand'}
        </Button>
      </div>

      {/* Pool Content */}
      {poolExpanded && (
        <div className="p-4">
          {tickets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No tickets in pool</p>
              <p className="text-sm mt-2">
                Move tickets here from the timeline to queue them
              </p>
            </div>
          ) : (
            <div 
              className="relative min-h-[200px] bg-background/50 rounded-lg border border-border/30"
              style={{ 
                height: `${Math.max(200, tickets.length * 60 + 40)}px`,
              }}
            >
              {/* Pool tickets with drag-drop reordering */}
              {poolTicketsWithPositions.map((ticketWithPosition, index) => (
                <div
                  key={ticketWithPosition.id}
                  className={`absolute left-4 flex items-center gap-2 transition-all duration-200 ${
                    dragState.draggedTicketId === ticketWithPosition.id ? 'opacity-50' : ''
                  } ${
                    dragState.dragOverIndex === index && dragState.isDragging ? 'transform translate-y-1' : ''
                  }`}
                  style={{
                    top: `${20 + index * 60}px`,
                    width: '90%',
                  }}
                  draggable
                  onDragStart={() => handleDragStart(ticketWithPosition.id, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  {/* FIFO Queue indicator with visual priority */}
                  <div className="flex-shrink-0 flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 ${
                      index === 0 
                        ? 'bg-green-100 border-green-300 text-green-700' // Next to be scheduled
                        : 'bg-muted/50 border-muted text-muted-foreground'
                    }`}>
                      #{index + 1}
                    </div>
                    {index === 0 && (
                      <div className="text-xs text-green-600 font-medium">NEXT</div>
                    )}
                  </div>
                  
                  {/* Ticket component with pool status indicator */}
                  <div 
                    className="flex-1 relative"
                    onMouseEnter={(e) => handleTicketMouseEnter(e, ticketWithPosition)}
                    onMouseMove={handleTicketMouseMove}
                    onMouseLeave={handleTicketMouseLeave}
                  >
                    <TicketComponent
                      ticketWithPosition={ticketWithPosition}
                      isSelected={false}
                      isHovered={tooltipState.hoveredTicket?.id === ticketWithPosition.id}
                      onMouseDown={() => {}} // Pool tickets don't use drag-drop for repositioning
                      onClick={() => handleTicketClick(ticketWithPosition)} // Enable modal opening
                      onMouseEnter={() => {}}
                      onMouseLeave={() => {}}
                      laneToY={() => 0} // Pool uses fixed positioning
                      showPoolAction={false} // Pool tickets don't show "Move to Pool" action
                    />
                    {/* Unscheduled status badge */}
                    <div className="absolute -top-1 -right-1 bg-orange-100 border border-orange-300 text-orange-700 text-xs px-2 py-0.5 rounded-full font-medium">
                      QUEUED
                    </div>
                  </div>

                  {/* Schedule button */}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleScheduleTicket(ticketWithPosition)}
                    className="flex-shrink-0 text-xs"
                  >
                    Schedule
                  </Button>
                </div>
              ))}

              {/* Enhanced FIFO indicator with visual flow */}
              <div className="absolute bottom-2 right-2 flex items-center gap-2">
                <div className="text-xs text-muted-foreground">
                  FIFO Queue
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>First In</span>
                  <span>→</span>
                  <span>First Out</span>
                </div>
                {tickets.length > 0 && (
                  <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    Next: #{1}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tooltip for pool tickets */}
      <TimelineTooltip
        mousePosition={tooltipState.mousePosition}
        hoveredTime={null}
        hoveredTicket={tooltipState.hoveredTicket ? {
          ...tooltipState.hoveredTicket,
          startX: 0,
          endX: 300,
          width: 300,
          lane: 0,
          statusBorderColor: '#e2e8f0',
          statusBackgroundColor: tooltipState.hoveredTicket.color || '#f1f5f9',
        } : null}
      />
    </div>
  );
}
