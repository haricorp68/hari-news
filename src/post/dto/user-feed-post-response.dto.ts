import { ReactionType } from '../../reaction/entities/reaction.entity';

export class UserFeedPostMediaResponseDto {
  url: string;
  type: string;
  order: number;
}

export class UserFeedPostUserResponseDto {
  name: string;
  avatar: string;
}

export class UserFeedPostResponseDto {
  id: string;
  caption: string;
  created_at: Date;
  updated_at: Date;
  media: UserFeedPostMediaResponseDto[];
  user: UserFeedPostUserResponseDto;
  userReaction?: ReactionType;
  commentCount: number;
  reactionSummary: {};
}
