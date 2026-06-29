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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new post' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePostDto,
  ) {
    return this.postsService.createPost(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Get feed from followed users' })
  async getFeed(
    @CurrentUser('id') userId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.postsService.getFeed(userId, pagination.page, pagination.limit);
  }

  @Public()
  @Get('trending')
  @ApiOperation({ summary: 'Get trending posts (last 7 days)' })
  async getTrending(@Query() pagination: PaginationDto) {
    return this.postsService.getTrending(pagination.page, pagination.limit);
  }

  @Public()
  @Get('user/:username')
  @ApiOperation({ summary: 'Get posts by username' })
  async getUserPosts(
    @Param('username') username: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.postsService.getUserPosts(username, pagination.page, pagination.limit);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a single post by ID' })
  async getById(@Param('id') id: string) {
    return this.postsService.getPostById(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Edit post caption or location' })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postsService.updatePost(id, userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete a post' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.postsService.deletePost(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Like a post' })
  async like(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.postsService.likePost(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id/like')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unlike a post' })
  async unlike(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.postsService.unlikePost(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/bookmark')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bookmark a post' })
  async bookmark(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.postsService.bookmarkPost(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id/bookmark')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove bookmark from a post' })
  async removeBookmark(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.postsService.removeBookmark(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/report')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Report a post' })
  async report(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('reason') reason: string,
    @Body('description') description?: string,
  ) {
    return this.postsService.reportPost(id, userId, reason, description);
  }
}
