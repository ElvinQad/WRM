import React, { useCallback, useRef, useState, useEffect } from 'react';
import { clsx } from 'clsx';

export interface DateRangeSliderProps {
  /** Start date value */
  startDate: Date;
  /** End date value */
  endDate: Date;
  /** Minimum selectable date */
  minDate: Date;
  /** Maximum selectable date */
  maxDate: Date;
  /** Callback when date range changes */
  onChange: (startDate: Date, endDate: Date) => void;
  /** Optional className for styling */
  className?: string;
  /** Whether the slider is disabled */
  disabled?: boolean;
  /** Format function for displaying dates */
  formatDate?: (date: Date) => string;
}

export function DateRangeSlider({
  startDate,
  endDate,
  minDate,
  maxDate,
  onChange,
  className,
  disabled = false,
  formatDate = (date: Date) => date.toLocaleDateString(),
}: DateRangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  // Convert date to percentage position
  const dateToPercent = useCallback((date: Date): number => {
    const totalRange = maxDate.getTime() - minDate.getTime();
    const dateOffset = date.getTime() - minDate.getTime();
    return Math.max(0, Math.min(100, (dateOffset / totalRange) * 100));
  }, [minDate, maxDate]);

  // Convert percentage to date
  const percentToDate = useCallback((percent: number): Date => {
    const totalRange = maxDate.getTime() - minDate.getTime();
    const timeOffset = (percent / 100) * totalRange;
    return new Date(minDate.getTime() + timeOffset);
  }, [minDate, maxDate]);

  // Get current positions
  const startPercent = dateToPercent(startDate);
  const endPercent = dateToPercent(endDate);

  // Handle mouse down on handles
  const handleMouseDown = useCallback((type: 'start' | 'end', event: React.MouseEvent) => {
    if (disabled || !trackRef.current) return;
    
    event.preventDefault();
    setIsDragging(type);
    
    const trackRect = trackRef.current.getBoundingClientRect();
    const handlePercent = type === 'start' ? startPercent : endPercent;
    const handlePixelPos = (handlePercent / 100) * trackRect.width;
    setDragOffset(event.clientX - trackRect.left - handlePixelPos);
  }, [disabled, startPercent, endPercent]);

  // Handle mouse move
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isDragging || !trackRef.current) return;

    const trackRect = trackRef.current.getBoundingClientRect();
    const relativeX = event.clientX - trackRect.left - dragOffset;
    const percent = Math.max(0, Math.min(100, (relativeX / trackRect.width) * 100));
    const newDate = percentToDate(percent);

    if (isDragging === 'start') {
      // Ensure start date doesn't go beyond end date
      const maxStart = new Date(endDate.getTime() - 60000); // At least 1 minute gap
      const clampedDate = new Date(Math.min(newDate.getTime(), maxStart.getTime()));
      onChange(clampedDate, endDate);
    } else {
      // Ensure end date doesn't go before start date
      const minEnd = new Date(startDate.getTime() + 60000); // At least 1 minute gap
      const clampedDate = new Date(Math.max(newDate.getTime(), minEnd.getTime()));
      onChange(startDate, clampedDate);
    }
  }, [isDragging, dragOffset, startDate, endDate, onChange, percentToDate]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
    setDragOffset(0);
  }, []);

  // Track click to move nearest handle
  const handleTrackClick = useCallback((event: React.MouseEvent) => {
    if (disabled || !trackRef.current || isDragging) return;

    const trackRect = trackRef.current.getBoundingClientRect();
    const clickX = event.clientX - trackRect.left;
    const clickPercent = (clickX / trackRect.width) * 100;
    const clickDate = percentToDate(clickPercent);

    // Determine which handle is closer
    const distanceToStart = Math.abs(clickDate.getTime() - startDate.getTime());
    const distanceToEnd = Math.abs(clickDate.getTime() - endDate.getTime());

    if (distanceToStart < distanceToEnd) {
      // Move start handle
      const maxStart = new Date(endDate.getTime() - 60000);
      const clampedDate = new Date(Math.min(clickDate.getTime(), maxStart.getTime()));
      onChange(clampedDate, endDate);
    } else {
      // Move end handle
      const minEnd = new Date(startDate.getTime() + 60000);
      const clampedDate = new Date(Math.max(clickDate.getTime(), minEnd.getTime()));
      onChange(startDate, clampedDate);
    }
  }, [disabled, isDragging, startDate, endDate, onChange, percentToDate]);

  // Add global mouse listeners when dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className={clsx('w-full', className)}>
      {/* Date range display */}
      <div className="flex items-center justify-between mb-2 text-sm text-muted-foreground">
        <span>{formatDate(startDate)}</span>
        <span className="text-xs">to</span>
        <span>{formatDate(endDate)}</span>
      </div>

      {/* Slider track */}
      <div className="relative">
        <div
          ref={trackRef}
          className={clsx(
            'relative h-2 bg-muted rounded-full cursor-pointer',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          onClick={handleTrackClick}
        >
          {/* Active range */}
          <div
            className="absolute h-full bg-primary rounded-full"
            style={{
              left: `${startPercent}%`,
              width: `${endPercent - startPercent}%`,
            }}
          />

          {/* Start handle */}
          <div
            className={clsx(
              'absolute w-4 h-4 bg-background border-2 border-primary rounded-full cursor-grab transform -translate-y-1/2 -translate-x-1/2 transition-transform hover:scale-110',
              isDragging === 'start' && 'cursor-grabbing scale-110',
              disabled && 'cursor-not-allowed opacity-50'
            )}
            style={{
              left: `${startPercent}%`,
              top: '50%',
            }}
            onMouseDown={(e) => handleMouseDown('start', e)}
          />

          {/* End handle */}
          <div
            className={clsx(
              'absolute w-4 h-4 bg-background border-2 border-primary rounded-full cursor-grab transform -translate-y-1/2 -translate-x-1/2 transition-transform hover:scale-110',
              isDragging === 'end' && 'cursor-grabbing scale-110',
              disabled && 'cursor-not-allowed opacity-50'
            )}
            style={{
              left: `${endPercent}%`,
              top: '50%',
            }}
            onMouseDown={(e) => handleMouseDown('end', e)}
          />
        </div>
      </div>
    </div>
  );
}
