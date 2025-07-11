import { IsOptional, IsString, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCommentMediaDto {
  @IsEnum(['image', 'video', 'file'])
  type: 'image' | 'video' | 'file';

  @IsString()
  url: string;
}

export class UpdateCommentDto {
  @IsString()
  @IsOptional()
  content?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateCommentMediaDto)
  @IsOptional()
  media?: UpdateCommentMediaDto[];
}
