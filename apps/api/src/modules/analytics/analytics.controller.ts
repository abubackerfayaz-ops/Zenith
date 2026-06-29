import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { AnalyticsFilterDto } from './dto/analytics-filter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get dashboard overview analytics' })
  async getOverview(@CurrentUser('id') userId: string) {
    return this.analyticsService.getOverview(userId);
  }

  @Get('followers')
  @ApiOperation({ summary: 'Get follower growth data (daily, weekly, monthly)' })
  async getFollowers(@CurrentUser('id') userId: string, @Query() filter: AnalyticsFilterDto) {
    return this.analyticsService.getFollowers(userId, filter);
  }

  @Get('engagement')
  @ApiOperation({ summary: 'Get engagement rate over time' })
  async getEngagement(@CurrentUser('id') userId: string, @Query() filter: AnalyticsFilterDto) {
    return this.analyticsService.getEngagement(userId, filter);
  }

  @Get('content')
  @ApiOperation({ summary: 'Get content performance breakdown' })
  async getContent(@CurrentUser('id') userId: string, @Query() filter: AnalyticsFilterDto) {
    return this.analyticsService.getContent(userId, filter);
  }

  @Get('audience')
  @ApiOperation({ summary: 'Get audience demographics' })
  async getAudience(@CurrentUser('id') userId: string) {
    return this.analyticsService.getAudience(userId);
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue analytics' })
  async getRevenue(@CurrentUser('id') userId: string, @Query() filter: AnalyticsFilterDto) {
    return this.analyticsService.getRevenue(userId, filter);
  }
}
