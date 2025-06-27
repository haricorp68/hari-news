import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Policy } from '../entities/policy.entity';

@Injectable()
export class PolicyRepository extends Repository<Policy> {
  constructor(private dataSource: DataSource) {
    super(Policy, dataSource.createEntityManager());
  }
  // Thêm các method custom nếu cần
} 