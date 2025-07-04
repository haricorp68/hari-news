import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CheckAbility } from '../common/decorators/check-ability.decorator';
import { CaslAbilityGuard } from '../common/guards/casl-ability.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserConfigService } from './user-config.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userConfigService: UserConfigService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @CheckAbility('create', 'user')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query() query: any,
  ) {
    const { page: _p, pageSize: _ps, ...filters } = query;
    const { data, total } = await this.userService.paginate({
      page,
      pageSize,
      filters,
    });
    return {
      data,
      message: 'Lấy danh sách user thành công!',
      metadata: {
        page: Number(page),
        pageSize: Number(pageSize),
        total,
        totalPages: Math.ceil(total / pageSize),
        filters,
      },
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user) {
    const userProfile = await this.userService.findOne(user.userId || user.id);
    return {
      user: userProfile,
      message: 'Lấy thông tin profile thành công!',
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @CheckAbility('update', 'user')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @CurrentUser() user,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updated = await this.userService.update(
      user.userId || user.id,
      updateUserDto,
    );
    return {
      data: updated,
      message: 'Cập nhật profile thành công!',
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @CheckAbility('delete', 'user')
  async remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @Get('config')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @CheckAbility('read', 'user')
  async getAllUserConfigs(@CurrentUser() user) {
    const configs = await this.userConfigService.getAllUserConfigs();
    return {
      data: configs,
      message: 'Lấy danh sách user config thành công!',
    };
  }

  @Get(':userId/config')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @CheckAbility('read', 'user')
  async getUserConfig(@Param('userId') userId: string) {
    const config = await this.userConfigService.getUserConfig(+userId);
    return {
      data: config,
      message: 'Lấy cấu hình user thành công!',
    };
  }

  @Post(':userId/config')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @CheckAbility('create', 'user')
  async createUserConfig(@Param('userId') userId: string) {
    const config = await this.userConfigService.createUserConfig(+userId);
    return {
      data: config,
      message: 'Tạo cấu hình user thành công!',
    };
  }

  @Patch(':userId/config')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @CheckAbility('update', 'user')
  async updateUserConfig(
    @Param('userId') userId: string,
    @Body() configData: any,
  ) {
    const config = await this.userConfigService.updateUserConfig(
      +userId,
      configData,
    );
    return {
      data: config,
      message: 'Cập nhật cấu hình user thành công!',
    };
  }

  @Patch(':userId/config/preferences')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @CheckAbility('update', 'user')
  async updatePreferences(
    @Param('userId') userId: string,
    @Body() preferences: any,
  ) {
    const config = await this.userConfigService.updatePreferences(
      +userId,
      preferences,
    );
    return {
      data: config,
      message: 'Cập nhật preferences thành công!',
    };
  }

  @Patch(':userId/config/social-links')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @CheckAbility('update', 'user')
  async updateSocialLinks(
    @Param('userId') userId: string,
    @Body() socialLinks: any,
  ) {
    const config = await this.userConfigService.updateSocialLinks(
      +userId,
      socialLinks,
    );
    return {
      data: config,
      message: 'Cập nhật social links thành công!',
    };
  }

  @Post(':userId/config/2fa/enable')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @CheckAbility('update', 'user')
  async enableTwoFactor(
    @Param('userId') userId: string,
    @Body() body: { secret: string },
  ) {
    const config = await this.userConfigService.enableTwoFactor(
      +userId,
      body.secret,
    );
    return {
      data: config,
      message: 'Bật 2FA thành công!',
    };
  }

  @Post(':userId/config/2fa/disable')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @CheckAbility('update', 'user')
  async disableTwoFactor(@Param('userId') userId: string) {
    const config = await this.userConfigService.disableTwoFactor(+userId);
    return {
      data: config,
      message: 'Tắt 2FA thành công!',
    };
  }

  @Delete(':userId/config')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @CheckAbility('delete', 'user')
  async deleteUserConfig(@Param('userId') userId: string) {
    const deleted = await this.userConfigService.deleteUserConfig(+userId);
    return {
      data: { deleted },
      message: deleted
        ? 'Xóa cấu hình user thành công!'
        : 'Không tìm thấy cấu hình user!',
    };
  }

  @Get('config/self')
  @UseGuards(JwtAuthGuard)
  async getMyConfig(@CurrentUser() user) {
    const config = await this.userConfigService.getUserConfig(
      user.userId || user.id,
    );
    return {
      message: 'Lấy cấu hình user thành công!',
      config,
    };
  }

  @Post('config/self')
  @UseGuards(JwtAuthGuard)
  async createMyConfig(@CurrentUser() user) {
    const config = await this.userConfigService.createUserConfig(
      user.userId || user.id,
    );
    return {
      message: 'Tạo cấu hình user thành công!',
      config,
    };
  }

  @Patch('config/self')
  @UseGuards(JwtAuthGuard)
  async updateMyConfig(@CurrentUser() user, @Body() configData: any) {
    const config = await this.userConfigService.updateUserConfig(
      user.userId || user.id,
      configData,
    );
    return {
      message: 'Cập nhật cấu hình user thành công!',
      config,
    };
  }

  @Delete('config/self')
  @UseGuards(JwtAuthGuard)
  async deleteMyConfig(@CurrentUser() user) {
    const deleted = await this.userConfigService.deleteUserConfig(
      user.userId || user.id,
    );
    return {
      data: { deleted },
      message: deleted
        ? 'Xóa cấu hình user thành công!'
        : 'Không tìm thấy cấu hình user!',
    };
  }
}
