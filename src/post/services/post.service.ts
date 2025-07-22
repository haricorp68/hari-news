import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import {
  CreateUserFeedPostDto,
  CreateUserFeedPostMediaDto,
} from './../dto/create-user-feed-post.dto';
import {
  CreateCommunityFeedPostDto,
  CreateCommunityFeedPostMediaDto,
} from './../dto/create-community-feed-post.dto';
import {
  CreateCompanyFeedPostDto,
  CreateCompanyFeedPostMediaDto,
} from './../dto/create-company-feed-post.dto';
import { UserFeedPostRepository } from './../repositories/user_feed_post.repository';
import { CommunityFeedPostRepository } from './../repositories/community_feed_post.repository';
import { CompanyFeedPostRepository } from './../repositories/company_feed_post.repository';
import { PostMediaRepository } from './../repositories/post_media.repository';
import { MediaType, BlockType } from './../enums/post.enums';
import { UserFeedPostResponseDto } from './../dto/user-feed-post-response.dto';
import { CommunityFeedPostResponseDto } from './../dto/community-feed-post-response.dto';
import { CompanyFeedPostResponseDto } from './../dto/company-feed-post-response.dto';
import { In } from 'typeorm';
import { ReactionService } from '../../reaction/reaction.service';
import { CommentService } from '../../comment/comment.service';
import { UserNewsPostRepository } from './../repositories/user_news_post.repository';
import { PostBlockRepository } from './../repositories/post_block.repository';
import { CreateUserNewsPostDto } from './../dto/create-user-news-post.dto';
import { UpdateUserNewsPostDto } from './../dto/update-user-news-post.dto';
import { UserNewsPostListDto } from './../dto/user-news-post-response.dto';
import { ReactionType } from '../../reaction/entities/reaction.entity';
import { NewsTagService } from './news_tag.service';
import { CompanyNewsPostRepository } from './../repositories/company_news_post.repository';
import { CommunityNewsPostRepository } from './../repositories/community_news_post.repository';
import { CreateCompanyNewsPostDto } from './../dto/create-company-news-post.dto';
import { CreateCommunityNewsPostDto } from './../dto/create-community-news-post.dto';

