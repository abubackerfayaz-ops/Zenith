import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.module';
import { CreateReelDto } from './dto/create-reel.dto';
import { UpdateReelDto } from './dto/update-reel.dto';
import { RemixReelDto } from './dto/remix-reel.dto';
import { ReportReelDto } from './dto/report-reel.dto';

@Injectable()
export class ReelsService {
  constructor(private readonly prisma: PrismaService) {}

  async createReel(userId: string, dto: CreateReelDto) {
    const reel = await this.prisma.reel.create({
      data: {
        userId,
        caption: dto.caption,
        music: dto.music,
        allowRemix: dto.allowRemix ?? true,
        allowComment: dto.allowComment ?? true,
        media: {
          create: {
            url: dto.videoUrl,
            type: 'VIDEO',
            orderIndex: 0,
          },
        },
      },
      include: {
        media: { orderBy: { orderIndex: 'asc' } },
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
      data: { totalReels: { increment: 1 } },
    });

    return { data: reel, message: 'Reel created successfully' };
  }

  async getFeed(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = following.map((f) => f.followingId);
    followingIds.push(userId);

    const [data, total] = await Promise.all([
      this.prisma.reel.findMany({
        where: {
          userId: { in: followingIds },
          isArchived: false,
        },
        skip,
        take: limit,
        orderBy: [{ viralScore: 'desc' }, { createdAt: 'desc' }],
        include: {
          media: { orderBy: { orderIndex: 'asc' } },
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              profilePicture: true,
              isVerified: true,
            },
          },
          _count: { select: { likes: true, comments: true, bookmarks: true } },
          likes: { where: { userId }, take: 1, select: { id: true } },
          bookmarks: { where: { userId }, take: 1, select: { id: true } },
        },
      }),
      this.prisma.reel.count({
        where: {
          userId: { in: followingIds },
          isArchived: false,
        },
      }),
    ]);

    const reels = data.map((reel) => ({
      ...reel,
      isLiked: reel.likesCount > 0,
      isBookmarked: reel.savesCount > 0,
      likes: undefined,
      bookmarks: undefined,
    }));

