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
  id: number;
  caption: string;
  created_at: Date;
  media: UserFeedPostMediaResponseDto[];
  user: UserFeedPostUserResponseDto;
} 