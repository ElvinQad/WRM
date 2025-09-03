import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service.ts';
import { CreateRecurrenceDto, UpdateRecurrenceDto, RecurrenceResponseDto, RecurrenceFrequency } from '../dto/recurrence.dto.ts';
import { Ticket } from '@prisma/client';

interface RecurrencePatternUpdateData {
  frequency?: RecurrenceFrequency;
  interval?: number;
  skipDates?: Date[];
}

interface TicketUpdateData {
  recurrenceEnd?: Date | null;
  maxOccurrences?: number | null;
  [key: string]: Date | number | string | boolean | null | undefined;
}

interface RecurrencePattern {
  id: string;
  ticketId: string;
  frequency: string; // Use string to avoid type conflicts between Prisma and DTO enums
  interval: number;
  skipDates: Date[];
  createdAt: Date;
}

@Injectable()
export class RecurrenceService {
  constructor(private prisma: PrismaService) {}

  async createRecurrence(ticketId: string, userId: string, createRecurrenceDto: CreateRecurrenceDto): Promise<RecurrenceResponseDto> {
    // Validate ticket exists and belongs to user
    const ticket = await this.prisma.ticket.findFirst({
      where: { id: ticketId, userId }
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Check if recurrence already exists
    const existingRecurrence = await this.prisma.recurrencePattern.findUnique({
      where: { ticketId }
    });

    if (existingRecurrence) {
      throw new BadRequestException('Ticket already has recurrence pattern');
    }

    // Create recurrence pattern
    const recurrencePattern = await this.prisma.recurrencePattern.create({
      data: {
        ticketId,
        frequency: createRecurrenceDto.frequency,
        interval: createRecurrenceDto.interval,
        skipDates: createRecurrenceDto.skipDates ? createRecurrenceDto.skipDates.map((date: string) => new Date(date)) : []
      }
    });

    // Update ticket to mark as recurring
    await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        isRecurring: true,
        recurrenceId: recurrencePattern.id,
        recurrenceEnd: createRecurrenceDto.endDate ? new Date(createRecurrenceDto.endDate) : null,
        maxOccurrences: createRecurrenceDto.maxOccurrences
      }
    });

