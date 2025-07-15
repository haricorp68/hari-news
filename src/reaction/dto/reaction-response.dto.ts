import { ReactionType } from '../entities/reaction.entity';

export class ReactionResponseDto {
  id: string;
  type: ReactionType;
  postId: string;
  entityId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
