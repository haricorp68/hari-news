import { Injectable } from '@nestjs/common';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { UpdateReactionDto } from './dto/update-reaction.dto';
import { ReactionRepository } from './repositories/reaction.repository';
import { PostType } from '../post/enums/post.enums';
import { UserFeedPostRepository } from '../post/repositories/user_feed_post.repository';
import { CompanyFeedPostRepository } from '../post/repositories/company_feed_post.repository';
import { CommunityFeedPostRepository } from '../post/repositories/community_feed_post.repository';
import { UserNewsPostRepository } from '../post/repositories/user_news_post.repository';
import { CompanyNewsPostRepository } from '../post/repositories/company_news_post.repository';
import { CommunityNewsPostRepository } from '../post/repositories/community_news_post.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ReactionType } from './entities/reaction.entity';

@Injectable()
export class ReactionService {
  constructor(
    private readonly reactionRepository: ReactionRepository,
    private readonly userFeedPostRepository: UserFeedPostRepository,
    private readonly companyFeedPostRepository: CompanyFeedPostRepository,
    private readonly communityFeedPostRepository: CommunityFeedPostRepository,
    private readonly userNewsPostRepository: UserNewsPostRepository,
    private readonly companyNewsPostRepository: CompanyNewsPostRepository,
    private readonly communityNewsPostRepository: CommunityNewsPostRepository,
  ) {}

  async validatePost(postType: PostType, postId: string): Promise<boolean> {
    const id = postId;
    switch (postType) {
      case PostType.USER_FEED:
        return !!(await this.userFeedPostRepository.findOne({ where: { id } }));
      case PostType.COMPANY_FEED:
        return !!(await this.companyFeedPostRepository.findOne({
          where: { id },
        }));
      case PostType.COMMUNITY_FEED:
        return !!(await this.communityFeedPostRepository.findOne({
          where: { id },
        }));
      case PostType.USER_NEWS:
        return !!(await this.userNewsPostRepository.findOne({ where: { id } }));
      case PostType.COMPANY_NEWS:
        return !!(await this.companyNewsPostRepository.findOne({
          where: { id },
        }));
      case PostType.COMMUNITY_NEWS:
        return !!(await this.communityNewsPostRepository.findOne({
          where: { id },
        }));
      default:
        return false;
    }
  }

  async create(createReactionDto: CreateReactionDto) {
    const { postType, postId, userId } = createReactionDto; // userId cần có trong DTO hoặc truyền vào
    const valid = await this.validatePost(postType, postId);
    if (!valid) {
      throw new BadRequestException('Invalid postId or postType');
    }
    // Kiểm tra duplicate reaction
    const existed = await this.reactionRepository.findOne({
      where: {
        userId,
        postType,
        postId,
      },
    });
    if (existed) {
      throw new BadRequestException('Reaction already exists');
    }
    const reaction = this.reactionRepository.create(createReactionDto);
    return this.reactionRepository.save(reaction);
  }

  async findAll() {
    return this.reactionRepository.find();
  }

  async findOne(id: string) {
    const reaction = await this.reactionRepository.findOne({ where: { id } });
    if (!reaction) throw new NotFoundException('Reaction not found');
    return reaction;
  }

  async update(id: string, updateReactionDto: UpdateReactionDto) {
    const reaction = await this.reactionRepository.findOne({ where: { id } });
    if (!reaction) throw new NotFoundException('Reaction not found');
    Object.assign(reaction, updateReactionDto);
    return this.reactionRepository.save(reaction);
  }

  async remove(id: string) {
    const reaction = await this.reactionRepository.findOne({ where: { id } });
    if (!reaction) throw new NotFoundException('Reaction not found');
    await this.reactionRepository.remove(reaction);
    return { deleted: true };
  }

  async toggleReaction(
    createReactionDto: CreateReactionDto & { userId: string },
  ) {
    const { postType, postId, type, userId } = createReactionDto;
    const valid = await this.validatePost(postType, postId);
    if (!valid) {
      throw new BadRequestException('Invalid postId or postType');
    }
    const existed = await this.reactionRepository.findOne({
      where: {
        userId,
        postType,
        postId,
      },
    });
    if (!existed) {
      // Chưa có -> tạo mới
      const reaction = this.reactionRepository.create(createReactionDto);
      return this.reactionRepository.save(reaction);
    }
    if (existed.type === type) {
      // Đã có cùng loại -> xóa (gỡ reaction)
      await this.reactionRepository.remove(existed);
      return { deleted: true };
    }
    // Đã có khác loại -> cập nhật
    existed.type = type;
    return this.reactionRepository.save(existed);
  }

  async findByPost(params: {
    postType: PostType;
    postId: string;
    type?: ReactionType;
  }) {
    const { postType, postId, type } = params;
    const where: any = { postType, postId };
    if (type) where.type = type;
    const reactions = await this.reactionRepository.find({ where });
    // Tính summary
    const summary: Record<string, number> = {};
    for (const r of reactions) {
      summary[r.type] = (summary[r.type] || 0) + 1;
    }
    return { reactions, summary };
  }

  async findByPosts(params: {
    postType: PostType;
    postIds: string[];
    type?: ReactionType;
  }) {
    const { postType, postIds, type } = params;
    return this.reactionRepository.getSummaryByPosts(postType, postIds, type);
  }
}
