import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.module';
import { SearchQueryDto, ExploreFilterDto } from './dto/search.dto';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(private readonly prisma: PrismaService) {}

  async searchAll(query: SearchQueryDto) {
    const [users, hashtags, posts] = await Promise.all([
      this.searchUsers(query),
      this.searchHashtags(query),
      this.searchPosts(query),
    ]);

    return {
      data: {
        users: users.data,
        hashtags: hashtags.data,
        posts: posts.data,
      },
      message: 'Global search results',
    };
  }

  async searchUsers(query: SearchQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: query.q } },
            { displayName: { contains: query.q } },
            { bio: { contains: query.q } },
          ],
          isBanned: false,
        },
        skip,
        take: limit,
        orderBy: [
          { isVerified: 'desc' },
        ],
        select: {
          id: true,
          username: true,
          displayName: true,
          profilePicture: true,
          bio: true,
          isVerified: true,
          _count: { select: { followers: true, posts: true } },
        },
      }),
      this.prisma.user.count({
        where: {
          OR: [
            { username: { contains: query.q } },
            { displayName: { contains: query.q } },
            { bio: { contains: query.q } },
          ],
          isBanned: false,
        },
      }),
    ]);

    return { data, meta: { total, page, limit } };
  }

  async searchHashtags(query: SearchQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.hashtag.findMany({
        where: {
          name: { contains: query.q },
        },
        skip,
        take: limit,
        orderBy: { postsCount: 'desc' },
      }),
      this.prisma.hashtag.count({
        where: {
          name: { contains: query.q },
        },
      }),
    ]);

    return { data, meta: { total, page, limit } };
  }

  async searchPosts(query: SearchQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.post.findMany({
        where: {
          OR: [
            { caption: { contains: query.q } },
            { hashtags: { some: { hashtag: { name: { contains: query.q } } } } },
          ],
          isArchived: false,
        },
        skip,
        take: limit,
        orderBy: [
          { likesCount: 'desc' },
          { createdAt: 'desc' },
        ],
        include: {
          user: { select: { id: true, username: true, displayName: true, profilePicture: true } },
          hashtags: { include: { hashtag: { select: { id: true, name: true } } } },
          _count: { select: { likes: true, comments: true } },
        },
      }),
      this.prisma.post.count({
        where: {
          OR: [
            { caption: { contains: query.q } },
            { hashtags: { some: { hashtag: { name: { contains: query.q } } } } },
          ],
          isArchived: false,
        },
      }),
    ]);

    return { data, meta: { total, page, limit } };
  }

  async explore(filter: ExploreFilterDto) {
    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const skip = (page - 1) * limit;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [trendingPosts, suggestedUsers, trendingHashtags] = await Promise.all([
      this.prisma.post.findMany({
        where: {
          createdAt: { gte: sevenDaysAgo },
          isArchived: false,
        },
        orderBy: [
          { likesCount: 'desc' },
          { commentsCount: 'desc' },
          { createdAt: 'desc' },
        ],
        take: limit,
        include: {
          user: { select: { id: true, username: true, displayName: true, profilePicture: true, isVerified: true } },
          hashtags: { include: { hashtag: { select: { id: true, name: true } } } },
          _count: { select: { likes: true, comments: true } },
        },
      }),
      this.prisma.user.findMany({
        where: {
          isBanned: false,
        },
        orderBy: [
          { isVerified: 'desc' },
        ],
        take: limit,
        select: {
          id: true,
          username: true,
          displayName: true,
          profilePicture: true,
          bio: true,
          isVerified: true,
          _count: { select: { followers: true, posts: true } },
        },
      }),
      this.prisma.hashtag.findMany({
        orderBy: { postsCount: 'desc' },
        take: limit,
      }),
    ]);

    return {
      data: {
        trendingPosts,
        suggestedUsers,
        trendingHashtags,
      },
      message: 'Explore content retrieved',
    };
  }

  async getTrending() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [trendingHashtags, trendingPosts] = await Promise.all([
      this.prisma.hashtag.findMany({
        orderBy: { postsCount: 'desc' },
        take: 30,
        select: { id: true, name: true, postsCount: true },
      }),
      this.prisma.post.findMany({
        where: {
          createdAt: { gte: sevenDaysAgo },
          isArchived: false,
        },
        orderBy: [
          { likesCount: 'desc' },
          { commentsCount: 'desc' },
          { sharesCount: 'desc' },
        ],
        take: 20,
        include: {
          user: { select: { id: true, username: true, displayName: true, profilePicture: true } },
          hashtags: { include: { hashtag: { select: { id: true, name: true } } } },
        },
      }),
    ]);

    return {
      data: {
        trendingHashtags,
        trendingPosts,
      },
      message: 'Trending topics retrieved',
    };
  }
}
