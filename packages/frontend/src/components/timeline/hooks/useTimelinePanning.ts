import { useState, useCallback } from 'react';

export function useTimelinePanning(totalWidth: number) {
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; scrollLeft: number } | null>(null);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleTimelineMouseDown = useCallback((e: React.MouseEvent, containerRef: React.RefObject<HTMLDivElement | null>) => {
    // Only start panning if clicking on empty space (not on tickets)
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.timeline-content')) {
      setIsPanning(true);
      setPanStart({
        x: e.clientX,
        scrollLeft: containerRef.current?.scrollLeft || 0,
      });
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent, containerRef: React.RefObject<HTMLDivElement | null>) => {
    // Handle panning if active
    if (isPanning && panStart && containerRef.current) {
      const deltaX = e.clientX - panStart.x;
      const maxScrollLeft = Math.max(0, totalWidth - containerRef.current.clientWidth);
      const newScrollLeft = Math.max(0, Math.min(maxScrollLeft, panStart.scrollLeft - deltaX));
      containerRef.current.scrollLeft = newScrollLeft;
      setScrollLeft(newScrollLeft);
      return true; // Indicate that panning was handled
    }
    return false; // Indicate that panning was not handled
  }, [isPanning, panStart, totalWidth]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setPanStart(null);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPanning(false);
    setPanStart(null);
  }, []);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    // Only update scroll position for horizontal scrolling
    setScrollLeft(e.currentTarget.scrollLeft);
  }, []);

  return {
    isPanning,
    scrollLeft,
    handleTimelineMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleScroll,
  };
}
