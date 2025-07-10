import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserNewsPostBlockDto {
  @IsString()
  type: 'text' | 'image' | 'video' | 'file';

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  media_url?: string;

  @IsOptional()
  @IsString()
  file_name?: string;

  @IsOptional()
  file_size?: number;

  order: number;
}

export class CreateUserNewsPostMediaDto {
  @IsString()
  url: string;

  @IsString()
  type: 'image' | 'video';

  order: number;
}

export class CreateUserNewsPostDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  cover_image?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateUserNewsPostBlockDto)
  blocks?: CreateUserNewsPostBlockDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateUserNewsPostMediaDto)
  media?: CreateUserNewsPostMediaDto[];
} 