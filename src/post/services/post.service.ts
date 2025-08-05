import { BadRequestException, Injectable } from '@nestjs/common';
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
import { ReactionService } from '../../reaction/reaction.service';
import { CommentService } from '../../comment/comment.service';
import { UserNewsPostRepository } from './../repositories/user_news_post.repository';
import { PostBlockRepository } from './../repositories/post_block.repository';
import { CreateUserNewsPostDto } from './../dto/create-user-news-post.dto';
import { UpdateUserNewsPostDto } from './../dto/update-user-news-post.dto';
import { UserNewsPostListDto } from './../dto/user-news-post-response.dto';
import { ReactionType } from '../../reaction/entities/reaction.entity';
import { NewsTagService } from './news_tag.service';
import { NewsTag } from '../entities/news_tag.entity';

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

  // Thêm hàm generateUniqueSlug vào class
  private slugify(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu tiếng Việt
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async generateUniqueSlug(
    title: string,
    currentId?: string,
  ): Promise<string> {
    const baseSlug = this.slugify(title);
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const queryBuilder = this.userNewsPostRepo
        .createQueryBuilder('post')
        .where('post.slug = :slug', { slug });

      // Exclude current post khi update
      if (currentId) {
        queryBuilder.andWhere('post.id != :currentId', { currentId });
      }

      const existing = await queryBuilder.getOne();

      if (!existing) break;

      counter++;
      slug = `${baseSlug}-${counter}`;
    }

    return slug;
  }

  // Hàm createUserNewsPost đã cập nhật
  async createUserNewsPost(userId: string, dto: CreateUserNewsPostDto) {
    let tags: NewsTag[] = [];
    if (dto.tags?.length) {
      const rawTags = await Promise.all(
        dto.tags.map((id) => this.newsTagService.findOne(id)),
      );
      tags = rawTags.filter(Boolean) as NewsTag[]; // Type assertion
    }

    // Kiểm tra nếu không có tag hợp lệ thì báo lỗi
    if (!tags.length) {
      throw new BadRequestException(
        'At least one valid tag is required to create a news post',
      );
    }

    // Generate unique slug từ title
    const slug = await this.generateUniqueSlug(dto.title);

    // Tạo news post và gán tags + slug
    const post = this.userNewsPostRepo.create({
      user: { id: userId },
      title: dto.title,
      summary: dto.summary,
      cover_image: dto.cover_image,
      categoryId: dto.categoryId,
      slug, // Thêm slug
      tags,
    });

    await this.userNewsPostRepo.save(post);

    // Lưu blocks nếu có
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

    return { id: post.id, type: 'user_news', slug }; // Return slug để có thể dùng ngay
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
      slug: post.slug,
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
      slug: post.slug,
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
      slug: post.slug,
      categoryId: post.categoryId,
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

  async getUserNewsPostDetailById(postId: string, userId?: string | null) {
    const post = await this.userNewsPostRepo.findOne({
      where: { id: postId },
      relations: ['user', 'category', 'tags'],
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

    // Only get user reaction if userId is provided and not null
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

      slug: post.slug,
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
      userReaction, // Will be undefined for guest users
      commentCount,
    };
  }

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

    // Track nếu title thay đổi để generate slug mới
    const titleChanged = dto.title !== undefined && dto.title !== post.title;

    // Update post fields
    if (dto.title !== undefined) post.title = dto.title;
    if (dto.summary !== undefined) post.summary = dto.summary;
    if (dto.cover_image !== undefined) post.cover_image = dto.cover_image;
    if (dto.categoryId !== undefined) post.categoryId = dto.categoryId;

    // Nếu title thay đổi, generate slug mới
    if (titleChanged && dto.title) {
      post.slug = await this.generateUniqueSlug(dto.title, postId);
    }

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

    return {
      id: post.id,
      type: 'user_news',
      updated: true,
      slug: post.slug, // Return slug để có thể update URL ở frontend
    };
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

  async getAllUserNews(
    page = 1,
    pageSize = 10,
    {
      tagIds,
      categoryId,
      fromDate,
      toDate,
      sortByInteraction,
    }: {
      tagIds?: string[];
      categoryId?: string;
      fromDate?: string;
      toDate?: string;
      sortByInteraction?: boolean;
    } = {},
  ) {
    const qb = this.userNewsPostRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.tags', 'tags');

    if (categoryId) {
      qb.andWhere('post.categoryId = :categoryId', { categoryId });
    }
    if (tagIds && tagIds.length > 0) {
      qb.andWhere('tags.id IN (:...tagIds)', { tagIds });
    }
    if (fromDate) {
      qb.andWhere('post.created_at >= :fromDate', { fromDate });
    }
    if (toDate) {
      qb.andWhere('post.created_at <= :toDate', { toDate });
    }

    qb.skip((page - 1) * pageSize).take(pageSize);
    qb.orderBy('post.created_at', 'DESC');

    const [posts, total] = await qb.getManyAndCount();
    const postIds = posts.map((p) => p.id);
    const reactionSummaryMap = await this.reactionService.findByPosts({
      postIds,
    });
    const commentCounts = await Promise.all(
      postIds.map((id) => this.commentService.getCommentCountByPost(id)),
    );

    // Nếu sortByInteraction, sort lại theo tổng reaction + comment
    let data = posts.map((post, idx) => {
      const reactionCount = Object.values(
        reactionSummaryMap[post.id] || {},
      ).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0);
      const commentCount = commentCounts[idx];
      return {
        id: post.id,
        title: post.title,
        summary: post.summary,
        cover_image: post.cover_image,
        slug: post.slug,
        category: post.category
          ? {
              id: post.category.id,
              name: post.category.name,
              description: post.category.description,
            }
          : undefined,
        tags: post.tags?.map((tag) => ({ id: tag.id, name: tag.name })) || [],
        created_at: post.created_at,
        updated_at: post.updated_at,
        user: {
          id: post.user.id,
          name: post.user.name,
          avatar: post.user.avatar,
        },
        reactionSummary: reactionSummaryMap[post.id] || {},
        commentCount,
        interactionCount: reactionCount + commentCount,
      };
    });
    if (sortByInteraction) {
      data = data.sort((a, b) => b.interactionCount - a.interactionCount);
    }
    return {
      data,
      metadata: {
        page: Number(page),
        pageSize: Number(pageSize),
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getPostsStatByUserId(userId: string) {
    const userFeedPostsCount = await this.userFeedPostRepo.count({
      where: { user: { id: userId } },
    });
    const userNewsPostsCount = await this.userNewsPostRepo.count({
      where: { user: { id: userId } },
    });

    return {
      userFeedPosts: userFeedPostsCount,
      userNewsPosts: userNewsPostsCount,
    };
  }
  // Thêm vào PostService
  async getUserNewsPostDetailBySlug(slug: string, userId?: string | null) {
    const post = await this.userNewsPostRepo.findOne({
      where: { slug },
      relations: ['user', 'category', 'tags'],
    });

    if (!post) return null;

    const blocks = await this.postBlockRepo.findBy({
      post_type: 'user_news',
      post_id: post.id, // Vẫn dùng ID để query blocks
    });

    const reactionSummaryMap = await this.reactionService.findByPosts({
      postIds: [post.id],
    });

    const commentCount = await this.commentService.getCommentCountByPost(
      post.id,
    );

    // Only get user reaction if userId is provided and not null
    let userReaction: ReactionType | undefined = undefined;
    if (userId) {
      const userReactionMap =
        await this.reactionService.getUserReactionsForPosts(userId, [post.id]);
      userReaction = userReactionMap[post.id] as ReactionType | undefined;
    }

    return {
      id: post.id,
      slug: post.slug, // Thêm slug vào response
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
      blocks: blocks.map((block) => ({
        id: block.id,
        type: block.type,
        content: block.content,
        media_url: block.media_url,
        file_name: block.file_name,
        file_size: block.file_size,
        order: block.order,
      })),
      reactionSummary: reactionSummaryMap[post.id] || {},
      userReaction,
      commentCount,
    };
  }
}
