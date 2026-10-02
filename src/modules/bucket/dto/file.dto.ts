import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsIn, IsOptional, IsUUID } from 'class-validator';
import { BaseQueryDto2 } from '../../common/dtos/common.base-query.dto';

export const FILE_ORDER_FIELDS = [
  'createdAt',
  'updatedAt',
  'fileName',
  'fileSize',
] as const;

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

  @ApiPropertyOptional({ enum: FILE_ORDER_FIELDS, default: 'createdAt' })
  @IsOptional()
  @IsIn(FILE_ORDER_FIELDS)
  fieldOrder: (typeof FILE_ORDER_FIELDS)[number] = 'createdAt';

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }: { value: unknown }) =>
    value === undefined ? undefined : value === true || value === 'true',
  )
  isSubmitted?: boolean;
}
