import { Column, Entity, OneToMany } from 'typeorm';
import { BaseUUIDEntity } from '../../common/entities/base.entity';
import { ROLE_ENTITY } from '../constants/rbac.constant';
import { RolePermission } from './role-permission.entity';
import { UserRole } from './user-role.entity';

@Entity(ROLE_ENTITY)
export class Role extends BaseUUIDEntity {
  // mã cố định để code tham chiếu (ADMIN, CUSTOMER...), không đổi sau khi tạo
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string | null;

  // role hệ thống: không xoá được
  @Column({ type: 'boolean', default: false })
  isSystem: boolean;

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  rolePermissions?: RolePermission[];

  @OneToMany(() => UserRole, (userRole) => userRole.role)
  userRoles?: UserRole[];
}
