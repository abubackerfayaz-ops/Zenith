import { Router, Request, Response } from 'express';
import { PushService } from '../services/push.service';
import { EmailService } from '../services/email.service';
import { SmsService } from '../services/sms.service';
import { InAppService, InAppNotification } from '../services/in-app.service';

export const notificationRouter = Router();

const emailService = EmailService.getInstance();
const smsService = SmsService.getInstance();

notificationRouter.post('/push/send', async (req: Request, res: Response) => {
  try {
    const { userId, title, body, data, badge, sound, imageUrl } = req.body;
    if (!userId || !title || !body) {
      res.status(400).json({ success: false, error: 'userId, title, and body required' });
      return;
    }

    const pushService: PushService = res.locals.pushService;
    const result = await pushService.sendToUser(userId, { title, body, data, badge, sound, imageUrl });
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Push send failed' });
  }
});

notificationRouter.post('/push/broadcast', async (req: Request, res: Response) => {
  try {
    const { channel, title, body, data, imageUrl } = req.body;
    if (!channel || !title || !body) {
      res.status(400).json({ success: false, error: 'channel, title, and body required' });
      return;
    }

    const pushService: PushService = res.locals.pushService;
    const result = await pushService.broadcastToChannel(channel, { title, body, data, imageUrl });
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Broadcast failed' });
  }
});

notificationRouter.post('/push/broadcast-all', async (req: Request, res: Response) => {
  try {
    const { title, body, data, imageUrl } = req.body;
    if (!title || !body) {
      res.status(400).json({ success: false, error: 'title and body required' });
      return;
    }

    const pushService: PushService = res.locals.pushService;
    await pushService.broadcastToAll({ title, body, data, imageUrl });
    res.json({ success: true, message: 'Broadcast sent' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Broadcast failed' });
  }
});

notificationRouter.post('/email/send', async (req: Request, res: Response) => {
  try {
    const { to, subject, template, context, attachments, cc, bcc, replyTo } = req.body;
    if (!to || !subject || !template || !context) {
      res.status(400).json({ success: false, error: 'to, subject, template, and context required' });
      return;
    }

    const result = await emailService.send({ to, subject, template, context, attachments, cc, bcc, replyTo });
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Email send failed' });
  }
});

notificationRouter.post('/sms/send', async (req: Request, res: Response) => {
  try {
    const { to, body, mediaUrl } = req.body;
    if (!to || !body) {
      res.status(400).json({ success: false, error: 'to and body required' });
      return;
    }

    const result = await smsService.send({ to, body, mediaUrl });
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'SMS send failed' });
  }
});

notificationRouter.post('/sms/verify', async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      res.status(400).json({ success: false, error: 'phoneNumber required' });
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const result = await smsService.sendVerificationCode(phoneNumber, code);
    res.json({ success: true, data: { ...result, code } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Verification failed' });
  }
});

notificationRouter.post('/in-app', async (req: Request, res: Response) => {
  try {
    const { userId, type, title, body, data } = req.body;
    if (!userId || !type || !title || !body) {
      res.status(400).json({ success: false, error: 'userId, type, title, and body required' });
      return;
    }

    const inAppService: InAppService = res.locals.inAppService;
    const notification = await inAppService.create({
      userId,
      type,
      title,
      body,
      data,
    } as Omit<InAppNotification, 'id' | 'read' | 'createdAt'>);

    const pushService: PushService = res.locals.pushService;
    await pushService.sendToUser(userId, { title, body, data: { ...data, notificationId: notification.id } });

    res.json({ success: true, data: notification });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Notification creation failed' });
  }
});

notificationRouter.get('/in-app/:userId', async (req: Request, res: Response) => {
  try {
    const inAppService: InAppService = res.locals.inAppService;
    const { types, unreadOnly } = req.query;
    const limit = parseInt(req.query.limit as string || '20', 10);
    const offset = parseInt(req.query.offset as string || '0', 10);

    const result = await inAppService.getNotifications({
      userId: req.params.userId,
      types: types ? (types as string).split(',') as InAppNotification['type'][] : undefined,
      limit: Math.min(limit, 100),
      offset,
      unreadOnly: unreadOnly === 'true',
    });

    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Fetch notifications failed' });
  }
});

notificationRouter.get('/in-app/:userId/unread-count', async (req: Request, res: Response) => {
  try {
    const inAppService: InAppService = res.locals.inAppService;
    const count = await inAppService.getUnreadCount(req.params.userId);
    res.json({ success: true, data: { count } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Fetch unread count failed' });
  }
});

notificationRouter.put('/in-app/:userId/read/:notificationId', async (req: Request, res: Response) => {
  try {
    const inAppService: InAppService = res.locals.inAppService;
    const result = await inAppService.markAsRead(req.params.notificationId, req.params.userId);
    res.json({ success: true, data: { marked: result } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Mark as read failed' });
  }
});

notificationRouter.put('/in-app/:userId/read-all', async (req: Request, res: Response) => {
  try {
    const inAppService: InAppService = res.locals.inAppService;
    const count = await inAppService.markAllAsRead(req.params.userId);
    res.json({ success: true, data: { marked: count } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Mark all as read failed' });
  }
});

notificationRouter.delete('/in-app/:userId/:notificationId', async (req: Request, res: Response) => {
  try {
    const inAppService: InAppService = res.locals.inAppService;
    const result = await inAppService.deleteNotification(req.params.notificationId, req.params.userId);
    res.json({ success: true, data: { deleted: result } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Delete notification failed' });
  }
});
