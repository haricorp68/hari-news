import { Injectable } from '@nestjs/common';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CommunityRole } from './entities/community_role.entity';
import { Community } from './entities/community.entity';
import { Repository } from 'typeorm';
import { CreateCommunityRoleDto } from './dto/create-community-role.dto';
import { CommunityRoleRepository } from './repositories/community_role.repository';

@Injectable()
export class CommunityService {
  constructor(
    private readonly communityRoleRepository: CommunityRoleRepository,
  ) {}

  create(createCommunityDto: CreateCommunityDto) {
    return 'This action adds a new community';
  }

  findAll() {
    return `This action returns all community`;
  }

  findOne(id: number) {
    return `This action returns a #${id} community`;
  }

  update(id: number, updateCommunityDto: UpdateCommunityDto) {
    return `This action updates a #${id} community`;
  }

  remove(id: number) {
    return `This action removes a #${id} community`;
  }
}
