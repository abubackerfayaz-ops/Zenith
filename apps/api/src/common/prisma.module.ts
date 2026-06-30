import { Injectable, Logger, OnModuleInit, Global, Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const url = 'postgresql://postgres:LsxJnenRnJSTitpD@db.ymjbeyzjvvogskssywsp.supabase.co:5432/postgres';
    super({
      datasources: { db: { url } },
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
      errorFormat: 'colorless',
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('Database connection established successfully');
    } catch (error) {
      this.logger.error('Failed to connect to database', error);
      throw error;
    }
  }

  async enableShutdownHooks(): Promise<void> {
    process.on('beforeExit', async () => {
      await this.$disconnect();
    });
  }
}

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
