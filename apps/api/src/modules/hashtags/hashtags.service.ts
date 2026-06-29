import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.module';

@Injectable()
export class HashtagsService {
  constructor(private readonly prisma: PrismaService) {}

  async getTrending(limit: number = 20) {
    const data = await this.prisma.hashtag.findMany({
      orderBy: { postsCount: 'desc' },
      take: limit || 20,
    });

    return { data, message: 'Trending hashtags retrieved successfully' };
  }

  async getHashtag(name: string) {
    const cleanName = name.startsWith('#') ? name.slice(1).toLowerCase() : name.toLowerCase();

    const hashtag = await this.prisma.hashtag.findUnique({
      where: { name: cleanName },
    });

    if (!hashtag) {
      throw new NotFoundException('Hashtag not found');
    }

    return { data: hashtag, message: 'Hashtag retrieved successfully' };
  }

  async getHashtagPosts(name: string, page: number, limit: number) {
    const cleanName = name.startsWith('#') ? name.slice(1).toLowerCase() : name.toLowerCase();

    const hashtag = await this.prisma.hashtag.findUnique({
      where: { name: cleanName },
    });

    if (!hashtag) {
      throw new NotFoundException('Hashtag not found');
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.post.findMany({
        where: {
          hashtags: { some: { hashtagId: hashtag.id } },
          deletedAt: null,
          isArchived: false,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      this.prisma.post.count({
        where: {
          hashtags: { some: { hashtagId: hashtag.id } },
          deletedAt: null,
          isArchived: false,
        },
      }),
    ]);

    return { data, meta: { total, page, limit }, message: 'Hashtag posts retrieved successfully' };
  }

  async searchHashtags(query: string, limit: number) {
    const data = await this.prisma.hashtag.findMany({
      where: {
        name: { contains: query.toLowerCase() },
      },
      orderBy: { postsCount: 'desc' },
      take: Math.min(limit, 50),
    });

    return { data, message: 'Hashtag search results retrieved successfully' };
  }
}
