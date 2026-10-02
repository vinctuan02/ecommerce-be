import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BucketFileController } from './controllers/bucket-file.controller';
import { BucketController } from './controllers/bucket.controller';
import { FileEntity } from './entities/file.entity';
import { BucketFileService } from './services/bucket-file.service';
import { BucketService } from './services/bucket.service';
import { MinioService } from './services/minio.service';

@Module({
  imports: [TypeOrmModule.forFeature([FileEntity])],
  providers: [BucketService, BucketFileService, MinioService],
  controllers: [BucketFileController, BucketController],
  exports: [BucketService],
})
export class BucketModule {}
