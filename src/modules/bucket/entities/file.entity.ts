import { Column, Entity } from 'typeorm';
import { BaseUUIDEntity } from '../../common/entities/base.entity';
import { FILE_NAME_TIMESTAMP_PREFIX_LENGTH } from '../utils/bucket.util';

@Entity('files', {
  comment: 'Bảng lưu trữ metadata của các file trên MinIO',
})
export class FileEntity extends BaseUUIDEntity {
  @Column({
    type: 'boolean',
    default: false,
    comment: 'Đánh dấu file đã được submit / sử dụng chính thức hay chưa',
  })
  isSubmitted: boolean;

  @Column({
    type: 'varchar',
    length: 500 + FILE_NAME_TIMESTAMP_PREFIX_LENGTH,
    comment: 'Tên file gốc, có thể kèm prefix timestamp',
  })
  fileName: string;

  @Column({
    type: 'varchar',
    length: 500,
    comment: 'Key lưu trữ file trong bucket (đường dẫn nội bộ)',
  })
  key: string;

  @Column({
    type: 'varchar',
    length: 200,
    comment: 'MIME type của file (ví dụ: image/png)',
  })
  contentType: string;

  @Column({
    type: 'varchar',
    length: 10,
    comment: 'Phần mở rộng của file (ví dụ: png, jpg)',
  })
  extension: string;

  @Column({
    type: 'bigint',
    comment: 'Dung lượng file, tính bằng byte',
  })
  fileSize: number;

  @Column({
    type: 'varchar',
    length: 63,
    comment: 'Tên bucket lưu trữ file',
  })
  bucket: string;
}
