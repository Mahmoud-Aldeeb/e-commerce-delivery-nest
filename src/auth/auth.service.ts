import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { Role } from '../generated/prisma/enums.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private generateToken(id: string) {
    return this.jwtService.sign({ id });
  }

  private toUserResponse<T extends { password: string; role: Role }>(user: T) {
    const { password, ...rest } = user;
    return { ...rest, isAdmin: user.role === Role.ADMIN };
  }

  // ===== Register =====
  async register({ name, email, password }: RegisterDto) {
    const normalizedEmail = email.toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingUser) {
      throw new BadRequestException('User already exists with this email');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: { name, email: normalizedEmail, password: hashedPassword },
    });

    return {
      user: this.toUserResponse(user),
      token: this.generateToken(user.id),
    };
  }

  // ===== Login =====
  async login({ email, password }: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { addresses: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return {
      user: this.toUserResponse(user),
      token: this.generateToken(user.id),
    };
  }
}
