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
    const { postType, postId } = createReactionDto;
    const valid = await this.validatePost(postType, postId);
    if (!valid) {
      throw new BadRequestException('Invalid postId or postType');
    }
    // You may want to check for duplicate reaction by user here
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
}
