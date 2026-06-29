import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiGateway } from './ai.gateway';

@Module({
  controllers: [AiController],
  providers: [AiService, AiGateway],
  exports: [AiService],
})
export class AiModule {}
