import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CommunityRole } from '../entities/community_role.entity';

@Injectable()
export class CommunityRoleRepository extends Repository<CommunityRole> {
  constructor(private dataSource: DataSource) {
    super(CommunityRole, dataSource.createEntityManager());
  }
  // Bạn có thể thêm các method custom ở đây
} 