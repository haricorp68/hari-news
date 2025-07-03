import { Module } from '@nestjs/common';
import { CommunityService } from './community.service';
import { CommunityController } from './community.controller';
import { CommunityRoleRepository } from './repositories/community_role.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Community } from './entities/community.entity';
import { CommunityRepository } from './repositories/community.repository';
import { CommunityRoleService } from './community-role.service';
import { CommunityMemberService } from './community-member.service';
import { CommunityMemberRepository } from './repositories/community_member.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Community])],
  controllers: [CommunityController],
  providers: [
    CommunityService,
    CommunityRoleService,
    CommunityRoleRepository,
    CommunityRepository,
    CommunityMemberService,
    CommunityMemberRepository,
  ],
  exports: [
    CommunityService,
    CommunityRoleService,
    CommunityRoleRepository,
    CommunityMemberService,
    CommunityMemberRepository,
  ],
})
export class CommunityModule {}
