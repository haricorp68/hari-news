import { Injectable } from '@nestjs/common';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { CreateCommunityRoleDto } from './dto/create-community-role.dto';
import { UpdateCommunityRoleDto } from './dto/update-community-role.dto';
import { CommunityRepository } from './repositories/community.repository';
import { Like } from 'typeorm';
import { CommunityRoleService } from './community-role.service';
import { CommunityMemberService } from './community-member.service';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class CommunityService {
  constructor(
    private readonly communityRepository: CommunityRepository,
    private readonly communityRoleService: CommunityRoleService,
    private readonly communityMemberService: CommunityMemberService,
  ) {}

  async create(createCommunityDto: CreateCommunityDto & { creatorId: string }) {
    const community = this.communityRepository.create(createCommunityDto);
    const savedCommunity = await this.communityRepository.save(community);
    const roles =
      await this.communityRoleService.createDefaultRolesForCommunity(
        savedCommunity,
      );

    // Gán user tạo vào role owner
    const ownerRole = roles.find((r) => r.is_owner);
    if (ownerRole) {
      await this.communityMemberService.addMember(
        savedCommunity,
        { id: createCommunityDto.creatorId } as User,
        ownerRole,
      );
    }
    return savedCommunity;
  }

  async findAll(query: { page?: number; limit?: number; name?: string }) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.name) {
      where.name =
        typeof query.name === 'string' ? Like(`%${query.name}%`) : undefined;
    }

    const [data, total] = await this.communityRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { id: 'DESC' },
    });
    return {
      data,
      total,
      page,
      limit,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    return this.communityRepository.findOne({ where: { id } });
  }

  async update(id: string, updateCommunityDto: UpdateCommunityDto) {
    const community = await this.communityRepository.findOne({ where: { id } });
    if (!community) throw new Error('Community not found');
    Object.assign(community, updateCommunityDto);
    return this.communityRepository.save(community);
  }

  async remove(id: string) {
    const result = await this.communityRepository.delete(id);
    return { deleted: (result.affected || 0) > 0 };
  }

  async createCommunityRole(dto: CreateCommunityRoleDto) {
    const community = await this.communityRepository.findOne({
      where: { id: dto.communityId },
    });
    if (!community) {
      throw new Error('Community not found');
    }
    return this.communityRoleService.create(dto, community);
  }

  async findAllCommunityRoles(communityId: string) {
    return this.communityRoleService.findAll(communityId);
  }

  async findOneCommunityRole(id: string) {
    return this.communityRoleService.findOne(id);
  }

  async updateCommunityRole(id: string, dto: UpdateCommunityRoleDto) {
    return this.communityRoleService.update(id, dto);
  }

  async removeCommunityRole(id: string) {
    return this.communityRoleService.remove(id);
  }

  async paginate({
    page = 1,
    pageSize = 10,
    filters = {},
  }: {
    page?: number;
    pageSize?: number;
    filters?: any;
  }) {
    const skip = (page - 1) * pageSize;
    const where: any = {};
    if (filters.name) {
      where.name = Like(`%${filters.name}%`);
    }
    // Có thể bổ sung filter cho các trường khác ở đây
    const [data, total] = await this.communityRepository.findAndCount({
      where,
      skip,
      take: pageSize,
      order: { id: 'DESC' },
    });
    return {
      data,
      total,
      lastPage: Math.ceil(total / pageSize),
    };
  }
}
