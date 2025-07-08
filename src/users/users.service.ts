import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(private prisma: PrismaService) {}

  async searchUsers(query: string, currentUserId: string) {
    if (!query) {
      return [];
    }
    return this.prisma.user.findMany({
      where: {
        userName: {
          contains: query,
        },
        id: {
          not: currentUserId,
        },
      },
      select: {
        id: true,
        userName: true,
      },
    });
  }
}
