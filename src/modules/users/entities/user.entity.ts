import { Column, Entity } from 'typeorm';
import { BaseUUIDEntity } from '../../common/entities/base.entity';
import { UserStatus } from '../enums/user.enum';

@Entity('users')
export class User extends BaseUUIDEntity {
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, select: false })
  passwordHash: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fullName: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 20, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ type: 'timestamptz', nullable: true })
  emailVerifiedAt: Date | null;

  // Avatar lưu trên MinIO, ref: files.id
  @Column({ type: 'uuid', nullable: true })
  avatarFileId: string | null;
}
