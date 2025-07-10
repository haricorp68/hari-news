import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import {
  CreateUserFeedPostDto,
  CreateUserFeedPostMediaDto,
} from './dto/create-user-feed-post.dto';
import {
  CreateCommunityFeedPostDto,
  CreateCommunityFeedPostMediaDto,
} from './dto/create-community-feed-post.dto';
import {
  CreateCompanyFeedPostDto,
  CreateCompanyFeedPostMediaDto,
} from './dto/create-company-feed-post.dto';
import { UserFeedPostRepository } from './repositories/user_feed_post.repository';
import { CommunityFeedPostRepository } from './repositories/community_feed_post.repository';
import { CompanyFeedPostRepository } from './repositories/company_feed_post.repository';
import { PostMediaRepository } from './repositories/post_media.repository';
import { MediaType } from './enums/post.enums';
import { UserFeedPostResponseDto } from './dto/user-feed-post-response.dto';
import { CommunityFeedPostResponseDto } from './dto/community-feed-post-response.dto';
import { CompanyFeedPostResponseDto } from './dto/company-feed-post-response.dto';

@Injectable()
export class PostService {
  constructor(
    private readonly userFeedPostRepo: UserFeedPostRepository,
    private readonly communityFeedPostRepo: CommunityFeedPostRepository,
    private readonly companyFeedPostRepo: CompanyFeedPostRepository,
    private readonly postMediaRepo: PostMediaRepository,
  ) {}

  async createUserFeedPost(userId: number, dto: CreateUserFeedPostDto) {
    const post = this.userFeedPostRepo.create({
      user: { id: userId },
      caption: dto.caption,
    });
    await this.userFeedPostRepo.save(post);
    if (dto.media?.length) {
      const mediaEntities = dto.media.map((m: CreateUserFeedPostMediaDto) =>
        this.postMediaRepo.create({
          post_type: 'user_feed',
          post_id: post.id,
          url: m.url,
          type: m.type as MediaType,
          order: m.order,
        }),
      );
      await this.postMediaRepo.save(mediaEntities);
    }
    return { id: post.id, type: 'user_feed' };
  }

  async createCommunityFeedPost(dto: CreateCommunityFeedPostDto) {
    const post = this.communityFeedPostRepo.create({
      community: { id: dto.communityId },
      caption: dto.caption,
    });
    await this.communityFeedPostRepo.save(post);
    if (dto.media?.length) {
      const mediaEntities = dto.media.map(
        (m: CreateCommunityFeedPostMediaDto) =>
          this.postMediaRepo.create({
            post_type: 'community_feed',
            post_id: post.id,
            url: m.url,
            type: m.type as MediaType,
            order: m.order,
          }),
      );
      await this.postMediaRepo.save(mediaEntities);
    }
    return { id: post.id, type: 'community_feed' };
  }

  async createCompanyFeedPost(dto: CreateCompanyFeedPostDto) {
    const post = this.companyFeedPostRepo.create({
      company: { id: dto.companyId },
      caption: dto.caption,
    });
    await this.companyFeedPostRepo.save(post);
    if (dto.media?.length) {
      const mediaEntities = dto.media.map((m: CreateCompanyFeedPostMediaDto) =>
        this.postMediaRepo.create({
          post_type: 'company_feed',
          post_id: post.id,
          url: m.url,
          type: m.type as MediaType,
          order: m.order,
        }),
      );
      await this.postMediaRepo.save(mediaEntities);
    }
    return { id: post.id, type: 'company_feed' };
  }

  async getUserSelfFeedPosts(
    userId: number,
    limit = 20,
    offset = 0,
  ): Promise<UserFeedPostResponseDto[]> {
    const posts = await this.userFeedPostRepo.getUserFeedPosts(
      userId,
      limit,
      offset,
    );
    return posts.map((post) => ({
      id: post.id,
      caption: post.caption,
      created_at: post.created_at,
      updated_at: post.updated_at,
      media: (post['media'] || []).map((m) => ({
        url: m.url,
        type: m.type,
        order: m.order,
      })),
      user: {
        name: post.user?.name,
        avatar: post.user?.avatar,
      },
    }));
  }

  async getUserSelfFeedPostDetail(
    userId: number,
    postId: number,
  ): Promise<UserFeedPostResponseDto | null> {
    const post = await this.userFeedPostRepo.getUserFeedPostDetail(
      userId,
      postId,
    );
    if (!post) return null;
    return {
      id: post.id,
      caption: post.caption,
      created_at: post.created_at,
      updated_at: post.updated_at,
      media: (post['media'] || []).map((m) => ({
        url: m.url,
        type: m.type,
        order: m.order,
      })),
      user: {
        name: post.user?.name,
        avatar: post.user?.avatar,
      },
    };
  }

  async getCommunityFeedPosts(
    communityId: number,
    limit = 20,
    offset = 0,
  ): Promise<CommunityFeedPostResponseDto[]> {
    const posts = await this.communityFeedPostRepo.getCommunityFeedPosts(
      communityId,
      limit,
      offset,
    );
    return posts.map((post) => ({
      id: post.id,
      caption: post.caption,
      created_at: post.created_at,
      media: (post['media'] || []).map((m) => ({
        url: m.url,
        type: m.type,
        order: m.order,
      })),
      community: {
        name: post.community?.name,
        avatar: post.community?.avatar,
      },
    }));
  }

  async getCommunityFeedPostDetail(
    communityId: number,
    postId: number,
  ): Promise<CommunityFeedPostResponseDto | null> {
    const post = await this.communityFeedPostRepo.getCommunityFeedPostDetail(
      communityId,
      postId,
    );
    if (!post) return null;
    return {
      id: post.id,
      caption: post.caption,
      created_at: post.created_at,
      media: (post['media'] || []).map((m) => ({
        url: m.url,
        type: m.type,
        order: m.order,
      })),
      community: {
        name: post.community?.name,
        avatar: post.community?.avatar,
      },
    };
  }

  async getCompanyFeedPosts(
    companyId: number,
    limit = 20,
    offset = 0,
  ): Promise<CompanyFeedPostResponseDto[]> {
    const posts = await this.companyFeedPostRepo.getCompanyFeedPosts(
      companyId,
      limit,
      offset,
    );
    return posts.map((post) => ({
      id: post.id,
      caption: post.caption,
      created_at: post.created_at,
      media: (post['media'] || []).map((m) => ({
        url: m.url,
        type: m.type,
        order: m.order,
      })),
      company: {
        name: post.company?.name,
        avatar: post.company?.avatar,
      },
    }));
  }

  async getCompanyFeedPostDetail(
    companyId: number,
    postId: number,
  ): Promise<CompanyFeedPostResponseDto | null> {
    const post = await this.companyFeedPostRepo.getCompanyFeedPostDetail(
      companyId,
      postId,
    );
    if (!post) return null;
    return {
      id: post.id,
      caption: post.caption,
      created_at: post.created_at,
      media: (post['media'] || []).map((m) => ({
        url: m.url,
        type: m.type,
        order: m.order,
      })),
      company: {
        name: post.company?.name,
        avatar: post.company?.avatar,
      },
    };
  }
}
