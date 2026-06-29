import { Namespace } from 'socket.io';
import { AuthenticatedSocket } from '../auth';

interface NotificationPayload {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  timestamp?: number;
}

interface ReadNotificationPayload {
  notificationId: string;
}

export function registerNotificationsNamespace(io: Namespace): void {
  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`[Notifications] User ${socket.userId} connected`);

    const userRoom = `user:${socket.userId}`;
    socket.join(userRoom);

    socket.on(
      'notification:new',
      (data: NotificationPayload) => {
        try {
          if (!data.id || !data.type || !data.title) return;

          const notification: NotificationPayload = {
            ...data,
            timestamp: data.timestamp || Date.now(),
          };

          socket.to(userRoom).emit('notification:new', notification);
        } catch (error) {
          console.error(`[Notifications] Error sending notification:`, error);
        }
      }
    );

    socket.on(
      'notification:read',
      (data: ReadNotificationPayload) => {
        try {
          if (!data.notificationId) return;

          socket.to(userRoom).emit('notification:read', {
            notificationId: data.notificationId,
            userId: socket.userId,
            readAt: Date.now(),
          });
        } catch (error) {
          console.error(`[Notifications] Error marking notification as read:`, error);
        }
      }
    );

    socket.on('unread:count', (callback?: (count: number) => void) => {
      try {
        socket.emit('unread:count', { userId: socket.userId, count: 0 });
        if (callback) callback(0);
      } catch (error) {
        console.error(`[Notifications] Error fetching unread count:`, error);
        if (callback) callback(0);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Notifications] User ${socket.userId} disconnected`);
    });
  });
}
