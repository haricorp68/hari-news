import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
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

// Load .env file
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'hari_news',
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
  synchronize: true,
});
