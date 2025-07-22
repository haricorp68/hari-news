import { ReactionType } from '../../reaction/entities/reaction.entity';
import { BlockType } from '../enums/post.enums';
import { NewsTagDto } from './news-tag.dto';

export interface PostBlockDto {
  id: string;
  type: BlockType;
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
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    description?: string;
  };
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
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    description?: string;
  };
  created_at: Date;
  updated_at: Date;
  user: {
    id: string;
    name?: string;
    avatar?: string;
  };
  userReaction?: ReactionType;
  blocks?: PostBlockDto[];
  tags: NewsTagDto[];
} 