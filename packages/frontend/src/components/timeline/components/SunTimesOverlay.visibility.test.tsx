import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SunTimesOverlay } from './SunTimesOverlay.tsx';

describe('SunTimesOverlay - Day/Night Visibility Fix', () => {
  const mockSunTimes = {
    sunrise: new Date('2024-01-01T06:30:00Z'),
    sunset: new Date('2024-01-01T18:30:00Z'),
    nextSunrise: new Date('2024-01-02T06:30:00Z'),
  };

  const timeToPixels = (time: number) => {
    const baseTime = new Date('2024-01-01T00:00:00Z').getTime();
    const hoursFromStart = (time - baseTime) / (1000 * 60 * 60);
    return hoursFromStart * 60; // 60 pixels per hour
  };

  const startTime = new Date('2024-01-01T00:00:00Z').getTime();
  const endTime = new Date('2024-01-01T23:59:59Z').getTime();

  it('should render night overlays with improved visibility for daily view', () => {
    const { container } = render(
      <SunTimesOverlay
        sunTimes={mockSunTimes}
        startTime={startTime}
        endTime={endTime}
        currentScale="daily"
        timeToPixels={timeToPixels}
      />
    );

    // Check for night overlays
    const nightOverlays = container.querySelectorAll('[class*="bg-slate-800"]');
    expect(nightOverlays.length).toBeGreaterThan(0);

    // Verify improved opacity - should be more visible now
    const firstNightOverlay = nightOverlays[0] as HTMLElement;
    const opacity = parseFloat(firstNightOverlay.style.opacity);
    expect(opacity).toBeGreaterThan(0.3); // Should be more visible than before
  });

  it('should render day overlays with improved visibility', () => {
    const { container } = render(
      <SunTimesOverlay
        sunTimes={mockSunTimes}
        startTime={startTime}
        endTime={endTime}
        currentScale="daily"
        timeToPixels={timeToPixels}
      />
    );

    // Check for day overlays
    const dayOverlays = container.querySelectorAll('[class*="bg-yellow-100"]');
    expect(dayOverlays.length).toBeGreaterThan(0);

    // Verify improved opacity
    const firstDayOverlay = dayOverlays[0] as HTMLElement;
    const opacity = parseFloat(firstDayOverlay.style.opacity);
    expect(opacity).toBeGreaterThan(0.2); // Should be more visible than before
  });

  it('should render dawn/dusk transitions for daily views', () => {
    const { container: dailyContainer } = render(
      <SunTimesOverlay
        sunTimes={mockSunTimes}
        startTime={startTime}
        endTime={endTime}
        currentScale="daily"
        timeToPixels={timeToPixels}
      />
    );

    // Check for gradient transitions in daily view
    const dailyTransitions = dailyContainer.querySelectorAll('[class*="bg-gradient-to-r"]');
    expect(dailyTransitions.length).toBeGreaterThan(0);

    const { container: weeklyContainer } = render(
      <SunTimesOverlay
        sunTimes={mockSunTimes}
        startTime={startTime}
        endTime={endTime}
        currentScale="weekly"
        timeToPixels={timeToPixels}
      />
    );

    // Weekly view should have no transitions (since we removed hourly logic)
    const weeklyTransitions = weeklyContainer.querySelectorAll('[class*="bg-gradient-to-r"]');
    expect(weeklyTransitions.length).toBe(0);
  });

  it('should render markers with proper z-index', () => {
    const { container } = render(
      <SunTimesOverlay
        sunTimes={mockSunTimes}
        startTime={startTime}
        endTime={endTime}
        currentScale="daily"
        timeToPixels={timeToPixels}
      />
    );

    // Check for sunrise/sunset markers
    const markers = container.querySelectorAll('[class*="bg-gradient-to-b"]');
    expect(markers.length).toBeGreaterThanOrEqual(2); // sunrise and sunset markers

    // Verify z-index is set properly
    const firstMarker = markers[0] as HTMLElement;
    expect(firstMarker.style.zIndex).toBe('50');
  });

  it('should show overlays in weekly view for first day', () => {
    const { container } = render(
      <SunTimesOverlay
        sunTimes={mockSunTimes}
        startTime={startTime}
        endTime={endTime}
        currentScale="weekly"
        timeToPixels={timeToPixels}
      />
    );

    // Even in weekly view, should show some overlays
    const allOverlays = container.querySelectorAll('[class*="absolute"]');
    expect(allOverlays.length).toBeGreaterThan(0);
  });
});
