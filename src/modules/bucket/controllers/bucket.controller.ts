import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResponseSuccess } from '../../common/dtos/common.response.dto';
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
    const result = await this.bucketService.create(data);

    return new ResponseSuccess({ data: result });
  }

  @Post('bulk')
  async bulkCreate(@Body() data: BulkCreateBucketDto) {
    const result = await this.bucketService.bulkCreate(data);

    return new ResponseSuccess({ data: result });
  }

  @Post('bulk/submit')
  async bulkSubmit(@Body() data: BulkSubmitDto) {
    const result = await this.bucketService.bulkSubmit(data);

    return new ResponseSuccess({ data: result });
  }

  @Post(':id/submit')
  async submit(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.bucketService.submit(id);

    return new ResponseSuccess({ data: result });
  }

  // read
  @Get(':id/download')
  async getUrlDown(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.bucketService.getUrlDown(id);

    return new ResponseSuccess({ data: result });
  }

  @Get(':id/read')
  async getUrlRead(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.bucketService.getUrlRead(id);

    return new ResponseSuccess({ data: result });
  }

  @Get(':id')
  async getDetail(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.bucketService.getDetail(id);

    return new ResponseSuccess({ data: result });
  }
}
