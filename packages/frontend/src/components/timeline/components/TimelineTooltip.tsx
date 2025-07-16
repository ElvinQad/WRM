
interface TimelineTooltipProps {
  mousePosition: { x: number; y: number } | null;
  hoveredTime: Date | null;
}

export function TimelineTooltip({ mousePosition, hoveredTime }: TimelineTooltipProps) {
  if (!mousePosition || !hoveredTime) return null;

  return (
    <div
      className="fixed bg-popover text-popover-foreground text-sm px-3 py-2 rounded shadow-lg pointer-events-none z-50 border border-border"
      style={{
        left: `${mousePosition.x + 10}px`,
        top: `${mousePosition.y - 10}px`,
      }}
    >
      {hoveredTime.toLocaleString()}
    </div>
  );
}
