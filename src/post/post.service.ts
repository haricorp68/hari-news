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
import { MediaType, BlockType } from './enums/post.enums';
import { UserFeedPostResponseDto } from './dto/user-feed-post-response.dto';
import { CommunityFeedPostResponseDto } from './dto/community-feed-post-response.dto';
import { CompanyFeedPostResponseDto } from './dto/company-feed-post-response.dto';
import { ReactionRepository } from '../reaction/repositories/reaction.repository';
import { In } from 'typeorm';
import { PostType } from './enums/post.enums';
import { ReactionService } from '../reaction/reaction.service';
import { CommentService } from '../comment/comment.service';
import { UserNewsPostRepository } from './repositories/user_news_post.repository';
import { PostBlockRepository } from './repositories/post_block.repository';
import { CreateUserNewsPostDto } from './dto/create-user-news-post.dto';
import { UpdateUserNewsPostDto } from './dto/update-user-news-post.dto';
import { UserNewsPostResponseDto, UserNewsPostListDto, PostBlockDto } from './dto/user-news-post-response.dto';

@Injectable()
export class PostService {
  constructor(
    private readonly userFeedPostRepo: UserFeedPostRepository,
    private readonly communityFeedPostRepo: CommunityFeedPostRepository,
    private readonly companyFeedPostRepo: CompanyFeedPostRepository,
    private readonly postMediaRepo: PostMediaRepository,
    private readonly reactionService: ReactionService, // inject service thay vì repo
    private readonly commentService: CommentService,
    private readonly userNewsPostRepo: UserNewsPostRepository,
    private readonly postBlockRepo: PostBlockRepository,
  ) {}

  async createUserFeedPost(userId: string, dto: CreateUserFeedPostDto) {
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

  async createUserNewsPost(userId: string, dto: CreateUserNewsPostDto) {
    // Create the news post
    const post = this.userNewsPostRepo.create({
      user: { id: userId },
      title: dto.title,
      summary: dto.summary,
      cover_image: dto.cover_image,
    });
    await this.userNewsPostRepo.save(post);
    // Save blocks if any (news posts only use blocks, not media)
    if (dto.blocks?.length) {
      const blocks = dto.blocks.map((b) =>
        this.postBlockRepo.create({
          post_type: 'user_news',
          post_id: post.id,
          type: BlockType[b.type.toUpperCase() as keyof typeof BlockType],
          content: b.content,
          media_url: b.media_url,
          file_name: b.file_name,
          file_size: b.file_size,
          order: b.order,
        }),
      );
      await this.postBlockRepo.save(blocks);
    }
    return { id: post.id, type: 'user_news' };
  }

  async getUserSelfFeedPosts(userId: string, limit = 20, offset = 0) {
    const posts = await this.userFeedPostRepo.getUserFeedPosts(
      userId,
      limit,
      offset,
    );
    const postIds = posts.map((p) => p.id);
    const reactionSummaryMap = await this.reactionService.findByPosts({
      postType: PostType.USER_FEED,
      postIds,
    });
    // Lấy số lượng comment cho từng post
    const commentCounts = await Promise.all(
      postIds.map((id) => this.commentService.getCommentCountByPost(id)),
    );
    return posts.map((post, idx) => ({
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
        id: post.user.id,
      },
      reactionSummary: reactionSummaryMap[post.id] || {},
      commentCount: commentCounts[idx],
    }));
  }

