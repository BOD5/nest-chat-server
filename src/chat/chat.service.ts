import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async createChat(userId: string, participantId: string) {
    const existingChat = await this.prisma.chat.findFirst({
      where: {
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: participantId } } },
        ],
      },
    });

    if (existingChat) {
      return existingChat;
    }

    return this.prisma.chat.create({
      data: {
        participants: {
          create: [{ userId }, { userId: participantId }],
        },
      },
    });
  }

  async getChatsForUser(userId: string) {
    return this.prisma.chat.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        participants: {
          select: {
            user: {
              select: {
                id: true,
                userName: true,
              },
            },
          },
        },
        events: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });
  }

  async getChatEvents(chatId: string, userId: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: { participants: true },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    const isParticipant = chat.participants.some((p) => p.userId === userId);
    if (!isParticipant) {
      throw new ForbiddenException("You don't have access to this chat");
    }

    return this.prisma.chatEvent.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            userName: true,
          },
        },
      },
    });
  }
}
