import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { UserConfig } from './entities/user-config.entity';
import { UserConfigService } from './user-config.service';
import { UserConfigRepository } from './repositories/user-config.repository';
import { FollowModule } from '../follow/follow.module';
import { PostService } from 'src/post/services/post.service';
import { PostModule } from 'src/post/post.module';
import { UserFeedPostRepository } from 'src/post/repositories/user_feed_post.repository';
import { CommunityFeedPostRepository } from 'src/post/repositories/community_feed_post.repository';
import { CompanyFeedPostRepository } from 'src/post/repositories/company_feed_post.repository';
import { PostMediaRepository } from 'src/post/repositories/post_media.repository';
import { ReactionService } from 'src/reaction/reaction.service';
import { CommentService } from 'src/comment/comment.service';
import { UserNewsPostRepository } from 'src/post/repositories/user_news_post.repository';
import { PostBlockRepository } from 'src/post/repositories/post_block.repository';
import { NewsTagService } from 'src/post/services/news_tag.service';
import { ReactionRepository } from 'src/reaction/repositories/reaction.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserConfig]),
    FollowModule,
    PostModule,
  ],
  controllers: [UserController],
  providers: [
    UserService,
    UserConfigService,
    UserRepository,
    UserConfigRepository,
  ],
  exports: [
    UserService,
    UserConfigService,
    UserRepository,
    UserConfigRepository,
  ],
})
export class UserModule {}
