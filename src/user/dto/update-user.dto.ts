import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsUrl,
  IsObject, // Thêm để validate object
  ValidateIf, // Thêm để validate có điều kiện
} from 'class-validator';
import { Transform } from 'class-transformer';
import { SocialPlatform } from '../enums/user.enum'; // Import enum SocialPlatform

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'Tên phải là chuỗi' })
  name?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Avatar phải là URL hợp lệ' })
  avatar?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Ảnh bìa phải là URL hợp lệ' })
  coverImage?: string;

  @IsOptional()
  @IsObject({ message: 'Liên kết mạng xã hội phải là một đối tượng' })
  // Sử dụng Transform để đảm bảo rằng các giá trị trong object là string (URL) nếu có
  @Transform(({ value }) => {
    if (value && typeof value === 'object') {
      const transformedValue: Partial<Record<SocialPlatform, string>> = {};
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          // Chỉ thêm vào nếu key là một giá trị hợp lệ từ enum và value là một chuỗi
          if (
            Object.values(SocialPlatform).includes(key as SocialPlatform) &&
            typeof value[key] === 'string'
          ) {
            transformedValue[key as SocialPlatform] = value[key];
          }
        }
      }
      return transformedValue;
    }
    return value;
  })
  // Validate từng giá trị trong socialLinks
  // ValidateIf và IsUrl kết hợp để kiểm tra từng thuộc tính của socialLinks nếu nó tồn tại
  socialLinks?: {
    [K in SocialPlatform]?: string; // Sử dụng enum làm type của các khóa
  };

  @IsOptional()
  @IsString({ message: 'Số điện thoại phải là chuỗi' })
  phone?: string; // Trường này không có trong User entity hiện tại của bạn, nhưng nếu có ý định thêm vào thì giữ lại

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

  @IsString()
  @IsOptional()
  bio?: string;

  @IsOptional()
  @IsString({ message: 'Alias phải là chuỗi' }) // Added alias field
  alias?: string;
}
