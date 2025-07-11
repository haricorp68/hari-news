import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ReactionType } from '../entities/reaction.entity';
import { PostType } from '../../post/enums/post.enums';

export class CreateReactionDto {
  @IsEnum(ReactionType)
  type: ReactionType;

  @IsEnum(PostType)
  postType: PostType;

  @IsUUID()
  postId: string;

  @IsUUID()
  @IsOptional()
  userId: string;
}
