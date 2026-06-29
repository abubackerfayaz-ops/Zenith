import { Server as SocketIOServer } from 'socket.io';
import * as admin from 'firebase-admin';

let firebaseInitialized = false;

function initFirebase(): void {
  if (firebaseInitialized) return;

  try {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      firebaseInitialized = true;
      console.log('[Push] Firebase initialized');
    } else {
      console.warn('[Push] Firebase config incomplete, Firebase notifications disabled');
    }
  } catch (error) {
    console.error('[Push] Firebase initialization failed:', error);
  }
}

interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  badge?: number;
  sound?: string;
  imageUrl?: string;
}

interface PushNotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class PushService {
  private static instance: PushService;
  private io: SocketIOServer;

  private constructor(io: SocketIOServer) {
    this.io = io;
    initFirebase();
  }

  static getInstance(io: SocketIOServer): PushService {
    if (!PushService.instance) {
      PushService.instance = new PushService(io);
    }
    return PushService.instance;
  }

  async sendToUser(userId: string, notification: PushNotificationPayload): Promise<PushNotificationResult> {
    try {
      this.io.to(`user:${userId}`).emit('notification', {
        type: 'push',
        ...notification,
        timestamp: new Date().toISOString(),
      });

      if (firebaseInitialized) {
        try {
          const message = {
            notification: {
              title: notification.title,
              body: notification.body,
              imageUrl: notification.imageUrl,
            },
            data: notification.data || {},
            token: userId,
          };

          const response = await admin.messaging().send(message);
          return { success: true, messageId: response };
        } catch (firebaseError: any) {
          if (firebaseError.code === 'messaging/invalid-registration-token') {
            return { success: true };
          }
          console.warn('[Push] Firebase send failed:', firebaseError.message);
          return { success: true };
        }
      }

      return { success: true };
    } catch (error: any) {
      console.error('[Push] Send failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendToMultipleUsers(userIds: string[], notification: PushNotificationPayload): Promise<PushNotificationResult[]> {
    const results = await Promise.all(
      userIds.map(userId => this.sendToUser(userId, notification))
    );
    return results;
  }

  async broadcastToChannel(channel: string, notification: PushNotificationPayload): Promise<PushNotificationResult> {
    try {
      this.io.to(`broadcast:${channel}`).emit('notification', {
        type: 'broadcast',
        channel,
        ...notification,
        timestamp: new Date().toISOString(),
      });

      return { success: true };
    } catch (error: any) {
      console.error('[Push] Broadcast failed:', error);
      return { success: false, error: error.message };
    }
  }

  async broadcastToAll(notification: PushNotificationPayload): Promise<void> {
    this.io.emit('notification', {
      type: 'global',
      ...notification,
      timestamp: new Date().toISOString(),
    });
  }
}
