import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '../../rbac/constants/permission.constant';
import { RequirePermissions } from '../../rbac/decorators/rbac.decorator';
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
  @RequirePermissions(PERMISSIONS.FILES_READ)
  async getList(@Query() query: GetListFileDto) {
    return await this.bucketFileService.getList(query);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.FILES_READ)
  async getOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.bucketFileService.findOne(id);
  }

  // delete: xoá cả trên MinIO và trong db
  @Delete(':id')
  @RequirePermissions(PERMISSIONS.FILES_DELETE)
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.bucketService.delete(id);
  }
}
