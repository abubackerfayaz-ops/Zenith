import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReelsService } from './reels.service';
import { CreateReelDto } from './dto/create-reel.dto';
import { UpdateReelDto } from './dto/update-reel.dto';
import { RemixReelDto } from './dto/remix-reel.dto';
import { ReportReelDto } from './dto/report-reel.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Reels')
@Controller('reels')
export class ReelsController {
  constructor(private readonly reelsService: ReelsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new reel' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateReelDto,
  ) {
    return this.reelsService.createReel(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Get feed/paginated reels (AI recommendation ordering)' })
  async getFeed(
    @CurrentUser('id') userId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.reelsService.getFeed(userId, pagination.page, pagination.limit);
  }

  @Public()
  @Get('trending')
  @ApiOperation({ summary: 'Trending reels sorted by viralScore' })
  async getTrending(@Query() pagination: PaginationDto) {
    return this.reelsService.getTrending(pagination.page, pagination.limit);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('user/:username')
  @ApiOperation({ summary: "Get user's reels" })
  async getUserReels(
    @Param('username') username: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.reelsService.getUserReels(username, pagination.page, pagination.limit);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a single reel by ID' })
  async getById(
    @Param('id') id: string,
    @CurrentUser('id') userId?: string,
  ) {
    return this.reelsService.getReelById(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Update reel caption' })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateReelDto,
  ) {
    return this.reelsService.updateReel(id, userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete a reel' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.reelsService.deleteReel(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Like a reel' })
  async like(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.reelsService.likeReel(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id/like')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unlike a reel' })
  async unlike(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.reelsService.unlikeReel(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/bookmark')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bookmark a reel' })
  async bookmark(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.reelsService.bookmarkReel(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id/bookmark')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove bookmark from a reel' })
  async removeBookmark(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.reelsService.removeBookmark(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/remix')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a remix of a reel' })
  async remix(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: RemixReelDto,
  ) {
    return this.reelsService.remixReel(id, userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/report')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Report a reel' })
  async report(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: ReportReelDto,
  ) {
    return this.reelsService.reportReel(id, userId, dto);
  }
}
