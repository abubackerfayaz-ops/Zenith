import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { notificationRouter } from './routes/notification.routes';
import { PushService } from './services/push.service';
import { InAppService } from './services/in-app.service';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 4353;

app.use(cors());
app.use(express.json());

const pushService = PushService.getInstance(io);
const inAppService = InAppService.getInstance();

app.use((_req, res, next) => {
  res.locals.pushService = pushService;
  res.locals.inAppService = inAppService;
  next();
});

app.use('/api/notifications', notificationRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'notification-service', timestamp: new Date().toISOString() });
});

io.on('connection', (socket) => {
  console.log(`[Notifications] Client connected: ${socket.id}`);

  socket.on('join', (userId: string) => {
    socket.join(`user:${userId}`);
    console.log(`[Notifications] Socket ${socket.id} joined user:${userId}`);
  });

  socket.on('join-broadcast', (channel: string) => {
    socket.join(`broadcast:${channel}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Notifications] Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`[Notification Service] Running on port ${PORT}`);
});

export { app, server, io };
