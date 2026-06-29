import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RankingService } from './ranking.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { RankingFilterDto } from './dto/ranking-filter.dto';

@ApiTags('Ranking')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('ranking')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  @Public()
  @Get('world')
  @ApiOperation({ summary: 'Get world ranking list' })
  async getWorld(@Query() filter: RankingFilterDto) {
    return this.rankingService.getWorld(filter);
  }

  @Public()
  @Get('top')
  @ApiOperation({ summary: 'Get top 100 rankings' })
  async getTop() {
    return this.rankingService.getTop();
  }

  @Public()
  @Get('country/:country')
  @ApiOperation({ summary: 'Get country-specific ranking' })
  async getByCountry(@Param('country') country: string, @Query() filter: RankingFilterDto) {
    return this.rankingService.getByCountry(country, filter);
  }

  @Public()
  @Get('city/:city')
  @ApiOperation({ summary: 'Get city-specific ranking' })
  async getByCity(@Param('city') city: string, @Query() filter: RankingFilterDto) {
    return this.rankingService.getByCity(city, filter);
  }

  @Public()
  @Get('category/:category')
  @ApiOperation({ summary: 'Get category-specific ranking' })
  async getByCategory(@Param('category') category: string, @Query() filter: RankingFilterDto) {
    return this.rankingService.getByCategory(category, filter);
  }

  @Public()
  @Get('college/:college')
  @ApiOperation({ summary: 'Get college-specific ranking' })
  async getByCollege(@Param('college') college: string, @Query() filter: RankingFilterDto) {
    return this.rankingService.getByCollege(college, filter);
  }

  @Public()
  @Get('user/:userId')
  @ApiOperation({ summary: "Get user's ranks across all categories" })
  async getUserRanks(@Param('userId') userId: string) {
    return this.rankingService.getUserRanks(userId);
  }
}
