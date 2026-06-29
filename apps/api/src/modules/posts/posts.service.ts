import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.module';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPost(userId: string, dto: CreatePostDto) {
    const { mediaUrls, hashtags, mentions, caption, location, type } = dto;

    const post = await this.prisma.post.create({
      data: {
        userId,
        caption,
        location,
        type: type ?? 'PHOTO',
        media: {
          create: mediaUrls.map((url, index) => ({
            url,
            type: 'IMAGE',
            orderIndex: index,
          })),
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

    if (hashtags?.length) {
      await this.processHashtags(post.id, hashtags);
    }

    if (mentions?.length) {
      await this.processMentions(post.id, mentions);
    }

    await this.prisma.userAnalytics.updateMany({
      where: { userId },
      data: { totalPosts: { increment: 1 } },
    });

    return { data: post, message: 'Post created successfully' };
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
      this.prisma.post.findMany({
        where: {
          userId: { in: followingIds },
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
          likes: { where: { userId }, take: 1, select: { id: true } },
          bookmarks: { where: { userId }, take: 1, select: { id: true } },
        },
      }),
      this.prisma.post.count({
        where: {
          userId: { in: followingIds },
          deletedAt: null,
          isArchived: false,
        },
      }),
    ]);

    const posts = data.map((post) => ({
      ...post,
      isLiked: post.likes.length > 0,
      isBookmarked: post.bookmarks.length > 0,
      likes: undefined,
      bookmarks: undefined,
    }));

    return { data: posts, meta: { total, page, limit }, message: 'Feed retrieved successfully' };
  }

  async getTrending(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [data, total] = await Promise.all([
      this.prisma.post.findMany({
        where: {
          deletedAt: null,
          isArchived: false,
          createdAt: { gte: sevenDaysAgo },
        },
        skip,
        take: limit,
        orderBy: [{ likesCount: 'desc' }, { commentsCount: 'desc' }, { viewsCount: 'desc' }],
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
          deletedAt: null,
          isArchived: false,
          createdAt: { gte: sevenDaysAgo },
        },
      }),
    ]);

    return { data, meta: { total, page, limit }, message: 'Trending posts retrieved successfully' };
  }

  async getPostById(postId: string, userId?: string) {
    const post = await this.prisma.post.findFirst({
      where: { id: postId, deletedAt: null },
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
        hashtags: {
          include: { hashtag: { select: { id: true, name: true } } },
        },
        _count: { select: { likes: true, comments: true, bookmarks: true } },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    await this.prisma.post.update({
      where: { id: postId },
      data: { viewsCount: { increment: 1 } },
    });

    let isLiked = false;
    let isBookmarked = false;

    if (userId) {
      const [like, bookmark] = await Promise.all([
        this.prisma.like.findUnique({
          where: { userId_postId: { userId, postId } },
        }),
        this.prisma.bookmark.findUnique({
          where: { userId_postId: { userId, postId } },
        }),
      ]);
      isLiked = !!like;
      isBookmarked = !!bookmark;
    }

    return { data: { ...post, isLiked, isBookmarked }, message: 'Post retrieved successfully' };
  }

  async getUserPosts(username: string, page: number, limit: number) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { userId: user.id, deletedAt: null, isArchived: false },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          media: { orderBy: { orderIndex: 'asc' } },
          _count: { select: { likes: true, comments: true, bookmarks: true } },
        },
      }),
      this.prisma.post.count({
        where: { userId: user.id, deletedAt: null, isArchived: false },
      }),
    ]);

    return { data, meta: { total, page, limit }, message: 'User posts retrieved successfully' };
  }

  async updatePost(postId: string, userId: string, dto: UpdatePostDto) {
    const post = await this.prisma.post.findFirst({
      where: { id: postId, deletedAt: null },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.userId !== userId) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    const updated = await this.prisma.post.update({
      where: { id: postId },
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

    return { data: updated, message: 'Post updated successfully' };
  }

  async deletePost(postId: string, userId: string) {
    const post = await this.prisma.post.findFirst({
      where: { id: postId, deletedAt: null },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.userId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.prisma.post.update({
      where: { id: postId },
      data: { deletedAt: new Date().toISOString() },
    });

    await this.prisma.userAnalytics.updateMany({
      where: { userId },
      data: { totalPosts: { decrement: 1 } },
    });

    return { message: 'Post deleted successfully' };
  }

  async likePost(postId: string, userId: string) {
    const post = await this.prisma.post.findFirst({
      where: { id: postId, deletedAt: null },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const existing = await this.prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existing) {
      throw new BadRequestException('Already liked this post');
    }

    await this.prisma.like.create({ data: { userId, postId } });

    await this.prisma.post.update({
      where: { id: postId },
      data: { likesCount: { increment: 1 } },
    });

    return { message: 'Post liked successfully' };
  }

  async unlikePost(postId: string, userId: string) {
    const existing = await this.prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (!existing) {
      throw new BadRequestException('Not liked yet');
    }

    await this.prisma.like.delete({
      where: { userId_postId: { userId, postId } },
    });

    await this.prisma.post.update({
      where: { id: postId },
      data: { likesCount: { decrement: 1 } },
    });

    return { message: 'Post unliked successfully' };
  }

  async bookmarkPost(postId: string, userId: string) {
    const post = await this.prisma.post.findFirst({
      where: { id: postId, deletedAt: null },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const existing = await this.prisma.bookmark.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existing) {
      throw new BadRequestException('Already bookmarked this post');
    }

    await this.prisma.bookmark.create({ data: { userId, postId } });

    await this.prisma.post.update({
      where: { id: postId },
      data: { savesCount: { increment: 1 } },
    });

    return { message: 'Post bookmarked successfully' };
  }

  async removeBookmark(postId: string, userId: string) {
    const existing = await this.prisma.bookmark.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (!existing) {
      throw new BadRequestException('Not bookmarked yet');
    }

    await this.prisma.bookmark.delete({
      where: { userId_postId: { userId, postId } },
    });

    await this.prisma.post.update({
      where: { id: postId },
      data: { savesCount: { decrement: 1 } },
    });

    return { message: 'Bookmark removed successfully' };
  }

  async reportPost(postId: string, userId: string, reason: string, description?: string) {
    const post = await this.prisma.post.findFirst({
      where: { id: postId, deletedAt: null },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    await this.prisma.report.create({
      data: {
        reason: reason as any,
        description,
        reporterId: userId,
        reportedId: post.userId,
        postId,
      },
    });

    return { message: 'Post reported successfully' };
  }

  private async processHashtags(postId: string, hashtags: string[]) {
    for (const tag of hashtags) {
      const name = tag.startsWith('#') ? tag.slice(1).toLowerCase() : tag.toLowerCase();

      const hashtag = await this.prisma.hashtag.upsert({
        where: { name },
        create: { name, postsCount: 1 },
        update: { postsCount: { increment: 1 } },
      });

      await this.prisma.postHashtag.create({
        data: { postId, hashtagId: hashtag.id },
      });
    }
  }

  private async processMentions(postId: string, usernames: string[]) {
    for (const username of usernames) {
      const cleanUsername = username.startsWith('@') ? username.slice(1) : username;

      const user = await this.prisma.user.findUnique({
        where: { username: cleanUsername },
        select: { id: true },
      });

      if (user) {
        await this.prisma.mention.create({
          data: { postId, userId: user.id },
        });
      }
    }
  }
}
