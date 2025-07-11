import { Injectable } from '@nestjs/common';
import { DataSource, Repository, In } from 'typeorm';
import { Reaction } from '../entities/reaction.entity';

@Injectable()
export class ReactionRepository extends Repository<Reaction> {
  constructor(private dataSource: DataSource) {
    super(Reaction, dataSource.createEntityManager());
  }

  async getSummaryByPosts(postType: string, postIds: string[], type?: string) {
    if (!postIds.length) return {};
    const where: any = { postType, postId: In(postIds) };
    if (type) where.type = type;
    const reactions = await this.find({ where });
    const result: Record<string, Record<string, number>> = {};
    for (const r of reactions) {
      if (!result[r.postId]) result[r.postId] = {};
      result[r.postId][r.type] = (result[r.postId][r.type] || 0) + 1;
    }
    return result; // { postId: { like: 2, love: 1, ... }, ... }
  }
} 