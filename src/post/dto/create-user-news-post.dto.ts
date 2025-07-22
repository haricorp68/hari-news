import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BlockType } from '../enums/post.enums';

export class CreateUserNewsPostBlockDto {
  @IsString()
  type: BlockType;

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

export class CreateUserNewsPostDto {
  @IsString()
  title: string;

  @IsString()
  summary: string;

  @IsString()
  cover_image: string;

  @IsString()
  categoryId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateUserNewsPostBlockDto)
  blocks?: CreateUserNewsPostBlockDto[];
}
