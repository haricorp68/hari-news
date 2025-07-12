import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateFollowDto {
  @IsOptional()
  @IsBoolean()
  isMuted?: boolean;
} 