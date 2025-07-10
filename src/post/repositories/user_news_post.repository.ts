import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { UserNewsPost } from '../entities/user_news_post.entity';

@Injectable()
export class UserNewsPostRepository extends Repository<UserNewsPost> {
  constructor(private dataSource: DataSource) {
    super(UserNewsPost, dataSource.createEntityManager());
  }
} 