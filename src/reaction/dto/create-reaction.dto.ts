import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ReactionType } from '../entities/reaction.entity';

export class CreateReactionDto {
  @IsOptional()
  @IsEnum(ReactionType)
  type?: ReactionType;

  @IsUUID()
  postId: string;

  @IsUUID()
  @IsOptional()
  userId: string;
}
