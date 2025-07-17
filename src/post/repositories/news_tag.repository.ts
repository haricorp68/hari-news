import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { NewsTag } from '../entities/news_tag.entity';

@Injectable()
export class NewsTagRepository extends Repository<NewsTag> {
  constructor(private dataSource: DataSource) {
    super(NewsTag, dataSource.createEntityManager());
  }
} 