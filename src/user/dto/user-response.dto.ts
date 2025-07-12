export class UserResponseDto {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  coverImage?: string;
  bio?: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: string;
  address?: string;
  city?: string;
  isActive: boolean;
  isVerified: boolean;
  emailVerifiedAt?: Date;
  phoneVerifiedAt?: Date;
  status: string;
  role: string;
  lastLoginAt?: Date;
  loginCount: number;
  lastPasswordChangeAt?: Date;
  deletedAt?: Date;
  created_at: Date;
  updated_at: Date;
  
  // Follow stats (optional)
  followersCount?: number;
  followingCount?: number;
  
  // Config (optional)
  config?: {
    id: string;
    userId: string;
    theme?: string;
    language?: string;
    notifications?: boolean;
    privacy?: string;
    created_at: Date;
    updated_at: Date;
  };
} 