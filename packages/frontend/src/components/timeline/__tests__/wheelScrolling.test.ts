import { describe, it, expect } from 'vitest';
import { convertWheelToHorizontalScroll, calculateScrollBounds, clampScrollPosition, getScrollDirection } from '../utils/scrollUtils.ts';

describe('Timeline Mouse Wheel Scroll Calculations', () => {
  describe('convertWheelToHorizontalScroll', () => {
    it('should convert horizontal wheel delta to horizontal scroll', () => {
      const mockEvent = {
        deltaX: 50,
        deltaY: 10,
      } as WheelEvent;

      const result = convertWheelToHorizontalScroll(mockEvent);
      expect(result).toBe(50); // Should use deltaX when it's larger
    });

    it('should convert vertical wheel delta to horizontal scroll', () => {
      const mockEvent = {
        deltaX: 5,
        deltaY: 100,
      } as WheelEvent;

      const result = convertWheelToHorizontalScroll(mockEvent);
      expect(result).toBe(100); // Should use deltaY when it's larger
    });

    it('should apply sensitivity multiplier', () => {
      const mockEvent = {
        deltaX: 0,
        deltaY: 50,
      } as WheelEvent;

      const config = { wheelSensitivity: 2.0, touchSensitivity: 1.0, momentumDecay: 0.95, maxVelocity: 100, debounceMs: 16 };
      const result = convertWheelToHorizontalScroll(mockEvent, config);
      expect(result).toBe(100); // 50 * 2.0
    });

    it('should handle zero delta values', () => {
      const mockEvent = {
        deltaX: 0,
        deltaY: 0,
      } as WheelEvent;

      const result = convertWheelToHorizontalScroll(mockEvent);
      expect(result).toBe(0);
    });
  });

  describe('calculateScrollBounds', () => {
    it('should calculate correct bounds when content is larger than container', () => {
      const bounds = calculateScrollBounds(800, 1200);
      expect(bounds.min).toBe(0);
      expect(bounds.max).toBe(400); // 1200 - 800
    });

    it('should handle case when container is larger than content', () => {
      const bounds = calculateScrollBounds(1200, 800);
      expect(bounds.min).toBe(0);
      expect(bounds.max).toBe(0); // No scrolling needed
    });

    it('should handle equal dimensions', () => {
      const bounds = calculateScrollBounds(800, 800);
      expect(bounds.min).toBe(0);
      expect(bounds.max).toBe(0);
    });
  });

  describe('clampScrollPosition', () => {
    const bounds = { min: 0, max: 400 };

    it('should clamp position within bounds', () => {
      expect(clampScrollPosition(200, bounds)).toBe(200);
      expect(clampScrollPosition(-50, bounds)).toBe(0);
      expect(clampScrollPosition(500, bounds)).toBe(400);
    });

    it('should handle boundary values', () => {
      expect(clampScrollPosition(0, bounds)).toBe(0);
      expect(clampScrollPosition(400, bounds)).toBe(400);
    });
  });

  describe('getScrollDirection', () => {
    it('should detect scroll direction correctly', () => {
      expect(getScrollDirection(50)).toBe('right');
      expect(getScrollDirection(-50)).toBe('left');
      expect(getScrollDirection(0.5)).toBe('none');
      expect(getScrollDirection(-0.5)).toBe('none');
    });
  });

  describe('Performance Requirements', () => {
    it('should process wheel events within 16ms for 60fps', () => {
      const startTime = performance.now();
      
      // Simulate multiple wheel events
      for (let i = 0; i < 100; i++) {
        const mockEvent = {
          deltaX: Math.random() * 100,
          deltaY: Math.random() * 100,
        } as WheelEvent;
        
        convertWheelToHorizontalScroll(mockEvent);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should process 100 events well under 16ms
      expect(duration).toBeLessThan(16);
    });

    it('should handle rapid scroll bound calculations efficiently', () => {
      const startTime = performance.now();
      
      // Simulate rapid boundary checking
      const bounds = calculateScrollBounds(800, 5000);
      for (let i = 0; i < 1000; i++) {
        clampScrollPosition(Math.random() * 6000 - 1000, bounds);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should handle 1000 boundary checks well under 16ms
      expect(duration).toBeLessThan(16);
    });
  });
});
