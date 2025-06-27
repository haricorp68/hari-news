import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CommunityRole } from '../entities/community_role.entity';
import { Community } from '../entities/community.entity';

@Injectable()
export class CommunityRoleRepository extends Repository<CommunityRole> {
  constructor(private dataSource: DataSource) {
    super(CommunityRole, dataSource.createEntityManager());
  }
  async createDefaultRolesForCommunity(community: Community) {
    const defaultRoles = [
      { name: 'admin', description: 'Quản trị viên', is_owner: true },
      { name: 'quản lý', description: 'Quản lý cộng đồng', is_owner: false },
      {
        name: 'thành viên',
        description: 'Thành viên cộng đồng',
        is_owner: false,
      },
    ];
    const roles = defaultRoles.map((role) =>
      this.create({ ...role, community }),
    );
    return this.save(roles);
  }
}