    return this.mapToResponseDto(recurrencePattern);
  }

  async updateRecurrence(ticketId: string, userId: string, updateRecurrenceDto: UpdateRecurrenceDto): Promise<RecurrenceResponseDto> {
    // Validate ticket exists and belongs to user
    const ticket = await this.prisma.ticket.findFirst({
      where: { id: ticketId, userId, isRecurring: true }
    });

    if (!ticket) {
      throw new NotFoundException('Recurring ticket not found');
    }

    // Update recurrence pattern
    const updateData: RecurrencePatternUpdateData = {};
    if (updateRecurrenceDto.frequency !== undefined) updateData.frequency = updateRecurrenceDto.frequency;
    if (updateRecurrenceDto.interval !== undefined) updateData.interval = updateRecurrenceDto.interval;
    if (updateRecurrenceDto.skipDates !== undefined) {
      updateData.skipDates = updateRecurrenceDto.skipDates.map((date: string) => new Date(date));
    }

    const recurrencePattern = await this.prisma.recurrencePattern.update({
      where: { ticketId },
      data: updateData
    });

    // Update ticket recurrence settings
    const ticketUpdateData: TicketUpdateData = {};
    if (updateRecurrenceDto.endDate !== undefined) {
      ticketUpdateData.recurrenceEnd = updateRecurrenceDto.endDate ? new Date(updateRecurrenceDto.endDate) : null;
    }
    if (updateRecurrenceDto.maxOccurrences !== undefined) {
      ticketUpdateData.maxOccurrences = updateRecurrenceDto.maxOccurrences;
    }

    if (Object.keys(ticketUpdateData).length > 0) {
      await this.prisma.ticket.update({
        where: { id: ticketId },
        data: ticketUpdateData
      });
    }

    return this.mapToResponseDto(recurrencePattern);
  }

  async deleteRecurrence(ticketId: string, userId: string): Promise<void> {
    // Validate ticket exists and belongs to user
    const ticket = await this.prisma.ticket.findFirst({
      where: { id: ticketId, userId, isRecurring: true }
    });

    if (!ticket) {
      throw new NotFoundException('Recurring ticket not found');
    }

    // Delete recurrence pattern
    await this.prisma.recurrencePattern.delete({
      where: { ticketId }
    });

    // Update ticket to remove recurrence
    await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        isRecurring: false,
        recurrenceId: null,
        recurrenceEnd: null,
        maxOccurrences: null,
        recurrenceRule: null
      }
    });
  }

  async getRecurrence(ticketId: string, userId: string): Promise<RecurrenceResponseDto> {
    // Validate ticket exists and belongs to user
    const ticket = await this.prisma.ticket.findFirst({
      where: { id: ticketId, userId, isRecurring: true }
    });

    if (!ticket) {
      throw new NotFoundException('Recurring ticket not found');
    }

    const recurrencePattern = await this.prisma.recurrencePattern.findUnique({
      where: { ticketId }
    });

    if (!recurrencePattern) {
      throw new NotFoundException('Recurrence pattern not found');
    }

    return this.mapToResponseDto(recurrencePattern);
  }

  async detachInstance(ticketId: string, userId: string): Promise<void> {
    // Validate ticket exists and belongs to user
    const ticket = await this.prisma.ticket.findFirst({
      where: { id: ticketId, userId }
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Only allow detaching if it's a child instance
    if (!ticket.recurrenceParentId) {
      throw new BadRequestException('Can only detach child instances of recurring tickets');
    }

    // Update ticket to detach from series
    await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        recurrenceParentId: null,
        recurrenceId: null,
        isRecurring: false
      }
    });
  }

  async generateInstances(ticketId: string, userId: string, count: number = 10): Promise<Ticket[]> {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id: ticketId, userId, isRecurring: true },
      include: { recurrencePattern: true }
    });

    if (!ticket || !ticket.recurrencePattern) {
      throw new NotFoundException('Recurring ticket not found');
    }

    const instances: Ticket[] = [];
    const pattern = ticket.recurrencePattern;
    let currentDate = new Date(ticket.startTime);
    const ticketDuration = ticket.endTime.getTime() - ticket.startTime.getTime();

    for (let i = 0; i < count; i++) {
      // Calculate next occurrence based on frequency and interval
      currentDate = this.calculateNextOccurrence(currentDate, pattern.frequency as RecurrenceFrequency, pattern.interval);

      // Check if we've exceeded end date or max occurrences
      if (ticket.recurrenceEnd && currentDate > ticket.recurrenceEnd) break;
      if (ticket.maxOccurrences && i >= ticket.maxOccurrences - 1) break;

      // Skip if date is in skip list
      if (pattern.skipDates.some((skipDate: Date) => skipDate.toDateString() === currentDate.toDateString())) {
        continue;
      }

      // Create instance
      const instance = await this.prisma.ticket.create({
        data: {
          userId: ticket.userId,
          title: ticket.title,
          description: ticket.description,
          startTime: currentDate,
          endTime: new Date(currentDate.getTime() + ticketDuration),
          typeId: ticket.typeId,
          customProperties: ticket.customProperties || {},
          recurrenceParentId: ticketId,
          recurrenceId: pattern.id,
          status: 'FUTURE',
          isRecurring: false, // Child instances are not recurring themselves
          isInPool: false,
          aiGenerated: false
        }
      });

      instances.push(instance);
    }

    return instances;
  }

  async generateNextInstance(ticketId: string, userId: string): Promise<Ticket> {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id: ticketId, userId },
      include: { 
        recurrencePattern: true,
      }
    });

    if (!ticket || !ticket.recurrencePattern || !ticket.isRecurring) {
      throw new NotFoundException('Recurring ticket not found');
    }

    const pattern = ticket.recurrencePattern;
    const ticketDuration = ticket.endTime.getTime() - ticket.startTime.getTime();
    
    // Find the latest child instance to calculate next from
    const lastChild = await this.prisma.ticket.findFirst({
      where: {
        hierarchyParentId: ticketId,
        userId
      },
      orderBy: { startTime: 'desc' }
    });

    let lastOccurrenceDate: Date;
    if (lastChild) {
      lastOccurrenceDate = lastChild.startTime;
    } else {
      lastOccurrenceDate = ticket.startTime;
    }

    // Calculate next occurrence
    let nextDate = this.calculateNextOccurrence(lastOccurrenceDate, pattern.frequency as RecurrenceFrequency, pattern.interval);

    // Check if we've exceeded end date or max occurrences
    if (ticket.recurrenceEnd && nextDate > ticket.recurrenceEnd) {
      throw new BadRequestException('Recurrence has ended');
    }

    const existingInstancesCount = await this.prisma.ticket.count({
      where: { recurrenceParentId: ticketId, userId }
    });
    
    if (ticket.maxOccurrences && existingInstancesCount >= ticket.maxOccurrences) {
      throw new BadRequestException('Maximum occurrences reached');
    }

    // Skip dates if needed (find next available date)
    while (pattern.skipDates.some((skipDate: Date) => skipDate.toDateString() === nextDate.toDateString())) {
      nextDate = this.calculateNextOccurrence(nextDate, pattern.frequency as RecurrenceFrequency, pattern.interval);
      
      // Check again after skipping
      if (ticket.recurrenceEnd && nextDate > ticket.recurrenceEnd) {
        throw new BadRequestException('No more valid dates available');
      }
    }

    // Create the next instance
    const nextInstance = await this.prisma.ticket.create({
      data: {
        userId: ticket.userId,
        title: ticket.title,
        description: ticket.description,
        startTime: nextDate,
        endTime: new Date(nextDate.getTime() + ticketDuration),
        typeId: ticket.typeId,
        customProperties: ticket.customProperties || {},
        recurrenceParentId: ticketId,
        recurrenceId: pattern.id,
        status: 'FUTURE',
        isRecurring: false, // Child instances are not recurring themselves
        isInPool: false,
        aiGenerated: false
      }
    });

    return nextInstance;
  }

  private calculateNextOccurrence(date: Date, frequency: RecurrenceFrequency, interval: number): Date {
    const nextDate = new Date(date);

    switch (frequency) {
      case RecurrenceFrequency.DAILY:
        nextDate.setDate(nextDate.getDate() + interval);
        break;
      case RecurrenceFrequency.WEEKLY:
        nextDate.setDate(nextDate.getDate() + (interval * 7));
        break;
      case RecurrenceFrequency.MONTHLY:
        nextDate.setMonth(nextDate.getMonth() + interval);
        break;
      case RecurrenceFrequency.CUSTOM:
        // For custom frequency, treat interval as days
        nextDate.setDate(nextDate.getDate() + interval);
        break;
    }

    return nextDate;
  }

  private mapToResponseDto(recurrencePattern: RecurrencePattern): RecurrenceResponseDto {
    return {
      id: recurrencePattern.id,
      frequency: recurrencePattern.frequency as RecurrenceFrequency,
      interval: recurrencePattern.interval,
      skipDates: recurrencePattern.skipDates,
      createdAt: recurrencePattern.createdAt
    };
  }
}
