import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.module';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ReportCommentDto } from './dto/report-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createComment(userId: string, dto: CreateCommentDto) {
    if (!dto.postId && !dto.reelId) {
      throw new BadRequestException('Either postId or reelId must be provided');
    }

    if (dto.postId && dto.reelId) {
      throw new BadRequestException('Provide either postId or reelId, not both');
    }

    if (dto.parentId) {
      const parent = await this.prisma.comment.findFirst({
        where: { id: dto.parentId, deletedAt: null },
      });

      if (!parent) {
        throw new NotFoundException('Parent comment not found');
      }
    }

    const comment = await this.prisma.comment.create({
      data: {
        userId,
        text: dto.text,
        postId: dto.postId,
        reelId: dto.reelId,
        parentId: dto.parentId,
      },
      include: {
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

    if (dto.postId) {
      await this.prisma.post.update({
        where: { id: dto.postId },
        data: { commentsCount: { increment: 1 } },
      });
    } else if (dto.reelId) {
      await this.prisma.reel.update({
        where: { id: dto.reelId },
        data: { commentsCount: { increment: 1 } },
      });
    }

    return { data: comment, message: 'Comment created successfully' };
  }

  async getPostComments(postId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { postId, parentId: null, deletedAt: null },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              profilePicture: true,
              isVerified: true,
            },
          },
          _count: { select: { likes: true, replies: true } },
        },
      }),
      this.prisma.comment.count({
        where: { postId, parentId: null, deletedAt: null },
      }),
    ]);

    return { data, meta: { total, page, limit }, message: 'Post comments retrieved successfully' };
  }

  async getReelComments(reelId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { reelId, parentId: null, deletedAt: null },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              profilePicture: true,
              isVerified: true,
            },
          },
          _count: { select: { likes: true, replies: true } },
        },
      }),
      this.prisma.comment.count({
        where: { reelId, parentId: null, deletedAt: null },
      }),
    ]);

    return { data, meta: { total, page, limit }, message: 'Reel comments retrieved successfully' };
  }

  async getCommentReplies(commentId: string, page: number, limit: number) {
    const parent = await this.prisma.comment.findFirst({
      where: { id: commentId, deletedAt: null },
    });

    if (!parent) {
      throw new NotFoundException('Comment not found');
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { parentId: commentId, deletedAt: null },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              profilePicture: true,
              isVerified: true,
            },
          },
          _count: { select: { likes: true } },
        },
      }),
      this.prisma.comment.count({
        where: { parentId: commentId, deletedAt: null },
      }),
    ]);

    return { data, meta: { total, page, limit }, message: 'Comment replies retrieved successfully' };
  }

  async updateComment(commentId: string, userId: string, dto: UpdateCommentDto) {
    const comment = await this.prisma.comment.findFirst({
      where: { id: commentId, deletedAt: null },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    const updated = await this.prisma.comment.update({
      where: { id: commentId },
      data: { text: dto.text, isEdited: true },
      include: {
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

    return { data: updated, message: 'Comment updated successfully' };
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findFirst({
      where: { id: commentId, deletedAt: null },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.prisma.comment.update({
      where: { id: commentId },
      data: { deletedAt: new Date().toISOString() },
    });

    if (comment.postId) {
      await this.prisma.post.update({
        where: { id: comment.postId },
        data: { commentsCount: { decrement: 1 } },
      });
    } else if (comment.reelId) {
      await this.prisma.reel.update({
        where: { id: comment.reelId },
        data: { commentsCount: { decrement: 1 } },
      });
    }

    return { message: 'Comment deleted successfully' };
  }

  async likeComment(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findFirst({
      where: { id: commentId, deletedAt: null },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const existing = await this.prisma.commentLike.findUnique({
      where: { userId_commentId: { userId, commentId } },
    });

    if (existing) {
      throw new BadRequestException('Already liked this comment');
    }

    await this.prisma.commentLike.create({ data: { userId, commentId } });

    await this.prisma.comment.update({
      where: { id: commentId },
      data: { likesCount: { increment: 1 } },
    });

    return { message: 'Comment liked successfully' };
  }

  async unlikeComment(commentId: string, userId: string) {
    const existing = await this.prisma.commentLike.findUnique({
      where: { userId_commentId: { userId, commentId } },
    });

    if (!existing) {
      throw new BadRequestException('Not liked yet');
    }

    await this.prisma.commentLike.delete({
      where: { userId_commentId: { userId, commentId } },
    });

    await this.prisma.comment.update({
      where: { id: commentId },
      data: { likesCount: { decrement: 1 } },
    });

    return { message: 'Comment unliked successfully' };
  }

  async reportComment(commentId: string, userId: string, dto: ReportCommentDto) {
    const comment = await this.prisma.comment.findFirst({
      where: { id: commentId, deletedAt: null },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    await this.prisma.report.create({
      data: {
        reason: dto.reason,
        description: dto.description,
        reporterId: userId,
        reportedId: comment.userId,
        commentId,
      },
    });

    return { message: 'Comment reported successfully' };
  }
}
