import { useState, useCallback } from 'react';
import { ZOOM_LEVELS } from '../constants';

export function useTimelineZoom() {
  const [zoomLevel, setZoomLevel] = useState(0); // Start at Weekly view (index 0)
  const [isZooming, setIsZooming] = useState(false);

  const currentZoomConfig = ZOOM_LEVELS[Math.max(0, Math.min(ZOOM_LEVELS.length - 1, zoomLevel))];
  const currentScale = currentZoomConfig.scale;
  const currentZoom = currentZoomConfig.zoom;

  const handleZoomChange = useCallback((direction: 'in' | 'out') => {
    setIsZooming(true);
    
    if (direction === 'in') {
      // Zoom in: move to next higher zoom level
      setZoomLevel(prev => Math.min(ZOOM_LEVELS.length - 1, prev + 1));
    } else {
      // Zoom out: move to next lower zoom level  
      setZoomLevel(prev => Math.max(0, prev - 1));
    }
    
    // Reset zooming flag after animation completes
    setTimeout(() => setIsZooming(false), 150);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault(); // Always prevent default scroll behavior
    
    // Both regular wheel and Ctrl+Wheel now work the same way - discrete level changes
    if (e.deltaY > 0) {
      // Scroll down = zoom out
      handleZoomChange('out');
    } else {
      // Scroll up = zoom in
      handleZoomChange('in');
    }
  }, [handleZoomChange]);

  return {
    zoomLevel,
    isZooming,
    currentZoomConfig,
    currentScale,
    currentZoom,
    handleZoomChange,
    handleWheel,
  };
}
