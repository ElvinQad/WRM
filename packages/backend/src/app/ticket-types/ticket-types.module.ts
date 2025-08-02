import { Module } from '@nestjs/common';
import { TicketTypesController } from './ticket-types.controller.ts';
import { TicketTypesService } from './ticket-types.service.ts';
import { PrismaService } from '../prisma.service.ts';

@Module({
  controllers: [TicketTypesController],
  providers: [TicketTypesService, PrismaService],
  exports: [TicketTypesService],
})
export class TicketTypesModule {}
