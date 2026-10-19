import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '../../rbac/constants/permission.constant';
import { RequirePermissions } from '../../rbac/decorators/rbac.decorator';
import {
  BulkCreateBucketDto,
  BulkSubmitDto,
  CreateBucketDto,
} from '../dto/bucket.dto';
import { GetListFileDto } from '../dto/file.dto';
import { BucketService } from '../services/bucket.service';

// upload, lấy url đọc / tải: mọi user đã đăng nhập (khách cần upload avatar)
// liệt kê, xem chi tiết, xoá: cần quyền files:*
@ApiTags('Bucket')
@Controller('bucket')
export class BucketController {
  constructor(private readonly bucketService: BucketService) {}

  // create
  @Post()
  async create(@Body() data: CreateBucketDto) {
    return await this.bucketService.create(data);
  }

  @Post('bulk')
  async bulkCreate(@Body() data: BulkCreateBucketDto) {
    return await this.bucketService.bulkCreate(data);
  }

  @Post('bulk/submit')
  async bulkSubmit(@Body() data: BulkSubmitDto) {
    return await this.bucketService.bulkSubmit(data);
  }

  @Post(':id/submit')
  async submit(@Param('id', ParseUUIDPipe) id: string) {
    return await this.bucketService.submit(id);
  }

  // read
  @Get()
  @RequirePermissions(PERMISSIONS.FILES_READ)
  async getList(@Query() query: GetListFileDto) {
    return await this.bucketService.getList(query);
  }

  @Get(':id/download')
  async getUrlDown(@Param('id', ParseUUIDPipe) id: string) {
    return await this.bucketService.getUrlDown(id);
  }

  @Get(':id/read')
  async getUrlRead(@Param('id', ParseUUIDPipe) id: string) {
    return await this.bucketService.getUrlRead(id);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.FILES_READ)
  async getDetail(@Param('id', ParseUUIDPipe) id: string) {
    return await this.bucketService.getDetail(id);
  }

  // delete: xoá cả trên MinIO và trong db
  @Delete(':id')
  @RequirePermissions(PERMISSIONS.FILES_DELETE)
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.bucketService.delete(id);
  }
}
