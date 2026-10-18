import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description:
      'شماره موبایل کاربر (باید با الگوی شماره موبایل ایرانی مطابقت داشته باشد)',
    example: '09395510232',
    pattern: '^09\\d{9}$',
    minLength: 11,
    maxLength: 11,
  })
  @IsString({ message: 'شماره موبایل باید یک رشته متنی باشد' })
  @IsNotEmpty({ message: 'شماره موبایل الزامی است' })
  @Matches(/^09\d{9}$/, {
    message:
      'شماره موبایل باید با الگوی شماره موبایل ایرانی (09xxxxxxxxx) مطابقت داشته باشد',
  })
  mobile: string;

  @ApiProperty({
    description: 'رمز عبور کاربر (حداقل 8 کاراکتر)',
    example: '12345678',
    minLength: 8,
  })
  @IsString({ message: 'رمز عبور باید یک رشته متنی باشد' })
  @IsNotEmpty({ message: 'رمز عبور الزامی است' })
  @MinLength(8, { message: 'رمز عبور باید حداقل 8 کاراکتر باشد' })
  password: string;

  @ApiPropertyOptional({
    description: 'نقش کاربری (manager یا employee)',
    example: 'employee',
    enum: UserRole,
    enumName: 'UserRole',
  })
  @IsOptional()
  @IsEnum(UserRole, {
    message: 'نقش کاربری باید یکی از مقادیر manager یا employee باشد',
  })
  role?: UserRole;
}
