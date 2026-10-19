import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { BaseQueryDto2 } from '../../common/dtos/common.base-query.dto';
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  USER_ENTITY,
} from '../constants/user.constant';
import { UserRole, UserStatus } from '../enums/user.enum';

export const trimLower = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateUserDto {
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
  fullName?: string | null;

  @ApiPropertyOptional({ example: '0912345678', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Transform(trim)
  phone?: string | null;

  @ApiPropertyOptional({ format: 'uuid', description: 'files.id của avatar' })
  @IsOptional()
  @IsUUID()
  avatarFileId?: string | null;

  @ApiPropertyOptional({ enum: UserStatus, default: UserStatus.ACTIVE })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.CUSTOMER })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

// password không bắt buộc khi update, chỉ gửi khi muốn đổi
export class UpdateUserDto extends PartialType(CreateUserDto) {}

// dạng <entity>.<field>, sau này thêm field của bảng join (vd `${FILE_ENTITY}.fileName`)
export const USER_ORDER_FIELDS = [
  `${USER_ENTITY}.createdAt`,
  `${USER_ENTITY}.updatedAt`,
  `${USER_ENTITY}.email`,
  `${USER_ENTITY}.fullName`,
] as const;

export type UserOrderField = (typeof USER_ORDER_FIELDS)[number];

export class GetListUserDto extends BaseQueryDto2 {
  @ApiPropertyOptional({
    enum: USER_ORDER_FIELDS,
    default: `${USER_ENTITY}.createdAt`,
  })
  @IsOptional()
  @IsIn(USER_ORDER_FIELDS)
  fieldOrder: UserOrderField = `${USER_ENTITY}.createdAt`;

  @ApiPropertyOptional({ enum: UserStatus, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(UserStatus, { each: true })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? [value] : value,
  )
  statuses?: UserStatus[];
}
