import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { FileEntity } from '../../bucket/entities/file.entity';
import { BaseUUIDEntity } from '../../common/entities/base.entity';
import { USER_ENTITY } from '../constants/user.constant';
import { UserStatus } from '../enums/user.enum';

@Entity(USER_ENTITY)
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

  // xoá file thì user chỉ mất avatar, không bị xoá theo
  @ManyToOne(() => FileEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'avatar_file_id' })
  avatar: FileEntity | null;
}
