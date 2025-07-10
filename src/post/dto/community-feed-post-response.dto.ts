export class CommunityFeedPostMediaResponseDto {
  url: string;
  type: string;
  order: number;
}

export class CommunityFeedPostCommunityResponseDto {
  name: string;
  avatar: string;
}

export class CommunityFeedPostResponseDto {
  id: number;
  caption: string;
  created_at: Date;
  media: CommunityFeedPostMediaResponseDto[];
  community: CommunityFeedPostCommunityResponseDto;
} 