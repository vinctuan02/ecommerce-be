import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { UploadPurpose } from '../enums/bucket.enum';

class CreateFileDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  fileName: string;

  @IsString()
  @IsNotEmpty()
  contentType: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  extension: string;

  @IsNumber()
  @Min(0)
  fileSize: number;
}

export class CreateBucketDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateFileDto)
  file: CreateFileDto;

  // mục đích upload, dùng để xác định folder lưu file
  @IsEnum(UploadPurpose)
  uploadPurpose: UploadPurpose;

  // key do client gửi lên để mapping kết quả trả về
  @IsString()
  @IsOptional()
  key: string | null = null;
}

export class BulkCreateBucketDto {
  @IsNotEmpty()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateBucketDto)
  bucketDtos: CreateBucketDto[];
}

export class BulkSubmitDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  ids: string[];
}