    return { data: reels, meta: { total, page, limit }, message: 'Feed retrieved successfully' };
  }

  async getTrending(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.reel.findMany({
        where: { isArchived: false },
        skip,
        take: limit,
        orderBy: { viralScore: 'desc' },
        include: {
          media: { orderBy: { orderIndex: 'asc' } },
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              profilePicture: true,
              isVerified: true,
            },
          },
          _count: { select: { likes: true, comments: true, bookmarks: true } },
        },
      }),
      this.prisma.reel.count({
        where: { isArchived: false },
      }),
    ]);

    return { data, meta: { total, page, limit }, message: 'Trending reels retrieved successfully' };
  }

  async getReelById(reelId: string, userId?: string) {
    const reel = await this.prisma.reel.findFirst({
      where: { id: reelId },
      include: {
        media: { orderBy: { orderIndex: 'asc' } },
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profilePicture: true,
            isVerified: true,
          },
        },
        _count: { select: { likes: true, comments: true, bookmarks: true } },
      },
    });

    if (!reel) {
      throw new NotFoundException('Reel not found');
    }

    await this.prisma.reel.update({
      where: { id: reelId },
      data: { viewsCount: { increment: 1 } },
    });

    let isLiked = false;
    let isBookmarked = false;

    if (userId) {
      const [like, bookmark] = await Promise.all([
        this.prisma.like.findUnique({
          where: { userId_reelId: { userId, reelId } },
        }),
        this.prisma.bookmark.findUnique({
          where: { userId_reelId: { userId, reelId } },
        }),
      ]);
      isLiked = !!like;
      isBookmarked = !!bookmark;
    }

    return { data: { ...reel, isLiked, isBookmarked }, message: 'Reel retrieved successfully' };
  }

  async getUserReels(username: string, page: number, limit: number) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.reel.findMany({
        where: { userId: user.id, isArchived: false },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          media: { orderBy: { orderIndex: 'asc' } },
          _count: { select: { likes: true, comments: true, bookmarks: true } },
        },
      }),
      this.prisma.reel.count({
        where: { userId: user.id, isArchived: false },
      }),
    ]);

    return { data, meta: { total, page, limit }, message: 'User reels retrieved successfully' };
  }

  async updateReel(reelId: string, userId: string, dto: UpdateReelDto) {
    const reel = await this.prisma.reel.findFirst({
      where: { id: reelId },
    });

    if (!reel) {
      throw new NotFoundException('Reel not found');
    }

    if (reel.userId !== userId) {
      throw new ForbiddenException('You can only edit your own reels');
    }

    const updated = await this.prisma.reel.update({
      where: { id: reelId },
      data: dto,
      include: {
        media: { orderBy: { orderIndex: 'asc' } },
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

    return { data: updated, message: 'Reel updated successfully' };
  }

  async deleteReel(reelId: string, userId: string) {
    const reel = await this.prisma.reel.findFirst({
      where: { id: reelId },
    });

    if (!reel) {
      throw new NotFoundException('Reel not found');
    }

    if (reel.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reels');
    }

    await this.prisma.reel.update({
      where: { id: reelId },
      data: { deletedAt: new Date().toISOString() },
    });

    await this.prisma.userAnalytics.updateMany({
      where: { userId },
      data: { totalReels: { decrement: 1 } },
    });

    return { message: 'Reel deleted successfully' };
  }

  async likeReel(reelId: string, userId: string) {
    const reel = await this.prisma.reel.findFirst({
      where: { id: reelId },
    });

    if (!reel) {
      throw new NotFoundException('Reel not found');
    }

    const existing = await this.prisma.like.findUnique({
      where: { userId_reelId: { userId, reelId } },
    });

    if (existing) {
      throw new BadRequestException('Already liked this reel');
    }

    await this.prisma.like.create({ data: { userId, reelId } });

    await this.prisma.reel.update({
      where: { id: reelId },
      data: { likesCount: { increment: 1 } },
    });

    return { message: 'Reel liked successfully' };
  }

  async unlikeReel(reelId: string, userId: string) {
    const existing = await this.prisma.like.findUnique({
      where: { userId_reelId: { userId, reelId } },
    });

    if (!existing) {
      throw new BadRequestException('Not liked yet');
    }

    await this.prisma.like.delete({
      where: { userId_reelId: { userId, reelId } },
    });

    await this.prisma.reel.update({
      where: { id: reelId },
      data: { likesCount: { decrement: 1 } },
    });

    return { message: 'Reel unliked successfully' };
  }

  async bookmarkReel(reelId: string, userId: string) {
    const reel = await this.prisma.reel.findFirst({
      where: { id: reelId },
    });

    if (!reel) {
      throw new NotFoundException('Reel not found');
    }

    const existing = await this.prisma.bookmark.findUnique({
      where: { userId_reelId: { userId, reelId } },
    });

    if (existing) {
      throw new BadRequestException('Already bookmarked this reel');
    }

    await this.prisma.bookmark.create({ data: { userId, reelId } });

    await this.prisma.reel.update({
      where: { id: reelId },
      data: { savesCount: { increment: 1 } },
    });

    return { message: 'Reel bookmarked successfully' };
  }

  async removeBookmark(reelId: string, userId: string) {
    const existing = await this.prisma.bookmark.findUnique({
      where: { userId_reelId: { userId, reelId } },
    });

    if (!existing) {
      throw new BadRequestException('Not bookmarked yet');
    }

    await this.prisma.bookmark.delete({
      where: { userId_reelId: { userId, reelId } },
    });

    await this.prisma.reel.update({
      where: { id: reelId },
      data: { savesCount: { decrement: 1 } },
    });

    return { message: 'Bookmark removed successfully' };
  }

  async remixReel(reelId: string, userId: string, dto: RemixReelDto) {
    const original = await this.prisma.reel.findFirst({
      where: { id: reelId, allowRemix: true },
      include: { media: true },
    });

    if (!original) {
      throw new NotFoundException('Reel not found or remixing not allowed');
    }

    const originalMedia = original.media[0];

    const remix = await this.prisma.reel.create({
      data: {
        userId,
        caption: dto.caption,
        music: original.music,
        allowRemix: true,
        allowComment: true,
        media: {
          create: {
            url: originalMedia.url,
            type: 'VIDEO',
            orderIndex: 0,
          },
        },
      },
      include: {
        media: { orderBy: { orderIndex: 'asc' } },
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

    await this.prisma.reel.update({
      where: { id: reelId },
      data: { remixCount: { increment: 1 } },
    });

    return { data: remix, message: 'Remix created successfully' };
  }

  async reportReel(reelId: string, userId: string, dto: ReportReelDto) {
    const reel = await this.prisma.reel.findFirst({
      where: { id: reelId },
    });

    if (!reel) {
      throw new NotFoundException('Reel not found');
    }

    await this.prisma.report.create({
      data: {
        reason: dto.reason,
        description: dto.description,
        reporterId: userId,
        reportedId: reel.userId,
      },
    });

    return { message: 'Reel reported successfully' };
  }
}
