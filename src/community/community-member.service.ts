import { Injectable } from '@nestjs/common';
import { CommunityMemberRepository } from './repositories/community_member.repository';
import { CommunityMember } from './entities/community_member.entity';
import { Community } from './entities/community.entity';
import { User } from 'src/user/entities/user.entity';
import { CommunityRole } from './entities/community_role.entity';

@Injectable()
export class CommunityMemberService {
  constructor(private readonly communityMemberRepository: CommunityMemberRepository) {}

  async addMember(community: Community, user: User, role: CommunityRole) {
    const member = this.communityMemberRepository.create({
      community,
      user,
      role,
      is_active: true,
    });
    return this.communityMemberRepository.save(member);
  }

  async findAllByCommunity(communityId: number) {
    return this.communityMemberRepository.find({
      where: { community: { id: communityId } },
      relations: ['community', 'user', 'role'],
    });
  }

  async findAllByUser(userId: number) {
    return this.communityMemberRepository.find({
      where: { user: { id: userId } },
      relations: ['community', 'user', 'role'],
    });
  }

  async updateRole(memberId: number, role: CommunityRole) {
    const member = await this.communityMemberRepository.findOne({ where: { id: memberId } });
    if (!member) throw new Error('Member not found');
    member.role = role;
    return this.communityMemberRepository.save(member);
  }

  async remove(memberId: number) {
    const result = await this.communityMemberRepository.delete(memberId);
    return { deleted: (result.affected || 0) > 0 };
  }
} 