import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.module';
import { CreateBattleDto, UpdateBattleDto, BattleFilterDto, BattleStatus } from './dto/create-battle.dto';

@Injectable()
export class BattlesService {
  private readonly logger = new Logger(BattlesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateBattleDto) {
    const battle = await this.prisma.battle.create({
      data: {
        title: dto.title,
        description: dto.description,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        prize: dto.prize,
        category: dto.category,
        status: BattleStatus.UPCOMING,
      },
    });

    return { data: battle, message: 'Battle created successfully' };
  }

  async findAll(filter: BattleFilterDto) {
    const where: any = {};

    if (filter.status) {
      where.status = filter.status;
    }
    if (filter.category) {
      where.category = filter.category;
    }

    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.battle.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          participants: {
            include: {
              user: { select: { id: true, username: true, displayName: true, profilePicture: true } },
            },
          },
          _count: { select: { participants: true, votes: true } },
        },
      }),
      this.prisma.battle.count({ where }),
    ]);

    return { data, meta: { total, page, limit } };
  }

  async getActive() {
    const now = new Date();
    const data = await this.prisma.battle.findMany({
      where: {
        status: BattleStatus.ACTIVE,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { endDate: 'asc' },
      include: {
        participants: {
          include: {
            user: { select: { id: true, username: true, displayName: true, profilePicture: true } },
          },
        },
        _count: { select: { participants: true, votes: true } },
      },
    });

    return { data, message: 'Active battles retrieved' };
  }

  async getLeaderboard() {
    const data = await this.prisma.battleParticipant.groupBy({
      by: ['userId'],
      _sum: { votesCount: true },
      _count: { id: true },
      orderBy: { _sum: { votesCount: 'desc' } },
      take: 100,
    });

    const userIds = data.map((d) => d.userId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true, displayName: true, profilePicture: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));
    const leaderboard = data.map((entry, index) => ({
      rank: index + 1,
      user: userMap.get(entry.userId),
      totalVotes: entry._sum.votesCount || 0,
      battlesParticipated: entry._count.id,
    }));

    return { data: leaderboard, message: 'Leaderboard retrieved' };
  }

  async getWeekly() {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const data = await this.prisma.battle.findMany({
      where: {
        startDate: { gte: weekStart, lte: weekEnd },
        status: BattleStatus.ACTIVE,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        participants: {
          include: {
            user: { select: { id: true, username: true, displayName: true, profilePicture: true } },
          },
        },
        _count: { select: { participants: true, votes: true } },
      },
    });

    return { data, message: 'Weekly battles retrieved' };
  }

  async findOne(id: string) {
    const data = await this.prisma.battle.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: { select: { id: true, username: true, displayName: true, profilePicture: true } },
          },
          orderBy: { votesCount: 'desc' },
        },
        _count: { select: { votes: true } },
      },
    });

    if (!data) {
      throw new NotFoundException('Battle not found');
    }

    return { data, message: 'Battle details retrieved' };
  }

  async update(id: string, dto: UpdateBattleDto) {
    const existing = await this.prisma.battle.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Battle not found');
    }

    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.startDate !== undefined) data.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) data.endDate = new Date(dto.endDate);
    if (dto.prize !== undefined) data.prize = dto.prize;
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.status !== undefined) data.status = dto.status;

    const battle = await this.prisma.battle.update({
      where: { id },
      data,
    });

    return { data: battle, message: 'Battle updated successfully' };
  }

  async join(userId: string, battleId: string) {
    const battle = await this.prisma.battle.findUnique({ where: { id: battleId } });
    if (!battle) {
      throw new NotFoundException('Battle not found');
    }

    if (battle.status !== BattleStatus.UPCOMING && battle.status !== BattleStatus.ACTIVE) {
      throw new BadRequestException('Battle is not open for participants');
    }

    const existing = await this.prisma.battleParticipant.findUnique({
      where: { userId_battleId: { userId, battleId } },
    });
    if (existing) {
      throw new ConflictException('Already joined this battle');
    }

    const participant = await this.prisma.battleParticipant.create({
      data: { battleId, userId },
    });

    return { data: participant, message: 'Joined battle successfully' };
  }

  async vote(userId: string, battleId: string, participantId: string) {
    const battle = await this.prisma.battle.findUnique({ where: { id: battleId } });
    if (!battle) {
      throw new NotFoundException('Battle not found');
    }

    if (battle.status !== BattleStatus.ACTIVE) {
      throw new BadRequestException('Battle is not currently active');
    }

    if (new Date() > battle.endDate) {
      throw new BadRequestException('Battle has ended');
    }

    const participant = await this.prisma.battleParticipant.findUnique({
      where: { id: participantId },
    });
    if (!participant || participant.battleId !== battleId) {
      throw new NotFoundException('Participant not found in this battle');
    }

    if (participant.userId === userId) {
      throw new BadRequestException('Cannot vote for yourself');
    }

    const existingVote = await this.prisma.battleVote.findUnique({
      where: { userId_battleId: { userId, battleId } },
    });
    if (existingVote) {
      throw new ConflictException('You have already voted in this battle');
    }

    const [vote] = await this.prisma.$transaction([
      this.prisma.battleVote.create({
        data: { battleId, participantId, userId },
      }),
      this.prisma.battleParticipant.update({
        where: { id: participantId },
        data: { votesCount: { increment: 1 } },
      }),
    ]);

    return { data: vote, message: 'Vote cast successfully' };
  }

  async autoComplete() {
    const now = new Date();
    const expired = await this.prisma.battle.findMany({
      where: {
        status: BattleStatus.ACTIVE,
        endDate: { lte: now },
      },
    });

    for (const battle of expired) {
      await this.prisma.battle.update({
        where: { id: battle.id },
        data: { status: BattleStatus.COMPLETED },
      });
    }

    return { message: `${expired.length} battles auto-completed` };
  }
}
