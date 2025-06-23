import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginAuthDto } from './dto/create-auth.dto';
import * as bcrypt from 'bcryptjs';
import { RefreshTokenType } from './entities/refresh-token.entity';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
    });
    await this.userRepository.save(user);
    return { message: 'User registered successfully' };
  }

  async login(loginDto: LoginAuthDto, device?: string, ip?: string, userAgent?: string) {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    });
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    const expiredAt = new Date(Date.now() + this.parseExpiresIn(process.env.JWT_REFRESH_EXPIRES_IN || '7d'));
    await this.refreshTokenRepository.createAndSave({
      user,
      token: hashedRefreshToken,
      device,
      ip,
      userAgent,
      type: RefreshTokenType.LOCAL,
      expiredAt,
    });
    return { accessToken, refreshToken };
  }

  async refreshToken(userId: number, refreshToken: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }
    const tokens = await this.refreshTokenRepository.findByUser(userId, RefreshTokenType.LOCAL);
    let found = false;
    for (const tokenEntity of tokens) {
      const match = await bcrypt.compare(refreshToken, tokenEntity.token);
      if (match && (!tokenEntity.expiredAt || tokenEntity.expiredAt > new Date()) && !tokenEntity.revokedAt) {
        found = true;
        break;
      }
    }
    if (!found) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    try {
      this.jwtService.verify(refreshToken, { secret: process.env.JWT_SECRET });
    } catch (e) {
      throw new UnauthorizedException('Expired or invalid refresh token');
    }
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    return { accessToken };
  }

  async revokeAllRefreshTokensForUser(userId: number) {
    return this.refreshTokenRepository.revokeAllForUser(userId, RefreshTokenType.LOCAL);
  }

  async oauthLogin(oauthUser: any) {
    // oauthUser: { provider, providerId, email, name, avatar }
    if (!oauthUser.email) {
      throw new UnauthorizedException('No email from OAuth provider');
    }
    let user = await this.userRepository.findOne({ where: { email: oauthUser.email } });
    if (!user) {
      user = this.userRepository.create({
        email: oauthUser.email,
        password: '', // Không có password cho OAuth
      });
      await this.userRepository.save(user);
    }
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    });
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    const expiredAt = new Date(Date.now() + this.parseExpiresIn(process.env.JWT_REFRESH_EXPIRES_IN || '7d'));
    await this.refreshTokenRepository.createAndSave({
      user,
      token: hashedRefreshToken,
      type: RefreshTokenType.OAUTH,
      expiredAt,
    });
    return { accessToken, refreshToken };
  }

  private parseExpiresIn(expiresIn: string): number {
    // supports s, m, h, d (e.g. 3600s, 7d)
    const match = expiresIn.match(/(\d+)([smhd])/);
    if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7d
    const value = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return 7 * 24 * 60 * 60 * 1000;
    }
  }
}
