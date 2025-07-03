import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { RefreshTokenType } from './entities/refresh-token.entity';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserConfigService } from '../user/user-config.service';
import { randomBytes } from 'crypto';
import { User } from '../user/entities/user.entity';
import { sendEmailVerificationDto } from './dto/send-email-verification.dto';
import { RedisService } from 'src/cache';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly redisService: RedisService,
    private readonly userService: UserService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly jwtService: JwtService,
    private readonly userConfigService: UserConfigService,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async register(createUserDto: RegisterAuthDto) {
    const { email, token, ...rest } = createUserDto;
    const tokenKey = `email_verification:${email}`;
    // Lấy token từ Redis
    const data = await this.redisService.getCache(tokenKey);
    if (!data) {
      throw new BadRequestException(
        'Bạn cần xác thực email trước khi đăng ký!',
      );
    }
    let parsed: any;
    try {
      parsed = JSON.parse(data);
    } catch {
      throw new BadRequestException('Token không hợp lệ!');
    }
    if (!parsed.token || parsed.token !== token) {
      throw new BadRequestException(
        'Token xác thực email không đúng hoặc đã hết hạn!',
      );
    }
    // Xóa token khỏi Redis sau khi dùng
    await this.redisService.del(tokenKey);
    // Đăng ký user, set isVerified=true
    const user = await this.userService.create({
      email,
      ...rest,
      isVerified: true,
    });
    return user;
  }

  async login(
    loginDto: LoginAuthDto,
    device?: string,
    ip?: string,
    userAgent?: string,
  ) {
    const user = (await this.userService.findByEmail(
      loginDto.email,
      true,
    )) as User | null;
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    });
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    const expiredAt = new Date(
      Date.now() +
        this.parseExpiresIn(process.env.JWT_REFRESH_EXPIRES_IN || '7d'),
    );
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
    const user = (await this.userService.findOne(userId, true)) as User;
    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }
    const tokens = await this.refreshTokenRepository.findByUser(
      userId,
      RefreshTokenType.LOCAL,
    );
    let found = false;
    for (const tokenEntity of tokens) {
      const match = await bcrypt.compare(refreshToken, tokenEntity.token);
      if (
        match &&
        (!tokenEntity.expiredAt || tokenEntity.expiredAt > new Date()) &&
        !tokenEntity.revokedAt
      ) {
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
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    return { accessToken };
  }

  async revokeAllRefreshTokensForUser(userId: number) {
    return this.refreshTokenRepository.revokeAllForUser(
      userId,
      RefreshTokenType.LOCAL,
    );
  }

  async oauthLogin(oauthUser: any) {
    if (!oauthUser.email) {
      throw new UnauthorizedException('No email from OAuth provider');
    }
    let user = (await this.userService.findByEmail(
      oauthUser.email,
      true,
    )) as User;
    if (!user) {
      user = (await this.userService.create({
        email: oauthUser.email,
        name: oauthUser.name,
        password: '',
      })) as User;
    }
    if (!user) {
      throw new UnauthorizedException('Cannot create user from OAuth');
    }
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    });
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    const expiredAt = new Date(
      Date.now() +
        this.parseExpiresIn(process.env.JWT_REFRESH_EXPIRES_IN || '7d'),
    );
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
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000;
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

    // Gửi email chứa link reset password
    const frontendUrl = this.configService.get('FRONTEND_URL');
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Đặt lại mật khẩu - Hari News',
      template: 'reset-password',
      context: {
        resetUrl,
        year: new Date().getFullYear(),
      },
    });

    return {};
  }

  // Đặt lại mật khẩu bằng token
  async resetPassword({ token, newPassword }: ResetPasswordDto) {
    const config = await this.userConfigService.findByResetToken(token);
    if (
      !config ||
      !config.passwordResetExpiresAt ||
      config.passwordResetExpiresAt < new Date()
    ) {
      throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
    }
    await this.userService.update(config.userId, { password: newPassword });
    await this.userConfigService.updateUserConfig(config.userId, {
      passwordResetToken: undefined,
      passwordResetExpiresAt: undefined,
    });
    return {};
  }

  // Gửi email xác thực
  async sendEmailVerification({ email }: sendEmailVerificationDto) {
    // Kiểm tra email đã tồn tại chưa
    const existed = await this.userService.findByEmail(email);
    if (existed) {
      throw new BadRequestException('Email đã tồn tại trong hệ thống!');
    }
    const tokenKey = `email_verification:${email}`;
    const cooldownKey = `email_verification_cooldown:${email}`;
    // Nếu đang cooldown thì báo lỗi
    const isCooldown = await this.redisService.getCache(cooldownKey);
    if (isCooldown) {
      const ttl = await this.redisService.ttl(cooldownKey);
      throw new BadRequestException({
        message:
          'Bạn vừa yêu cầu xác thực, vui lòng chờ 1 phút trước khi gửi lại!',
        retryAfter: ttl,
      });
    }
    // Tạo token mới, lưu vào Redis 10 phút
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    await this.redisService.setCache(tokenKey, JSON.stringify({ token }), 600); // TTL 10 phút
    await this.redisService.setCache(cooldownKey, '1', 60); // TTL 1 phút
    const frontendUrl = this.configService.get('FRONTEND_URL');
    const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Xác thực email tài khoản',
      template: 'email-verification',
      context: {
        verifyUrl,
        year: new Date().getFullYear(),
      },
    });
    return {};
  }

  // Đổi mật khẩu khi đã đăng nhập
  async changePassword(
    userId: number,
    { oldPassword, newPassword }: ChangePasswordDto,
  ) {
    const user = (await this.userService.findOne(userId, true)) as User;
    if (!user || !user.password) {
      throw new UnauthorizedException('User not found');
    }
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Old password is incorrect');
    }
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await this.userService.update(userId, { password: hashedNewPassword });
    // Revoke all refresh tokens for security
    await this.revokeAllRefreshTokensForUser(userId);
    return {};
  }

  async getCurrentUser(userId: number) {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    // User đã được loại bỏ password từ userService.findOne
    return { user };
  }
}
