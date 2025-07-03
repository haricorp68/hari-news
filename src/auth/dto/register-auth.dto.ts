import {
  IsBoolean,
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
} from 'class-validator';

export class RegisterAuthDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @IsOptional()
  token?: string;

  @IsBoolean()
  @IsOptional()
  isVerified?: boolean = false;
}
