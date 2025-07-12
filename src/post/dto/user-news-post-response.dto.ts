export interface PostBlockDto {
  id: string;
  type: 'text' | 'image' | 'video' | 'file';
  content?: string;
  media_url?: string;
  file_name?: string;
  file_size?: number;
  order: number;
}

export class UserNewsPostListDto {
  id: string;
  title: string;
  summary?: string;
  cover_image?: string;
  created_at: Date;
  updated_at: Date;
  user: {
    id: string;
    name?: string;
    avatar?: string;
  };
}

export class UserNewsPostResponseDto {
  id: string;
  title: string;
  summary?: string;
  cover_image?: string;
  created_at: Date;
  updated_at: Date;
  user: {
    id: string;
    name?: string;
    avatar?: string;
  };
  blocks?: PostBlockDto[];
  // News posts only use blocks, not media
} 