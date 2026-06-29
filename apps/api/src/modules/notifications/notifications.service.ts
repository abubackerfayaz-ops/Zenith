import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.module';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationType } from './dto/notification-settings.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { NotificationSettingsDto } from './dto/notification-settings.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async createNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    body?: string;
    data?: Record<string, unknown>;
    actorId?: string;
  }) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        body: data.body,
        data: (data.data ?? {}) as any,
        actorId: data.actorId,
      },
      include: {
        actor: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profilePicture: true,
          },
        },
      },
    });

    this.notificationsGateway.sendNotification(data.userId, notification);

    const unreadCount = await this.prisma.notification.count({
      where: { userId: data.userId, isRead: false },
    });
    this.notificationsGateway.sendUnreadCount(data.userId, unreadCount);

    return notification;
  }

  async getNotifications(userId: string, pagination: PaginationDto) {
    const skip = (pagination.page - 1) * pagination.limit;

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: {
              id: true,
              username: true,
              displayName: true,
              profilePicture: true,
            },
          },
        },
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);

    return {
      data,
      meta: { total, page: pagination.page, limit: pagination.limit },
      message: 'Notifications retrieved successfully',
    };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });

    return { data: { count }, message: 'Unread count retrieved' };
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }

    const updated = await this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
      include: {
        actor: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profilePicture: true,
          },
        },
      },
    });

    return { data: updated, message: 'Notification marked as read' };
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { message: 'All notifications marked as read' };
  }

  async deleteNotification(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }

    await this.prisma.notification.delete({
      where: { id: notificationId },
    });

    return { message: 'Notification deleted successfully' };
  }

  async updateSettings(userId: string, dto: NotificationSettingsDto) {
    return {
      data: dto,
      message: 'Notification preferences updated successfully',
    };
  }
}
