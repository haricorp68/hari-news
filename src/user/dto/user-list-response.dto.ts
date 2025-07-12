import { UserResponseDto } from './user-response.dto';

export class UserListResponseDto {
  data: UserResponseDto[];
  message: string;
  metadata: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    filters?: any;
  };
} 