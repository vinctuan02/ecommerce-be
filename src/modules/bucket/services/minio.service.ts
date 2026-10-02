import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  READ_URL_EXPIRES_IN,
  UPLOAD_URL_EXPIRES_IN,
} from '../constants/bucket.constant';
import { BucketException } from '../constants/bucket.response';

@Injectable()
export class MinioService {
  private readonly client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.client = new S3Client({
      region: this.configService.get<string>('MINIO_REGION', 'us-east-1'),
      endpoint: this.configService.getOrThrow<string>('MINIO_ENDPOINT'),
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('MINIO_ACCESS_KEY'),
        secretAccessKey:
          this.configService.getOrThrow<string>('MINIO_SECRET_KEY'),
      },
      // MinIO dùng path-style: http://host:9000/<bucket>/<key>
      forcePathStyle: true,
    });

    this.bucketName = this.configService.getOrThrow<string>('MINIO_BUCKET');
  }

  getBucketName(): string {
    return this.bucketName;
  }

  getSignedUrlUpload({
    key,
    contentType,
  }: {
    key: string;
    contentType: string;
  }): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    return getSignedUrl(this.client, command, {
      expiresIn: UPLOAD_URL_EXPIRES_IN,
    });
  }

  getSignedUrlRead({
    key,
    bucket = this.bucketName,
  }: {
    key: string;
    bucket?: string;
  }): Promise<string> {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });

    return getSignedUrl(this.client, command, {
      expiresIn: READ_URL_EXPIRES_IN,
    });
  }

  getSignedUrlDown({
    key,
    fileName,
    bucket = this.bucketName,
  }: {
    key: string;
    fileName: string;
    bucket?: string;
  }): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${encodeURIComponent(fileName)}"`,
    });

    return getSignedUrl(this.client, command, {
      expiresIn: READ_URL_EXPIRES_IN,
    });
  }

  async findOne({
    key,
    bucket = this.bucketName,
  }: {
    key: string;
    bucket?: string;
  }): Promise<void> {
    try {
      await this.client.send(
        new HeadObjectCommand({ Bucket: bucket, Key: key }),
      );
    } catch {
      throw BucketException.FILE_NOT_FOUND_IN_STORAGE();
    }
  }

  async delete({
    key,
    bucket = this.bucketName,
  }: {
    key: string;
    bucket?: string;
  }): Promise<void> {
    await this.findOne({ key, bucket });
    await this.client.send(
      new DeleteObjectCommand({ Bucket: bucket, Key: key }),
    );
  }
}
