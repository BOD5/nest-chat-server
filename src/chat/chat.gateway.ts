import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { SendMessageDto } from './dto/send-message.dto';
import { ForbiddenException, UsePipes, ValidationPipe } from '@nestjs/common';
import { EventType } from '@prisma/client';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private clients = new Map<string, string>();

  constructor(
    private readonly chatService: ChatService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const authHeader = client.handshake.headers.authorization;
      if (!authHeader) {
        throw new Error('No authorization header');
      }

      const token = authHeader.split(' ')[1];
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      const userId = payload.sub;
      this.clients.set(client.id, userId);

      const chats = await this.chatService.getChatsForUser(userId);
      chats.forEach((chat) => client.join(chat.id));
    } catch (e) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.clients.delete(client.id);
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('client:sendMessage')
  async handleMessage(client: Socket, payload: SendMessageDto) {
    const userId = this.clients.get(client.id);
    if (!userId) {
      return;
    }

    const chat = await this.prisma.chat.findUnique({
      where: { id: payload.chatId },
      include: { participants: true },
    });

    if (!chat) {
      return;
    }

    const isParticipant = chat.participants.some((p) => p.userId === userId);
    if (!isParticipant) {
      throw new ForbiddenException("You don't have access to this chat");
    }

    const event = await this.prisma.chatEvent.create({
      data: {
        chatId: payload.chatId,
        senderId: userId,
        type: EventType.TEXT_MESSAGE,
        payload: { content: payload.content },
      },
      include: {
        sender: {
          select: { id: true, userName: true },
        },
      },
    });

    this.server.to(payload.chatId).emit('server:newEvent', event);
  }
}