import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import { CreateChatDto } from './dto/create-chat.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('api/chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  create(@GetUser('id') userId: string, @Body() createChatDto: CreateChatDto) {
    return this.chatService.createChat(userId, createChatDto.participantId);
  }

  @Get()
  findAll(@GetUser('id') userId: string) {
    return this.chatService.getChatsForUser(userId);
  }

  @Get(':id/events')
  findOne(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.chatService.getChatEvents(id, userId);
  }
}
