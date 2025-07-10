import { ReactionType, EntityType } from '../entities/reaction.entity';
import { PostType } from '../../post/enums/post.enums';

export class ReactionResponseDto {
  id: string;
  type: ReactionType;
  postType: PostType;
  postId: string;
  entityType: EntityType;
  entityId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
} 