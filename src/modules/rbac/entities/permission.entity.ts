import { Column, Entity, PrimaryColumn } from 'typeorm';
import { PERMISSION_ENTITY } from '../constants/rbac.constant';

// bản sao danh mục PERMISSIONS trong code, đồng bộ lúc khởi động, không sửa qua API
@Entity(PERMISSION_ENTITY)
export class PermissionEntity {
  // `${resource}:${action}`
  @PrimaryColumn({ type: 'varchar', length: 100 })
  code: string;

  @Column({ type: 'varchar', length: 50 })
  resource: string;

  @Column({ type: 'varchar', length: 50 })
  action: string;

  @Column({ type: 'varchar', length: 255 })
  description: string;
}
