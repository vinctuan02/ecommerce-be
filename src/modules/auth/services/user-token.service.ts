import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { UserTokenTtlMinutes } from '../constants/auth.constant';
import { AuthException } from '../constants/auth.response';
import { UserToken } from '../entities/user-token.entity';
import { UserTokenType } from '../enums/auth.enum';
import { addMinutes, randomToken, sha256 } from '../utils/token.util';

// token dùng 1 lần gửi qua email
@Injectable()
export class UserTokenService {
  constructor(
    @InjectRepository(UserToken)
    private readonly tokenRepo: Repository<UserToken>,
  ) {}

  // trả raw token để ghép vào link, db chỉ lưu hash
  // phát token mới thì link cũ cùng loại hết hiệu lực
  async issue(userId: string, type: UserTokenType): Promise<string> {
    await this.tokenRepo.delete({ userId, type, usedAt: IsNull() });

    const token = randomToken();
    await this.tokenRepo.save(
      this.tokenRepo.create({
        userId,
        type,
        tokenHash: sha256(token),
        expiresAt: addMinutes(new Date(), UserTokenTtlMinutes[type]),
      }),
    );

    return token;
  }

  // đánh dấu đã dùng, trả về userId
  async consume(token: string, type: UserTokenType): Promise<string> {
    const found = await this.tokenRepo.findOne({
      where: {
        tokenHash: sha256(token),
        type,
        usedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
    });
    if (!found) {
      throw AuthException.INVALID_TOKEN();
    }

    // điều kiện usedAt IsNull: bấm link 2 lần cùng lúc thì chỉ 1 lần được tính
    const { affected } = await this.tokenRepo.update(
      { id: found.id, usedAt: IsNull() },
      { usedAt: new Date() },
    );
    if (!affected) {
      throw AuthException.INVALID_TOKEN();
    }

    return found.userId;
  }
}
