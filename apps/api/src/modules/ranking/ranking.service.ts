import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.module';
import { RankingFilterDto, RankingSortBy, SortOrder } from './dto/ranking-filter.dto';

@Injectable()
export class RankingService {
  private readonly logger = new Logger(RankingService.name);

  constructor(private readonly prisma: PrismaService) {}

  private async buildRankingQuery(
    where: any = {},
    filter: RankingFilterDto = {} as RankingFilterDto,
  ) {
    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const skip = (page - 1) * limit;

    const orderBy: any = {};
    const sortBy = filter.sortBy || RankingSortBy.SCORE;
    const sortOrder = filter.sortOrder || SortOrder.DESC;

    switch (sortBy) {
      case RankingSortBy.FOLLOWERS:
        orderBy.followersCount = sortOrder;
        break;
      case RankingSortBy.ENGAGEMENT:
        orderBy.avgEngagementRate = sortOrder;
        break;
      case RankingSortBy.POSTS:
        orderBy.totalPosts = sortOrder;
        break;
      default:
        orderBy.score = sortOrder;
    }

    const [data, total] = await Promise.all([
      this.prisma.fameScore.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              profilePicture: true,
              _count: { select: { followers: true } },
            },
          },
        },
      }),
      this.prisma.fameScore.count({ where }),
    ]);

    const rankings = data.map((entry, index) => ({
      rank: skip + index + 1,
      user: entry.user,
      score: entry.score,
      viralPotential: entry.viralPotential,
      followersCount: entry.user._count.followers,
      totalPosts: entry.totalPosts,
      avgEngagementRate: entry.avgEngagementRate,
    }));

    return { data: rankings, meta: { total, page, limit } };
  }

  async getWorld(filter: RankingFilterDto) {
    return this.buildRankingQuery({}, filter);
  }

  async getTop() {
    return this.buildRankingQuery({}, { page: 1, limit: 100, sortBy: RankingSortBy.SCORE, sortOrder: SortOrder.DESC } as RankingFilterDto);
  }

  async getByCountry(country: string, filter: RankingFilterDto) {
    const users = await this.prisma.user.findMany({
      where: { country: { equals: country } },
      select: { id: true },
    });
    const userIds = users.map((u) => u.id);
    return this.buildRankingQuery({ userId: { in: userIds } }, filter);
  }

  async getByCity(city: string, filter: RankingFilterDto) {
    const users = await this.prisma.user.findMany({
      where: { city: { equals: city } },
      select: { id: true },
    });
    const userIds = users.map((u) => u.id);
    return this.buildRankingQuery({ userId: { in: userIds } }, filter);
  }

  async getByCategory(category: string, filter: RankingFilterDto) {
    const users = await this.prisma.user.findMany({
      where: { primaryCategory: { equals: category } },
      select: { id: true },
    });
    const userIds = users.map((u) => u.id);
    return this.buildRankingQuery({ userId: { in: userIds } }, filter);
  }

  async getByCollege(college: string, filter: RankingFilterDto) {
    const users = await this.prisma.user.findMany({
      where: { college: { equals: college } },
      select: { id: true },
    });
    const userIds = users.map((u) => u.id);
    return this.buildRankingQuery({ userId: { in: userIds } }, filter);
  }

  async getUserRanks(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, displayName: true, profilePicture: true, country: true, city: true, college: true, primaryCategory: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const fameScore = await this.prisma.fameScore.findUnique({ where: { userId } });

    const getRank = async (where: any): Promise<number | null> => {
      const higher = await this.prisma.fameScore.count({
        where: { ...where, score: { gt: fameScore?.score || 0 } },
      });
      return higher + 1;
    };

    const [worldRank, countryRank, cityRank, categoryRank, collegeRank] = await Promise.all([
      getRank({}),
      user.country ? getRank({ user: { country: user.country } }) : Promise.resolve(null),
      user.city ? getRank({ user: { city: user.city } }) : Promise.resolve(null),
      user.primaryCategory ? getRank({ user: { primaryCategory: user.primaryCategory } }) : Promise.resolve(null),
      user.college ? getRank({ user: { college: user.college } }) : Promise.resolve(null),
    ]);

    return {
      data: {
        user,
        score: fameScore?.score || 0,
        viralPotential: fameScore?.viralPotential || 0,
        ranks: {
          world: worldRank,
          country: countryRank,
          city: cityRank,
          category: categoryRank,
          college: collegeRank,
        },
      },
      message: 'User ranks retrieved',
    };
  }
}
