import { IsString, IsNumber, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCommunityFeedPostMediaDto {
  @IsString()
  url: string;

  @IsString()
  type: 'image' | 'video';

  order: number;
}

export class CreateCommunityFeedPostDto {
  @IsString()
  communityId: string;

  @IsString()
  caption: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCommunityFeedPostMediaDto)
  media?: CreateCommunityFeedPostMediaDto[];
} 