// Timeline-specific types for the WRM frontend components
// Enhanced for Epic 1 (Dynamic Timeline)
import { FrontendTicket, TicketStatus, TimelineConflict, TicketWithPosition } from './types.ts';

/**
 * Epic 1: Timeline view modes from PRD
 */
export type TimelineView =  'daily' | 'weekly';

/**
 * Epic 1: Enhanced timeline component props
 */
export interface TimelineProps {
  view: TimelineView;
  dateRange: { start: Date; end: Date };
  tickets?: FrontendTicket[];
  onTicketMove?: (ticketId: string, newStartTime: Date, newEndTime?: Date) => void;
  onTicketResize?: (ticketId: string, newEndTime: Date) => void;
  onTicketUpdate?: (updatedTicket: FrontendTicket) => void; // New: for full ticket updates including lanes
  onTicketClick?: (ticket: FrontendTicket) => void;
  onTicketCreate?: (startTime: Date, endTime: Date, typeId?: string) => void;
  onViewChange?: (view: TimelineView) => void;
  onDateRangeChange?: (range: { start: Date; end: Date }) => void;
  
  // Epic 1: Real-time features
  enableRealTimeUpdates?: boolean;
  showConflicts?: boolean;
  
  // Optional legacy props
  sunTimes?: { sunrise: Date; sunset: Date; nextSunrise: Date } | null;
  autoCenterOnNow?: boolean;
}

/**
 * Epic 1: Enhanced drag state for timeline interactions
 */
export interface DragState {
  ticketId: string | null;
  isDragging: boolean;
  dragType: 'move' | 'resize-start' | 'resize-end' | 'create' | null;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  startTime: number;
  startLane: number;
  originalStart: number;
  originalEnd: number;
  originalLane: number;
  
  // Epic 1: Performance optimizations
  previewPosition?: { startTime: number; endTime: number; lane: number };
  validDropZone?: boolean;
  conflictsWith?: string[]; // Ticket IDs that conflict
}

/**
 * Epic 1: Ticket with calculated position for rendering
 */
// Type is imported from types.ts

/**
 * Epic 1: Enhanced time markers for timeline grid
 */
export interface TimeMarker {
  time: number;
  label: string;
  x: number;
  type: 'major' | 'minor' | 'now' | 'hour' | 'day' | 'week' | 'month';
  isVisible: boolean;
}

/**
 * Epic 1: Timeline viewport for performance optimization
 */
export interface TimelineViewport {
  startTime: number;
  endTime: number;
  pixelsPerHour: number;
  totalWidth: number;
  visibleTickets: TicketWithPosition[];
  timeMarkers: TimeMarker[];
}

/**
 * Epic 1: Timeline events for real-time updates
 */
export interface TimelineEvents {
  onTicketMoved: (ticketId: string, newStartTime: Date, newEndTime: Date) => void;
  onTicketResized: (ticketId: string, newEndTime: Date) => void;
  onTicketCreated: (ticket: Partial<FrontendTicket>) => void;
  onTicketDeleted: (ticketId: string) => void;
  onConflictDetected: (conflict: TimelineConflict) => void;
}

/**
 * Epic 1: Timeline grid configuration
 */
export interface TimelineGridConfig {
  view: TimelineView;
  startDate: Date;
  endDate: Date;
  timeSlotDuration: number; // minutes
  laneHeight: number;       // pixels
  minTicketWidth: number;   // pixels
  snapToGrid: boolean;
  showTimeLabels: boolean;
  showNowLine: boolean;
  theme: 'light' | 'dark';
}

/**
 * Epic 1: Timeline state for Redux store
 */
export interface TimelineState {
  config: TimelineGridConfig;
  tickets: TicketWithPosition[];
  selectedTicketId: string | null;
  dragState: DragState;
  conflicts: TimelineConflict[];
  isLoading: boolean;
  error: string | null;
  
  // Real-time features
  lastUpdate: string | null;
  isConnected: boolean;
}

/**
 * Timeline viewport configuration
 */
export interface TimelineViewport {
  startTime: number;
  endTime: number;
  pixelsPerHour: number;
  centerTime?: number;
}

/**
 * Timeline interaction events
 */
export interface TimelineEvents {
  onTicketDragStart?: (ticket: FrontendTicket) => void;
  onTicketDrag?: (ticket: FrontendTicket, deltaX: number, deltaY: number) => void;
  onTicketDragEnd?: (ticket: FrontendTicket) => void;
  onTicketResize?: (ticket: FrontendTicket, edge: 'start' | 'end', deltaX: number) => void;
  onTimelineClick?: (time: number, lane: number) => void;
}