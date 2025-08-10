import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';
import { RefreshTokenType } from './entities/refresh-token.entity';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
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
import { UserResponseDto } from '../user/dto/user-response.dto';

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

    // Kiểm tra nếu người dùng không tồn tại
    if (!user) {
      throw new UnauthorizedException(
        'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.',
      );
    }

    // Kiểm tra nếu mật khẩu của người dùng không được đặt
    if (!user.password) {
      throw new UnauthorizedException(
        'Người dùng chưa có mật khẩu được thiết lập. Vui lòng liên hệ quản trị viên.',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    // Kiểm tra nếu mật khẩu không hợp lệ
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.',
      );
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

  async refreshToken(userId: string, refreshToken: string) {
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

  async revokeAllRefreshTokensForUser(userId: string) {
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

    // Lưu token vào Redis cache
    const cacheKey = `reset_password:${token}`;
    await this.redisService.setCache(
      cacheKey,
      JSON.stringify({ userId: user.id, expires: expires.toISOString() }),
      1800,
    ); // TTL 30 phút

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
    const cacheKey = `reset_password:${token}`;
    let userId: string | undefined = undefined;
    // Thử lấy từ cache trước
    const cached = await this.redisService.getCache(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        userId = parsed.userId;
        // Kiểm tra hạn sử dụng
        if (parsed.expires && new Date(parsed.expires) < new Date()) {
          throw new BadRequestException('Token đã hết hạn');
        }
      } catch {
        // Nếu lỗi parse, bỏ qua cache
      }
    }
    // Nếu không có trong cache, lấy từ DB
    if (!userId) {
      const config = await this.userConfigService.findByResetToken(token);
      if (
        !config ||
        !config.passwordResetExpiresAt ||
        config.passwordResetExpiresAt < new Date()
      ) {
        throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
      }
      userId = config.userId;
    }
    await this.userService.update(userId, { password: newPassword });
    await this.userConfigService.updateUserConfig(userId, {
      passwordResetToken: undefined,
      passwordResetExpiresAt: undefined,
    });
    // Xoá cache sau khi dùng
    await this.redisService.del(cacheKey);
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

    // Tạo token mới
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const otpDigits = token.split('');

    try {
      // Gửi email trước
      await this.mailerService.sendMail({
        to: email,
        subject: 'Xác thực email tài khoản',
        template: 'email-verification',
        context: {
          otpCode0: otpDigits[0],
          otpCode1: otpDigits[1],
          otpCode2: otpDigits[2],
          otpCode3: otpDigits[3],
          otpCode4: otpDigits[4],
          otpCode5: otpDigits[5],
          year: new Date().getFullYear(),
        },
      });

      // Chỉ lưu vào Redis khi gửi email thành công
      await this.redisService.setCache(
        tokenKey,
        JSON.stringify({ token }),
        600,
      ); // TTL 10 phút
      await this.redisService.setCache(cooldownKey, '1', 60); // TTL 1 phút

      return {};
    } catch (error) {
      // Log lỗi để debug
      console.error('Gửi email verification thất bại:', error);

      // Throw lại exception để client biết gửi email thất bại
      throw new BadRequestException(
        'Không thể gửi email xác thực. Vui lòng thử lại sau!',
      );
    }
  }

  // Đổi mật khẩu khi đã đăng nhập
  async changePassword(
    userId: string,
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

  async getCurrentUser(userId: string): Promise<UserResponseDto> {
    const user = await this.userService.findOne(userId, false);
    const userDto = this.userService.mapToUserResponseDto(user);
    if (!userDto) {
      throw new UnauthorizedException('User not found');
    }
    return userDto;
  }

  async refreshTokenByCookie(refreshToken: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET,
      });
    } catch (e) {
      throw new UnauthorizedException('Expired or invalid refresh token');
    }
    const userId = payload.sub;
    const user = await this.userService.findOne(userId, true);
    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }
    // Kiểm tra refreshToken có hợp lệ trong DB không
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
    // Cấp accessToken mới
    const newAccessToken = this.jwtService.sign(
      { sub: user.id, email: user.email, role: user.role },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
    );
    return { accessToken: newAccessToken };
  }

  async checkEmailExist(email: string) {
    const user = await this.userService.findByEmail(email);
    return !!user;
  }
  async checkNameExist(name: string) {
    const user = await this.userService.findByName(name);
    return !!user;
  }
}
