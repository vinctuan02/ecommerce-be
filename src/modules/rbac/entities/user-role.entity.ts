import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { USER_ROLE_TABLE } from '../constants/rbac.constant';
import { Role } from './role.entity';

// bảng nối user - role, khoá chính là cặp (userId, roleId)
@Entity(USER_ROLE_TABLE)
export class UserRole {
  @PrimaryColumn({ type: 'uuid' })
  userId: string;

  @PrimaryColumn({ type: 'uuid' })
  roleId: string;

  // thời điểm gán role
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  // xoá user / role thì dòng nối bị xoá theo
  @ManyToOne(() => User, (user) => user.userRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Role, (role) => role.userRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;
}
