import {
  IsBoolean,
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
} from 'class-validator';

export class LoginAuthDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
