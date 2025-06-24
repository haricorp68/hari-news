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
      entities: [User, RefreshToken],
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
