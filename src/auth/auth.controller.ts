import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UseGuards,
  Res,
  ForbiddenException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { sendEmailVerificationDto } from './dto/send-email-verification.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { ForbiddenError } from '@casl/ability';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: RegisterAuthDto) {
    const user = await this.authService.register(createUserDto);
    return { message: 'User registered successfully' };
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
    return { message: 'Login successful' };
  }

  @SkipThrottle({ short: true, medium: true, long: true })
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() user): Promise<{ message: string }> {
    const result = await this.authService.getCurrentUser(
      user.userId || user.id,
    );
    return { message: 'Lấy thông tin người dùng thành công', ...result };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user, @Res({ passthrough: true }) res: Response) {
    // Thu hồi refresh token
    await this.authService.revokeAllRefreshTokensForUser(
      user.userId || user.id,
    );
    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return { message: 'Logout successful' };
  }

  @Post('refresh-token')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
      throw new ForbiddenException('No refresh token found');
    }
    const result = await this.authService.refreshTokenByCookie(refreshToken);
    // Set lại accessToken mới vào cookie
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    return { message: 'Refresh token successful' };
  }

  // Google OAuth
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.oauthLogin(req.user);
    const html = `<html><body><script>
window.opener.postMessage(
  {
    type: 'oauth-success',
    accessToken: '${result.accessToken}',
    refreshToken: '${result.refreshToken}'
  },
  '*'
);
window.close();
</script></body></html>`;
    res.send(html);
  }

  // Facebook OAuth
  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuth() {}

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuthCallback(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.oauthLogin(req.user);
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
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    res.type('html').send(`
      <html>
        <head>
          <title>Đăng nhập thành công</title>
          <script>
            window.opener && window.opener.postMessage('oauth-success', '*');
            setTimeout(() => { window.close(); }, 1000);
          </script>
        </head>
      </html>
    `);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto);
    return { message: 'Đã gửi email đặt lại mật khẩu' };
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto);
    return { message: 'Đặt lại mật khẩu thành công!' };
  }

  @Post('send-email-verification')
  async sendEmailVerification(@Body() dto: sendEmailVerificationDto) {
    await this.authService.sendEmailVerification(dto);
    return { message: 'Đã gửi email xác thực' };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@CurrentUser() user, @Body() dto: ChangePasswordDto) {
    await this.authService.changePassword(user.userId || user.id, dto);
    return { message: 'Password changed successfully' };
  }

  @Post('set-cookie')
  async setCookie(
    @Body() body: { accessToken: string; refreshToken: string },

    @Res({ passthrough: true }) res: Response,
  ) {
    // res.cookie('accessToken', body.accessToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'lax', // hoặc 'none' nếu dùng HTTPS và cross-domain
    //   path: '/',
    // });
    // res.cookie('refreshToken', body.refreshToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'lax',
    //   path: '/',
    // });
    res.cookie('accessToken', body.accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'none', // hoặc 'none' nếu dùng HTTPS và cross-domain
      path: '/',
    });
    res.cookie('refreshToken', body.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'none',
      path: '/',
    });

    return { message: 'Set cookie thành công' };
  }

  @Post('check-exist')
  async checkExist(@Body() body: { email?: string; name?: string }) {
    const emailExists = body.email
      ? await this.authService.checkEmailExist(body.email)
      : false;
    const nameExists = body.name
      ? await this.authService.checkNameExist(body.name)
      : false;
    if (body.email && !body.name && emailExists) {
      return { emailExists, message: 'Mail đã tồn tại' };
    }
    if (body.name && !body.email && nameExists) {
      return { nameExists, message: 'Tên đã tồn tại' };
    }
    return { emailExists, nameExists };
  }
}
