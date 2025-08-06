import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { navigateToHeatMapDate, clearHeatMapSelection } from '../../../store/slices/timelineSlice.ts';
import { 
  convertWheelToHorizontalScroll, 
  calculateScrollBounds, 
  clampScrollPosition,
  calculateTouchGesture,
  isHorizontalGesture,
  calculateMomentumFrame,
  DEFAULT_SCROLL_CONFIG 
} from '../utils/scrollUtils.ts';
import { pixelsToTime } from '../utils/timelineUtils.ts';
import type { RootState } from '../../../store/index.ts';

interface TouchState {
  isActive: boolean;
  startTouch: { clientX: number; clientY: number } | null;
  startTime: number;
  startScrollLeft: number;
  momentum: {
    velocity: number;
    animationId: number | null;
  };
}

interface ScrollBoundaryInfo {
  nearLeftEdge: boolean;
  nearRightEdge: boolean;
  currentTime: number;
  loadedStartTime: number;
  loadedEndTime: number;
}

export function useTimelinePanning(
  totalWidth: number, 
  startTime?: number, 
  pixelsPerMinute?: number,
  onDataLoadingNeeded?: (direction: 'previous' | 'next') => void
) {
  const dispatch = useDispatch();
  const { selectedHeatMapDate } = useSelector((state: RootState) => state.timeline);
  const loadedDateRanges = useSelector((state: RootState) => state.timeline.loadedDateRanges || []);
  
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; scrollLeft: number } | null>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  // Touch state management
  const [touchState, setTouchState] = useState<TouchState>({
    isActive: false,
    startTouch: null,
    startTime: 0,
    startScrollLeft: 0,
    momentum: {
      velocity: 0,
      animationId: null,
    },
  });

  // Calculate boundary information for selective loading
  const calculateScrollBoundaries = useCallback((containerScrollLeft: number, containerWidth: number): ScrollBoundaryInfo => {
    if (!startTime || !pixelsPerMinute) {
      return {
        nearLeftEdge: false,
        nearRightEdge: false,
        currentTime: Date.now(),
        loadedStartTime: Date.now(),
        loadedEndTime: Date.now(),
      };
    }

    // Calculate the currently visible time range
    const leftVisibleTime = pixelsToTime(containerScrollLeft, startTime, pixelsPerMinute);
    const rightVisibleTime = pixelsToTime(containerScrollLeft + containerWidth, startTime, pixelsPerMinute);
    
    // Find the overall loaded time range
    const sortedRanges = [...loadedDateRanges].sort((a, b) => a.start.getTime() - b.start.getTime());
    const loadedStartTime = sortedRanges.length > 0 ? sortedRanges[0].start.getTime() : startTime;
    const loadedEndTime = sortedRanges.length > 0 ? sortedRanges[sortedRanges.length - 1].end.getTime() : startTime;
    
    // Define boundary threshold (e.g., 20% of visible area)
    const visibleDuration = rightVisibleTime - leftVisibleTime;
    const boundaryThreshold = visibleDuration * 0.2;
    
    // Check if we're near the edges of loaded data
    const nearLeftEdge = leftVisibleTime - loadedStartTime < boundaryThreshold;
    const nearRightEdge = loadedEndTime - rightVisibleTime < boundaryThreshold;
    
    return {
      nearLeftEdge,
      nearRightEdge,
      currentTime: (leftVisibleTime + rightVisibleTime) / 2,
      loadedStartTime,
      loadedEndTime,
    };
  }, [startTime, pixelsPerMinute, loadedDateRanges]);

  // Handle boundary detection and trigger prefetching
  const handleScrollBoundary = useCallback((scrollLeft: number, containerWidth: number) => {
    if (!onDataLoadingNeeded) return;

    const boundaries = calculateScrollBoundaries(scrollLeft, containerWidth);
    
    if (boundaries.nearLeftEdge && scrollLeft <= 100) {
      // Near left edge, trigger previous period loading
      onDataLoadingNeeded('previous');
    } else if (boundaries.nearRightEdge && scrollLeft >= totalWidth - containerWidth - 100) {
      // Near right edge, trigger next period loading
      onDataLoadingNeeded('next');
    }
  }, [calculateScrollBoundaries, onDataLoadingNeeded, totalWidth]);

  // Heat map navigation handlers
  const navigateToDate = useCallback((date: Date) => {
    dispatch(navigateToHeatMapDate(date));
  }, [dispatch]);

  const clearDateSelection = useCallback(() => {
    dispatch(clearHeatMapSelection());
  }, [dispatch]);

  // Momentum animation handler
  const animateMomentum = useCallback((containerRef: React.RefObject<HTMLDivElement | null>) => {
    const container = containerRef.current;
    if (!container || !touchState.momentum.velocity) return;

    const frame = calculateMomentumFrame(touchState.momentum.velocity);
    
    if (!frame.shouldContinue) {
      setTouchState(prev => ({
        ...prev,
        momentum: { velocity: 0, animationId: null }
      }));
      return;
    }

    const bounds = calculateScrollBounds(container.clientWidth, totalWidth);
    const newScrollLeft = clampScrollPosition(container.scrollLeft + frame.distance, bounds);
    
    container.scrollLeft = newScrollLeft;
    setScrollLeft(newScrollLeft);
    
    // Check for boundary conditions during momentum scrolling
    handleScrollBoundary(newScrollLeft, container.clientWidth);
    
    setTouchState(prev => ({
      ...prev,
      momentum: { 
        velocity: frame.velocity, 
        animationId: globalThis.requestAnimationFrame(() => animateMomentum(containerRef))
      }
    }));
  }, [touchState.momentum.velocity, totalWidth, handleScrollBoundary]);

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent, containerRef: React.RefObject<HTMLDivElement | null>) => {
    const container = containerRef.current;
    if (!container || e.touches.length !== 1) return;

    // Cancel any ongoing momentum animation
    if (touchState.momentum.animationId) {
      globalThis.cancelAnimationFrame(touchState.momentum.animationId);
    }

    const touch = e.touches[0];
    const now = Date.now();

    setTouchState({
      isActive: true,
      startTouch: { clientX: touch.clientX, clientY: touch.clientY },
      startTime: now,
      startScrollLeft: container.scrollLeft,
      momentum: { velocity: 0, animationId: null }
    });
  }, [touchState.momentum.animationId]);

  const handleTouchMove = useCallback((e: React.TouchEvent, containerRef: React.RefObject<HTMLDivElement | null>) => {
    const container = containerRef.current;
    if (!container || !touchState.isActive || !touchState.startTouch || e.touches.length !== 1) return;

    const currentTouch = e.touches[0];
    const gesture = calculateTouchGesture(
      touchState.startTouch,
      { clientX: currentTouch.clientX, clientY: currentTouch.clientY },
      touchState.startTime,
      Date.now()
    );

    // Only handle horizontal gestures
    if (!isHorizontalGesture(gesture)) return;

    // Calculate new scroll position
    const bounds = calculateScrollBounds(container.clientWidth, totalWidth);
    const newScrollLeft = clampScrollPosition(
      touchState.startScrollLeft - gesture.deltaX * DEFAULT_SCROLL_CONFIG.touchSensitivity,
      bounds
    );

    container.scrollLeft = newScrollLeft;
    setScrollLeft(newScrollLeft);
    
    // Check for boundary conditions
    handleScrollBoundary(newScrollLeft, container.clientWidth);

    // Prevent default to avoid page scrolling
    e.preventDefault();
  }, [touchState.isActive, touchState.startTouch, touchState.startTime, touchState.startScrollLeft, totalWidth, handleScrollBoundary]);

  const handleTouchEnd = useCallback((e: React.TouchEvent, containerRef: React.RefObject<HTMLDivElement | null>) => {
    const container = containerRef.current;
    if (!container || !touchState.isActive || !touchState.startTouch) return;

    const touch = e.changedTouches[0];
    const gesture = calculateTouchGesture(
      touchState.startTouch,
      { clientX: touch.clientX, clientY: touch.clientY },
      touchState.startTime,
      Date.now()
    );

    // Apply momentum if the gesture was horizontal and had sufficient velocity
    if (isHorizontalGesture(gesture) && gesture.velocity > 0.5) {
      const momentumVelocity = -gesture.deltaX * 0.1; // Convert to momentum velocity
      
      setTouchState(prev => ({
        ...prev,
        isActive: false,
        momentum: { 
          velocity: Math.sign(momentumVelocity) * Math.min(Math.abs(momentumVelocity), DEFAULT_SCROLL_CONFIG.maxVelocity),
          animationId: null
        }
      }));
      
      // Start momentum animation
      globalThis.requestAnimationFrame(() => animateMomentum(containerRef));
    } else {
      setTouchState(prev => ({
        ...prev,
        isActive: false,
        momentum: { velocity: 0, animationId: null }
      }));
    }
  }, [touchState.isActive, touchState.startTouch, touchState.startTime, animateMomentum]);

  // Mouse wheel horizontal scrolling handler
  const handleWheel = useCallback((e: React.WheelEvent, containerRef: React.RefObject<HTMLDivElement | null>) => {
    const container = containerRef.current;
    if (!container) return;

    // Convert wheel movement to horizontal scroll
    const horizontalDelta = convertWheelToHorizontalScroll(e.nativeEvent);
    
    // Calculate scroll bounds
    const bounds = calculateScrollBounds(container.clientWidth, totalWidth);
    
    // Calculate new scroll position
    const currentScrollLeft = container.scrollLeft;
    const newScrollLeft = clampScrollPosition(currentScrollLeft + horizontalDelta, bounds);
    
    // Apply scroll immediately for responsiveness
    container.scrollLeft = newScrollLeft;
    setScrollLeft(newScrollLeft);
    
    // Check for boundary conditions
    handleScrollBoundary(newScrollLeft, container.clientWidth);
    
    // Prevent default scrolling behavior
    e.preventDefault();
  }, [totalWidth, handleScrollBoundary]);

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
      const bounds = calculateScrollBounds(containerRef.current.clientWidth, totalWidth);
      const newScrollLeft = clampScrollPosition(panStart.scrollLeft - deltaX, bounds);
      containerRef.current.scrollLeft = newScrollLeft;
      setScrollLeft(newScrollLeft);
      
      // Check for boundary conditions
      handleScrollBoundary(newScrollLeft, containerRef.current.clientWidth);
      
      return true; // Indicate that panning was handled
    }
    return false; // Indicate that panning was not handled
  }, [isPanning, panStart, totalWidth, handleScrollBoundary]);

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
    const newScrollLeft = e.currentTarget.scrollLeft;
    setScrollLeft(newScrollLeft);
    
    // Check for boundary conditions
    handleScrollBoundary(newScrollLeft, e.currentTarget.clientWidth);
  }, [handleScrollBoundary]);

  return {
    isPanning,
    scrollLeft,
    isTouch: touchState.isActive,
    boundaries: startTime && pixelsPerMinute ? calculateScrollBoundaries(scrollLeft, 800) : undefined,
    handleWheel,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTimelineMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleScroll,
    // Heat map navigation
    navigateToDate,
    clearDateSelection,
    selectedHeatMapDate,
  };
}
