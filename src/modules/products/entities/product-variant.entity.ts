import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { bigintToNumber } from '../../common/entities/column.transformers';
import { BaseUUIDEntity } from '../../common/entities/base.entity';
import {
  PRODUCT_SKU_MAX_LENGTH,
  PRODUCT_VARIANT_ENTITY,
} from '../constants/product.constant';
import { Product } from './product.entity';

@Entity(PRODUCT_VARIANT_ENTITY)
export class ProductVariant extends BaseUUIDEntity {
  @Column({ type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'varchar', length: PRODUCT_SKU_MAX_LENGTH, unique: true })
  sku: string;

  // giá bán (VND)
  @Column({ type: 'bigint', transformer: bigintToNumber })
  price: number;

  // giá gốc, hiển thị gạch ngang
  @Column({ type: 'bigint', nullable: true, transformer: bigintToNumber })
  originalPrice: number | null;

  // giá trị theo từng option của product: { 'Màu': 'Đỏ', 'Size': 'M' }
  @Column({ type: 'jsonb', default: () => "'{}'" })
  optionValues: Record<string, string>;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
