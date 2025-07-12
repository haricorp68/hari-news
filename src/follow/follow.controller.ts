import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { FollowService } from './follow.service';
import { CreateFollowDto } from './dto/create-follow.dto';
import { UpdateFollowDto } from './dto/update-follow.dto';
import { FollowResponseDto } from './dto/follow-response.dto';
import { FollowStatsDto } from './dto/follow-stats.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('follows')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createFollow(
    @CurrentUser() user,
    @Body() createFollowDto: CreateFollowDto,
  ): Promise<FollowResponseDto> {
    const userId = user.userId || user.id;
    return this.followService.createFollow(userId, createFollowDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getFollowById(@Param('id') id: string): Promise<FollowResponseDto> {
    return this.followService.getFollowById(id);
  }

  @Get('check/:followingId')
  @UseGuards(JwtAuthGuard)
  async checkFollowStatus(
    @CurrentUser() user,
    @Param('followingId') followingId: string,
  ): Promise<{ isFollowing: boolean; follow?: FollowResponseDto }> {
    const userId = user.userId || user.id;
    const isFollowing = await this.followService.isFollowing(
      userId,
      followingId,
    );
    let follow: FollowResponseDto | undefined = undefined;

    if (isFollowing) {
      const followData = await this.followService.getFollowByUsers(
        userId,
        followingId,
      );
      follow = followData || undefined;
    }

    return { isFollowing, follow };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateFollow(
    @Param('id') id: string,
    @Body() updateFollowDto: UpdateFollowDto,
  ): Promise<FollowResponseDto> {
    return this.followService.updateFollow(id, updateFollowDto);
  }

  @Delete(':id')
  async deleteFollow(@Param('id') id: string): Promise<{ message: string }> {
    await this.followService.deleteFollow(id);
    return { message: 'Follow deleted successfully' };
  }

  @Delete('unfollow/:followingId')
  @UseGuards(JwtAuthGuard)
  async unfollow(
    @CurrentUser() user,
    @Param('followingId') followingId: string,
  ): Promise<{ message: string }> {
    const userId = user.userId || user.id;
    await this.followService.unfollow(userId, followingId);
    return { message: 'Unfollowed successfully' };
  }

  @Get('followers/:userId')
  @UseGuards(JwtAuthGuard)
  async getFollowers(
    @Param('userId') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<FollowResponseDto[]> {
    return this.followService.getFollowers(userId, page, limit);
  }

  @Get('following/:userId')
  @UseGuards(JwtAuthGuard)
  async getFollowing(
    @Param('userId') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<FollowResponseDto[]> {
    return this.followService.getFollowing(userId, page, limit);
  }

  @Get('stats/:userId')
  @UseGuards(JwtAuthGuard)
  async getFollowStats(
    @Param('userId') userId: string,
  ): Promise<FollowStatsDto> {
    return this.followService.getFollowStats(userId);
  }

  @Get('my/followers')
  @UseGuards(JwtAuthGuard)
  async getMyFollowers(
    @CurrentUser() user,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<FollowResponseDto[]> {
    const userId = user.userId || user.id;
    return this.followService.getFollowers(userId, page, limit);
  }

  @Get('my/following')
  @UseGuards(JwtAuthGuard)
  async getMyFollowing(
    @CurrentUser() user,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<FollowResponseDto[]> {
    const userId = user.userId || user.id;
    return this.followService.getFollowing(userId, page, limit);
  }

  @Get('my/stats')
  @UseGuards(JwtAuthGuard)
  async getMyFollowStats(@CurrentUser() user): Promise<FollowStatsDto> {
    const userId = user.userId || user.id;
    return this.followService.getFollowStats(userId);
  }
}
