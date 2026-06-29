import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.module';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { AddParticipantsDto } from './dto/add-participants.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class MessagingService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserChats(userId: string) {
    const participants = await this.prisma.chatParticipant.findMany({
      where: { userId },
      include: {
        chat: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    displayName: true,
                    profilePicture: true,
                    isVerified: true,
                  },
                },
              },
            },
            messages: {
              take: 1,
              orderBy: { createdAt: 'desc' },
              select: {
                id: true,
                text: true,
                type: true,
                createdAt: true,
                senderId: true,
              },
            },
          },
        },
      },
      orderBy: { chat: { lastMessageAt: 'desc' } },
    });

    const data = participants
      .filter((p) => !p.chat.lastMessageAt || p.chat.lastMessageAt !== null)
      .map((p) => ({
        ...p.chat,
        lastMessage: p.chat.messages[0] || null,
        messages: undefined,
      }));

    return { data, message: 'Chats retrieved successfully' };
  }

  async createChat(userId: string, dto: CreateChatDto) {
    const isGroup = dto.isGroup ?? dto.participantIds.length > 1;

    if (!isGroup && dto.participantIds.length === 1) {
      const otherUserId = dto.participantIds[0];

      const existingChat = await this.prisma.chat.findFirst({
        where: {
          isGroup: false,
          AND: [
            { participants: { some: { userId } } },
            { participants: { some: { userId: otherUserId } } },
          ],
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  profilePicture: true,
                  isVerified: true,
                },
              },
            },
          },
        },
      });

      if (existingChat) {
        return { data: existingChat, message: 'Chat already exists' };
      }
    }

    const allParticipantIds = [userId, ...dto.participantIds.filter((id) => id !== userId)];

    const chat = await this.prisma.chat.create({
      data: {
        isGroup,
        name: dto.name,
        image: dto.image,
        participants: {
          create: allParticipantIds.map((id) => ({
            userId: id,
            role: isGroup && id === userId ? 'ADMIN' : 'MEMBER',
          })),
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                profilePicture: true,
                isVerified: true,
              },
            },
          },
        },
      },
    });

    return { data: chat, message: 'Chat created successfully' };
  }

  async getChatById(chatId: string, userId: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                profilePicture: true,
                isVerified: true,
              },
            },
          },
        },
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    const isParticipant = chat.participants.some((p) => p.userId === userId);
    if (!isParticipant) {
      throw new ForbiddenException('You are not a participant of this chat');
    }

    return { data: chat, message: 'Chat retrieved successfully' };
  }

  async updateChat(chatId: string, userId: string, dto: UpdateChatDto) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: { participants: true },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (!chat.isGroup) {
      throw new BadRequestException('Cannot update a one-to-one chat');
    }

    const participant = chat.participants.find((p) => p.userId === userId);
    if (!participant || participant.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can update group info');
    }

    const updated = await this.prisma.chat.update({
      where: { id: chatId },
      data: dto,
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                profilePicture: true,
                isVerified: true,
              },
            },
          },
        },
      },
    });

    return { data: updated, message: 'Chat updated successfully' };
  }

  async deleteChat(chatId: string, userId: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: { participants: true },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    const participant = chat.participants.find((p) => p.userId === userId);
    if (!participant) {
      throw new ForbiddenException('You are not a participant of this chat');
    }

    if (chat.isGroup) {
      await this.prisma.chatParticipant.delete({
        where: { userId_chatId: { userId, chatId } },
      });

      const remainingParticipants = await this.prisma.chatParticipant.count({
        where: { chatId },
      });

      if (remainingParticipants === 0) {
        await this.prisma.chat.delete({ where: { id: chatId } });
      }

      return { message: 'Left the group chat successfully' };
    }

    await this.prisma.chat.delete({ where: { id: chatId } });
    return { message: 'Chat deleted successfully' };
  }

  async addParticipants(chatId: string, userId: string, dto: AddParticipantsDto) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: { participants: true },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (!chat.isGroup) {
      throw new BadRequestException('Cannot add participants to a one-to-one chat');
    }

    const participant = chat.participants.find((p) => p.userId === userId);
    if (!participant || participant.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can add participants');
    }

    const existingIds = chat.participants.map((p) => p.userId);
    const newIds = dto.userIds.filter((id) => !existingIds.includes(id));

    if (newIds.length === 0) {
      throw new BadRequestException('All users are already participants');
    }

    await this.prisma.chatParticipant.createMany({
      data: newIds.map((id) => ({ userId: id, chatId })),
    });

    const updated = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                profilePicture: true,
                isVerified: true,
              },
            },
          },
        },
      },
    });

    return { data: updated, message: 'Participants added successfully' };
  }

  async removeParticipant(chatId: string, userId: string, targetUserId: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: { participants: true },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (!chat.isGroup) {
      throw new BadRequestException('Cannot remove participants from a one-to-one chat');
    }

    const participant = chat.participants.find((p) => p.userId === userId);
    if (!participant || participant.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can remove participants');
    }

    const target = chat.participants.find((p) => p.userId === targetUserId);
    if (!target) {
      throw new NotFoundException('User is not a participant');
    }

    await this.prisma.chatParticipant.delete({
      where: { userId_chatId: { userId: targetUserId, chatId } },
    });

    return { message: 'Participant removed successfully' };
  }

  async getMessages(chatId: string, userId: string, page: number, limit: number) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: { participants: { where: { userId }, select: { id: true } } },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.participants.length === 0) {
      throw new ForbiddenException('You are not a participant of this chat');
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { chatId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              displayName: true,
              profilePicture: true,
            },
          },
          media: true,
        },
      }),
      this.prisma.message.count({ where: { chatId } }),
    ]);

    return {
      data: data.reverse(),
      meta: { total, page, limit },
      message: 'Messages retrieved successfully',
    };
  }

  async sendMessage(chatId: string, userId: string, dto: SendMessageDto) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: { participants: true },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    const isParticipant = chat.participants.some((p) => p.userId === userId);
    if (!isParticipant) {
      throw new ForbiddenException('You are not a participant of this chat');
    }

    if (!dto.text && !dto.imageUrl && !dto.videoUrl && !dto.voiceUrl) {
      throw new BadRequestException('Message must contain text or media');
    }

    let messageType = 'TEXT';
    if (dto.imageUrl) messageType = 'IMAGE';
    else if (dto.videoUrl) messageType = 'VIDEO';
    else if (dto.voiceUrl) messageType = 'VOICE';

    const otherParticipants = chat.participants.filter((p) => p.userId !== userId);

    const message = await this.prisma.message.create({
      data: {
        text: dto.text,
        type: messageType,
        senderId: userId,
        chatId,
        media: {
          create: [
            ...(dto.imageUrl ? [{ url: dto.imageUrl, type: 'IMAGE', orderIndex: 0 }] : []),
            ...(dto.videoUrl ? [{ url: dto.videoUrl, type: 'VIDEO', orderIndex: 0 }] : []),
            ...(dto.voiceUrl ? [{ url: dto.voiceUrl, type: 'AUDIO', orderIndex: 0 }] : []),
          ],
        },
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profilePicture: true,
          },
        },
        media: true,
      },
    });

    await this.prisma.chat.update({
      where: { id: chatId },
      data: {
        lastMessage: dto.text || '[Media]',
        lastMessageAt: new Date().toISOString(),
      },
    });

    return { data: message, message: 'Message sent successfully' };
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    await this.prisma.message.delete({ where: { id: messageId } });

    return { message: 'Message deleted successfully' };
  }

  async markAsRead(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: { chat: { include: { participants: true } } },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    const isParticipant = message.chat.participants.some((p) => p.userId === userId);
    if (!isParticipant) {
      throw new ForbiddenException('You are not a participant of this chat');
    }

    if (message.senderId === userId) {
      throw new BadRequestException('Cannot mark your own message as read');
    }

    const [updated] = await Promise.all([
      this.prisma.message.update({
        where: { id: messageId },
        data: { isRead: true, readAt: new Date().toISOString() },
      }),
      this.prisma.chatParticipant.updateMany({
        where: { userId, chatId: message.chatId },
        data: { lastReadAt: new Date().toISOString() },
      }),
    ]);

    return { data: updated, message: 'Message marked as read' };
  }
}
