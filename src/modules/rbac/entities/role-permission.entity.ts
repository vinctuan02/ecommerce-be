import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { ROLE_PERMISSION_TABLE } from '../constants/rbac.constant';
import { PermissionEntity } from './permission.entity';
import { Role } from './role.entity';

// bảng nối role - permission, khoá chính là cặp (roleId, permissionCode)
@Entity(ROLE_PERMISSION_TABLE)
export class RolePermission {
  @PrimaryColumn({ type: 'uuid' })
  roleId: string;

  @PrimaryColumn({ type: 'varchar', length: 100 })
  permissionCode: string;

  // thời điểm cấp quyền
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  // xoá role / quyền (quyền bỏ khỏi code) thì dòng nối bị xoá theo
  @ManyToOne(() => Role, (role) => role.rolePermissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => PermissionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permission_code' })
  permission: PermissionEntity;
}
