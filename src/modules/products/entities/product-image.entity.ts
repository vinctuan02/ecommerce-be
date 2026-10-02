import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { FileEntity } from '../../bucket/entities/file.entity';
import { BaseUUIDEntity } from '../../common/entities/base.entity';
import { PRODUCT_IMAGE_ENTITY } from '../constants/product.constant';
import { Product } from './product.entity';

@Entity(PRODUCT_IMAGE_ENTITY)
export class ProductImage extends BaseUUIDEntity {
  @Column({ type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  // ref: files.id, xoá file thì ảnh cũng mất khỏi sản phẩm
  @Column({ type: 'uuid' })
  fileId: string;

  @ManyToOne(() => FileEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'file_id' })
  file: FileEntity;

  // thứ tự hiển thị, 0 là ảnh đại diện
  @Column({ type: 'int', default: 0 })
  position: number;
}
