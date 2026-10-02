import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsIn, IsOptional, IsUUID } from 'class-validator';
import { BaseQueryDto2 } from '../../common/dtos/common.base-query.dto';
import { FILE_ENTITY } from '../constants/bucket.constant';

// dạng <entity>.<field>, giống USER_ORDER_FIELDS
export const FILE_ORDER_FIELDS = [
  `${FILE_ENTITY}.createdAt`,
  `${FILE_ENTITY}.updatedAt`,
  `${FILE_ENTITY}.fileName`,
  `${FILE_ENTITY}.fileSize`,
] as const;

export type FileOrderField = (typeof FILE_ORDER_FIELDS)[number];

export class GetListFileDto extends BaseQueryDto2 {
  // ?ids=a&ids=b hoặc ?ids=a
  @ApiPropertyOptional({ type: [String], format: 'uuid' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? [value] : value,
  )
  ids?: string[];

  @ApiPropertyOptional({
    enum: FILE_ORDER_FIELDS,
    default: `${FILE_ENTITY}.createdAt`,
  })
  @IsOptional()
  @IsIn(FILE_ORDER_FIELDS)
  fieldOrder: FileOrderField = `${FILE_ENTITY}.createdAt`;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }: { value: unknown }) =>
    value === undefined ? undefined : value === true || value === 'true',
  )
  isSubmitted?: boolean;
}
