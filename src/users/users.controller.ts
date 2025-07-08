import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '@prisma/client';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getMe(@GetUser() user: Omit<User, 'passwordHash'>) {
    return user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('search')
  searchUsers(
    @Query('query') query: string,
    @GetUser('id') currentUserId: string,
  ) {
    return this.usersService.searchUsers(query, currentUserId);
  }
}
