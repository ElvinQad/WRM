import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.ts';
import { CreateTicketDto, UpdateTicketDto, TicketResponseDto } from './dto/ticket.dto.ts';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async createTicket(userId: string, createTicketDto: CreateTicketDto): Promise<TicketResponseDto> {
    const ticket = await this.prisma.ticket.create({
      data: {
        userId,
        title: createTicketDto.title,
        startTime: new Date(createTicketDto.startTime),
        endTime: new Date(createTicketDto.endTime),
        typeId: createTicketDto.typeId,
        customProperties: createTicketDto.customProperties as any || {},
      },
      include: {
        ticketType: true,
      },
    });

    return this.mapToResponseDto(ticket);
  }

  async getTickets(userId: string): Promise<TicketResponseDto[]> {
    const tickets = await this.prisma.ticket.findMany({
      where: { userId },
      include: {
        ticketType: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return tickets.map(ticket => this.mapToResponseDto(ticket));
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

    return this.mapToResponseDto(ticket);
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

    const updateData: any = {};
    if (updateTicketDto.title !== undefined) updateData.title = updateTicketDto.title;
    if (updateTicketDto.startTime !== undefined) updateData.startTime = new Date(updateTicketDto.startTime);
    if (updateTicketDto.endTime !== undefined) updateData.endTime = new Date(updateTicketDto.endTime);
    if (updateTicketDto.typeId !== undefined) updateData.typeId = updateTicketDto.typeId;
    if (updateTicketDto.customProperties !== undefined) updateData.customProperties = updateTicketDto.customProperties as any;

    const ticket = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: updateData,
      include: {
        ticketType: true,
      },
    });

    return this.mapToResponseDto(ticket);
  }

  async deleteTicket(userId: string, ticketId: string): Promise<void> {
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
  }

  // deno-lint-ignore no-explicit-any
  private mapToResponseDto(ticket: any): TicketResponseDto {
    const now = new Date();
    const startTime = new Date(ticket.startTime);
    const endTime = new Date(ticket.endTime);
    
    // Calculate status based on time
    let status: 'FUTURE' | 'ACTIVE' | 'PAST_UNTOUCHED' | 'PAST_CONFIRMED';
    if (startTime > now) {
      status = 'FUTURE';
    } else if (startTime <= now && endTime >= now) {
      status = 'ACTIVE';
    } else {
      // For past tickets, we'll default to PAST_UNTOUCHED
      // In a real implementation, this would be based on user interaction
      status = 'PAST_UNTOUCHED';
    }

    return {
      id: ticket.id,
      userId: ticket.userId,
      title: ticket.title,
      description: ticket.description,
      startTime: ticket.startTime.toISOString(),
      endTime: ticket.endTime.toISOString(),
      typeId: ticket.typeId,
      customProperties: ticket.customProperties || {},
      status,
      lastInteraction: ticket.lastInteraction?.toISOString(),
      aiGenerated: ticket.aiGenerated || false,
      aiContext: ticket.aiContext,
      priority: ticket.priority,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      typeName: ticket.ticketType?.name,
      color: ticket.customProperties?.color,
      category: ticket.customProperties?.category,
    };
  }
}
