import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { CompanyFeedPost } from '../entities/company_feed_post.entity';

@Injectable()
export class CompanyFeedPostRepository extends Repository<CompanyFeedPost> {
  constructor(private dataSource: DataSource) {
    super(CompanyFeedPost, dataSource.createEntityManager());
  }
} 