import { Injectable, BadRequestException } from '@nestjs/common';
import { Follow } from './entities/follow.entity';
import { FollowResponseDto } from './dto/follow-response.dto';
import { FollowStatsDto } from './dto/follow-stats.dto';
import { FollowRepository } from './repositories/follow.repository';

@Injectable()
export class FollowService {
  constructor(private followRepository: FollowRepository) {}

  async toggleFollow(
    followerId: string,
    followingId: string,
  ): Promise<{ message: string; isFollowing: boolean }> {
    // Kiểm tra không follow chính mình
    if (followerId === followingId) {
      throw new BadRequestException('Cannot follow yourself');
    }

    // Kiểm tra đã follow chưa
    const existingFollow = await this.followRepository.findByUsers(
      followerId,
      followingId,
    );

    if (existingFollow) {
      // Nếu đã follow thì unfollow
      await this.followRepository.deleteFollow(followerId, followingId);
      return {
        message: 'Unfollowed successfully',
        isFollowing: false,
      };
    } else {
      // Nếu chưa follow thì follow
      await this.followRepository.createFollow(followerId, followingId);
      return {
        message: 'Followed successfully',
        isFollowing: true,
      };
    }
  }

  async getFollowers(
    userId: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<{ data: FollowResponseDto[]; total: number; lastPage: number }> {
    const [follows, total] = await this.followRepository.findFollowersWithCount(
      userId,
      page,
      pageSize,
    );

    const data = follows.map((follow) => this.mapToResponseDto(follow));
    const lastPage = Math.ceil(total / pageSize);

    return { data, total, lastPage };
  }

  async getFollowing(
    userId: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<{ data: FollowResponseDto[]; total: number; lastPage: number }> {
    const [follows, total] = await this.followRepository.findFollowingWithCount(
      userId,
      page,
      pageSize,
    );

    const data = follows.map((follow) => this.mapToResponseDto(follow));
    const lastPage = Math.ceil(total / pageSize);

    return { data, total, lastPage };
  }

  async getFollowStats(userId: string): Promise<FollowStatsDto> {
    const [followersCount, followingCount] = await Promise.all([
      this.followRepository.countFollowers(userId),
      this.followRepository.countFollowing(userId),
    ]);

    return {
      followersCount,
      followingCount,
    };
  }

  private mapToResponseDto(follow: Follow): FollowResponseDto {
    return {
      id: follow.id,
      followerId: follow.followerId,
      followingId: follow.followingId,
      isMuted: follow.isMuted,
      mutedAt: follow.mutedAt,
      created_at: follow.created_at,
      updated_at: follow.updated_at,
      follower: follow.follower
        ? {
            id: follow.follower.id,
            name: follow.follower.name,
            email: follow.follower.email,
            avatar: follow.follower.avatar,
          }
        : undefined,
      following: follow.following
        ? {
            id: follow.following.id,
            name: follow.following.name,
            email: follow.following.email,
            avatar: follow.following.avatar,
          }
        : undefined,
    };
  }
  async checkFollowStatus(
    followerId: string,
    followingId: string,
  ): Promise<{ isFollowing: boolean; follow?: any }> {
    // Kiểm tra không check chính mình
    if (followerId === followingId) {
      return { isFollowing: false };
    }

    const existingFollow = await this.followRepository.findByUsers(
      followerId,
      followingId,
    );

    return {
      isFollowing: !!existingFollow,
      follow: existingFollow ? this.mapToResponseDto(existingFollow) : null,
    };
  }
}
