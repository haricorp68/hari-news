import { Module } from '@nestjs/common';
import { CommunityService } from './community.service';
import { CommunityController } from './community.controller';
import { CommunityRoleRepository } from './repositories/community_role.repository';

@Module({
  controllers: [CommunityController],
  providers: [CommunityService, CommunityRoleRepository],
})
export class CommunityModule {}
