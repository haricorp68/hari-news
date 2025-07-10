import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { CommunityNewsPost } from '../entities/community_news_post.entity';

@Injectable()
export class CommunityNewsPostRepository extends Repository<CommunityNewsPost> {
  constructor(private dataSource: DataSource) {
    super(CommunityNewsPost, dataSource.createEntityManager());
  }
} 