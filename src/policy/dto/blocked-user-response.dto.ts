export class BlockedUserResponseDto {
  id: string;
  blockedUserId: string;
  reason?: string;
  blockedAt: Date;
  expiresAt?: Date;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
} 