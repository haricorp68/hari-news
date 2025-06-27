import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CommunityMember } from '../entities/community_member.entity';

@Injectable()
export class CommunityMemberRepository extends Repository<CommunityMember> {
  constructor(private dataSource: DataSource) {
    super(CommunityMember, dataSource.createEntityManager());
  }
  // Thêm các method custom nếu cần
} 