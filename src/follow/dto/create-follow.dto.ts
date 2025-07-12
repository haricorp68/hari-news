import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateFollowDto {
  @IsNotEmpty()
  @IsUUID()
  followingId: string;
}
