import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserConfigService } from './user-config.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CaslAbilityGuard } from '../common/guards/casl-ability.guard';
import { CheckAbility } from '../common/decorators/check-ability.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('user-config')
export class UserConfigController {
  constructor(private readonly userConfigService: UserConfigService) {}

  @Get()
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @CheckAbility('read', 'user')
  async getAllUserConfigs(@CurrentUser() user) {
    const configs = await this.userConfigService.getAllUserConfigs();
    return {
      data: configs,
      message: 'Lấy danh sách user config thành công!',
    };
  }

  @Get(':userId')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @CheckAbility('read', 'user')
  async getUserConfig(@CurrentUser() user, @Param('userId') userId: string) {
    const config = await this.userConfigService.getUserConfig(+userId);
    return {
      data: config,
      message: 'Lấy cấu hình user thành công!',
    };
  }

  @Post(':userId')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @CheckAbility('create', 'user')
  async createUserConfig(@CurrentUser() user, @Param('userId') userId: string) {
    const config = await this.userConfigService.createUserConfig(+userId);
    return {
      data: config,
      message: 'Tạo cấu hình user thành công!',
    };
  }

  @Patch(':userId')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @CheckAbility('update', 'user')
  async updateUserConfig(
    @CurrentUser() user,
    @Param('userId') userId: string,
    @Body() configData: any,
  ) {
    const config = await this.userConfigService.updateUserConfig(+userId, configData);
    return {
      data: config,
      message: 'Cập nhật cấu hình user thành công!',
    };
  }

  @Patch(':userId/preferences')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @CheckAbility('update', 'user')
  async updatePreferences(
    @CurrentUser() user,
    @Param('userId') userId: string,
    @Body() preferences: any,
  ) {
    const config = await this.userConfigService.updatePreferences(+userId, preferences);
    return {
      data: config,
      message: 'Cập nhật preferences thành công!',
    };
  }

  @Patch(':userId/social-links')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @CheckAbility('update', 'user')
  async updateSocialLinks(
    @CurrentUser() user,
    @Param('userId') userId: string,
    @Body() socialLinks: any,
  ) {
    const config = await this.userConfigService.updateSocialLinks(+userId, socialLinks);
    return {
      data: config,
      message: 'Cập nhật social links thành công!',
    };
  }

  @Post(':userId/2fa/enable')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @CheckAbility('update', 'user')
  async enableTwoFactor(
    @CurrentUser() user,
    @Param('userId') userId: string,
    @Body() body: { secret: string },
  ) {
    const config = await this.userConfigService.enableTwoFactor(+userId, body.secret);
    return {
      data: config,
      message: 'Bật 2FA thành công!',
    };
  }

  @Post(':userId/2fa/disable')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @CheckAbility('update', 'user')
  async disableTwoFactor(@CurrentUser() user, @Param('userId') userId: string) {
    const config = await this.userConfigService.disableTwoFactor(+userId);
    return {
      data: config,
      message: 'Tắt 2FA thành công!',
    };
  }

  @Delete(':userId')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @CheckAbility('delete', 'user')
  async deleteUserConfig(@CurrentUser() user, @Param('userId') userId: string) {
    const deleted = await this.userConfigService.deleteUserConfig(+userId);
    return {
      data: { deleted },
      message: deleted ? 'Xóa cấu hình user thành công!' : 'Không tìm thấy cấu hình user!',
    };
  }
} 