import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { FollowService } from './follow.service';
import { FollowResponseDto } from './dto/follow-response.dto';
import { FollowStatsDto } from './dto/follow-stats.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('follows')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post('toggle/:followingId')
  @UseGuards(JwtAuthGuard)
  async toggleFollow(
    @CurrentUser() user,
    @Param('followingId') followingId: string,
  ): Promise<{ message: string; isFollowing: boolean }> {
    const userId = user.userId || user.id;
    const result = await this.followService.toggleFollow(userId, followingId);
    return result;
  }

  @Get('followers/:userId')
  @UseGuards(JwtAuthGuard)
  async getFollowers(
    @Param('userId') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
  ) {
    const { data, total, lastPage } = await this.followService.getFollowers(
      userId,
      page,
      pageSize,
    );
    return {
      data,
      message: 'Lấy danh sách followers thành công!',
      metadata: {
        page: Number(page),
        pageSize: Number(pageSize),
        total,
        totalPages: lastPage,
      },
    };
  }

  @Get('following/:userId')
  @UseGuards(JwtAuthGuard)
  async getFollowing(
    @Param('userId') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
  ) {
    const { data, total, lastPage } = await this.followService.getFollowing(
      userId,
      page,
      pageSize,
    );
    return {
      data,
      message: 'Lấy danh sách following thành công!',
      metadata: {
        page: Number(page),
        pageSize: Number(pageSize),
        total,
        totalPages: lastPage,
      },
    };
  }

  @Get('stats/:userId')
  @UseGuards(JwtAuthGuard)
  async getFollowStats(@Param('userId') userId: string) {
    const stats = await this.followService.getFollowStats(userId);
    return {
      message: 'Lấy thống kê follow thành công!',
      ...stats,
    };
  }

  @Get('check/:userId')
  @UseGuards(JwtAuthGuard)
  async checkFollowStatus(
    @CurrentUser() user,
    @Param('userId') userId: string,
  ) {
    const currentUserId = user.userId || user.id;
    const result = await this.followService.checkFollowStatus(
      currentUserId,
      userId,
    );
    return {
      message: 'Lấy trạng thái follow thành công!',
      ...result,
    };
  }
}
