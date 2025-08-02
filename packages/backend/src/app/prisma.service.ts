import { Injectable, OnModuleInit } from '@nestjs/common';
import pkg from '@prisma/client';

const { PrismaClient } = pkg;

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}