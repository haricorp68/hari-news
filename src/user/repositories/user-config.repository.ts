import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserConfig } from '../entities/user-config.entity';

@Injectable()
export class UserConfigRepository extends Repository<UserConfig> {
  constructor(private dataSource: DataSource) {
    super(UserConfig, dataSource.createEntityManager());
  }
  // Thêm các method custom nếu cần
} 