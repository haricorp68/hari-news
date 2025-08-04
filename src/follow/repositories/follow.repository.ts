import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Follow } from '../entities/follow.entity';

@Injectable()
export class FollowRepository extends Repository<Follow> {
  constructor(private dataSource: DataSource) {
    super(Follow, dataSource.createEntityManager());
  }

  async findByUsers(followerId: string, followingId: string) {
    return this.findOne({
      where: { followerId, followingId },
      relations: ['follower', 'following'],
    });
  }

  async findFollowersWithCount(
    userId: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<[Follow[], number]> {
    return this.findAndCount({
      where: { followingId: userId },
      relations: ['follower'],
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { created_at: 'DESC' },
    });
  }

  async findFollowingWithCount(
    userId: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<[Follow[], number]> {
    return this.findAndCount({
      where: { followerId: userId },
      relations: ['following'],
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { created_at: 'DESC' },
    });
  }

  async countFollowers(userId: string) {
    return this.count({ where: { followingId: userId } });
  }

  async countFollowing(userId: string) {
    return this.count({ where: { followerId: userId } });
  }

  async createFollow(followerId: string, followingId: string) {
    const follow = this.create({
      followerId,
      followingId,
    });
    return this.save(follow);
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
}
