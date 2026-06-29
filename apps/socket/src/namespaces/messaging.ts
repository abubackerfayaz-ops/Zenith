import { Namespace } from 'socket.io';
import { AuthenticatedSocket } from '../auth';
import { storeOfflineMessage } from '../redis';

interface ChatMessage {
  chatId: string;
  content: string;
  messageId?: string;
  timestamp?: number;
}

interface TypingPayload {
  chatId: string;
  isTyping: boolean;
}

interface ReadReceipt {
  chatId: string;
  messageId: string;
}

export function registerMessagingNamespace(io: Namespace): void {
  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`[Messaging] User ${socket.userId} connected`);

    socket.on('join:chat', (chatId: string) => {
      if (typeof chatId !== 'string' || !chatId.trim()) return;

      socket.join(`chat:${chatId}`);
      console.log(`[Messaging] User ${socket.userId} joined chat ${chatId}`);
    });

    socket.on('leave:chat', (chatId: string) => {
      if (typeof chatId !== 'string' || !chatId.trim()) return;

      socket.leave(`chat:${chatId}`);
      console.log(`[Messaging] User ${socket.userId} left chat ${chatId}`);
    });

    socket.on(
      'message:send',
      async (data: ChatMessage, callback?: (response: { success: boolean; messageId?: string; error?: string }) => void) => {
        try {
          if (!data.chatId || !data.content) {
            if (callback) callback({ success: false, error: 'chatId and content are required' });
            return;
          }

          const message: ChatMessage = {
            chatId: data.chatId,
            content: data.content,
            messageId: data.messageId || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            timestamp: data.timestamp || Date.now(),
          };

          const room = `chat:${data.chatId}`;
          const roomSockets = await io.in(room).fetchSockets();

          if (roomSockets.length <= 1) {
            await storeOfflineMessage(data.chatId, {
              ...message,
              senderId: socket.userId,
            });
          }

          socket.to(room).emit('message:new', {
            ...message,
            senderId: socket.userId,
          });

          if (callback) callback({ success: true, messageId: message.messageId });
        } catch (error) {
          console.error(`[Messaging] Error sending message:`, error);
          if (callback) callback({ success: false, error: 'Failed to send message' });
        }
      }
    );

    socket.on(
      'message:read',
      (data: ReadReceipt) => {
        try {
          if (!data.chatId || !data.messageId) return;

          socket.to(`chat:${data.chatId}`).emit('message:read', {
            chatId: data.chatId,
            messageId: data.messageId,
            readBy: socket.userId,
            readAt: Date.now(),
          });
        } catch (error) {
          console.error(`[Messaging] Error marking message as read:`, error);
        }
      }
    );

    socket.on(
      'typing:start',
      (data: TypingPayload) => {
        if (!data.chatId) return;

        socket.to(`chat:${data.chatId}`).emit('typing:start', {
          chatId: data.chatId,
          userId: socket.userId,
          username: socket.username,
        });
      }
    );

    socket.on(
      'typing:stop',
      (data: TypingPayload) => {
        if (!data.chatId) return;

        socket.to(`chat:${data.chatId}`).emit('typing:stop', {
          chatId: data.chatId,
          userId: socket.userId,
        });
      }
    );

    socket.on('disconnect', () => {
      console.log(`[Messaging] User ${socket.userId} disconnected`);
    });
  });
}
