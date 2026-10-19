import {
  ApiProperty,
  ApiPropertyOptional,
  PartialType,
  PickType,
} from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';
import { trim } from '../../users/dto/user.dto';
import {
  PERMISSION_CODES,
  type PermissionCode,
} from '../constants/permission.constant';
import { ROLE_CODE_PATTERN } from '../constants/rbac.constant';

const trimUpper = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toUpperCase() : value;

export class CreateRoleDto {
  @ApiProperty({ example: 'STAFF', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(ROLE_CODE_PATTERN, {
    message: 'code chỉ gồm chữ in hoa, số, gạch dưới và bắt đầu bằng chữ',
  })
  @Transform(trimUpper)
  code: string;

  @ApiProperty({ example: 'Nhân viên', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(trim)
  name: string;

  @ApiPropertyOptional({ maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Transform(trim)
  description?: string | null;

  @ApiPropertyOptional({ enum: PERMISSION_CODES, isArray: true })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsIn(PERMISSION_CODES, { each: true })
  permissionCodes?: PermissionCode[];
}

// code cố định sau khi tạo. Có permissionCodes thì thay toàn bộ quyền của role
export class UpdateRoleDto extends PartialType(
  PickType(CreateRoleDto, ['name', 'description', 'permissionCodes'] as const),
) {}

// thay toàn bộ role của user
export class SetUserRolesDto {
  @ApiProperty({ type: [String], format: 'uuid' })
  @IsArray()
  @ArrayUnique()
  @IsUUID('all', { each: true })
  roleIds: string[];
}
