import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';

const PORT = parseInt(process.env.PORT || '4346', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'famewars-dev-jwt-secret-key-2024';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:4344';

interface AuthPayload {
  userId: string;
  username: string;
}

const httpServer = createServer();
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  adapter: undefined,
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (!token) {
    return next(new Error('Authentication required'));
  }
  try {
    const decoded = jwt.verify(token as string, JWT_SECRET) as AuthPayload & { sub: string };
    (socket as any).user = { userId: decoded.sub || decoded.userId, username: decoded.username };
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${(socket as any).user?.userId}`);
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${(socket as any).user?.userId}`);
  });
});

const messaging = io.of('/messaging');
messaging.on('connection', (socket) => {
  const userId = (socket as any).user?.userId;
  if (!userId) return socket.disconnect();

  socket.on('join:chat', (chatId: string) => {
    socket.join(`chat:${chatId}`);
  });

  socket.on('leave:chat', (chatId: string) => {
    socket.leave(`chat:${chatId}`);
  });

  socket.on('message:send', (data: { chatId: string; message: any }) => {
    socket.to(`chat:${data.chatId}`).emit('message:new', data.message);
  });

  socket.on('message:read', (data: { chatId: string; messageId: string }) => {
    socket.to(`chat:${data.chatId}`).emit('message:read', data);
  });

  socket.on('typing:start', (data: { chatId: string }) => {
    socket.to(`chat:${data.chatId}`).emit('typing:start', { userId, chatId: data.chatId });
  });

  socket.on('typing:stop', (data: { chatId: string }) => {
    socket.to(`chat:${data.chatId}`).emit('typing:stop', { userId, chatId: data.chatId });
  });
});

const notifications = io.of('/notifications');
notifications.on('connection', (socket) => {
  const userId = (socket as any).user?.userId;
  if (!userId) return socket.disconnect();

  socket.join(`user:${userId}`);

  socket.on('notification:read', (data: { notificationId: string }) => {
    socket.to(`user:${userId}`).emit('notification:read', data);
  });
});

const ai = io.of('/ai');
ai.on('connection', (socket) => {
  const userId = (socket as any).user?.userId;
  if (!userId) return socket.disconnect();

  socket.join(`ai:${userId}`);
});

const battles = io.of('/battles');
battles.on('connection', (socket) => {
  const userId = (socket as any).user?.userId;
  if (!userId) return socket.disconnect();

  socket.on('join:battle', (battleId: string) => {
    socket.join(`battle:${battleId}`);
  });

  socket.on('leave:battle', (battleId: string) => {
    socket.leave(`battle:${battleId}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
