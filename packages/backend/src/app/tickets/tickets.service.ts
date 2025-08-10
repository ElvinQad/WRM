import { Injectable, NotFoundException, BadRequestException, forwardRef, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma.service.ts';
import { CreateTicketDto, UpdateTicketDto, TicketResponseDto } from './dto/ticket.dto.ts';
import { Prisma } from '@prisma/client';
import { mapToResponseDto } from './utils/map-to-response.ts';
import { RecurrenceService } from './services/recurrence.service.ts';

@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => RecurrenceService))
    private recurrenceService: RecurrenceService
  ) {}

  async createTicket(userId: string, createTicketDto: CreateTicketDto): Promise<TicketResponseDto> {
    const ticket = await this.prisma.ticket.create({
      data: {
        userId,
        title: createTicketDto.title,
        startTime: new Date(createTicketDto.startTime),
        endTime: new Date(createTicketDto.endTime),
        typeId: createTicketDto.typeId,
        customProperties: createTicketDto.customProperties as Prisma.JsonObject || {},
      },
      include: {
        ticketType: true,
      },
    });

  return mapToResponseDto(ticket);
  }

  async getTickets(userId: string, startDate?: Date, endDate?: Date): Promise<TicketResponseDto[]> {
    const whereClause: Prisma.TicketWhereInput = { userId };

    // Add date range filtering if provided
    if (startDate || endDate) {
      whereClause.OR = [
        // Tickets that start within the date range
        {
          startTime: {
            ...(startDate && { gte: startDate }),
            ...(endDate && { lte: endDate }),
          },
        },
        // Tickets that end within the date range
        {
          endTime: {
            ...(startDate && { gte: startDate }),
            ...(endDate && { lte: endDate }),
          },
        },
        // Tickets that span the entire date range (start before, end after)
        {
          AND: [
            ...(startDate ? [{ startTime: { lte: startDate } }] : []),
            ...(endDate ? [{ endTime: { gte: endDate } }] : []),
          ],
        },
      ];
    }

    const tickets = await this.prisma.ticket.findMany({
      where: whereClause,
      include: {
        ticketType: true,
      },
      orderBy: { startTime: 'asc' }, // Order by start time for timeline display
    });

    // Auto-generate next instances for recurring tickets that need them
    await this.generateNextInstancesIfNeeded(userId, startDate, endDate);

    // Re-fetch tickets to include any newly generated instances
    const updatedTickets = await this.prisma.ticket.findMany({
      where: whereClause,
      include: {
        ticketType: true,
      },
      orderBy: { startTime: 'asc' },
    });

  return updatedTickets.map(ticket => mapToResponseDto(ticket));
  }

  async getTicketById(userId: string, ticketId: string): Promise<TicketResponseDto> {
    const ticket = await this.prisma.ticket.findFirst({
      where: { 
        id: ticketId,
        userId,
      },
      include: {
        ticketType: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
    }

  return mapToResponseDto(ticket);
  }

  async updateTicket(userId: string, ticketId: string, updateTicketDto: UpdateTicketDto): Promise<TicketResponseDto> {
    const existingTicket = await this.prisma.ticket.findFirst({
      where: { 
        id: ticketId,
        userId,
      },
    });

    if (!existingTicket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
    }

    const updateData: {
      title?: string;
      startTime?: Date;
      endTime?: Date;
      typeId?: string;
      customProperties?: Prisma.JsonObject;
    } = {};
    if (updateTicketDto.title !== undefined) updateData.title = updateTicketDto.title;
    if (updateTicketDto.startTime !== undefined) updateData.startTime = new Date(updateTicketDto.startTime);
    if (updateTicketDto.endTime !== undefined) updateData.endTime = new Date(updateTicketDto.endTime);
    if (updateTicketDto.typeId !== undefined) updateData.typeId = updateTicketDto.typeId;
    if (updateTicketDto.customProperties !== undefined) updateData.customProperties = updateTicketDto.customProperties as Prisma.JsonObject;

    const ticket = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: updateData,
      include: {
        ticketType: true,
      },
    });

  return mapToResponseDto(ticket);
  }

  async deleteTicket(userId: string, ticketId: string): Promise<{ message: string }> {
    const existingTicket = await this.prisma.ticket.findFirst({
      where: { 
        id: ticketId,
        userId,
      },
    });

    if (!existingTicket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
    }

    await this.prisma.ticket.delete({
      where: { id: ticketId },
    });

    return { message: 'Ticket deleted successfully' };
  }

  // Pool-related methods for Story 1.5.4 - Tickets Pool
  async moveTicketToPool(userId: string, ticketId: string): Promise<TicketResponseDto> {
    const existingTicket = await this.prisma.ticket.findFirst({
      where: { 
        id: ticketId,
        userId,
      },
    });

    if (!existingTicket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
    }

    if (existingTicket.isInPool) {
      throw new BadRequestException(`Ticket ${ticketId} is already in the pool`);
    }

    // Get the highest pool order for FIFO queue (add to end)
    const lastPoolTicket = await this.prisma.ticket.findFirst({
      where: { userId, isInPool: true },
      orderBy: { poolOrder: 'desc' },
    });

    const newPoolOrder = (lastPoolTicket?.poolOrder ?? -1) + 1;

    const ticket = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        isInPool: true,
        poolOrder: newPoolOrder,
      },
      include: {
        ticketType: true,
      },
    });

  return mapToResponseDto(ticket);
  }

  async scheduleTicketFromPool(userId: string, ticketId: string, startTime: Date, endTime: Date): Promise<TicketResponseDto> {
    const existingTicket = await this.prisma.ticket.findFirst({
      where: { 
        id: ticketId,
        userId,
      },
    });

    if (!existingTicket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
    }

    if (!existingTicket.isInPool) {
      throw new BadRequestException(`Ticket ${ticketId} is not in the pool`);
    }

    const ticket = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        isInPool: false,
        poolOrder: null,
        startTime,
        endTime,
      },
      include: {
        ticketType: true,
      },
    });

  return mapToResponseDto(ticket);
  }

  async reorderTicketInPool(userId: string, ticketId: string, newPosition: number): Promise<TicketResponseDto> {
    const existingTicket = await this.prisma.ticket.findFirst({
      where: { 
        id: ticketId,
        userId,
        isInPool: true,
      },
    });

    if (!existingTicket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} not found in pool`);
    }

    // Get all pool tickets to reorder
    const poolTickets = await this.prisma.ticket.findMany({
      where: { userId, isInPool: true },
      orderBy: { poolOrder: 'asc' },
    });

    if (newPosition < 0 || newPosition >= poolTickets.length) {
      throw new BadRequestException(`Invalid position: ${newPosition}. Must be between 0 and ${poolTickets.length - 1}`);
    }

    // Reorder the tickets
    const reorderedTickets = poolTickets.filter(t => t.id !== ticketId);
    const targetTicket = poolTickets.find(t => t.id === ticketId)!;
    reorderedTickets.splice(newPosition, 0, targetTicket);

    // Update pool orders in transaction
    await this.prisma.$transaction(
      reorderedTickets.map((ticket, index) =>
        this.prisma.ticket.update({
          where: { id: ticket.id },
          data: { poolOrder: index },
        })
      )
    );

    const updatedTicket = await this.prisma.ticket.findFirst({
      where: { id: ticketId },
      include: { ticketType: true },
    });

  return mapToResponseDto(updatedTicket);
  }

  async getPoolTickets(userId: string): Promise<TicketResponseDto[]> {
    const tickets = await this.prisma.ticket.findMany({
      where: { 
        userId,
        isInPool: true,
      },
      include: {
        ticketType: true,
      },
      orderBy: { poolOrder: 'asc' }, // FIFO order
    });

  return tickets.map(ticket => mapToResponseDto(ticket));
  }

  /**
   * Automatically generate next instances for recurring tickets that need them
   * This ensures the timeline view always shows upcoming instances
   */
  private generateNextInstancesIfNeeded(_userId: string, _startDate?: Date, _endDate?: Date): Promise<void> {
    // Temporarily disabled due to schema compatibility issues
    // Users can manually generate next instances via the recurrence API
    console.log('Auto-generation disabled - use POST /api/tickets/recurrence/:id/generate-next to generate next instance');
    return Promise.resolve();
  }

  // mapToResponseDto now lives in ./utils/map-to-response.ts
}
