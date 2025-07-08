export type TimeScale = 'hours' | 'days' | 'weeks';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  color?: string;
  category?: string;
  lane?: number; // Add lane property for stacking
}

export interface TimelineProps {
  sunTimes?: { sunrise: Date; sunset: Date; nextSunrise: Date } | null;
  tickets?: Ticket[];
  onTicketUpdate?: (ticket: Ticket) => void;
  onTicketClick?: (ticket: Ticket) => void;
  useInfiniteTickets?: boolean; // New prop to enable infinite ticket generation
  autoCenterOnNow?: boolean; // New prop to control auto-centering behavior
}

export interface DragState {
  ticketId: string | null;
  isDragging: boolean;
  dragType: 'move' | 'resize-start' | 'resize-end' | null;
  startX: number;
  startY: number;
  startTime: number;
  startLane: number;
  originalStart: number;
  originalEnd: number;
  originalLane: number;
}

export interface TicketWithPosition {
  ticket: Ticket;
  startX: number;
  endX: number;
  width: number;
  lane: number;
}

export interface TimeMarker {
  time: number;
  label: string;
  x: number;
  type: 'major' | 'minor';
}

