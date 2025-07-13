import { IsString, IsOptional, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserNewsPostBlockDto {
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
  @IsNumber()
  file_size?: number;

  @IsNumber()
  order: number;
}

export class UpdateUserNewsPostDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  cover_image?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateUserNewsPostBlockDto)
  blocks?: UpdateUserNewsPostBlockDto[];
} 