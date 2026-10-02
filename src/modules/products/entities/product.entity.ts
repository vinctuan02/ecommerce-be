import { Column, Entity, OneToMany } from 'typeorm';
import { bigintToNumber } from '../../common/entities/column.transformers';
import { BaseUUIDEntity } from '../../common/entities/base.entity';
import {
  PRODUCT_ENTITY,
  PRODUCT_NAME_MAX_LENGTH,
} from '../constants/product.constant';
import { ProductStatus } from '../enums/product.enum';
import { ProductImage } from './product-image.entity';
import { ProductVariant } from './product-variant.entity';

// thông số: [{ name: 'Chất liệu', value: 'Cotton' }]
export interface ProductSpec {
  name: string;
  value: string;
}

// tuỳ chọn biến thể: [{ name: 'Màu', values: ['Đỏ', 'Xanh'] }]
export interface ProductOption {
  name: string;
  values: string[];
}

@Entity(PRODUCT_ENTITY)
export class Product extends BaseUUIDEntity {
  @Column({ type: 'varchar', length: PRODUCT_NAME_MAX_LENGTH })
  name: string;

  @Column({ type: 'varchar', length: PRODUCT_NAME_MAX_LENGTH, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 20, default: ProductStatus.DRAFT })
  status: ProductStatus;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  specs: ProductSpec[];

  @Column({ type: 'jsonb', default: () => "'[]'" })
  options: ProductOption[];

  // tính lại từ variants mỗi lần lưu, để sort / lọc theo giá
  @Column({ type: 'bigint', nullable: true, transformer: bigintToNumber })
  minPrice: number | null;

  @Column({ type: 'bigint', nullable: true, transformer: bigintToNumber })
  maxPrice: number | null;

  @OneToMany(() => ProductImage, (image) => image.product)
  images: ProductImage[];

  @OneToMany(() => ProductVariant, (variant) => variant.product)
  variants: ProductVariant[];
}
