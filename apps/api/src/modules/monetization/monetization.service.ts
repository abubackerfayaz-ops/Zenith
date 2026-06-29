import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.module';
import {
  DepositDto,
  WithdrawDto,
  CreateSubscriptionTierDto,
  SendTipDto,
  TransactionFilterDto,
} from './dto/monetization.dto';

@Injectable()
export class MonetizationService {
  private readonly logger = new Logger(MonetizationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getWallet(userId: string) {
    let wallet = await this.prisma.wallet.findUnique({ where: { userId } });

    if (!wallet) {
      wallet = await this.prisma.wallet.create({
        data: { userId, balance: 0 },
      });
    }

    return { data: wallet, message: 'Wallet retrieved' };
  }

  async deposit(userId: string, dto: DepositDto) {
    const wallet = await this.prisma.wallet.upsert({
      where: { userId },
      create: { userId, balance: dto.amount },
      update: { balance: { increment: dto.amount } },
    });

    const transaction = await this.prisma.transaction.create({
      data: {
        walletId: wallet.id,
        type: 'CREDIT',
        amount: dto.amount,
        status: 'COMPLETED',
        description: 'Wallet deposit',
        referenceId: dto.paymentId,
        metadata: dto.paymentProvider ? JSON.stringify({ paymentProvider: dto.paymentProvider }) : undefined,
      },
    });

    return { data: { wallet, transaction }, message: 'Deposit successful' };
  }

  async withdraw(userId: string, dto: WithdrawDto) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });

    if (!wallet || wallet.balance < dto.amount) {
      throw new BadRequestException('Insufficient balance');
    }

    const [updatedWallet, transaction] = await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { userId },
        data: { balance: { decrement: dto.amount } },
      }),
      this.prisma.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'DEBIT',
          amount: dto.amount,
          status: 'PENDING',
          description: `Withdrawal to ${dto.payoutMethod}: ${dto.payoutAddress}`,
        },
      }),
    ]);

    return { data: { wallet: updatedWallet, transaction }, message: 'Withdrawal request submitted' };
  }

  async getTransactions(userId: string, filter: TransactionFilterDto) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      const page = filter.page || 1;
      const limit = filter.limit || 20;
      return { data: [], meta: { total: 0, page, limit } };
    }

    const where: any = { walletId: wallet.id };

    if (filter.type) where.type = filter.type;
    if (filter.status) where.status = filter.status;

    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return { data, meta: { total, page, limit } };
  }

  async createSubscriptionTier(userId: string, dto: CreateSubscriptionTierDto) {
    const existing = await this.prisma.creatorSubscription.findFirst({
      where: { userId },
    });

    if (existing) {
      throw new BadRequestException('You already have a subscription tier');
    }

    const tier = await this.prisma.creatorSubscription.create({
      data: {
        userId,
        price: dto.price,
        description: dto.description,
        perks: dto.benefits ? JSON.stringify(dto.benefits) : undefined,
      },
    });

    return { data: tier, message: 'Subscription tier created' };
  }

  async getMySubscription(userId: string) {
    const tiers = await this.prisma.creatorSubscription.findMany({
      where: { userId },
      include: { _count: { select: { subscribers: true } } },
    });

    return { data: tiers, message: 'Subscription settings retrieved' };
  }

  async subscribe(userId: string, creatorId: string) {
    if (userId === creatorId) {
      throw new BadRequestException('Cannot subscribe to yourself');
    }

    const tier = await this.prisma.creatorSubscription.findFirst({
      where: { userId: creatorId },
    });

    if (!tier) {
      throw new NotFoundException('Creator has no subscription tier');
    }

    const existing = await this.prisma.subscription.findUnique({
      where: { subscriberId_subscriptionId: { subscriberId: userId, subscriptionId: tier.id } },
    });

    if (existing) {
      throw new BadRequestException('Already subscribed to this creator');
    }

    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet || wallet.balance < tier.price) {
      throw new BadRequestException('Insufficient balance to subscribe');
    }

    const [subscription] = await this.prisma.$transaction([
      this.prisma.subscription.create({
        data: {
          subscriberId: userId,
          subscriptionId: tier.id,
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      }),
      this.prisma.wallet.update({
        where: { userId },
        data: { balance: { decrement: tier.price } },
      }),
      this.prisma.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'DEBIT',
          amount: tier.price,
          status: 'COMPLETED',
          description: `Subscription to ${creatorId}`,
        },
      }),
    ]);

    return { data: subscription, message: 'Subscribed successfully' };
  }

  async unsubscribe(userId: string, creatorId: string) {
    const creatorSub = await this.prisma.creatorSubscription.findUnique({
      where: { userId: creatorId },
    });

    if (!creatorSub) {
      throw new NotFoundException('Creator has no subscription tier');
    }

    const existing = await this.prisma.subscription.findUnique({
      where: { subscriberId_subscriptionId: { subscriberId: userId, subscriptionId: creatorSub.id } },
    });

    if (!existing) {
      throw new NotFoundException('Not subscribed to this creator');
    }

    await this.prisma.subscription.delete({
      where: { id: existing.id },
    });

    return { message: 'Unsubscribed successfully' };
  }

  async sendTip(userId: string, creatorId: string, dto: SendTipDto) {
    if (userId === creatorId) {
      throw new BadRequestException('Cannot tip yourself');
    }

    const creator = await this.prisma.user.findUnique({ where: { id: creatorId } });
    if (!creator) {
      throw new NotFoundException('Creator not found');
    }

    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet || wallet.balance < dto.amount) {
      throw new BadRequestException('Insufficient balance');
    }

    const [tip] = await this.prisma.$transaction([
      this.prisma.tip.create({
        data: {
          senderId: userId,
          recipientId: creatorId,
          amount: dto.amount,
          message: dto.message,
        },
      }),
      this.prisma.wallet.update({
        where: { userId },
        data: { balance: { decrement: dto.amount } },
      }),
      this.prisma.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'DEBIT',
          amount: dto.amount,
          status: 'COMPLETED',
          description: `Tip to ${creatorId}${dto.message ? `: ${dto.message}` : ''}`,
        },
      }),
    ]);

    return { data: tip, message: 'Tip sent successfully' };
  }

  async getRevenue(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    const creatorSub = await this.prisma.creatorSubscription.findUnique({ where: { userId } });

    const [subscriptions, tips, totalEarnings] = await Promise.all([
      creatorSub
        ? this.prisma.subscription.findMany({
            where: { subscriptionId: creatorSub.id },
            orderBy: { createdAt: 'desc' },
          })
        : Promise.resolve([]),
      this.prisma.tip.findMany({
        where: { recipientId: userId },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { walletId: wallet?.id || '', type: 'CREDIT' },
      }),
    ]);

    const monthlySubRevenue = creatorSub ? creatorSub.price * subscriptions.length : 0;
    const totalTipRevenue = tips.reduce((s, tip) => s + tip.amount, 0);

    return {
      data: {
        totalRevenue: (totalEarnings._sum.amount || 0) + totalTipRevenue,
        subscriptionRevenue: monthlySubRevenue,
        tipRevenue: totalTipRevenue,
        subscriberCount: subscriptions.length,
        tipCount: tips.length,
        recentSubscriptions: subscriptions.slice(0, 10),
        recentTips: tips.slice(0, 10),
      },
      message: 'Revenue data retrieved',
    };
  }
}
