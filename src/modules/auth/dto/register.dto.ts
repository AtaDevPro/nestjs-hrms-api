import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../../../shared/enums/user-role.enum';

export class RegisterDto {
  @IsString()
  mobile: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
