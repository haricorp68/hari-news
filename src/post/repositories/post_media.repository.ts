import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { PostMedia } from '../entities/post_media.entity';

@Injectable()
export class PostMediaRepository extends Repository<PostMedia> {
  constructor(private dataSource: DataSource) {
    super(PostMedia, dataSource.createEntityManager());
  }
} 