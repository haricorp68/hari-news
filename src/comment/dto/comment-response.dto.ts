import { PostType } from 'src/post/enums/post.enums';
import { CommentMediaDto } from './create-comment.dto';

export class CommentUserDto {
  id: string;
  name: string;
  avatar?: string;
}

export class CommentResponseDto {
  id: string;
  postId: string;
  content: string;
  user: CommentUserDto;
  parentId?: string;
  media?: CommentMediaDto[];
  created_at: Date;
  updated_at: Date;
  childCount: number;
}
