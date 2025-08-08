import { ExecutionContext, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommunityModule } from './community/community.module';
import { CompanyModule } from './company/company.module';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { ReactionModule } from './reaction/reaction.module';
import { ShareModule } from './share/share.module';
import { PolicyModule } from './policy/policy.module';
import { RedisModule } from './cache/redis.module';
import {
  hours,
  minutes,
  seconds,
  ThrottlerGuard,
  ThrottlerModule,
} from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { FollowModule } from './follow/follow.module';
import { CategoryModule } from './category/category.module';
import { ElasticModule } from './elastic/elastic.module';
import { AppDataSource } from './data-source';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          { name: 'short', limit: 2000, ttl: seconds(1) },
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
    TypeOrmModule.forRoot(AppDataSource.options),
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
