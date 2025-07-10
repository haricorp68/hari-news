import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserFeedPostMediaDto {
  @IsString()
  url: string;

  @IsString()
  type: 'image' | 'video';

  @IsNumber()
  order: number;
}

export class CreateUserFeedPostDto {
  @IsString()
  caption: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateUserFeedPostMediaDto)
  media?: CreateUserFeedPostMediaDto[];
}
