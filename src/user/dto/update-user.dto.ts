import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsUrl,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'Tên phải là chuỗi' })
  name?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Avatar phải là URL hợp lệ' })
  avatar?: string;

  @IsOptional()
  @IsString({ message: 'Tiểu sử phải là chuỗi' })
  bio?: string;

  @IsOptional()
  @IsString({ message: 'Số điện thoại phải là chuỗi' })
  phone?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Ngày sinh không hợp lệ' })
  @Transform(({ value }) => (value ? new Date(value).toISOString() : null))
  dateOfBirth?: Date;

  @IsOptional()
  @IsEnum(['male', 'female', 'other'], { message: 'Giới tính không hợp lệ' })
  gender?: string;

  @IsOptional()
  @IsString({ message: 'Địa chỉ phải là chuỗi' })
  address?: string;

  @IsOptional()
  @IsString({ message: 'Thành phố phải là chuỗi' })
  city?: string;

  @IsString()
  @IsOptional()
  password?: string;
}
