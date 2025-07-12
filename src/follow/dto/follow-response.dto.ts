export class FollowResponseDto {
  id: string;
  followerId: string;
  followingId: string;
  isMuted: boolean;
  mutedAt?: Date;
  created_at: Date;
  updated_at: Date;
  follower?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    bio?: string;
  };
  following?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    bio?: string;
  };
} 