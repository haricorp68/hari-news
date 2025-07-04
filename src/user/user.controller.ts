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

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
  async update(
    @CurrentUser() user,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(+id, updateUserDto);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@CurrentUser() user, @Body() updateUserDto: UpdateUserDto) {
    const updated = await this.userService.update(user.userId || user.id, updateUserDto);
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
}
