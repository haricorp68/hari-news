import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateCommunityRoleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_owner?: boolean;
} 