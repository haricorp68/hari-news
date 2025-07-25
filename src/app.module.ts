import { ExecutionContext, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RefreshToken } from './auth/entities/refresh-token.entity';
import { CommunityModule } from './community/community.module';
import { CompanyModule } from './company/company.module';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { ReactionModule } from './reaction/reaction.module';
import { ShareModule } from './share/share.module';
import { PolicyModule } from './policy/policy.module';
import { RedisModule } from './cache/redis.module';
import { Policy } from './policy/entities/policy.entity';
import { Company } from './company/entities/company.entity';
import { CompanyStaff } from './company/entities/company_staff.entity';
import { Community } from './community/entities/community.entity';
import { CommunityMember } from './community/entities/community_member.entity';
import { CommunityRole } from './community/entities/community_role.entity';
import { PostMedia } from './post/entities/post_media.entity';
import { Comment } from './comment/entities/comment.entity';
import { Reaction } from './reaction/entities/reaction.entity';
import { Share } from './share/entities/share.entity';
import { UserConfig } from './user/entities/user-config.entity';
import {
  hours,
  minutes,
  seconds,
  ThrottlerGuard,
  ThrottlerModule,
} from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { CommunityFeedPost } from './post/entities/community_feed_post.entity';
import { CommunityNewsPost } from './post/entities/community_news_post.entity';
import { CompanyFeedPost } from './post/entities/company_feed_post.entity';
import { CompanyNewsPost } from './post/entities/company_news_post.entity';
import { PostBlock } from './post/entities/post_block.entity';
import { UserFeedPost } from './post/entities/user_feed_post.entity';
import { UserNewsPost } from './post/entities/user_news_post.entity';
import { FollowModule } from './follow/follow.module';
import { Follow } from './follow/entities/follow.entity';
import { Category } from './category/entities/category.entity';
import { CategoryModule } from './category/category.module';
import { NewsTag } from './post/entities/news_tag.entity';
import { ElasticModule } from './elastic/elastic.module';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          { name: 'short', limit: 20, ttl: seconds(10) },
          { name: 'medium', limit: 2000, ttl: minutes(1) },
          { name: 'long', limit: 20000, ttl: hours(1) },
        ],
        errorMessage: 'Rate limiting actived!',
        storage: new ThrottlerStorageRedisService({
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
        }),
        getTracker: (req: Record<string, any>, context: ExecutionContext) => {
          return req.headers['x-tenant-id'];
        },
        generateKey: (
          context: ExecutionContext,
          trackerString: string,
          throttlerName: string,
        ) => {
          return `${throttlerName}:${trackerString}`;
        },
      }),
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'db',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'hari_news',
      entities: [
        User,
        RefreshToken,
        Policy,
        Company,
        CompanyStaff,
        Community,
        CommunityMember,
        CommunityRole,
        PostMedia,
        Comment,
        Reaction,
        Share,
        UserConfig,
        CommunityFeedPost,
        CommunityNewsPost,
        CompanyFeedPost,
        CompanyNewsPost,
        PostBlock,
        PostMedia,
        UserFeedPost,
        UserNewsPost,
        Follow,
        Category,
        NewsTag,
      ],
      synchronize: true,
    }),
    RedisModule,
    AuthModule,
    UserModule,
    CommunityModule,
    CompanyModule,
    PostModule,
    CommentModule,
    ReactionModule,
    ShareModule,
    PolicyModule,
    FollowModule,
    CategoryModule,
    ElasticModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
