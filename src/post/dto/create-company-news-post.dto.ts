import { IsString, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCompanyNewsPostBlockDto {
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

export class CreateCompanyNewsPostMediaDto {
  @IsString()
  url: string;

  @IsString()
  type: 'image' | 'video';

  order: number;
}

export class CreateCompanyNewsPostDto {
  @IsString()
  companyId: string;

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
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCompanyNewsPostBlockDto)
  blocks?: CreateCompanyNewsPostBlockDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCompanyNewsPostMediaDto)
  media?: CreateCompanyNewsPostMediaDto[];
} 