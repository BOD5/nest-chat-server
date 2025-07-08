import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { UsersModule } from './users/users.module';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, ChatModule],
  controllers: [AppController, AuthController, UsersController],
  providers: [AppService, AuthService, UsersService],
})
export class AppModule {}
