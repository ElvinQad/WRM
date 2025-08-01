import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.ts';
import { AppService } from './app.service.ts';
import { AuthModule } from './auth-prisma.module.ts';
import { TicketsModule } from './tickets/tickets.module.ts';
import { PrismaService } from './prisma.service.ts';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule, TicketsModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
