import { IsString, IsNumber, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCompanyFeedPostMediaDto {
  @IsString()
  url: string;

  @IsString()
  type: 'image' | 'video';

  order: number;
}

export class CreateCompanyFeedPostDto {
  @IsNumber()
  companyId: number;

  @IsString()
  caption: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCompanyFeedPostMediaDto)
  media?: CreateCompanyFeedPostMediaDto[];
} 