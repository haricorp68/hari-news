import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { CommunityFeedPost } from '../entities/community_feed_post.entity';

@Injectable()
export class CommunityFeedPostRepository extends Repository<CommunityFeedPost> {
  constructor(private dataSource: DataSource) {
    super(CommunityFeedPost, dataSource.createEntityManager());
  }
} 