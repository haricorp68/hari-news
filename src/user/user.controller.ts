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

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @CurrentUser() user,

    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updated = await this.userService.update(user.userId, updateUserDto);
    return {
      message: 'Cập nhật profile thành công!',
      ...updated,
    };
  }

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
    const userProfile = await this.userService.findOne(
      user.userId || user.id,
      false,
    );
    return {
      user: userProfile,
      message: 'Lấy thông tin profile thành công!',
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id, false);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @CheckAbility('update', 'user')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @CheckAbility('delete', 'user')
  async remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  // --- CRUD for self user config ---
  @Get('config/self')
  @UseGuards(JwtAuthGuard)
  async getSelfConfig(@CurrentUser() user) {
    const config = await this.userConfigService.getUserConfig(
      user.userId || user.id,
    );
    return {
      message: 'Lấy config của bạn thành công!',
      ...config,
    };
  }

  @Post('config/self')
  @UseGuards(JwtAuthGuard)
  async createSelfConfig(@CurrentUser() user) {
    const config = await this.userConfigService.createUserConfig(
      user.userId || user.id,
    );
    return {
      config,
      message: 'Tạo config của bạn thành công!',
    };
  }

  @Patch('config/self')
  @UseGuards(JwtAuthGuard)
  async updateSelfConfig(@CurrentUser() user, @Body() configData: any) {
    const config = await this.userConfigService.updateUserConfig(
      user.userId || user.id,
      configData,
    );
    return {
      config,
      message: 'Cập nhật config của bạn thành công!',
    };
  }

  @Delete('config/self')
  @UseGuards(JwtAuthGuard)
  async deleteSelfConfig(@CurrentUser() user) {
    const result = await this.userConfigService.deleteUserConfig(
      user.userId || user.id,
    );
    return {
      success: result,
      message: result
        ? 'Xóa config của bạn thành công!'
        : 'Không tìm thấy config để xóa!',
    };
  }

  // --- CRUD for user config (admin or user with permission) ---
  @Get('config/:id')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @CheckAbility('read', 'userConfig')
  async getUserConfig(@Param('id') id: string) {
    const config = await this.userConfigService.getUserConfig(id);
    return {
      data: config,
      message: 'Lấy config user thành công!',
    };
  }

  @Post('config/:id')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @CheckAbility('create', 'userConfig')
  async createUserConfig(@Param('id') id: string) {
    const config = await this.userConfigService.createUserConfig(id);
    return {
      data: config,
      message: 'Tạo config user thành công!',
    };
  }

  @Patch('config/:id')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @CheckAbility('update', 'userConfig')
  async updateUserConfig(@Param('id') id: string, @Body() configData: any) {
    const config = await this.userConfigService.updateUserConfig(
      id,
      configData,
    );
    return {
      data: config,
      message: 'Cập nhật config user thành công!',
    };
  }

  @Delete('config/:id')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @CheckAbility('delete', 'userConfig')
  async deleteUserConfig(@Param('id') id: string) {
    const result = await this.userConfigService.deleteUserConfig(id);
    return {
      success: result,
      message: result
        ? 'Xóa config user thành công!'
        : 'Không tìm thấy config để xóa!',
    };
  }
}
