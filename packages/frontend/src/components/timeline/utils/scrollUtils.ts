/**
 * Scroll utilities for timeline navigation
 * Supports mouse wheel horizontal scrolling and touch gestures
 */

export interface ScrollEvent {
  deltaX: number;
  deltaY: number;
  timeStamp: number;
}

export interface TouchGesture {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
  velocity: number;
  timeStamp: number;
}

export interface ScrollConfig {
  wheelSensitivity: number;
  touchSensitivity: number;
  momentumDecay: number;
  maxVelocity: number;
  debounceMs: number;
}

export const DEFAULT_SCROLL_CONFIG: ScrollConfig = {
  wheelSensitivity: 1.0,
  touchSensitivity: 1.0,
  momentumDecay: 0.95,
  maxVelocity: 100,
  debounceMs: 16, // Target 60fps
};

/**
 * Convert mouse wheel delta to horizontal scroll movement
 * Handles both horizontal (deltaX) and vertical (deltaY) wheel events
 */
export function convertWheelToHorizontalScroll(
  event: WheelEvent,
  config: ScrollConfig = DEFAULT_SCROLL_CONFIG
): number {
  // Primary: Use deltaX if available (horizontal scrolling)
  if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
    return event.deltaX * config.wheelSensitivity;
  }
  
  // Secondary: Convert deltaY to horizontal movement
  // This enables vertical mouse wheel to scroll horizontally
  return event.deltaY * config.wheelSensitivity;
}

/**
 * Calculate touch gesture properties from touch events
 * Works with both React.Touch and standard Touch interfaces
 */
export function calculateTouchGesture(
  startTouch: { clientX: number; clientY: number },
  currentTouch: { clientX: number; clientY: number },
  startTime: number,
  currentTime: number
): TouchGesture {
  const deltaX = currentTouch.clientX - startTouch.clientX;
  const deltaY = currentTouch.clientY - startTouch.clientY;
  const deltaTime = Math.max(1, currentTime - startTime); // Prevent division by zero
  const velocity = Math.abs(deltaX) / deltaTime;

  return {
    startX: startTouch.clientX,
    startY: startTouch.clientY,
    currentX: currentTouch.clientX,
    currentY: currentTouch.clientY,
    deltaX,
    deltaY,
    velocity: Math.min(velocity, DEFAULT_SCROLL_CONFIG.maxVelocity),
    timeStamp: currentTime,
  };
}

/**
 * Determine if a touch gesture is primarily horizontal
 */
export function isHorizontalGesture(gesture: TouchGesture, threshold = 0.5): boolean {
  const horizontalDistance = Math.abs(gesture.deltaX);
  const verticalDistance = Math.abs(gesture.deltaY);
  
  // If very small movement, consider it horizontal by default
  if (horizontalDistance < 10 && verticalDistance < 10) {
    return true;
  }
  
  return horizontalDistance > verticalDistance * threshold;
}

/**
 * Calculate momentum scrolling animation frame
 */
export function calculateMomentumFrame(
  currentVelocity: number,
  decay: number = DEFAULT_SCROLL_CONFIG.momentumDecay
): { velocity: number; distance: number; shouldContinue: boolean } {
  const newVelocity = currentVelocity * decay;
  const distance = newVelocity;
  const shouldContinue = Math.abs(newVelocity) > 0.1; // Stop when velocity is very low
  
  return {
    velocity: newVelocity,
    distance,
    shouldContinue,
  };
}

/**
 * Detect scroll direction based on movement delta
 */
export function getScrollDirection(delta: number): 'left' | 'right' | 'none' {
  if (Math.abs(delta) < 1) return 'none';
  return delta > 0 ? 'right' : 'left';
}

/**
 * Debounce function optimized for scroll events
 */
export function debounceScroll<T extends (...args: unknown[]) => void>(
  func: T,
  delay: number = DEFAULT_SCROLL_CONFIG.debounceMs
): T {
  let timeoutId: number | undefined;
  
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = globalThis.setTimeout(() => func(...args), delay);
  }) as T;
}

/**
 * Throttle function for high-frequency scroll events
 */
export function throttleScroll<T extends (...args: unknown[]) => void>(
  func: T,
  delay: number = DEFAULT_SCROLL_CONFIG.debounceMs
): T {
  let lastCall = 0;
  
  return ((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  }) as T;
}

/**
 * Calculate scroll boundaries based on container and content dimensions
 */
export function calculateScrollBounds(
  containerWidth: number,
  contentWidth: number
): { min: number; max: number } {
  return {
    min: 0,
    max: Math.max(0, contentWidth - containerWidth),
  };
}

/**
 * Clamp scroll position within bounds
 */
export function clampScrollPosition(
  position: number,
  bounds: { min: number; max: number }
): number {
  return Math.max(bounds.min, Math.min(bounds.max, position));
}
