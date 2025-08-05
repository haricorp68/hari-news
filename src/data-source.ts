import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Comment } from './comment/entities/comment.entity';
import { User } from './user/entities/user.entity';
import { RefreshToken } from './auth/entities/refresh-token.entity';
import { Policy } from './policy/entities/policy.entity';
import { Company } from './company/entities/company.entity';
import { CompanyStaff } from './company/entities/company_staff.entity';
import { Community } from './community/entities/community.entity';
import { CommunityMember } from './community/entities/community_member.entity';
import { CommunityRole } from './community/entities/community_role.entity';
import { PostMedia } from './post/entities/post_media.entity';
import { Reaction } from './reaction/entities/reaction.entity';
import { Share } from './share/entities/share.entity';
import { UserConfig } from './user/entities/user-config.entity';
import { CommunityFeedPost } from './post/entities/community_feed_post.entity';
import { CommunityNewsPost } from './post/entities/community_news_post.entity';
import { CompanyFeedPost } from './post/entities/company_feed_post.entity';
import { CompanyNewsPost } from './post/entities/company_news_post.entity';
import { PostBlock } from './post/entities/post_block.entity';
import { UserFeedPost } from './post/entities/user_feed_post.entity';
import { UserNewsPost } from './post/entities/user_news_post.entity';
import { Follow } from './follow/entities/follow.entity';
import { Category } from './category/entities/category.entity';
import { NewsTag } from './post/entities/news_tag.entity';

// Khởi tạo ConfigService
const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 5432),
  username: configService.get<string>('DB_USERNAME', 'postgres'),
  password: configService.get<string>('DB_PASSWORD', 'postgres'),
  database: configService.get<string>('DB_DATABASE', 'hari_news'),
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
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
    UserFeedPost,
    UserNewsPost,
    Follow,
    Category,
    NewsTag,
  ],
  synchronize: false,
});
