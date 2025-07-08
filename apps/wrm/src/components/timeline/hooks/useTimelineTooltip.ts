import { useState, useCallback } from 'react';

export function useTimelineTooltip() {
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [hoveredTime, setHoveredTime] = useState<Date | null>(null);

  const handleMouseMove = useCallback((
    e: React.MouseEvent,
    scrollLeft: number,
    pixelsToTime: (pixels: number) => number
  ) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const currentX = e.clientX - rect.left + scrollLeft;
    
    // Update mouse position and hovered time for tooltip
    setMousePosition({ x: e.clientX, y: e.clientY });
    const timeAtCursor = pixelsToTime(currentX);
    setHoveredTime(new Date(timeAtCursor));
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMousePosition(null);
    setHoveredTime(null);
  }, []);

  return {
    mousePosition,
    hoveredTime,
    handleMouseMove,
    handleMouseLeave,
  };
}
