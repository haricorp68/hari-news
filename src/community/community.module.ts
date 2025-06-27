import { Module } from '@nestjs/common';
import { CommunityService } from './community.service';
import { CommunityController } from './community.controller';
import { CommunityRoleRepository } from './repositories/community_role.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Community } from './entities/community.entity';
import { CommunityRepository } from './repositories/community.repository';
import { CommunityRoleService } from './community-role.service';
import { PolicyService } from 'src/policy/policy.service';
import { PolicyModule } from 'src/policy/policy.module';
import { CommunityMemberService } from './community-member.service';
import { CommunityMemberRepository } from './repositories/community_member.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Community]), PolicyModule],
  controllers: [CommunityController],
  providers: [
    CommunityService,
    CommunityRoleService,
    PolicyService,
    CommunityRoleRepository,
    CommunityRepository,
    CommunityMemberService,
    CommunityMemberRepository,
  ],
  exports: [CommunityService, CommunityRoleService, CommunityRoleRepository, CommunityMemberService, CommunityMemberRepository],
})
export class CommunityModule {}
