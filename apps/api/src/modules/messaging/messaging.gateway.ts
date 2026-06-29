import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/messaging',
  cors: { origin: '*', credentials: true },
})
export class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, Set<string>>();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId).add(client.id);
      client.join(`user:${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId && this.userSockets.has(userId)) {
      this.userSockets.get(userId).delete(client.id);
      if (this.userSockets.get(userId).size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }

  @SubscribeMessage('join:chat')
  handleJoinChat(@ConnectedSocket() client: Socket, @MessageBody() chatId: string) {
    client.join(`chat:${chatId}`);
  }

  @SubscribeMessage('leave:chat')
  handleLeaveChat(@ConnectedSocket() client: Socket, @MessageBody() chatId: string) {
    client.leave(`chat:${chatId}`);
  }

  sendMessage(chatId: string, message: any) {
    this.server.to(`chat:${chatId}`).emit('message:new', message);
  }

  markAsRead(chatId: string, messageId: string, userId: string) {
    this.server.to(`chat:${chatId}`).emit('message:read', { messageId, userId });
  }

  sendTyping(chatId: string, userId: string) {
    this.server.to(`chat:${chatId}`).emit('typing', { userId });
  }

  notifyUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }
}
