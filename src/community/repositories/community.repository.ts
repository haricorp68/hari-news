import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Community } from '../entities/community.entity';

@Injectable()
export class CommunityRepository extends Repository<Community> {
  constructor(private dataSource: DataSource) {
    super(Community, dataSource.createEntityManager());
  }
  // Bạn có thể thêm các method custom ở đây
} 