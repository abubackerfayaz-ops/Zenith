import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { StoriesService } from './stories.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { StoryReactionDto, StoryReplyDto } from './dto/story-reaction.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Stories')
@Controller('stories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new story' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateStoryDto,
  ) {
    return this.storiesService.createStory(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get active stories from followed users' })
  async getActiveStories(@CurrentUser('id') userId: string) {
    return this.storiesService.getActiveStories(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single story by ID' })
  async getById(@Param('id') id: string) {
    return this.storiesService.getStoryById(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a story' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.storiesService.deleteStory(id, userId);
  }

  @Post(':id/view')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Record a story view' })
  async view(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.storiesService.viewStory(id, userId);
  }

  @Post(':id/react')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'React to a story with emoji' })
  async react(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: StoryReactionDto,
  ) {
    return this.storiesService.reactToStory(id, userId, dto);
  }

  @Post(':id/reply')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reply to a story' })
  async reply(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: StoryReplyDto,
  ) {
    return this.storiesService.replyToStory(id, userId, dto);
  }

  @Patch(':id/highlight')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle highlight for a story' })
  async toggleHighlight(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.storiesService.toggleHighlight(id, userId);
  }
}
