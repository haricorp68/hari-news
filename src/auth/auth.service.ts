import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginAuthDto } from './dto/create-auth.dto';
import * as bcrypt from 'bcryptjs';
import { RefreshTokenType } from './entities/refresh-token.entity';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserConfigService } from '../user/user-config.service';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly jwtService: JwtService,
    private readonly userConfigService: UserConfigService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return { message: 'User registered successfully', user };
  }

  async login(loginDto: LoginAuthDto, device?: string, ip?: string, userAgent?: string) {
    const user = await this.userService.findByEmail(loginDto.email, true) as import('../user/entities/user.entity').User | null;
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
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
    const user = await this.userService.findOne(userId, true) as import('../user/entities/user.entity').User | null;
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
    if (!oauthUser.email) {
      throw new UnauthorizedException('No email from OAuth provider');
    }
    let user = await this.userService.findByEmail(oauthUser.email, true) as import('../user/entities/user.entity').User | null;
    if (!user) {
      user = await this.userService.create({
        email: oauthUser.email,
        password: '',
      }) as import('../user/entities/user.entity').User;
    }
    if (!user) {
      throw new UnauthorizedException('Cannot create user from OAuth');
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
    const match = expiresIn.match(/(\d+)([smhd])/);
    if (!match) return 7 * 24 * 60 * 60 * 1000;
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

  // Forgot password: gửi email chứa token reset
  async forgotPassword({ email }: ForgotPasswordDto) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new BadRequestException('Email not found');
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 phút
    await this.userConfigService.updateUserConfig(user.id, {
      passwordResetToken: token,
      passwordResetExpiresAt: expires,
    });
    // TODO: Gửi email chứa link reset password với token này
    return { message: 'Đã gửi email đặt lại mật khẩu (giả lập)', token };
  }

  // Đặt lại mật khẩu bằng token
  async resetPassword({ token, newPassword }: ResetPasswordDto) {
    const config = await this.userConfigService.findByResetToken(token);
    if (!config || !config.passwordResetExpiresAt || config.passwordResetExpiresAt < new Date()) {
      throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
    }
    await this.userService.update(config.userId, { password: newPassword });
    await this.userConfigService.updateUserConfig(config.userId, {
      passwordResetToken: undefined,
      passwordResetExpiresAt: undefined,
    });
    return { message: 'Đặt lại mật khẩu thành công!' };
  }

  // Gửi email xác thực
  async sendEmailVerification(userId: number) {
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h
    await this.userConfigService.updateUserConfig(userId, {
      emailVerificationToken: token,
      emailVerificationExpiresAt: expires,
    });
    // TODO: Gửi email xác thực với token này
    return { message: 'Đã gửi email xác thực (giả lập)', token };
  }

  // Xác thực email
  async verifyEmail({ token }: VerifyEmailDto) {
    const config = await this.userConfigService.findByEmailVerificationToken(token);
    if (!config || !config.emailVerificationExpiresAt || config.emailVerificationExpiresAt < new Date()) {
      throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
    }
    await this.userService.update(config.userId, { isVerified: true });
    await this.userConfigService.updateUserConfig(config.userId, {
      emailVerificationToken: undefined,
      emailVerificationExpiresAt: undefined,
    });
    return { message: 'Xác thực email thành công!' };
  }

  // Đổi mật khẩu khi đã đăng nhập
  async changePassword(userId: number, { oldPassword, newPassword }: ChangePasswordDto) {
    const user = await this.userService.findOne(userId, true) as any;
    if (!user || !user.password) throw new BadRequestException('User not found');
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new BadRequestException('Mật khẩu cũ không đúng');
    await this.userService.update(userId, { password: newPassword });
    return { message: 'Đổi mật khẩu thành công!' };
  }
}
