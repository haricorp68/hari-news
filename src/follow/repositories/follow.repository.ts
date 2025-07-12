import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Follow } from '../entities/follow.entity';

@Injectable()
export class FollowRepository extends Repository<Follow> {
  constructor(private dataSource: DataSource) {
    super(Follow, dataSource.createEntityManager());
  }

  async findById(id: string) {
    return this.findOne({ where: { id } });
  }

  async findByUsers(followerId: string, followingId: string) {
    return this.findOne({ 
      where: { followerId, followingId },
      relations: ['follower', 'following']
    });
  }

  async findFollowers(userId: string, page: number = 1, limit: number = 20) {
    return this.find({
      where: { followingId: userId },
      relations: ['follower'],
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });
  }

  async findFollowing(userId: string, page: number = 1, limit: number = 20) {
    return this.find({
      where: { followerId: userId },
      relations: ['following'],
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });
  }



  async countFollowers(userId: string) {
    return this.count({ where: { followingId: userId } });
  }

  async countFollowing(userId: string) {
    return this.count({ where: { followerId: userId } });
  }



  async isFollowing(followerId: string, followingId: string) {
    const follow = await this.findOne({
      where: { followerId, followingId },
    });
    return !!follow;
  }

  async createFollow(followerId: string, followingId: string) {
    const follow = this.create({
      followerId,
      followingId,
    });
    return this.save(follow);
  }



  async updateMuteStatus(id: string, isMuted: boolean) {
    const mutedAt = isMuted ? new Date() : undefined;
    await this.update(id, { isMuted, mutedAt });
    return this.findOne({ where: { id } });
  }

  async deleteFollow(followerId: string, followingId: string) {
    const follow = await this.findOne({
      where: { followerId, followingId },
    });
    if (follow) {
      return this.remove(follow);
    }
    return null;
  }

  async findWithRelations(id: string, relations: string[] = []) {
    return this.findOne({ where: { id }, relations });
  }

  async findMutedFollows(userId: string) {
    return this.find({
      where: { followerId: userId, isMuted: true },
      relations: ['following'],
    });
  }
} 