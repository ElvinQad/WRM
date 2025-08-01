import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller.ts';
import { TicketsService } from './tickets.service.ts';
import { PrismaService } from '../prisma.service.ts';

@Module({
  controllers: [TicketsController],
  providers: [TicketsService, PrismaService],
  exports: [TicketsService],
})
export class TicketsModule {}
