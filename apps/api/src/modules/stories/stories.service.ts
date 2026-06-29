import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.module';
import { CreateStoryDto } from './dto/create-story.dto';
import { StoryReactionDto, StoryReplyDto } from './dto/story-reaction.dto';

@Injectable()
export class StoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async createStory(userId: string, dto: CreateStoryDto) {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const story = await this.prisma.story.create({
      data: {
        userId,
        caption: dto.caption,
        backgroundColor: dto.bgColor,
        textColor: dto.textColor,
        fontFamily: dto.font,
        expiresAt,
        media: {
          create: {
            url: dto.mediaUrl,
            type: 'IMAGE',
          },
        },
      },
      include: {
        media: true,
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profilePicture: true,
            isVerified: true,
          },
        },
      },
    });

    await this.prisma.userAnalytics.updateMany({
      where: { userId },
      data: { totalStories: { increment: 1 } },
    });

    return { data: story, message: 'Story created successfully' };
  }

  async getActiveStories(userId: string) {
    const now = new Date();

    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = following.map((f) => f.followingId);
    followingIds.push(userId);

    const stories = await this.prisma.story.findMany({
      where: {
        userId: { in: followingIds },
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        media: true,
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profilePicture: true,
            isVerified: true,
          },
        },
        _count: { select: { reactions: true } },
      },
    });

    const grouped = stories.reduce(
      (acc, story) => {
        if (!acc[story.userId]) {
          acc[story.userId] = {
            user: story.user,
            stories: [],
          };
        }
        acc[story.userId].stories.push(story);
        return acc;
      },
      {} as Record<string, { user: any; stories: any[] }>,
    );

    return {
      data: Object.values(grouped),
      message: 'Active stories retrieved successfully',
    };
  }

  async getStoryById(storyId: string) {
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
      include: {
        media: true,
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profilePicture: true,
            isVerified: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                profilePicture: true,
              },
            },
          },
        },
      },
    });

    if (!story) {
      throw new NotFoundException('Story not found');
    }

    if (new Date() > story.expiresAt) {
      throw new NotFoundException('Story has expired');
    }

    return { data: story, message: 'Story retrieved successfully' };
  }

  async deleteStory(storyId: string, userId: string) {
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!story) {
      throw new NotFoundException('Story not found');
    }

    if (story.userId !== userId) {
      throw new ForbiddenException('You can only delete your own stories');
    }

    await this.prisma.story.delete({ where: { id: storyId } });

    await this.prisma.userAnalytics.updateMany({
      where: { userId },
      data: { totalStories: { decrement: 1 } },
    });

    return { message: 'Story deleted successfully' };
  }

  async viewStory(storyId: string, userId: string) {
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!story) {
      throw new NotFoundException('Story not found');
    }

    if (new Date() > story.expiresAt) {
      throw new NotFoundException('Story has expired');
    }

    await this.prisma.story.update({
      where: { id: storyId },
      data: { viewsCount: { increment: 1 } },
    });

    return { message: 'View recorded successfully' };
  }

  async reactToStory(storyId: string, userId: string, dto: StoryReactionDto) {
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!story) {
      throw new NotFoundException('Story not found');
    }

    if (new Date() > story.expiresAt) {
      throw new NotFoundException('Story has expired');
    }

    const existing = await this.prisma.storyReaction.findUnique({
      where: { storyId_userId: { storyId, userId } },
    });

    if (existing) {
      const updated = await this.prisma.storyReaction.update({
        where: { id: existing.id },
        data: { emoji: dto.emoji ?? existing.emoji },
      });

      return { data: updated, message: 'Reaction updated successfully' };
    }

    const reaction = await this.prisma.storyReaction.create({
      data: { storyId, userId, emoji: dto.emoji },
    });

    return { data: reaction, message: 'Reaction added successfully' };
  }

  async replyToStory(storyId: string, userId: string, dto: StoryReplyDto) {
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!story) {
      throw new NotFoundException('Story not found');
    }

    if (new Date() > story.expiresAt) {
      throw new NotFoundException('Story has expired');
    }

    const existing = await this.prisma.storyReaction.findUnique({
      where: { storyId_userId: { storyId, userId } },
    });

    if (existing) {
      const updated = await this.prisma.storyReaction.update({
        where: { id: existing.id },
        data: { reply: dto.reply ?? existing.reply },
      });

      return { data: updated, message: 'Reply updated successfully' };
    }

    const reaction = await this.prisma.storyReaction.create({
      data: { storyId, userId, reply: dto.reply },
    });

    return { data: reaction, message: 'Reply added successfully' };
  }

  async toggleHighlight(storyId: string, userId: string) {
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!story) {
      throw new NotFoundException('Story not found');
    }

    if (story.userId !== userId) {
      throw new ForbiddenException('You can only highlight your own stories');
    }

    const updated = await this.prisma.story.update({
      where: { id: storyId },
      data: { isHighlight: !story.isHighlight },
    });

    return {
      data: updated,
      message: updated.isHighlight ? 'Story added to highlights' : 'Story removed from highlights',
    };
  }
}
