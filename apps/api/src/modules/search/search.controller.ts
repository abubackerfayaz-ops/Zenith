import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchQueryDto, ExploreFilterDto } from './dto/search.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Search')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Public()
  @Get('search/all')
  @ApiOperation({ summary: 'Global search across users, hashtags, and posts' })
  async searchAll(@Query() query: SearchQueryDto) {
    return this.searchService.searchAll(query);
  }

  @Public()
  @Get('search/users')
  @ApiOperation({ summary: 'Search users only' })
  async searchUsers(@Query() query: SearchQueryDto) {
    return this.searchService.searchUsers(query);
  }

  @Public()
  @Get('search/hashtags')
  @ApiOperation({ summary: 'Search hashtags only' })
  async searchHashtags(@Query() query: SearchQueryDto) {
    return this.searchService.searchHashtags(query);
  }

  @Public()
  @Get('search/posts')
  @ApiOperation({ summary: 'Search posts only' })
  async searchPosts(@Query() query: SearchQueryDto) {
    return this.searchService.searchPosts(query);
  }

  @Public()
  @Get('explore')
  @ApiOperation({ summary: 'Explore page content (trending posts, suggested users, trending hashtags)' })
  async explore(@Query() filter: ExploreFilterDto) {
    return this.searchService.explore(filter);
  }

  @Public()
  @Get('explore/trending')
  @ApiOperation({ summary: 'Get trending topics' })
  async getTrending() {
    return this.searchService.getTrending();
  }
}
