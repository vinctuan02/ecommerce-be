import { Injectable, Logger } from '@nestjs/common';
import { FolderBucketMap } from '../constants/bucket.constant';
import { BucketException } from '../constants/bucket.response';
import {
  BulkCreateBucketDto,
  BulkSubmitDto,
  CreateBucketDto,
} from '../dto/bucket.dto';
import { GetListFileDto } from '../dto/file.dto';
import { FileEntity } from '../entities/file.entity';
import { IResCreateBucket } from '../interfaces/bucket.interface';
import { generateFileNameWithTimestamp } from '../utils/bucket.util';
import { BucketFileService } from './bucket-file.service';
import { MinioService } from './minio.service';

@Injectable()
export class BucketService {
  private readonly logger = new Logger(BucketService.name);

  constructor(
    private readonly minioService: MinioService,
    private readonly bucketFileService: BucketFileService,
  ) {}

  // create
  async create(data: CreateBucketDto): Promise<IResCreateBucket> {
    const { file, uploadPurpose, key: keyForMapping } = data;

    const key = `${FolderBucketMap[uploadPurpose]}/${generateFileNameWithTimestamp(file.fileName)}`;

    const newFile = await this.bucketFileService.create({
      ...file,
      key,
      bucket: this.minioService.getBucketName(),
    });

    const urlUpload = await this.minioService.getSignedUrlUpload({
      key,
      contentType: newFile.contentType,
    });

    return {
      fileId: newFile.id,
      urlUpload,
      key: keyForMapping,
    };
  }

  async bulkCreate(data: BulkCreateBucketDto): Promise<IResCreateBucket[]> {
    return await Promise.all(data.bucketDtos.map((item) => this.create(item)));
  }

  async submit(id: string) {
    const { bucket, key, isSubmitted } =
      await this.bucketFileService.findOne(id);

    if (isSubmitted) {
      throw BucketException.FILE_ALREADY_SUBMITTED();
    }

    // đảm bảo client đã upload file lên MinIO
    await this.minioService.findOne({ key, bucket });

    return await this.bucketFileService.submit(id);
  }

  async bulkSubmit(data: BulkSubmitDto) {
    return await Promise.all(data.ids.map((id) => this.submit(id)));
  }

  // read
  async getList(query: GetListFileDto) {
    return await this.bucketFileService.getList(query);
  }

  async getUrlRead(id: string) {
    const { key, bucket } = await this.bucketFileService.findOne(id);

    return this.minioService.getSignedUrlRead({ key, bucket });
  }

  async getUrlDown(id: string) {
    const { key, fileName, bucket } = await this.bucketFileService.findOne(id);

    return this.minioService.getSignedUrlDown({ key, fileName, bucket });
  }

  // gắn presigned url đọc file vào entity (vd avatar của user)
  async attachUrlRead<T extends FileEntity | null | undefined>(file: T) {
    if (file) {
      file.urlRead = await this.minioService.getSignedUrlRead({
        key: file.key,
        bucket: file.bucket,
      });
    }
    return file;
  }

  async getDetail(id: string) {
    const file = await this.bucketFileService.findOne(id);

    return {
      ...file,
      urlRead: await this.minioService.getSignedUrlRead({
        key: file.key,
        bucket: file.bucket,
      }),
    };
  }

  // delete
  async delete(id: string) {
    const { key, bucket } = await this.bucketFileService.findOne(id);

    await this.minioService.delete({ key, bucket });
    await this.bucketFileService.delete(id);
  }

  async deleteSafe(id: string) {
    await this.delete(id).catch((e: Error) =>
      this.logger.warn(`Skip delete, reason: ${e.message}`),
    );
  }
}
