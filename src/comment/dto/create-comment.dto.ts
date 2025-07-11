import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { PostType } from 'src/post/enums/post.enums';

export class CommentMediaDto {
  @IsEnum(['image', 'video', 'file'])
  type: 'image' | 'video' | 'file';

  @IsString()
  url: string;
}

export class CreateCommentDto {
  @IsEnum(PostType)
  postType: PostType;

  @IsUUID()
  postId: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID()
  @IsOptional()
  parentId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CommentMediaDto)
  @IsOptional()
  media?: CommentMediaDto[];
}
