import { Injectable } from '@nestjs/common';
import { DataSource, Repository, In } from 'typeorm';
import { Reaction } from '../entities/reaction.entity';

@Injectable()
export class ReactionRepository extends Repository<Reaction> {
  constructor(private dataSource: DataSource) {
    super(Reaction, dataSource.createEntityManager());
  }

  async getSummaryByPosts(postIds: string[], type?: string) {
    if (!postIds.length) return {};
    const where: any = { postId: In(postIds) };
    if (type) where.type = type;
    const reactions = await this.find({ where });
    const result: Record<string, Record<string, number>> = {};
    for (const r of reactions) {
      if (!result[r.postId]) result[r.postId] = {};
      result[r.postId][r.type] = (result[r.postId][r.type] || 0) + 1;
    }
    return result; // { postId: { like: 2, love: 1, ... }, ... }
  }

  async getUserReactionsForPosts(userId: string, postIds: string[]): Promise<Record<string, string>> {
    if (!postIds.length) return {};
    const reactions = await this.find({ where: { userId, postId: In(postIds) } });
    const result: Record<string, string> = {};
    for (const r of reactions) {
      result[r.postId] = r.type;
    }
    return result;
  }
}
