import { Module } from '@nestjs/common';
import { PostController } from './controllers/post.controller';
import { CommunityFeedPostRepository } from './repositories/community_feed_post.repository';
import { UserFeedPostRepository } from './repositories/user_feed_post.repository';
import { CompanyFeedPostRepository } from './repositories/company_feed_post.repository';
import { PostMediaRepository } from './repositories/post_media.repository';
import { ReactionService } from 'src/reaction/reaction.service';
import { ReactionModule } from 'src/reaction/reaction.module';
import { UserNewsPostRepository } from './repositories/user_news_post.repository';
import { PostBlockRepository } from './repositories/post_block.repository';
import { CompanyNewsPostRepository } from './repositories/company_news_post.repository';
import { CommunityNewsPostRepository } from './repositories/community_news_post.repository';
import { CommentService } from 'src/comment/comment.service';
import { CommentModule } from 'src/comment/comment.module';
import { PostService } from './services/post.service';
import { NewsTagService } from './services/news_tag.service';
import { NewsTagRepository } from './repositories/news_tag.repository';
import { NewsTagSearchService } from './services/news_tag-search.service';
import { NewsTagController } from './controllers/news_tag.controller';
import { ElasticModule } from 'src/elastic/elastic.module';
import { NewscrawlService } from './services/newscrawl.service';
import { NewscrawlController } from './controllers/newscrawl.controller';

@Module({
  controllers: [PostController, NewsTagController, NewscrawlController],
  providers: [
    PostService,
    ReactionService,
    CommunityFeedPostRepository,
    UserFeedPostRepository,
    CompanyFeedPostRepository,
    PostMediaRepository,
    UserNewsPostRepository,
    PostBlockRepository,
    CompanyNewsPostRepository,
    CommunityNewsPostRepository,
    CommentService,
    NewsTagService,
    NewsTagRepository,
    NewsTagSearchService,
    NewscrawlService,
  ],
  imports: [ReactionModule, CommentModule, ElasticModule],
  exports: [PostService],
})
export class PostModule {}
