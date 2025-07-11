import { Module } from '@nestjs/common';
import { ReactionService } from './reaction.service';
import { ReactionController } from './reaction.controller';
import { ReactionRepository } from './repositories/reaction.repository';
import { UserFeedPostRepository } from '../post/repositories/user_feed_post.repository';
import { CompanyFeedPostRepository } from '../post/repositories/company_feed_post.repository';
import { CommunityFeedPostRepository } from '../post/repositories/community_feed_post.repository';
import { UserNewsPostRepository } from '../post/repositories/user_news_post.repository';
import { CompanyNewsPostRepository } from '../post/repositories/company_news_post.repository';
import { CommunityNewsPostRepository } from '../post/repositories/community_news_post.repository';

@Module({
  controllers: [ReactionController],
  providers: [
    ReactionService,
    ReactionRepository,
    UserFeedPostRepository,
    CompanyFeedPostRepository,
    CommunityFeedPostRepository,
    UserNewsPostRepository,
    CompanyNewsPostRepository,
    CommunityNewsPostRepository,
  ],
  exports: [ReactionService, ReactionRepository],
})
export class ReactionModule {}
