// src/common/dtos/base-query.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { FILED_ORDER_DEFAULT } from '../constants/common.default.constants';
import { OrderDirection } from '../enums/common';

// keywords là 1 mảng string
export abstract class BaseQueryDto2 {
  @ApiPropertyOptional({
    description: 'Search keywords (?keywords=a&keywords=b)',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value.map((v) => v?.trim())
      : typeof value === 'string'
        ? [value.trim()]
        : [],
  )
  keywords?: string[];

  /** 1‑based page number */
  @ApiProperty({
    description: 'Page number',
    required: false,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  /** Items per page */
  @ApiProperty({
    description: 'Number of items per page',
    required: false,
    default: 20,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize: number = 20;

  /** Number of records to skip */
  get skip(): number {
    return (this.page - 1) * this.pageSize;
  }

  /** Number of records to take */
  get limit(): number {
    return this.pageSize;
  }

  @ApiPropertyOptional({
    description: 'Field to order by',
    default: FILED_ORDER_DEFAULT,
  })
  @IsOptional()
  @IsString()
  fieldOrder: string = FILED_ORDER_DEFAULT;

  @ApiPropertyOptional({
    description: 'Order direction',
    enum: OrderDirection,
    default: OrderDirection.ASC,
  })
  @IsOptional()
  @IsString()
  @IsEnum(OrderDirection)
  orderBy: OrderDirection = OrderDirection.ASC;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDate()
  @Transform(({ value }: { value: string | undefined }) =>
    value ? new Date(value) : undefined,
  )
  startCreatedAt?: Date;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDate()
  @Transform(({ value }: { value: string | undefined }) =>
    value ? new Date(value) : undefined,
  )
  endCreatedAt?: Date;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDate()
  @Transform(({ value }: { value: string | undefined }) =>
    value ? new Date(value) : undefined,
  )
  startUpdatedAt?: Date;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDate()
  @Transform(({ value }: { value: string | undefined }) =>
    value ? new Date(value) : undefined,
  )
  endUpdatedAt?: Date;
}
