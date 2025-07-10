import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { PostBlock } from '../entities/post_block.entity';

@Injectable()
export class PostBlockRepository extends Repository<PostBlock> {
  constructor(private dataSource: DataSource) {
    super(PostBlock, dataSource.createEntityManager());
  }
} 