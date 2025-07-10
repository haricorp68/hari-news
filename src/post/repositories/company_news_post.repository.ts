import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { CompanyNewsPost } from '../entities/company_news_post.entity';

@Injectable()
export class CompanyNewsPostRepository extends Repository<CompanyNewsPost> {
  constructor(private dataSource: DataSource) {
    super(CompanyNewsPost, dataSource.createEntityManager());
  }
} 