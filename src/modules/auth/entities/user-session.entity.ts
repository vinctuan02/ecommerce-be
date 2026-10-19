import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseUUIDEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { USER_SESSION_ENTITY } from '../constants/auth.constant';

// mỗi dòng là 1 thiết bị đang đăng nhập
@Entity(USER_SESSION_ENTITY)
export class UserSession extends BaseUUIDEntity {
  @Index()
  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // sha256 phần secret của refresh token, đổi mỗi lần refresh
  @Column({ type: 'varchar', length: 64 })
  refreshTokenHash: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  userAgent: string | null;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip: string | null;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ type: 'timestamptz' })
  lastUsedAt: Date;

  // khác null là phiên đã bị thu hồi
  @Column({ type: 'timestamptz', nullable: true })
  revokedAt: Date | null;
}
