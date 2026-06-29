import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.module';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByPhone(phone: string) {
    return this.prisma.user.findUnique({ where: { phone } });
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByGoogleId(googleId: string) {
    return this.prisma.user.findUnique({ where: { googleId } });
  }

  async findByAppleId(appleId: string) {
    return this.prisma.user.findUnique({ where: { appleId } });
  }

  async findByPasswordResetToken(token: string) {
    return this.prisma.user.findFirst({
      where: {
        passwordResetToken: token,
      },
    });
  }

  async findByEmailVerificationToken(token: string) {
    return this.prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });
  }

  async create(data: {
    email?: string;
    phone?: string;
    username: string;
    displayName?: string;
    password?: string;
    googleId?: string;
    appleId?: string;
  }) {
    return this.prisma.user.create({ data });
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async getPublicProfile(username: string, currentUserId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        _count: { select: { followers: true, following: true, posts: true } },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let isFollowing = false;
    if (currentUserId) {
      const follow = await this.prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: user.id,
          },
        },
      });
      isFollowing = !!follow;
    }

    const { password, refreshToken, passwordResetToken, passwordResetExpires, emailVerificationToken, twoFactorSecret, ...safeUser } = user;

    return {
      ...safeUser,
      isFollowing,
    };
  }

  async getFollowers(username: string, page: number, limit: number, currentUserId?: string) {
    const user = await this.findByUsername(username);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { followingId: user.id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          follower: {
            select: {
              id: true,
              username: true,
              displayName: true,
              profilePicture: true,
              isVerified: true,
              accountType: true,
            },
          },
        },
      }),
      this.prisma.follow.count({ where: { followingId: user.id } }),
    ]);

    const followers = data.map((f) => f.follower);

    return { data: followers, meta: { total, page, limit }, message: 'Followers retrieved successfully' };
  }

  async getFollowing(username: string, page: number, limit: number, currentUserId?: string) {
    const user = await this.findByUsername(username);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { followerId: user.id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          following: {
            select: {
              id: true,
              username: true,
              displayName: true,
              profilePicture: true,
              isVerified: true,
              accountType: true,
            },
          },
        },
      }),
      this.prisma.follow.count({ where: { followerId: user.id } }),
    ]);

    const following = data.map((f) => f.following);

    return { data: following, meta: { total, page, limit }, message: 'Following retrieved successfully' };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });

    const { password, refreshToken, passwordResetToken, passwordResetExpires, emailVerificationToken, twoFactorSecret, ...safeUser } = updatedUser;

    return { data: safeUser, message: 'Profile updated successfully' };
  }

  async follow(currentUserId: string, targetUserId: string) {
    if (currentUserId === targetUserId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    const targetUser = await this.findById(targetUserId);
    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      throw new ConflictException('Already following this user');
    }

    await this.prisma.follow.create({
      data: {
        followerId: currentUserId,
        followingId: targetUserId,
      },
    });

    await this.prisma.userAnalytics.updateMany({
      where: { userId: targetUserId },
      data: { totalFollowers: { increment: 1 } },
    });

    return { message: 'User followed successfully' };
  }

  async unfollow(currentUserId: string, targetUserId: string) {
    if (currentUserId === targetUserId) {
      throw new BadRequestException('You cannot unfollow yourself');
    }

    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
    });

    if (!existingFollow) {
      throw new BadRequestException('Not following this user');
    }

    await this.prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
    });

    await this.prisma.userAnalytics.updateMany({
      where: { userId: targetUserId },
      data: { totalFollowers: { decrement: 1 } },
    });

    return { message: 'User unfollowed successfully' };
  }

  async getAnalytics(userId: string) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [analytics, fameScore, creatorLevel] = await Promise.all([
      this.prisma.userAnalytics.findUnique({ where: { userId } }),
      this.prisma.fameScore.findUnique({ where: { userId } }),
      this.prisma.creatorLevel.findUnique({ where: { userId } }),
    ]);

    return {
      data: {
        analytics,
        fameScore,
        creatorLevel,
      },
      message: 'Analytics retrieved successfully',
    };
  }

  async searchUsers(query: string, page: number, limit: number, currentUserId?: string) {
    if (!query || query.length < 1) {
      throw new BadRequestException('Search query is required');
    }

    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      OR: [
        { username: { contains: query } },
        { displayName: { contains: query } },
      ],
      deletedAt: null,
    };

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { isVerified: 'desc' },
        select: {
          id: true,
          username: true,
          displayName: true,
          profilePicture: true,
          isVerified: true,
          accountType: true,
          bio: true,
          _count: { select: { followers: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, meta: { total, page, limit }, message: 'Search results retrieved successfully' };
  }
}