@Injectable()
export class PostService {
  constructor(
    private readonly userFeedPostRepo: UserFeedPostRepository,
    private readonly communityFeedPostRepo: CommunityFeedPostRepository,
    private readonly companyFeedPostRepo: CompanyFeedPostRepository,
    private readonly postMediaRepo: PostMediaRepository,
    private readonly reactionService: ReactionService,
    private readonly commentService: CommentService,
    private readonly userNewsPostRepo: UserNewsPostRepository,
    private readonly postBlockRepo: PostBlockRepository,
    private readonly newsTagService: NewsTagService,
    private readonly companyNewsPostRepo: CompanyNewsPostRepository,
    private readonly communityNewsPostRepo: CommunityNewsPostRepository,
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
    let tags: any[] = [];
    if (dto.tags?.length) {
      tags = await Promise.all(
        dto.tags.map((id) => this.newsTagService.findOne(id)),
      );
      tags = tags.filter(Boolean);
    }
    // Create the news post
    const post = this.userNewsPostRepo.create({
      user: { id: userId },
      title: dto.title,
      summary: dto.summary,
      cover_image: dto.cover_image,
      categoryId: dto.categoryId,
      tags,
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

  async createCompanyNewsPost(dto: CreateCompanyNewsPostDto) {
    let tags: any[] = [];
    if (dto.tags?.length) {
      tags = await Promise.all(
        dto.tags.map((id) => this.newsTagService.findOne(id)),
      );
      tags = tags.filter(Boolean);
    }
    const post = this.companyNewsPostRepo.create({
      company: { id: dto.companyId },
      title: dto.title,
      summary: dto.summary,
      cover_image: dto.cover_image,
      tags,
    });
    await this.companyNewsPostRepo.save(post);
    if (dto.blocks?.length) {
      const blocks = dto.blocks.map((b) =>
        this.postBlockRepo.create({
          post_type: 'company_news',
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
    return { id: post.id, type: 'company_news' };
  }

  async createCommunityNewsPost(dto: CreateCommunityNewsPostDto) {
    let tags: any[] = [];
    if (dto.tags?.length) {
      tags = await Promise.all(
        dto.tags.map((id) => this.newsTagService.findOne(id)),
      );
      tags = tags.filter(Boolean);
    }
    const post = this.communityNewsPostRepo.create({
      community: { id: dto.communityId },
      title: dto.title,
      summary: dto.summary,
      cover_image: dto.cover_image,
      tags,
    });
    await this.communityNewsPostRepo.save(post);
    if (dto.blocks?.length) {
      const blocks = dto.blocks.map((b) =>
        this.postBlockRepo.create({
          post_type: 'community_news',
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
    return { id: post.id, type: 'community_news' };
  }

  // Public endpoint for reading user feed posts by userId
  async getUserFeedPosts(userId: string, limit = 20, offset = 0) {
    const posts = await this.userFeedPostRepo.getUserFeedPosts(
      userId,
      limit,
      offset,
    );
    const postIds = posts.map((p) => p.id);
    const reactionSummaryMap = await this.reactionService.findByPosts({
      postIds,
    });
    const userReactionMap = await this.reactionService.getUserReactionsForPosts(
      userId,
      postIds,
    );
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
      userReaction: userReactionMap[post.id] as ReactionType | undefined,
      commentCount: commentCounts[idx],
    }));
  }

  async getUserFeedPostDetail(
    postId: string,
    userId: string,
  ): Promise<UserFeedPostResponseDto | null> {
    const post = await this.userFeedPostRepo.getUserFeedPostDetail(
      userId,
      postId,
    );
    if (!post) return null;
    const commentCount = await this.commentService.getCommentCountByPost(
      post.id,
    );
    // Get reaction summary and user reaction for this post
    const reactionSummaryMap = await this.reactionService.findByPosts({
      postIds: [post.id],
    });
    const userReactionMap = await this.reactionService.getUserReactionsForPosts(
      userId,
      [post.id],
    );
    const reactionSummary = reactionSummaryMap[post.id] || {};
    const userReaction = userReactionMap[post.id] as ReactionType | undefined;

    return {
      id: post.id,
      caption: post.caption,
      created_at: post.created_at,
      updated_at: post.updated_at,
      media: (post['media'] || []).map(
        (m: { url: string; type: string; order: number }) => ({
          url: m.url,
          type: m.type,
          order: m.order,
        }),
      ),
      user: {
        name: post.user?.name,
        avatar: post.user?.avatar,
      },
      commentCount,
      reactionSummary,
      userReaction,
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
      relations: ['user', 'category', 'tags'],
    });
    const postIds = posts.map((p) => p.id);
    const userReactionMap = await this.reactionService.getUserReactionsForPosts(
      userId,
      postIds,
    );
    const reactionSummaryMap = await this.reactionService.findByPosts({
      postIds,
    });
    const commentCounts = await Promise.all(
      postIds.map((id) => this.commentService.getCommentCountByPost(id)),
    );
    return posts.map((post, idx) => ({
      id: post.id,
      title: post.title,
      summary: post.summary,
      cover_image: post.cover_image,
      category: post.category
        ? {
            id: post.category.id,
            name: post.category.name,
            description: post.category.description,
          }
        : undefined,
      tags:
        post.tags?.map((tag) => ({
          id: tag.id,
          name: tag.name,
        })) || [],
      created_at: post.created_at,
      updated_at: post.updated_at,
      user: {
        id: post.user.id,
        name: post.user.name,
        avatar: post.user.avatar,
      },
      userReaction: userReactionMap[post.id] as ReactionType | undefined,
      reactionSummary: reactionSummaryMap[post.id] || {},
      commentCount: commentCounts[idx],
    }));
  }

  // Public endpoints for reading user news posts
  async getUserNewsPosts(
    userId: string,
    currentUserId?: string,
    limit = 20,
    offset = 0,
  ): Promise<UserNewsPostListDto[]> {
    const posts = await this.userNewsPostRepo.find({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' },
      skip: offset,
      take: limit,
      relations: ['user', 'category', 'tags'], // thêm 'tags'
    });
    const postIds = posts.map((p) => p.id);
    const userReactionMap = currentUserId
      ? await this.reactionService.getUserReactionsForPosts(
          currentUserId,
          postIds,
        )
      : {};
    const reactionSummaryMap = await this.reactionService.findByPosts({
      postIds,
    });
    const commentCounts = await Promise.all(
      postIds.map((id) => this.commentService.getCommentCountByPost(id)),
    );
    return posts.map((post, idx) => ({
      id: post.id,
      title: post.title,
      summary: post.summary,
      cover_image: post.cover_image,
      category: post.category
        ? {
            id: post.category.id,
            name: post.category.name,
            description: post.category.description,
          }
        : undefined,
      tags: post.tags?.map((tag) => ({
        id: tag.id,
        name: tag.name,
      })) || [],
      created_at: post.created_at,
      updated_at: post.updated_at,
      user: {
        id: post.user.id,
        name: post.user.name,
        avatar: post.user.avatar,
      },
      userReaction: userReactionMap[post.id] as ReactionType | undefined,
      reactionSummary: reactionSummaryMap[post.id] || {},
      commentCount: commentCounts[idx],
    }));
  }

  async getUserNewsSummary(
    userId: string,
    currentUserId?: string,
    limit = 20,
    offset = 0,
  ) {
    const posts = await this.userNewsPostRepo.find({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' },
      skip: offset,
      take: limit,
      relations: ['user', 'category', 'tags'], // thêm 'tags'
    });
    const postIds = posts.map((p) => p.id);
    const userReactionMap = currentUserId
      ? await this.reactionService.getUserReactionsForPosts(
          currentUserId,
          postIds,
        )
      : {};
    const reactionSummaryMap = await this.reactionService.findByPosts({
      postIds,
    });
    const commentCounts = await Promise.all(
      postIds.map((id) => this.commentService.getCommentCountByPost(id)),
    );
    return posts.map((post, idx) => ({
      id: post.id,
      title: post.title,
      summary: post.summary,
      cover_image: post.cover_image,
      categoryId: post.categoryId,
      category: post.category
        ? {
            id: post.category.id,
            name: post.category.name,
            description: post.category.description,
          }
        : undefined,
      tags: post.tags?.map((tag) => ({
        id: tag.id,
        name: tag.name,
      })) || [],
      created_at: post.created_at,
      updated_at: post.updated_at,
      user: {
        id: post.user.id,
        name: post.user.name,
        avatar: post.user.avatar,
      },
      userReaction: userReactionMap[post.id] as ReactionType | undefined,
      reactionSummary: reactionSummaryMap[post.id] || {},
      commentCount: commentCounts[idx],
    }));
  }

  async getUserNewsPostDetailById(postId: string, userId?: string) {
    const post = await this.userNewsPostRepo.findOne({
      where: { id: postId },
      relations: ['user', 'category', 'tags'], // thêm 'tags'
    });
    if (!post) return null;
    const blocks = await this.postBlockRepo.findBy({
      post_type: 'user_news',
      post_id: postId,
    });
    const reactionSummaryMap = await this.reactionService.findByPosts({
      postIds: [postId],
    });
    const commentCount =
      await this.commentService.getCommentCountByPost(postId);
    let userReaction: ReactionType | undefined = undefined;
    if (userId) {
      const userReactionMap =
        await this.reactionService.getUserReactionsForPosts(userId, [postId]);
      userReaction = userReactionMap[postId] as ReactionType | undefined;
    }
    return {
      id: post.id,
      title: post.title,
      summary: post.summary,
      cover_image: post.cover_image,
      category: post.category
        ? {
            id: post.category.id,
            name: post.category.name,
            description: post.category.description,
          }
        : undefined,
      tags: post.tags?.map((tag) => ({
        id: tag.id,
        name: tag.name,
      })) || [],
      created_at: post.created_at,
      updated_at: post.updated_at,
      user: {
        id: post.user.id,
        name: post.user.name,
        avatar: post.user.avatar,
      },
      blocks: blocks.map((block) => ({
        id: block.id,
        type: block.type,
        content: block.content,
        media_url: block.media_url,
        file_name: block.file_name,
        file_size: block.file_size,
        order: block.order,
      })),
      reactionSummary: reactionSummaryMap[postId] || {},
      userReaction,
      commentCount,
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
    if (dto.categoryId !== undefined) post.categoryId = dto.categoryId;

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
