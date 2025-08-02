import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.ts';
import { CreateTicketTypeDto, UpdateTicketTypeDto } from './dto/create-ticket-type.dto.ts';

@Injectable()
export class TicketTypesService {
  constructor(private prisma: PrismaService) {}

  async createTicketType(createTicketTypeDto: CreateTicketTypeDto, userId: string) {
    // Check for duplicate names for this user
    const existingType = await this.prisma.ticketType.findFirst({
      where: {
        name: createTicketTypeDto.name,
        userId: userId,
      },
    });

    if (existingType) {
      throw new BadRequestException('A ticket type with this name already exists');
    }

    return await this.prisma.ticketType.create({
      data: {
        name: createTicketTypeDto.name.trim(),
        color: createTicketTypeDto.color || '#3B82F6', // Default blue color
        userId: userId,
      },
    });
  }

  async updateTicketType(id: string, updateTicketTypeDto: UpdateTicketTypeDto, userId: string) {
    // First check if the ticket type exists and belongs to the user
    const existingType = await this.prisma.ticketType.findFirst({
      where: {
        id,
        userId: userId,
      },
    });

    if (!existingType) {
      throw new NotFoundException('Ticket type not found or access denied');
    }

    // Check for duplicate names if name is being updated
    if (updateTicketTypeDto.name && updateTicketTypeDto.name !== existingType.name) {
      const duplicateType = await this.prisma.ticketType.findFirst({
        where: {
          name: updateTicketTypeDto.name,
          userId: userId,
          id: { not: id }, // Exclude current record
        },
      });

      if (duplicateType) {
        throw new BadRequestException('A ticket type with this name already exists');
      }
    }

    return await this.prisma.ticketType.update({
      where: { id },
      data: {
        ...(updateTicketTypeDto.name && { name: updateTicketTypeDto.name.trim() }),
        ...(updateTicketTypeDto.color && { color: updateTicketTypeDto.color }),
      },
    });
  }

  async getTicketTypes(userId: string) {
    console.log('Service received userId:', userId);
    console.log('Service userId type:', typeof userId);
    return await this.prisma.ticketType.findMany({
      where: {
        OR: [
          { userId: userId }, // User's custom types
          { userId: null },   // Global types
        ],
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async getTicketType(id: string, userId: string) {
    return await this.prisma.ticketType.findFirst({
      where: {
        id,
        OR: [
          { userId: userId },
          { userId: null },
        ],
      },
    });
  }
}
