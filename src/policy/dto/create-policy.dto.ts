import { IsString, IsOptional } from 'class-validator';

export class CreatePolicyDto {
  @IsString()
  subjectType: string; // 'user' | 'role' | 'group'

  @IsString()
  subjectId: string;

  @IsString()
  action: string;

  @IsString()
  resource: string;

  @IsOptional()
  condition?: Record<string, any>;

  @IsOptional()
  @IsString()
  description?: string;
}
