import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'stdout',
          level: 'error',
        },
        {
          emit: 'stdout',
          level: 'info',
        },
        {
          emit: 'stdout',
          level: 'warn',
        },
      ],
    });
  }

  async onModuleInit() {
    // Connect to the database
    await this.$connect();
    this.logger.log('Connected to PostgreSQL database via Prisma');

    // Log slow queries in development
    if (process.env.NODE_ENV !== 'production') {
      // @ts-ignore - Prisma event typing issue
      this.$on('query', (e: any) => {
        if (e.duration > 100) {
          this.logger.warn(`Slow query: ${e.duration}ms - ${e.query}`);
        }
      });
    }
  }

  async onModuleDestroy() {
    // Disconnect from the database
    await this.$disconnect();
    this.logger.log('Disconnected from PostgreSQL database');
  }
}
