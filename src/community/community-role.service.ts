import { Injectable } from '@nestjs/common';
import { CommunityRoleRepository } from './repositories/community_role.repository';
import { CreateCommunityRoleDto } from './dto/create-community-role.dto';
import { UpdateCommunityRoleDto } from './dto/update-community-role.dto';
import { PolicyService } from 'src/policy/policy.service';

@Injectable()
export class CommunityRoleService {
  constructor(
    private readonly communityRoleRepository: CommunityRoleRepository,
    private readonly policyService: PolicyService,
  ) {}

  async create(dto: CreateCommunityRoleDto, community: any) {
    const role = this.communityRoleRepository.create({
      name: dto.name,
      description: dto.description,
      community: community,
    });
    return this.communityRoleRepository.save(role);
  }

  async findAll(communityId: string) {
    return this.communityRoleRepository.find({
      where: { community: { id: communityId } },
      relations: ['community'],
    });
  }

  async findOne(id: string) {
    return this.communityRoleRepository.findOne({
      where: { id },
      relations: ['community'],
    });
  }

  async update(id: string, dto: UpdateCommunityRoleDto) {
    const role = await this.communityRoleRepository.findOne({ where: { id } });
    if (!role) throw new Error('Role not found');
    Object.assign(role, dto);
    return this.communityRoleRepository.save(role);
  }

  async remove(id: string) {
    const result = await this.communityRoleRepository.delete(id);
    return { deleted: (result.affected || 0) > 0 };
  }

  async createDefaultRolesForCommunity(community: any) {
    const defaultRoles = [
      { name: 'owner', description: 'Chủ sở hữu cộng đồng', is_owner: true },
      { name: 'member', description: 'Thành viên cộng đồng', is_owner: false },
      { name: 'moderator', description: 'Quản lý cộng đồng', is_owner: false },
    ];
    const roles = defaultRoles.map((role) =>
      this.communityRoleRepository.create({ ...role, community }),
    );
    const savedRoles = await this.communityRoleRepository.save(roles);

    // Tạo policy mặc định cho từng role
    for (const role of savedRoles) {
      if (role.is_owner) {
        await this.policyService.createPolicy({
          subjectType: 'role',
          subjectId: String(role.id),
          action: 'manage',
          resource: `community:${community.id}`,
          condition: {},
          description: 'Owner có toàn quyền trong cộng đồng',
        });
      } else if (role.name === 'moderator') {
        await this.policyService.createPolicy({
          subjectType: 'role',
          subjectId: String(role.id),
          action: 'moderate',
          resource: `community:${community.id}`,
          condition: {},
          description: 'Moderator quản lý cộng đồng',
        });
      } else if (role.name === 'member') {
        await this.policyService.createPolicy({
          subjectType: 'role',
          subjectId: String(role.id),
          action: 'view',
          resource: `community:${community.id}`,
          condition: {},
          description: 'Member chỉ được xem trong cộng đồng',
        });
      }
    }
    return savedRoles;
  }
}
