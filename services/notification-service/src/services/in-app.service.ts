import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_HOST || 'localhost:6379');

export interface InAppNotification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'rank_change' | 'milestone' | 'achievement' | 'system' | 'fame_score_update';
  title: string;
  body: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface NotificationQuery {
  userId: string;
  types?: InAppNotification['type'][];
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
}

export class InAppService {
  private static instance: InAppService;

  static getInstance(): InAppService {
    if (!InAppService.instance) {
      InAppService.instance = new InAppService();
    }
    return InAppService.instance;
  }

  private notificationKey(userId: string): string {
    return `notifications:${userId}`;
  }

  private unreadCountKey(userId: string): string {
    return `notifications:unread:${userId}`;
  }

  async create(notification: Omit<InAppNotification, 'id' | 'read' | 'createdAt'>): Promise<InAppNotification> {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const notif: InAppNotification = {
      ...notification,
      id,
      read: false,
      createdAt: now,
    };

    const key = this.notificationKey(notification.userId);
    await redis.lpush(key, JSON.stringify(notif));
    await redis.ltrim(key, 0, 199);
    await redis.incr(this.unreadCountKey(notification.userId));
    await redis.expire(key, 604800);

    return notif;
  }

  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    const key = this.notificationKey(userId);
    const notifications = await redis.lrange(key, 0, -1);

    for (let i = 0; i < notifications.length; i++) {
      const notif = JSON.parse(notifications[i]) as InAppNotification;
      if (notif.id === notificationId && !notif.read) {
        notif.read = true;
        await redis.lset(key, i, JSON.stringify(notif));
        await redis.decr(this.unreadCountKey(userId));
        return true;
      }
    }

    return false;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const key = this.notificationKey(userId);
    const notifications = await redis.lrange(key, 0, -1);
    let markedCount = 0;

    const pipeline = redis.pipeline();
    for (let i = 0; i < notifications.length; i++) {
      const notif = JSON.parse(notifications[i]) as InAppNotification;
      if (!notif.read) {
        notif.read = true;
        pipeline.lset(key, i, JSON.stringify(notif));
        markedCount++;
      }
    }

    if (markedCount > 0) {
      await pipeline.exec();
      await redis.set(this.unreadCountKey(userId), '0');
      await redis.expire(this.unreadCountKey(userId), 604800);
    }

    return markedCount;
  }

  async getNotifications(query: NotificationQuery): Promise<{ notifications: InAppNotification[]; total: number; unreadCount: number }> {
    const key = this.notificationKey(query.userId);
    const limit = query.limit || 20;
    const offset = query.offset || 0;

    const [rawNotifications, unreadCountStr] = await Promise.all([
      redis.lrange(key, offset, offset + limit - 1),
      redis.get(this.unreadCountKey(query.userId)),
    ]);

    let notifications = rawNotifications.map(n => JSON.parse(n) as InAppNotification);

    if (query.types && query.types.length > 0) {
      notifications = notifications.filter(n => query.types!.includes(n.type));
    }

    if (query.unreadOnly) {
      notifications = notifications.filter(n => !n.read);
    }

    const total = await redis.llen(key);
    const unreadCount = parseInt(unreadCountStr || '0', 10);

    return { notifications, total, unreadCount };
  }

  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    const key = this.notificationKey(userId);
    const notifications = await redis.lrange(key, 0, -1);

    for (const notifStr of notifications) {
      const notif = JSON.parse(notifStr) as InAppNotification;
      if (notif.id === notificationId) {
        await redis.lrem(key, 1, notifStr);
        if (!notif.read) {
          await redis.decr(this.unreadCountKey(userId));
        }
        return true;
      }
    }

    return false;
  }

  async getUnreadCount(userId: string): Promise<number> {
    const count = await redis.get(this.unreadCountKey(userId));
    return parseInt(count || '0', 10);
  }
}
