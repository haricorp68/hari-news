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
import { PolicyService } from './policy.service';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';
import { BlockUserDto } from './dto/block-user.dto';
import { BlockedUserResponseDto } from './dto/blocked-user-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Throttle } from '@nestjs/throttler';

@Controller('policy')
@UseGuards(JwtAuthGuard)
export class PolicyController {
  constructor(private readonly policyService: PolicyService) {}

  @Get()
  async findAll() {
    const data = await this.policyService.findAll();
    return { message: 'Lấy danh sách policy thành công!', data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.policyService.findOne(id);
    return { message: 'Lấy policy thành công!', data };
  }

  @Post()
  async create(@Body() body: CreatePolicyDto) {
    const data = await this.policyService.create(body);
    return { message: 'Tạo policy thành công!', data };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdatePolicyDto) {
    const data = await this.policyService.update(id, body);
    return { message: 'Cập nhật policy thành công!', data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.policyService.remove(id);
    return { message: 'Xóa policy thành công!', data: null };
  }

  // Block User Endpoints
  @Post('block')
  async blockUser(@Body() blockUserDto: BlockUserDto, @CurrentUser() user) {
    const userId = user.userId || user.id;
    const data = await this.policyService.blockUser(userId, blockUserDto);
    return { message: 'Block user thành công!', data };
  }

  @Delete('unblock/:blockedId')
  async unblockUser(@Param('blockedId') blockedId: string, @CurrentUser() user) {
    const userId = user.userId || user.id;
    await this.policyService.unblockUser(userId, blockedId);
    return { message: 'Unblock user thành công!' };
  }

  @Get('blocked-users')
  async getBlockedUsers(@CurrentUser() user) {
    const userId = user.userId || user.id;
    const data = await this.policyService.getBlockedUsers(userId);
    return { message: 'Lấy danh sách blocked users thành công!', data };
  }

  @Get('users-who-blocked-me')
  async getUsersWhoBlockedMe(@CurrentUser() user) {
    const userId = user.userId || user.id;
    const data = await this.policyService.getUsersWhoBlockedMe(userId);
    return { message: 'Lấy danh sách users đã block tôi thành công!', data };
  }

  @Get('check-block/:userId')
  async checkBlockStatus(@Param('userId') userId: string, @CurrentUser() user) {
    const currentUserId = user.userId || user.id;
    const isBlocked = await this.policyService.isUserBlocked(currentUserId, userId);
    return { 
      message: 'Kiểm tra block status thành công!', 
      data: { isBlocked, userId } 
    };
  }
}