  async getUserSelfFeedPostDetail(
    userId: string,
    postId: string,
  ): Promise<UserFeedPostResponseDto | null> {
    const post = await this.userFeedPostRepo.getUserFeedPostDetail(
      userId,
      postId,
    );
    if (!post) return null;
    const commentCount = await this.commentService.getCommentCountByPost(
      post.id,
    );
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
      commentCount,
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
    const postIds = posts.map((p) => p.id);
    const commentCounts = await Promise.all(
      postIds.map((id) => this.commentService.getCommentCountByPost(id)),
    );
    return posts.map((post, idx) => ({
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
      commentCount: commentCounts[idx],
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
    const commentCount = await this.commentService.getCommentCountByPost(
      post.id,
    );
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
      commentCount,
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
    const postIds = posts.map((p) => p.id);
    const commentCounts = await Promise.all(
      postIds.map((id) => this.commentService.getCommentCountByPost(id)),
    );
    return posts.map((post, idx) => ({
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
      commentCount: commentCounts[idx],
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
    const commentCount = await this.commentService.getCommentCountByPost(
      post.id,
    );
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
      commentCount,
    };
  }

  async getUserSelfNewsPosts(
    userId: string,
    limit = 20,
    offset = 0,
  ): Promise<UserNewsPostListDto[]> {
    const posts = await this.userNewsPostRepo.find({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' },
      skip: offset,
      take: limit,
      relations: ['user'],
    });
    return posts.map((post) => ({
      id: post.id,
      title: post.title,
      summary: post.summary,
      cover_image: post.cover_image,
      created_at: post.created_at,
      updated_at: post.updated_at,
      user: {
        id: post.user.id,
        name: post.user.name,
        avatar: post.user.avatar,
      },
    }));
  }

  // Public endpoints for reading user news posts
  async getUserNewsPosts(
    userId: string,
    limit = 20,
    offset = 0,
  ): Promise<UserNewsPostResponseDto[]> {
    const posts = await this.userNewsPostRepo.find({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' },
      skip: offset,
      take: limit,
      relations: ['user'],
    });
    const postIds = posts.map((p) => p.id);
    const allBlocks = await this.postBlockRepo.findBy({
      post_type: 'user_news',
      post_id: In(postIds),
    });
    return posts.map((post) => ({
      id: post.id,
      title: post.title,
      summary: post.summary,
      cover_image: post.cover_image,
      created_at: post.created_at,
      updated_at: post.updated_at,
      user: {
        id: post.user.id,
        name: post.user.name,
        avatar: post.user.avatar,
      },
      blocks: allBlocks
        .filter((b) => b.post_id === post.id)
        .map((block): PostBlockDto => ({
          id: block.id,
          type: block.type,
          content: block.content,
          media_url: block.media_url,
          file_name: block.file_name,
          file_size: block.file_size,
          order: block.order,
        })),
    }));
  }

  async getUserNewsPostDetail(
    postId: string,
  ): Promise<UserNewsPostResponseDto | null> {
    const post = await this.userNewsPostRepo.findOne({
      where: { id: postId },
      relations: ['user'],
    });
    if (!post) return null;
    const blocks = await this.postBlockRepo.findBy({
      post_type: 'user_news',
      post_id: post.id,
    });
    return {
      id: post.id,
      title: post.title,
      summary: post.summary,
      cover_image: post.cover_image,
      created_at: post.created_at,
      updated_at: post.updated_at,
      user: {
        id: post.user.id,
        name: post.user.name,
        avatar: post.user.avatar,
      },
      blocks: blocks.map((block): PostBlockDto => ({
        id: block.id,
        type: block.type,
        content: block.content,
        media_url: block.media_url,
        file_name: block.file_name,
        file_size: block.file_size,
        order: block.order,
      })),
    };
  }

  // Update and delete methods
  async updateUserNewsPost(
    userId: string,
    postId: string,
    dto: UpdateUserNewsPostDto,
  ) {
    // Check if post exists and belongs to user
    const post = await this.userNewsPostRepo.findOne({
      where: { id: postId, user: { id: userId } },
    });
    if (!post) {
      throw new Error('Post not found or access denied');
    }

    // Update post fields
    if (dto.title !== undefined) post.title = dto.title;
    if (dto.summary !== undefined) post.summary = dto.summary;
    if (dto.cover_image !== undefined) post.cover_image = dto.cover_image;
    
    await this.userNewsPostRepo.save(post);

    // Update blocks if provided
    if (dto.blocks) {
      // Delete existing blocks
      await this.postBlockRepo.delete({
        post_type: 'user_news',
        post_id: postId,
      });

      // Create new blocks
      const blocks = dto.blocks.map((b) =>
        this.postBlockRepo.create({
          post_type: 'user_news',
          post_id: postId,
          type: BlockType[b.type.toUpperCase() as keyof typeof BlockType],
          content: b.content,
          media_url: b.media_url,
          file_name: b.file_name,
          file_size: b.file_size,
          order: b.order,
        }),
      );
      await this.postBlockRepo.save(blocks);
    }

    return { id: post.id, type: 'user_news', updated: true };
  }

  async deleteUserNewsPost(userId: string, postId: string) {
    // Check if post exists and belongs to user
    const post = await this.userNewsPostRepo.findOne({
      where: { id: postId, user: { id: userId } },
    });
    if (!post) {
      throw new Error('Post not found or access denied');
    }

    // Delete blocks first
    await this.postBlockRepo.delete({
      post_type: 'user_news',
      post_id: postId,
    });

    // Delete the post
    await this.userNewsPostRepo.delete(postId);

    return { id: postId, deleted: true };
  }
}
