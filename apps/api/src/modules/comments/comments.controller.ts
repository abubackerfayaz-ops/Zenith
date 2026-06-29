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
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ReportCommentDto } from './dto/report-comment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a comment on a post or reel' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.createComment(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('post/:postId')
  @ApiOperation({ summary: 'Get comments for a post (paginated)' })
  async getPostComments(
    @Param('postId') postId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.commentsService.getPostComments(postId, pagination.page, pagination.limit);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('reel/:reelId')
  @ApiOperation({ summary: 'Get comments for a reel (paginated)' })
  async getReelComments(
    @Param('reelId') reelId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.commentsService.getReelComments(reelId, pagination.page, pagination.limit);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id/replies')
  @ApiOperation({ summary: 'Get replies to a comment' })
  async getReplies(
    @Param('id') id: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.commentsService.getCommentReplies(id, pagination.page, pagination.limit);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Edit a comment' })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentsService.updateComment(id, userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete a comment' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.commentsService.deleteComment(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Like a comment' })
  async like(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.commentsService.likeComment(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id/like')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unlike a comment' })
  async unlike(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.commentsService.unlikeComment(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/report')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Report a comment' })
  async report(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: ReportCommentDto,
  ) {
    return this.commentsService.reportComment(id, userId, dto);
  }
}
