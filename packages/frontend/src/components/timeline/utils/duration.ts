/**
 * Utility functions for calculating and formatting ticket durations
 */

/**
 * Calculate the duration between two dates in milliseconds
 */
export function calculateDuration(start: Date, end: Date): number {
  return end.getTime() - start.getTime();
}

/**
 * Format duration in milliseconds to a human-readable string
 */
export function formatDuration(durationMs: number): string {
  const totalMinutes = Math.floor(durationMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours === 0) {
    return `${minutes}m`;
  } else if (minutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${minutes}m`;
  }
}

/**
 * Format duration in a more detailed format for longer durations
 */
export function formatDetailedDuration(durationMs: number): string {
  const totalMinutes = Math.floor(durationMs / (1000 * 60));
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;
  
  const parts: string[] = [];
  
  if (days > 0) {
    parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  }
  if (hours > 0) {
    parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  }
  if (minutes > 0) {
    parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
  }
  
  if (parts.length === 0) {
    return '0 minutes';
  }
  
  return parts.join(', ');
}

/**
 * Get ticket duration and formatted string
 */
export function getTicketDuration(ticket: { start: Date; end: Date }) {
  const durationMs = calculateDuration(ticket.start, ticket.end);
  return {
    milliseconds: durationMs,
    formatted: formatDuration(durationMs),
    detailed: formatDetailedDuration(durationMs)
  };
}
