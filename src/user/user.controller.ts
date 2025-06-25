import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ForbiddenException,
  UseGuards,
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
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @CheckAbility('read', 'user')
  async findOne(@CurrentUser() user, @Param('id') id: string) {
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

  @Delete(':id')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @CheckAbility('delete', 'user')
  async remove(@CurrentUser() user, @Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
