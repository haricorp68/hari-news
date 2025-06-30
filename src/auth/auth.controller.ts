import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UseGuards,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginAuthDto } from './dto/create-auth.dto';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { sendEmailVerificationDto } from './dto/send-email-verification.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginAuthDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const device = (req.headers['x-device'] as string) || 'unknown';
    const ip = req.ip || req.socket?.remoteAddress || '';
    const userAgent = (req.headers['user-agent'] as string) || '';
    const result = await this.authService.login(
      loginDto,
      device,
      ip,
      userAgent,
    );
    // Set token vào httpOnly cookie
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày hoặc tuỳ config
      path: '/',
    });
    // Có thể trả về user info hoặc chỉ status
    return { message: 'Login successful' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() user) {
    return this.authService.getCurrentUser(user.userId || user.id);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Res({ passthrough: true }) res: Response) {
    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return { message: 'Logout successful' };
  }

  @Post('refresh-token')
  async refreshToken(@Body() body: { userId: number; refreshToken: string }) {
    return this.authService.refreshToken(body.userId, body.refreshToken);
  }

  // Google OAuth
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: Request) {
    // req.user chứa thông tin user từ GoogleStrategy
    return this.authService.oauthLogin(req.user);
  }

  // Facebook OAuth
  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuth() {}

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuthCallback(@Req() req: Request) {
    // req.user chứa thông tin user từ FacebookStrategy
    return this.authService.oauthLogin(req.user);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('send-email-verification')
  async sendEmailVerification(@Body() dto: sendEmailVerificationDto) {
    return this.authService.sendEmailVerification(dto);
  }

  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@CurrentUser() user, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(user.userId || user.id, dto);
  }
}
