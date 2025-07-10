import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateCommunityRoleDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  communityId: string;
}
