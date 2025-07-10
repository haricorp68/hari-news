import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { CommunityFeedPostRepository } from './repositories/community_feed_post.repository';
import { UserFeedPostRepository } from './repositories/user_feed_post.repository';
import { CompanyFeedPostRepository } from './repositories/company_feed_post.repository';
import { PostMediaRepository } from './repositories/post_media.repository';

@Module({
  controllers: [PostController],
  providers: [
    PostService,
    CommunityFeedPostRepository,
    UserFeedPostRepository,
    CompanyFeedPostRepository,
    PostMediaRepository,
  ],
})
export class PostModule {}
