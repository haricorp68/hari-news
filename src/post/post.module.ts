import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { CommunityFeedPostRepository } from './repositories/community_feed_post.repository';
import { UserFeedPostRepository } from './repositories/user_feed_post.repository';
import { CompanyFeedPostRepository } from './repositories/company_feed_post.repository';
import { PostMediaRepository } from './repositories/post_media.repository';
import { ReactionService } from 'src/reaction/reaction.service';
import { ReactionModule } from 'src/reaction/reaction.module';
import { UserNewsPostRepository } from './repositories/user_news_post.repository';
import { CompanyNewsPostRepository } from './repositories/company_news_post.repository';
import { CommunityNewsPostRepository } from './repositories/community_news_post.repository';
import { CommentService } from 'src/comment/comment.service';
import { CommentModule } from 'src/comment/comment.module';

@Module({
  controllers: [PostController],
  providers: [
    PostService,
    ReactionService,
    CommunityFeedPostRepository,
    UserFeedPostRepository,
    CompanyFeedPostRepository,
    PostMediaRepository,
    UserNewsPostRepository,
    CompanyNewsPostRepository,
    CommunityNewsPostRepository,
    CommentService,
  ],
  imports: [ReactionModule, CommentModule],
})
export class PostModule {}
