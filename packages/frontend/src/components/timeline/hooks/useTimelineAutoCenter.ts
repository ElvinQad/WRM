import { useState, useEffect, useCallback, useRef } from 'react';
import { timeToPixels } from '../utils/timelineUtils';

export function useTimelineAutoCenter(
  startTime: number,
  pixelsPerMinute: number,
  totalWidth: number,
  isZooming: boolean,
  autoCenterOnNow = false
) {
  const [autoCenter, setAutoCenter] = useState(autoCenterOnNow);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const containerRefRef = useRef<React.RefObject<HTMLDivElement | null> | null>(null);

  const centerOnNow = useCallback((containerRef: React.RefObject<HTMLDivElement | null>, currentTime?: number) => {
    const container = containerRef.current;
    if (!container) return;

    const nowTime = currentTime || Date.now();
    const nowX = timeToPixels(nowTime, startTime, pixelsPerMinute);
    const containerWidth = container.clientWidth;
    const maxScrollLeft = Math.max(0, totalWidth - containerWidth);
    const newScrollLeft = Math.max(0, Math.min(maxScrollLeft, nowX - containerWidth / 2));
    
    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  }, [startTime, pixelsPerMinute, totalWidth]);

  // Center scroll on "Now" when auto-center is enabled and timeline parameters change
  useEffect(() => {
    if (!autoCenter || !containerRefRef.current) return;
    
    // Small delay to ensure DOM has updated and smooth animation
    const timeoutId = setTimeout(() => {
      if (containerRefRef.current) {
        centerOnNow(containerRefRef.current);
      }
    }, 200);
    
    return () => clearTimeout(timeoutId);
  }, [autoCenter, startTime, pixelsPerMinute, isZooming, totalWidth, centerOnNow]);

  // Auto-center on now when the component first mounts with autoCenterOnNow enabled
  useEffect(() => {
    if (autoCenterOnNow && containerRefRef.current) {
      const timeoutId = setTimeout(() => {
        if (containerRefRef.current) {
          centerOnNow(containerRefRef.current);
        }
      }, 300); // Slightly longer delay for initial load
      
      return () => clearTimeout(timeoutId);
    }
    
    return undefined; // Return undefined when no cleanup is needed
  }, [autoCenterOnNow, centerOnNow]);

  const centerOnDate = useCallback((date: Date, containerRef: React.RefObject<HTMLDivElement | null>) => {
    const container = containerRef.current;
    if (!container) return;

    const dateX = timeToPixels(date.getTime(), startTime, pixelsPerMinute);
    const containerWidth = container.clientWidth;
    const maxScrollLeft = Math.max(0, totalWidth - containerWidth);
    const newScrollLeft = Math.max(0, Math.min(maxScrollLeft, dateX - containerWidth / 2));
    
    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  }, [startTime, pixelsPerMinute, totalWidth]);

  const toggleAutoCenter = useCallback((containerRef: React.RefObject<HTMLDivElement | null>) => {
    const newAutoCenter = !autoCenter;
    setAutoCenter(newAutoCenter);
    containerRefRef.current = containerRef;
    
    // If enabling auto-center, immediately center on "Now"
    if (newAutoCenter) {
      centerOnNow(containerRef);
    }
  }, [autoCenter, centerOnNow]);

  const handleDateChange = useCallback((event: React.ChangeEvent<HTMLInputElement>, containerRef: React.RefObject<HTMLDivElement | null>) => {
    const selectedDateValue = event.target.value;
    if (selectedDateValue) {
      const date = new Date(selectedDateValue);
      setSelectedDate(date);
      centerOnDate(date, containerRef);
    } else {
      setSelectedDate(null);
    }
  }, [centerOnDate]);

  return {
    autoCenter,
    selectedDate,
    centerOnNow,
    centerOnDate,
    toggleAutoCenter,
    handleDateChange,
    setSelectedDate,
  };
}
