import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MessagingService } from './messaging.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { AddParticipantsDto } from './dto/add-participants.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Messaging')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller()
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Get('chats')
  @ApiOperation({ summary: "List user's chats" })
  async getChats(@CurrentUser('id') userId: string) {
    return this.messagingService.getUserChats(userId);
  }

  @Post('chats')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a chat (one-to-one or group)' })
  async createChat(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateChatDto,
  ) {
    return this.messagingService.createChat(userId, dto);
  }

  @Get('chats/:id')
  @ApiOperation({ summary: 'Get chat details' })
  async getChatById(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.messagingService.getChatById(id, userId);
  }

  @Patch('chats/:id')
  @ApiOperation({ summary: 'Update group chat info' })
  async updateChat(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateChatDto,
  ) {
    return this.messagingService.updateChat(id, userId, dto);
  }

  @Delete('chats/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Leave/delete a chat' })
  async deleteChat(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.messagingService.deleteChat(id, userId);
  }

  @Post('chats/:id/participants')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add participants to a group chat' })
  async addParticipants(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: AddParticipantsDto,
  ) {
    return this.messagingService.addParticipants(id, userId, dto);
  }

  @Delete('chats/:id/participants/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a participant from group chat' })
  async removeParticipant(
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.messagingService.removeParticipant(id, userId, targetUserId);
  }

  @Get('chats/:id/messages')
  @ApiOperation({ summary: 'Get messages in a chat (paginated)' })
  async getMessages(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.messagingService.getMessages(id, userId, pagination.page, pagination.limit);
  }

  @Post('chats/:id/messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send a message in a chat' })
  async sendMessage(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.messagingService.sendMessage(id, userId, dto);
  }

  @Delete('messages/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a message' })
  async deleteMessage(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.messagingService.deleteMessage(id, userId);
  }

  @Post('messages/:id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark a message as read' })
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.messagingService.markAsRead(id, userId);
  }
}
