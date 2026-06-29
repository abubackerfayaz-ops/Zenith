import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.module';
import { AnalyticsFilterDto, AnalyticsPeriod } from './dto/analytics-filter.dto';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private getDateRange(period: AnalyticsPeriod, startDate?: string, endDate?: string) {
    if (startDate && endDate) {
      return { start: new Date(startDate), end: new Date(endDate) };
    }

    const now = new Date();
    let start: Date;

    switch (period) {
      case AnalyticsPeriod.DAY:
        start = new Date(now);
        start.setDate(start.getDate() - 1);
        break;
      case AnalyticsPeriod.WEEK:
        start = new Date(now);
        start.setDate(start.getDate() - 7);
        break;
      case AnalyticsPeriod.MONTH:
        start = new Date(now);
        start.setMonth(start.getMonth() - 1);
        break;
      case AnalyticsPeriod.YEAR:
        start = new Date(now);
        start.setFullYear(start.getFullYear() - 1);
        break;
      default:
        start = new Date(0);
    }

    return { start, end: now };
  }

  async getOverview(userId: string) {
    const [user, posts, reels, followers, fameScore, recentAnalytics] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          _count: { select: { followers: true, following: true, posts: true } },
        },
      }),
      this.prisma.post.findMany({
        where: { userId, isArchived: false },
        select: { likesCount: true, commentsCount: true, sharesCount: true, viewsCount: true },
      }),
      this.prisma.reel.findMany({
        where: { userId, isArchived: false },
        select: { likesCount: true, commentsCount: true, sharesCount: true, viewsCount: true },
      }),
      this.prisma.follow.count({ where: { followingId: userId } }),
      this.prisma.fameScore.findUnique({ where: { userId } }),
      this.prisma.userAnalytics.findUnique({ where: { userId } }),
    ]);

    const allContent = [...posts, ...reels];
    const totalLikes = allContent.reduce((s, c) => s + c.likesCount, 0);
    const totalComments = allContent.reduce((s, c) => s + c.commentsCount, 0);
    const totalShares = allContent.reduce((s, c) => s + c.sharesCount, 0);
    const totalViews = allContent.reduce((s, c) => s + c.viewsCount, 0);
    const followerCount = user?._count.followers || 0;

    return {
      data: {
        followers: followerCount,
        following: user?._count.following || 0,
        totalPosts: user?._count.posts || 0,
        totalLikes,
        totalComments,
        totalShares,
        totalViews,
        engagementRate: followerCount > 0
          ? parseFloat((((totalLikes + totalComments + totalShares) / followerCount) * 100).toFixed(2))
          : 0,
        fameScore: fameScore?.score || 0,
        viralPotential: fameScore?.viralPotential || 0,
        followerGrowth: recentAnalytics?.followerGrowthRate || 0,
        contentGrowth: 0,
      },
      message: 'Overview retrieved',
    };
  }

  async getFollowers(userId: string, filter: AnalyticsFilterDto) {
    const { start, end } = this.getDateRange(filter.period, filter.startDate, filter.endDate);

    const allFollowers = await this.prisma.follow.findMany({
      where: { followingId: userId, createdAt: { gte: start, lte: end } },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true },
    });

    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const growth = {
      daily: allFollowers.filter((f) => f.createdAt >= dayAgo).length,
      weekly: allFollowers.filter((f) => f.createdAt >= weekAgo).length,
      monthly: allFollowers.filter((f) => f.createdAt >= monthAgo).length,
    };

    const followersBeforeStart = await this.prisma.follow.count({
      where: { followingId: userId, createdAt: { lt: start } },
    });

    const historyMap: Record<string, number> = {};
    for (const f of allFollowers) {
      const key = f.createdAt.toISOString().slice(0, 10);
      historyMap[key] = (historyMap[key] || 0) + 1;
    }

    let runningTotal = followersBeforeStart;
    const history = Object.entries(historyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, change]) => {
        runningTotal += change;
        return { date: new Date(date), change, total: runningTotal };
      });

    return {
      data: { growth, history },
      message: 'Follower growth data retrieved',
    };
  }

  async getEngagement(userId: string, filter: AnalyticsFilterDto) {
    const { start, end } = this.getDateRange(filter.period, filter.startDate, filter.endDate);

    const [posts, reels] = await Promise.all([
      this.prisma.post.findMany({
        where: { userId, createdAt: { gte: start, lte: end }, isArchived: false },
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true, likesCount: true, commentsCount: true, sharesCount: true, viewsCount: true },
      }),
      this.prisma.reel.findMany({
        where: { userId, createdAt: { gte: start, lte: end }, isArchived: false },
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true, likesCount: true, commentsCount: true, sharesCount: true, viewsCount: true },
      }),
    ]);

    const allContent = [...posts, ...reels].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const followerCount = await this.prisma.follow.count({ where: { followingId: userId } });

    const timeline = allContent.map((item) => {
      const interactions = item.likesCount + item.commentsCount + item.sharesCount;
      return {
        date: item.createdAt,
        likes: item.likesCount,
        comments: item.commentsCount,
        shares: item.sharesCount,
        views: item.viewsCount,
        engagementRate: followerCount > 0
          ? parseFloat(((interactions / followerCount) * 100).toFixed(2))
          : 0,
      };
    });

    const avgEngagementRate = timeline.length > 0
      ? parseFloat((timeline.reduce((s, t) => s + t.engagementRate, 0) / timeline.length).toFixed(2))
      : 0;

    return {
      data: { timeline, avgEngagementRate },
      message: 'Engagement data retrieved',
    };
  }

  async getContent(userId: string, filter: AnalyticsFilterDto) {
    const { start, end } = this.getDateRange(filter.period, filter.startDate, filter.endDate);

    const [posts, reels] = await Promise.all([
      this.prisma.post.findMany({
        where: { userId, createdAt: { gte: start, lte: end }, isArchived: false },
        select: { id: true, type: true, likesCount: true, commentsCount: true, sharesCount: true, viewsCount: true, createdAt: true },
      }),
      this.prisma.reel.findMany({
        where: { userId, createdAt: { gte: start, lte: end }, isArchived: false },
        select: { id: true, likesCount: true, commentsCount: true, sharesCount: true, viewsCount: true, createdAt: true },
      }),
    ]);

    const typeBreakdown: Record<string, { count: number; totalLikes: number; totalComments: number; totalShares: number; totalViews: number }> = {};

    for (const post of posts) {
      const type = post.type || 'POST';
      if (!typeBreakdown[type]) typeBreakdown[type] = { count: 0, totalLikes: 0, totalComments: 0, totalShares: 0, totalViews: 0 };
      typeBreakdown[type].count++;
      typeBreakdown[type].totalLikes += post.likesCount;
      typeBreakdown[type].totalComments += post.commentsCount;
      typeBreakdown[type].totalShares += post.sharesCount;
      typeBreakdown[type].totalViews += post.viewsCount;
    }

    for (const reel of reels) {
      const type = 'REEL';
      if (!typeBreakdown[type]) typeBreakdown[type] = { count: 0, totalLikes: 0, totalComments: 0, totalShares: 0, totalViews: 0 };
      typeBreakdown[type].count++;
      typeBreakdown[type].totalLikes += reel.likesCount;
      typeBreakdown[type].totalComments += reel.commentsCount;
      typeBreakdown[type].totalShares += reel.sharesCount;
      typeBreakdown[type].totalViews += reel.viewsCount;
    }

    const breakdown = Object.entries(typeBreakdown).map(([type, stats]) => ({
      type,
      count: stats.count,
      totalLikes: stats.totalLikes,
      totalComments: stats.totalComments,
      totalShares: stats.totalShares,
      totalViews: stats.totalViews,
      avgLikes: stats.count > 0 ? Math.round(stats.totalLikes / stats.count) : 0,
      avgEngagement: stats.count > 0
        ? parseFloat((((stats.totalLikes + stats.totalComments + stats.totalShares) / stats.count).toFixed(2)))
        : 0,
    }));

    return {
      data: { breakdown, total: posts.length + reels.length },
      message: 'Content performance retrieved',
    };
  }

  async getAudience(userId: string) {
    const followers = await this.prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: { country: true, city: true, college: true, createdAt: true },
        },
      },
    });

    const countryMap: Record<string, number> = {};
    const cityMap: Record<string, number> = {};
    const ageMap: Record<string, number> = {};

    for (const f of followers) {
      const country = f.follower.country || 'Unknown';
      countryMap[country] = (countryMap[country] || 0) + 1;

      const city = f.follower.city || 'Unknown';
      cityMap[city] = (cityMap[city] || 0) + 1;
    }

    return {
      data: {
        total: followers.length,
        demographics: {
          countries: Object.entries(countryMap)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count),
          cities: Object.entries(cityMap)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count),
        },
      },
      message: 'Audience demographics retrieved',
    };
  }

  async getRevenue(userId: string, filter: AnalyticsFilterDto) {
    const { start, end } = this.getDateRange(filter.period, filter.startDate, filter.endDate);

    const [wallet, creatorSub] = await Promise.all([
      this.prisma.wallet.findUnique({ where: { userId } }),
      this.prisma.creatorSubscription.findUnique({ where: { userId } }),
    ]);

    const [transactions, subscriptions, tips] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { walletId: wallet?.id ?? '', createdAt: { gte: start, lte: end } },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.subscription.findMany({
        where: { subscriptionId: creatorSub?.id ?? '', createdAt: { gte: start, lte: end } },
      }),
      this.prisma.tip.findMany({
        where: { recipientId: userId, createdAt: { gte: start, lte: end } },
      }),
    ]);

    const totalRevenue = transactions
      .filter((t) => t.type === 'CREDIT')
      .reduce((s, t) => s + t.amount, 0);
    const totalExpenses = transactions
      .filter((t) => t.type === 'DEBIT')
      .reduce((s, t) => s + t.amount, 0);

    const monthly: Record<string, number> = {};
    transactions.forEach((t) => {
      const key = t.createdAt.toISOString().slice(0, 7);
      monthly[key] = (monthly[key] || 0) + (t.type === 'CREDIT' ? t.amount : -t.amount);
    });

    return {
      data: {
        totalRevenue,
        totalExpenses,
        netRevenue: totalRevenue - totalExpenses,
        subscriptionRevenue: subscriptions.length * 9.99,
        tipRevenue: tips.reduce((s, t) => s + t.amount, 0),
        transactionCount: transactions.length,
        subscriptionCount: subscriptions.length,
        monthlyBreakdown: Object.entries(monthly).map(([month, amount]) => ({ month, amount })),
      },
      message: 'Revenue analytics retrieved',
    };
  }
}
