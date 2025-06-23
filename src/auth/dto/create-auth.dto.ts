import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateAuthDto {}

export class LoginAuthDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
