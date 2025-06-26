import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateCommunityRoleDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_owner?: boolean;

  @IsNotEmpty()
  communityId: number;
} 