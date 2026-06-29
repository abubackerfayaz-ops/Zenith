import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.module';
import { UpdateUserDto, CreateAdDto, UpdateAdDto, UserFilterDto, ResolveReportDto } from './dto/admin.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getUsers(filter: UserFilterDto) {
    const where: any = {};

    if (filter.search) {
      where.OR = [
        { username: { contains: filter.search.toLowerCase() } },
        { email: { contains: filter.search.toLowerCase() } },
        { displayName: { contains: filter.search.toLowerCase() } },
      ];
    }
    if (filter.role) where.role = filter.role;
    if (filter.isVerified !== undefined) where.isVerified = filter.isVerified;
    if (filter.isBanned !== undefined) where.isBanned = filter.isBanned;

    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          displayName: true,
          profilePicture: true,
          role: true,
          isVerified: true,
          isBanned: true,
          country: true,
          city: true,
          createdAt: true,
          lastLoginAt: true,
          _count: { select: { followers: true, posts: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, meta: { total, page, limit } };
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.username) {
      const existing = await this.prisma.user.findFirst({
        where: { username: dto.username, id: { not: id } },
      });
      if (existing) {
        throw new ConflictException('Username already taken');
      }
    }

    if (dto.email) {
      const existing = await this.prisma.user.findFirst({
        where: { email: dto.email, id: { not: id } },
      });
      if (existing) {
        throw new ConflictException('Email already in use');
      }
    }

    const data: any = {};
    if (dto.username !== undefined) data.username = dto.username;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.displayName !== undefined) data.displayName = dto.displayName;
    if (dto.role !== undefined) data.role = dto.role;
    if (dto.isVerified !== undefined) data.isVerified = dto.isVerified;
    if (dto.isBanned !== undefined) data.isBanned = dto.isBanned;

    const updated = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        profilePicture: true,
        role: true,
        isVerified: true,
        isBanned: true,
        createdAt: true,
      },
    });

    return { data: updated, message: 'User updated successfully' };
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({ where: { id } });

    return { message: 'User deleted successfully' };
  }

  async getReports(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.report.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: { select: { id: true, username: true } },
          reported: { select: { id: true, username: true } },
        },
      }),
      this.prisma.report.count(),
    ]);

    return { data, meta: { total, page, limit } };
  }

  async resolveReport(id: string, dto: ResolveReportDto) {
    const report = await this.prisma.report.findUnique({ where: { id } });
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (dto.action === 'BANNED') {
      await this.prisma.user.update({
        where: { id: report.reportedId },
        data: { isBanned: true },
      });
    }

    const resolved = await this.prisma.report.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        actionTaken: dto.resolution,
        resolvedAt: new Date().toISOString(),
      },
    });

    return { data: resolved, message: 'Report resolved' };
  }

  async getAnalytics() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [
      totalUsers,
      newUsers,
      totalPosts,
      totalReels,
      totalBattles,
      activeUsers,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      this.prisma.post.count({ where: { isArchived: false } }),
      this.prisma.reel.count({ where: { isArchived: false } }),
      this.prisma.battle.count({ where: { status: 'ACTIVE' } }),
      this.prisma.user.count({ where: { lastLoginAt: { gte: thirtyDaysAgo } } }),
      this.prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: 'CREDIT' },
      }),
    ]);

    return {
      data: {
        totalUsers,
        newUsers30d: newUsers,
        totalPosts,
        totalReels,
        totalContent: totalPosts + totalReels,
        activeBattles: totalBattles,
        activeUsers30d: activeUsers,
        totalRevenue: totalRevenue._sum.amount || 0,
        engagementRate: totalUsers > 0 ? parseFloat(((activeUsers / totalUsers) * 100).toFixed(2)) : 0,
      },
      message: 'Platform analytics retrieved',
    };
  }

  async createAd(userId: string, dto: CreateAdDto) {
    const ad = await this.prisma.ad.create({
      data: {
        title: dto.title,
        imageUrl: dto.imageUrl,
        linkUrl: dto.targetUrl,
        description: dto.description,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        budget: dto.dailyBudget,
      },
    });

    return { data: ad, message: 'Advertisement created' };
  }

  async getAds(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.ad.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },

      }),
      this.prisma.ad.count(),
    ]);

    return { data, meta: { total, page, limit } };
  }

  async updateAd(id: string, dto: UpdateAdDto) {
    const ad = await this.prisma.ad.findUnique({ where: { id } });
    if (!ad) {
      throw new NotFoundException('Advertisement not found');
    }

    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl;
    if (dto.targetUrl !== undefined) data.targetUrl = dto.targetUrl;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.startDate !== undefined) data.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) data.endDate = new Date(dto.endDate);
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.dailyBudget !== undefined) data.dailyBudget = dto.dailyBudget;
    if (dto.totalBudget !== undefined) data.totalBudget = dto.totalBudget;

    const updated = await this.prisma.ad.update({ where: { id }, data });

    return { data: updated, message: 'Advertisement updated' };
  }

  async deleteAd(id: string) {
    const ad = await this.prisma.ad.findUnique({ where: { id } });
    if (!ad) {
      throw new NotFoundException('Advertisement not found');
    }

    await this.prisma.ad.delete({ where: { id } });

    return { message: 'Advertisement deleted' };
  }

  async getRevenue(period?: string) {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0);
    }

    const [credits, debits, subscriptions, tips] = await Promise.all([
      this.prisma.transaction.aggregate({
        _sum: { amount: true },
        _count: true,
        where: { type: 'CREDIT', createdAt: { gte: startDate } },
      }),
      this.prisma.transaction.aggregate({
        _sum: { amount: true },
        _count: true,
        where: { type: 'DEBIT', createdAt: { gte: startDate } },
      }),
      this.prisma.subscription.count({ where: { createdAt: { gte: startDate } } }),
      this.prisma.tip.aggregate({
        _sum: { amount: true },
        where: { createdAt: { gte: startDate } },
      }),
    ]);

    const transactions = await this.prisma.transaction.findMany({
      where: { createdAt: { gte: startDate } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return {
      data: {
        totalRevenue: credits._sum.amount || 0,
        totalExpenses: debits._sum.amount || 0,
        netRevenue: (credits._sum.amount || 0) - (debits._sum.amount || 0),
        transactionCount: (credits._count || 0) + (debits._count || 0),
        subscriptionRevenue: subscriptions * 9.99,
        tipRevenue: tips._sum.amount || 0,
        recentTransactions: transactions,
      },
      message: 'Revenue analytics retrieved',
    };
  }

  async getDashboard() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      newUsersToday,
      totalPosts,
      totalReels,
      activeBattles,
      pendingReports,
      activeAds,
      totalRevenue,
      recentUsers,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
      this.prisma.post.count({ where: { isArchived: false } }),
      this.prisma.reel.count({ where: { isArchived: false } }),
      this.prisma.battle.count({ where: { status: 'ACTIVE' } }),
      this.prisma.report.count({ where: { status: 'PENDING' } }),
      this.prisma.ad.count({ where: { isActive: true } }),
      this.prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: 'CREDIT', createdAt: { gte: thirtyDaysAgo } },
      }),
      this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, username: true, displayName: true, profilePicture: true, createdAt: true },
      }),
    ]);

    return {
      data: {
        stats: {
          totalUsers,
          newUsersToday,
          totalPosts,
          totalReels,
          totalContent: totalPosts + totalReels,
          activeBattles,
          pendingReports,
          activeAds,
          revenue30d: totalRevenue._sum.amount || 0,
        },
        recentUsers,
      },
      message: 'Dashboard data retrieved',
    };
  }
}
