import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller.ts';
import { TicketsService } from './tickets.service.ts';
import { RecurrenceController } from './controllers/recurrence.controller.ts';
import { RecurrenceService } from './services/recurrence.service.ts';
import { HierarchyService } from './services/hierarchy.service.ts';
import { PrismaService } from '../prisma.service.ts';

@Module({
  controllers: [TicketsController, RecurrenceController],
  providers: [TicketsService, RecurrenceService, HierarchyService, PrismaService],
  exports: [TicketsService, RecurrenceService, HierarchyService],
})
export class TicketsModule {}
