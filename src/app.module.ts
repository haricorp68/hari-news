import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import { RefreshToken } from './auth/entities/refresh-token.entity';
import { CommunityModule } from './community/community.module';
import { CompanyModule } from './company/company.module';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { ReactionModule } from './reaction/reaction.module';
import { ShareModule } from './share/share.module';
import { PolicyModule } from './policy/policy.module';
import { Policy } from './policy/entities/policy.entity';
import { Company } from './company/entities/company.entity';
import { CompanyStaff } from './company/entities/company_staff.entity';
import { Community } from './community/entities/community.entity';
import { CommunityMember } from './community/entities/community_member.entity';
import { CommunityRole } from './community/entities/community_role.entity';
import { UserPost } from './post/entities/user_post.entity';
import { CommunityPost } from './post/entities/community_post.entity';
import { CompanyPost } from './post/entities/company_post.entity';
import { PersonalPostDetail } from './post/entities/personal_post_detail.entity';
import { NewsPostDetail } from './post/entities/news_post_detail.entity';
import { NewsPostBlock } from './post/entities/news_post_block.entity';
import { PostMedia } from './post/entities/post_media.entity';
import { Comment } from './comment/entities/comment.entity';
import { Reaction } from './reaction/entities/reaction.entity';
import { Share } from './share/entities/share.entity';
import { UserConfig } from './user/entities/user-config.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
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
        UserPost,
        CommunityPost,
        CompanyPost,
        PersonalPostDetail,
        NewsPostDetail,
        NewsPostBlock,
        PostMedia,
        Comment,
        Reaction,
        Share,
        UserConfig,
      ],
      synchronize: true,
    }),
    AuthModule,
    UserModule,
    CommunityModule,
    CompanyModule,
    PostModule,
    CommentModule,
    ReactionModule,
    ShareModule,
    PolicyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
