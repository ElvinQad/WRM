import { TimelineView } from '../../../store/slices/timelineSlice.ts';

interface SunTimesOverlayProps {
  sunTimes: { sunrise: Date; sunset: Date; nextSunrise: Date } | null;
  startTime: number;
  endTime: number;
  currentScale: TimelineView;
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

  // Adjust opacity based on scale for better visibility
  const getOpacity = (baseOpacity: number) => {
    let alpha: number;
    switch (currentScale) {
      case 'daily':
        alpha = 0.4; // More visible for daily view
        break;
      case 'weekly':
        alpha = 0.4; // Less prominent for weekly
        break;
      case 'monthly':
      default:
        alpha = 0.3; // Subtle for monthly
        break;
    }
    return Math.min(1.0, alpha * baseOpacity); // Ensure we don't exceed 1.0
  };

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
    
    if (currentScale === 'daily' && i === 0) {
      // For daily view on current day, use the actual provided sun times
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
    
    // Only add overlays if they're within the visible timeline or if we're showing basic day/night
    if (sunriseX >= 0 || sunsetX >= 0 || currentScale === 'daily') {
      const dayStart = timeToPixels(day.getTime());
      const dayEnd = timeToPixels(day.getTime() + 24 * 60 * 60 * 1000);
      
      // Night time overlay - start of day until sunrise
      if (dayStart < sunriseX) {
        sunTimeOverlays.push(
          <div
            key={`night-start-${i}`}
            className="absolute bg-slate-800 pointer-events-none"
            style={{
              left: `${Math.max(0, dayStart)}px`,
              top: 0,
              width: `${Math.max(0, sunriseX - Math.max(0, dayStart))}px`,
              height: '100%',
              opacity: getOpacity(1.0), // More visible
              zIndex: 5,
            }}
          />
        );
        
        // Add a subtle blue overlay for night time
        sunTimeOverlays.push(
          <div
            key={`night-start-blue-${i}`}
            className="absolute bg-blue-800 pointer-events-none"
            style={{
              left: `${Math.max(0, dayStart)}px`,
              top: 0,
              width: `${Math.max(0, sunriseX - Math.max(0, dayStart))}px`,
              height: '100%',
              opacity: getOpacity(0.3), // Additional blue tint
              zIndex: 6,
            }}
          />
        );
      }
      
      // Night time overlay - sunset until end of day
      if (sunsetX < dayEnd) {
        sunTimeOverlays.push(
          <div
            key={`night-end-${i}`}
            className="absolute bg-slate-800 pointer-events-none"
            style={{
              left: `${sunsetX}px`,
              top: 0,
              width: `${Math.max(0, dayEnd - sunsetX)}px`,
              height: '100%',
              opacity: getOpacity(1.0), // More visible
              zIndex: 5,
            }}
          />
        );
        
        // Add a subtle blue overlay for night time
        sunTimeOverlays.push(
          <div
            key={`night-end-blue-${i}`}
            className="absolute bg-blue-800 pointer-events-none"
            style={{
              left: `${sunsetX}px`,
              top: 0,
              width: `${Math.max(0, dayEnd - sunsetX)}px`,
              height: '100%',
              opacity: getOpacity(0.3), // Additional blue tint
              zIndex: 6,
            }}
          />
        );
      }
      
      // Day time overlay - sunrise to sunset
      if (sunriseX < sunsetX) {
        sunTimeOverlays.push(
          <div
            key={`day-${i}`}
            className="absolute bg-yellow-100 pointer-events-none"
            style={{
              left: `${sunriseX}px`,
              top: 0,
              width: `${Math.max(0, sunsetX - sunriseX)}px`,
              height: '100%',
              opacity: getOpacity(0.8), // More visible day overlay
              zIndex: 4,
            }}
          />
        );
      }
      
      // Dawn/Dusk transition zones (show for daily views)
      if (currentScale === 'daily') {
        // Transition zone width for daily view
        const transitionWidth = 45;
        
        sunTimeOverlays.push(
          <div
            key={`dawn-${i}`}
            className="absolute bg-gradient-to-r from-slate-700 to-orange-200 pointer-events-none"
            style={{
              left: `${Math.max(0, sunriseX - transitionWidth / 2)}px`,
              top: 0,
              width: `${transitionWidth}px`,
              height: '100%',
              opacity: getOpacity(0.8), // More visible transition
              zIndex: 7,
            }}
          />
        );
        
        sunTimeOverlays.push(
          <div
            key={`dusk-${i}`}
            className="absolute bg-gradient-to-r from-yellow-200 to-slate-700 pointer-events-none"
            style={{
              left: `${Math.max(0, sunsetX - transitionWidth / 2)}px`,
              top: 0,
              width: `${transitionWidth}px`,
              height: '100%',
              opacity: getOpacity(0.8), // More visible transition
              zIndex: 7,
            }}
          />
        );
      }
      
            // Sunrise and sunset markers (show for current day or daily view)
      if (currentScale === 'daily' || i === 0) {
        sunTimeOverlays.push(
          <div
            key={`sunrise-marker-${i}`}
            className="absolute w-1 bg-gradient-to-b from-orange-300 to-orange-500 pointer-events-none shadow-sm"
            style={{ 
              left: `${sunriseX}px`,
              top: 0,
              height: '100%',
              zIndex: 50,
            }}
          />
        );
        
        sunTimeOverlays.push(
          <div
            key={`sunset-marker-${i}`}
            className="absolute w-1 bg-gradient-to-b from-orange-500 to-red-600 pointer-events-none shadow-sm"
            style={{ 
              left: `${sunsetX}px`,
              top: 0,
              height: '100%',
              zIndex: 50,
            }}
          />
        );
        
        // Sun time labels (show for daily views and first day for weekly)
        if (currentScale === 'daily' || (i === 0 && currentScale === 'weekly')) {
          sunTimeOverlays.push(
            <div
              key={`sunrise-label-${i}`}
              className="absolute bg-orange-900/30 text-orange-300 text-xs px-2 py-1 rounded shadow-sm border border-orange-600/40 whitespace-nowrap"
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
              className="absolute bg-red-900/30 text-red-300 text-xs px-2 py-1 rounded shadow-sm border border-red-600/40 whitespace-nowrap"
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
