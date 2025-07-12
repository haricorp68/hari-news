import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { Follow } from './entities/follow.entity';
import { CreateFollowDto } from './dto/create-follow.dto';
import { UpdateFollowDto } from './dto/update-follow.dto';
import { FollowResponseDto } from './dto/follow-response.dto';
import { FollowStatsDto } from './dto/follow-stats.dto';
import { FollowRepository } from './repositories/follow.repository';

@Injectable()
export class FollowService {
  constructor(
    private followRepository: FollowRepository,
  ) {}

  async createFollow(followerId: string, createFollowDto: CreateFollowDto): Promise<FollowResponseDto> {
    const { followingId } = createFollowDto;

    // Kiểm tra không follow chính mình
    if (followerId === followingId) {
      throw new BadRequestException('Cannot follow yourself');
    }

    // Kiểm tra đã follow chưa
    const existingFollow = await this.followRepository.findByUsers(followerId, followingId);

    if (existingFollow) {
      throw new ConflictException('Already following this user');
    }

    const savedFollow = await this.followRepository.createFollow(followerId, followingId);
    return this.mapToResponseDto(savedFollow);
  }

  async getFollowById(id: string): Promise<FollowResponseDto> {
    const follow = await this.followRepository.findWithRelations(id, ['follower', 'following']);

    if (!follow) {
      throw new NotFoundException('Follow not found');
    }

    return this.mapToResponseDto(follow);
  }

  async getFollowByUsers(followerId: string, followingId: string): Promise<FollowResponseDto | null> {
    const follow = await this.followRepository.findByUsers(followerId, followingId);

    return follow ? this.mapToResponseDto(follow) : null;
  }

  async updateFollow(id: string, updateFollowDto: UpdateFollowDto): Promise<FollowResponseDto> {
    const follow = await this.followRepository.findWithRelations(id, ['follower', 'following']);

    if (!follow) {
      throw new NotFoundException('Follow not found');
    }

    if (updateFollowDto.isMuted !== undefined) {
      await this.followRepository.updateMuteStatus(id, updateFollowDto.isMuted);
    }





    const updatedFollow = await this.followRepository.findWithRelations(id, ['follower', 'following']);
    if (!updatedFollow) {
      throw new NotFoundException('Follow not found after update');
    }
    return this.mapToResponseDto(updatedFollow);
  }

  async deleteFollow(id: string): Promise<void> {
    const follow = await this.followRepository.findById(id);

    if (!follow) {
      throw new NotFoundException('Follow not found');
    }

    await this.followRepository.remove(follow);
  }

  async unfollow(followerId: string, followingId: string): Promise<void> {
    const result = await this.followRepository.deleteFollow(followerId, followingId);

    if (!result) {
      throw new NotFoundException('Follow relationship not found');
    }
  }

  async getFollowers(userId: string, page: number = 1, limit: number = 20): Promise<FollowResponseDto[]> {
    const follows = await this.followRepository.findFollowers(userId, page, limit);

    return follows.map(follow => this.mapToResponseDto(follow));
  }

  async getFollowing(userId: string, page: number = 1, limit: number = 20): Promise<FollowResponseDto[]> {
    const follows = await this.followRepository.findFollowing(userId, page, limit);

    return follows.map(follow => this.mapToResponseDto(follow));
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

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    return this.followRepository.isFollowing(followerId, followingId);
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
      follower: follow.follower ? {
        id: follow.follower.id,
        name: follow.follower.name,
        email: follow.follower.email,
        avatar: follow.follower.avatar,
        bio: follow.follower.bio,
      } : undefined,
      following: follow.following ? {
        id: follow.following.id,
        name: follow.following.name,
        email: follow.following.email,
        avatar: follow.following.avatar,
        bio: follow.following.bio,
      } : undefined,
    };
  }
} 