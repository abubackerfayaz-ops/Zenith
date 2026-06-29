import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { PredictViralDto } from './dto/predict-viral.dto';
import { AnalyzePersonalityDto } from './dto/analyze-personality.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('AI')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('predict-viral')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Predict virality for a post/reel' })
  async predictViral(
    @CurrentUser('id') userId: string,
    @Body() dto: PredictViralDto,
  ) {
    return this.aiService.predictViral(userId, dto);
  }

  @Get('fame-score/:userId')
  @ApiOperation({ summary: 'Get detailed fame score breakdown' })
  async getFameScore(@Param('userId') userId: string) {
    return this.aiService.getFameScore(userId);
  }

  @Post('analyze-personality')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Analyze user content and assign personality type' })
  async analyzePersonality(
    @CurrentUser('id') userId: string,
    @Body() dto: AnalyzePersonalityDto,
  ) {
    return this.aiService.analyzePersonality(userId, dto);
  }

  @Get('compatibility/:targetUserId')
  @ApiOperation({ summary: 'Get social compatibility with another user' })
  async getCompatibility(
    @CurrentUser('id') userId: string,
    @Param('targetUserId') targetUserId: string,
  ) {
    return this.aiService.getCompatibility(userId, targetUserId);
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get AI-powered content suggestions' })
  async getSuggestions(@CurrentUser('id') userId: string) {
    return this.aiService.getSuggestions(userId);
  }

  @Post('refresh-score')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Force recalculate fame score' })
  async refreshScore(@CurrentUser('id') userId: string) {
    return this.aiService.refreshScore(userId);
  }
}
