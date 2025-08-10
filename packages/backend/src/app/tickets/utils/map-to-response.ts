import { TicketResponseDto } from '../dto/ticket.dto.ts';

// deno-lint-ignore no-explicit-any
export function mapToResponseDto(ticket: any): TicketResponseDto {
  const now = new Date();
  const startTime = new Date(ticket.startTime);
  const endTime = new Date(ticket.endTime);
  const createdAt = new Date(ticket.createdAt);
  const updatedAt = new Date(ticket.updatedAt);
  const lastInteraction = ticket.lastInteraction ? new Date(ticket.lastInteraction) : undefined;

  let status: 'FUTURE' | 'ACTIVE' | 'PAST_UNTOUCHED' | 'PAST_CONFIRMED';
  if (startTime > now) {
    status = 'FUTURE';
  } else if (startTime <= now && endTime >= now) {
    status = 'ACTIVE';
  } else {
    status = 'PAST_UNTOUCHED';
  }

  return {
    id: ticket.id,
    userId: ticket.userId,
    title: ticket.title,
    description: ticket.description,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    typeId: ticket.typeId,
    customProperties: ticket.customProperties || {},
    status,
    lastInteraction: lastInteraction ? lastInteraction.toISOString() : undefined,
    aiGenerated: ticket.aiGenerated || false,
    aiContext: ticket.aiContext,
    priority: ticket.priority,
    poolOrder: ticket.poolOrder ?? undefined,
    isInPool: Boolean(ticket.isInPool),
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
    typeName: ticket.ticketType?.name,
    color: ticket.customProperties?.color,
    category: ticket.customProperties?.category,
  };
}
