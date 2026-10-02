import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  BulkCreateBucketDto,
  BulkSubmitDto,
  CreateBucketDto,
} from '../dto/bucket.dto';
import { BucketService } from '../services/bucket.service';

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
  @Get(':id/download')
  async getUrlDown(@Param('id', ParseUUIDPipe) id: string) {
    return await this.bucketService.getUrlDown(id);
  }

  @Get(':id/read')
  async getUrlRead(@Param('id', ParseUUIDPipe) id: string) {
    return await this.bucketService.getUrlRead(id);
  }

  @Get(':id')
  async getDetail(@Param('id', ParseUUIDPipe) id: string) {
    return await this.bucketService.getDetail(id);
  }
}
