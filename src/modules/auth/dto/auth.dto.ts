import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from '../../users/constants/user.constant';
import { trim, trimLower } from '../../users/dto/user.dto';
import { User } from '../../users/entities/user.entity';

// input
export class LoginDto {
  @ApiProperty({ example: 'user@example.com', maxLength: 255 })
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  @Transform(trimLower)
  email: string;

  // không check độ dài tối thiểu, sai thì báo chung invalidCredentials
  @ApiProperty({ example: 'P@ssw0rd123' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(PASSWORD_MAX_LENGTH)
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', maxLength: 255 })
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  @Transform(trimLower)
  email: string;

  @ApiProperty({
    example: 'P@ssw0rd123',
    minLength: PASSWORD_MIN_LENGTH,
    maxLength: PASSWORD_MAX_LENGTH,
  })
  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(PASSWORD_MAX_LENGTH)
  password: string;

  @ApiPropertyOptional({ example: 'Nguyễn Văn A', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Transform(trim)
  fullName?: string;
}

// token lấy từ link trong email
export class TokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com', maxLength: 255 })
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  @Transform(trimLower)
  email: string;
}

export class ResetPasswordDto extends TokenDto {
  @ApiProperty({
    minLength: PASSWORD_MIN_LENGTH,
    maxLength: PASSWORD_MAX_LENGTH,
  })
  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(PASSWORD_MAX_LENGTH)
  newPassword: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(PASSWORD_MAX_LENGTH)
  currentPassword: string;

  // khác currentPassword: check trong service
  @ApiProperty({
    minLength: PASSWORD_MIN_LENGTH,
    maxLength: PASSWORD_MAX_LENGTH,
  })
  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(PASSWORD_MAX_LENGTH)
  newPassword: string;
}

// output
export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty({ example: 900, description: 'Số giây access token còn hạn' })
  expiresIn: number;

  @ApiProperty({ type: () => User })
  user: User;
}
