import { ReactionType } from '../entities/reaction.entity';
import { PostType } from '../../post/enums/post.enums';

export class ReactionResponseDto {
  id: string;
  type: ReactionType;
  postType: PostType;
  postId: string;
  entityId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
