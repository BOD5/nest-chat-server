import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterAuthDto) {
    const { userName, password } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { userName },
    });

    if (existingUser) {
      throw new ConflictException('User with this username already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        userName,
        passwordHash,
      },
    });

    return this.signToken(user.id, user.userName);
  }

  async login(loginDto: LoginAuthDto) {
    const { userName, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { userName },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.signToken(user.id, user.userName);
  }

  private async signToken(userId: string, userName: string) {
    const payload = {
      sub: userId,
      userName,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
    };
  }
}
