import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCategoryDto {
  @IsOptional() // Đánh dấu là tùy chọn
  @IsUUID('4', { message: 'ID must be a valid UUID v4' }) // Tùy chọn: Validate định dạng UUID
  id?: string; // Thêm trường id

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsString()
  parentId?: string;
}
