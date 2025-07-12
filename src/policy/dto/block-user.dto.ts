import { IsUUID, IsOptional, IsString } from 'class-validator';

export class BlockUserDto {
  @IsUUID()
  blockedId: string;

  @IsOptional()
  @IsString()
  reason?: string;
} 