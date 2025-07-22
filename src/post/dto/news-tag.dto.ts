import { IsString, IsUUID } from 'class-validator';

export class NewsTagDto {
  @IsUUID()
  id: string;
  @IsString()
  name: string;
}

export class CreateNewsTagDto {
  @IsString()
  name: string;
}

export class UpdateNewsTagDto {
  @IsString()
  name?: string;
}
