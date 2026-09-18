import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    try {
      await this.$connect();
    } catch (error) {
      console.warn('Prisma failed to connect to database on startup. Ensure DATABASE_URL is valid.', error.message);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
