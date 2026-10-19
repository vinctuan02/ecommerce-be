import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseUUIDEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { USER_TOKEN_ENTITY } from '../constants/auth.constant';
import { UserTokenType } from '../enums/auth.enum';

// token dùng 1 lần gửi qua email: xác thực email, đặt lại mật khẩu
@Entity(USER_TOKEN_ENTITY)
@Index(['userId', 'type'])
export class UserToken extends BaseUUIDEntity {
  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 30 })
  type: UserTokenType;

  // sha256 của token gửi trong link
  @Column({ type: 'varchar', length: 64, unique: true })
  tokenHash: string;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  usedAt: Date | null;
}
