import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { HashtagsService } from './hashtags.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Hashtags')
@Controller('hashtags')
export class HashtagsController {
  constructor(private readonly hashtagsService: HashtagsService) {}

  @Public()
  @Get('trending')
  @ApiOperation({ summary: 'Get trending hashtags' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getTrending(@Query('limit') limit?: number) {
    return this.hashtagsService.getTrending(limit ?? 20);
  }

  @Public()
  @Get('search')
  @ApiOperation({ summary: 'Search hashtags' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async search(
    @Query('q') q: string,
    @Query('limit') limit?: number,
  ) {
    return this.hashtagsService.searchHashtags(q, limit ?? 20);
  }

  @Public()
  @Get(':name')
  @ApiOperation({ summary: 'Get hashtag details with post count' })
  async getHashtag(@Param('name') name: string) {
    return this.hashtagsService.getHashtag(name);
  }

  @Public()
  @Get(':name/posts')
  @ApiOperation({ summary: 'Get posts with a hashtag' })
  async getHashtagPosts(
    @Param('name') name: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.hashtagsService.getHashtagPosts(name, pagination.page, pagination.limit);
  }
}
