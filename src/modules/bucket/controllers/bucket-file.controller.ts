import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResponseSuccess } from '../../common/dtos/common.response.dto';
import { GetListFileDto } from '../dto/file.dto';
import { BucketFileService } from '../services/bucket-file.service';
import { BucketService } from '../services/bucket.service';

@ApiTags('Bucket File')
@Controller('bucket/files')
export class BucketFileController {
  constructor(
    private readonly bucketFileService: BucketFileService,
    private readonly bucketService: BucketService,
  ) {}

  // read
  @Get()
  async getList(@Query() query: GetListFileDto) {
    const result = await this.bucketFileService.getList(query);

    return new ResponseSuccess({ data: result });
  }

  @Get(':id')
  async getOne(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.bucketFileService.findOne(id);

    return new ResponseSuccess({ data: result });
  }

  // delete: xoá cả trên MinIO và trong db
  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.bucketService.delete(id);

    return new ResponseSuccess();
  }
}
