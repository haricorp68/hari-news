import { IsEmail } from 'class-validator';

export class sendEmailVerificationDto {
  @IsEmail()
  email: string;
}
