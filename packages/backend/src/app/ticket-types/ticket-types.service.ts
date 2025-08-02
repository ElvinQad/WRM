import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.ts';

@Injectable()
export class TicketTypesService {
  constructor(private prisma: PrismaService) {}

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
