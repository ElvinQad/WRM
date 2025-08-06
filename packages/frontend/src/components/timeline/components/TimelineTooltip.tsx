
import { TicketWithPosition } from '../types.ts';
import { getTicketDuration } from '../utils/duration.ts';

interface TimelineTooltipProps {
  mousePosition: { x: number; y: number } | null;
  hoveredTime: Date | null;
  hoveredTicket: TicketWithPosition | null;
}

export function TimelineTooltip({ mousePosition, hoveredTime, hoveredTicket }: TimelineTooltipProps) {
  if (!mousePosition) return null;

  return (
    <div
      className="fixed bg-popover text-popover-foreground text-sm px-3 py-2 rounded shadow-lg pointer-events-none z-50 border border-border"
      style={{
        left: `${mousePosition.x + 10}px`,
        top: `${mousePosition.y - 10}px`,
      }}
    >
      {hoveredTicket ? (
        <div className="space-y-1 max-w-xs">
          <div className="font-medium truncate">{hoveredTicket.title}</div>
          {hoveredTicket.category && (
            <div className="text-xs text-muted-foreground truncate">{hoveredTicket.category}</div>
          )}
          <div className="text-xs font-medium text-primary">
            Duration: {getTicketDuration(hoveredTicket).formatted}
          </div>
          <div className="text-xs text-muted-foreground">
            {hoveredTicket.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {hoveredTicket.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      ) : hoveredTime ? (
        <div>{hoveredTime.toLocaleString()}</div>
      ) : null}
    </div>
  );
}
