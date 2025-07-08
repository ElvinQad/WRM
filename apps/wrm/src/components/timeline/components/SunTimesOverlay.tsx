import React from 'react';
import { TimeScale } from '../types';

interface SunTimesOverlayProps {
  sunTimes: { sunrise: Date; sunset: Date; nextSunrise: Date } | null;
  startTime: number;
  endTime: number;
  currentScale: TimeScale;
  timeToPixels: (time: number) => number;
}

export function SunTimesOverlay({
  sunTimes,
  startTime,
  endTime,
  currentScale,
  timeToPixels,
}: SunTimesOverlayProps) {
  if (!sunTimes) return null;

  const sunTimeOverlays = [];
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  // Generate sun times for each day in the visible range
  const current = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const dayCount = Math.ceil((end.getTime() - current.getTime()) / (24 * 60 * 60 * 1000)) + 1;
  
  for (let i = 0; i < dayCount; i++) {
    const day = new Date(current.getTime() + i * 24 * 60 * 60 * 1000);
    
    // Skip if coordinates are not available
    if (!sunTimes.sunrise || !sunTimes.sunset) continue;
    
    // For now, use the provided sun times for today, but in a real app you'd calculate for each day
    // This is a simplified version - in production you'd want to calculate sun times for each specific day
    let daySunrise, daySunset;
    
    if (currentScale === 'hours') {
      // For hours view, use the actual provided sun times
      daySunrise = sunTimes.sunrise;
      daySunset = sunTimes.sunset;
    } else {
      // For other scales, approximate sun times for each day
      const todaySunrise = sunTimes.sunrise;
      const todaySunset = sunTimes.sunset;
      
      // Create sunrise/sunset for this day using the same time as today
      daySunrise = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 
        todaySunrise.getHours(), todaySunrise.getMinutes());
      daySunset = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 
        todaySunset.getHours(), todaySunset.getMinutes());
    }
    
    const sunriseX = timeToPixels(daySunrise.getTime());
    const sunsetX = timeToPixels(daySunset.getTime());
    
    // Only add overlays if they're within the visible timeline
    if (sunriseX >= 0 || sunsetX >= 0) {
      const dayStart = timeToPixels(day.getTime());
      const dayEnd = timeToPixels(day.getTime() + 24 * 60 * 60 * 1000);
      
      // Night time overlay - start of day until sunrise
      if (dayStart < sunriseX) {
        sunTimeOverlays.push(
          <div
            key={`night-start-${i}`}
            className="absolute bg-slate-800 opacity-20 pointer-events-none z-50"
            style={{
              left: `${Math.max(0, dayStart)}px`,
              top: 0,
              width: `${Math.max(0, sunriseX - Math.max(0, dayStart))}px`,
              height: '100%',
            }}
          />
        );
      }
      
      // Night time overlay - sunset until end of day
      if (sunsetX < dayEnd) {
        sunTimeOverlays.push(
          <div
            key={`night-end-${i}`}
            className="absolute bg-slate-800 opacity-20 pointer-events-none z-100"
            style={{
              left: `${sunsetX}px`,
              top: 0,
              width: `${Math.max(0, dayEnd - sunsetX)}px`,
              height: '100%',
            }}
          />
        );
      }
      
      // Dawn/Dusk transition zones (only for hours view to avoid clutter)
      if (currentScale === 'hours') {
        sunTimeOverlays.push(
          <div
            key={`dawn-${i}`}
            className="absolute bg-gradient-to-r from-slate-700 to-transparent opacity-15 pointer-events-none z-10"
            style={{
              left: `${Math.max(0, sunriseX - 30)}px`,
              top: 0,
              width: '60px',
              height: '100%',
            }}
          />
        );
        
        sunTimeOverlays.push(
          <div
            key={`dusk-${i}`}
            className="absolute bg-gradient-to-r from-transparent to-slate-700 opacity-15 pointer-events-none"
            style={{
              left: `${Math.max(0, sunsetX - 30)}px`,
              top: 0,
              width: '60px',
              height: '100%',
            }}
          />
        );
      }
      
      // Sunrise and sunset markers (only show for current day or when in hours view)
      if (currentScale === 'hours' || i === 0) {
        sunTimeOverlays.push(
          <div
            key={`sunrise-marker-${i}`}
            className="absolute w-1 bg-gradient-to-b from-orange-300 to-orange-500 pointer-events-none shadow-sm z-50"
            style={{ 
              left: `${sunriseX}px`,
              top: 0,
              height: '100%',
            }}
          />
        );
        
        sunTimeOverlays.push(
          <div
            key={`sunset-marker-${i}`}
            className="absolute w-1 bg-gradient-to-b from-orange-500 to-red-600 pointer-events-none shadow-sm z-50"
            style={{ 
              left: `${sunsetX}px`,
              top: 0,
              height: '100%',
            }}
          />
        );
        
        // Sun time labels (only for current day or hours view)
        if (currentScale === 'hours' || (i === 0 && currentScale === 'days')) {
          sunTimeOverlays.push(
            <div
              key={`sunrise-label-${i}`}
              className="absolute bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded shadow-sm border border-orange-200 whitespace-nowrap"
              style={{
                left: `${sunriseX + 6}px`,
                bottom: '8px',
              }}
            >
              🌅 Sunrise {daySunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          );
          
          sunTimeOverlays.push(
            <div
              key={`sunset-label-${i}`}
              className="absolute bg-red-100 text-red-800 text-xs px-2 py-1 rounded shadow-sm border border-red-200 whitespace-nowrap "
              style={{
                left: `${sunsetX + 6}px`,
                bottom: '8px',
              }}
            >
              🌇 Sunset {daySunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          );
        }
      }
    }
  }

  return <>{sunTimeOverlays}</>;
}
