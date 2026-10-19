import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { AuthException } from '../constants/auth.response';
import { UserSession } from '../entities/user-session.entity';
import {
  JwtPayload,
  RequestContext,
  SessionTokens,
} from '../interfaces/auth.interface';
import {
  addMinutes,
  buildRefreshToken,
  parseRefreshToken,
  randomToken,
  sha256,
} from '../utils/token.util';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(UserSession)
    private readonly sessionRepo: Repository<UserSession>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // tạo phiên mới khi login / register
  async create(user: User, ctx: RequestContext): Promise<SessionTokens> {
    const secret = randomToken();
    const now = new Date();

    const session = await this.sessionRepo.save(
      this.sessionRepo.create({
        userId: user.id,
        refreshTokenHash: sha256(secret),
        userAgent: ctx.userAgent?.slice(0, 500) ?? null,
        ip: ctx.ip,
        expiresAt: this.refreshExpiresAt(now),
        lastUsedAt: now,
      }),
    );

    return this.buildTokens(user, session, secret);
  }

  // kiểm tra refresh token, trả về phiên còn hiệu lực
  // secret sai với 1 phiên có thật = token cũ bị dùng lại -> thu hồi luôn phiên đó
  async verify(rawToken?: string | null): Promise<UserSession> {
    const parsed = parseRefreshToken(rawToken);
    if (!parsed) {
      throw AuthException.INVALID_REFRESH_TOKEN();
    }

    const session = await this.sessionRepo.findOne({
      where: { id: parsed.sessionId, revokedAt: IsNull() },
    });
    if (!session || session.expiresAt <= new Date()) {
      throw AuthException.INVALID_REFRESH_TOKEN();
    }

    if (session.refreshTokenHash !== sha256(parsed.secret)) {
      await this.revoke(session.id);
      throw AuthException.INVALID_REFRESH_TOKEN();
    }

    return session;
  }

  // đổi secret của phiên, gia hạn thêm REFRESH_TOKEN_TTL_DAYS
  async rotate(
    session: UserSession,
    user: User,
    ctx: RequestContext,
  ): Promise<SessionTokens> {
    const secret = randomToken();
    const now = new Date();
    const expiresAt = this.refreshExpiresAt(now);

    // điều kiện theo hash cũ: 2 request refresh cùng lúc thì chỉ 1 cái thắng
    const { affected } = await this.sessionRepo.update(
      { id: session.id, refreshTokenHash: session.refreshTokenHash },
      {
        refreshTokenHash: sha256(secret),
        expiresAt,
        lastUsedAt: now,
        userAgent: ctx.userAgent?.slice(0, 500) ?? session.userAgent,
        ip: ctx.ip ?? session.ip,
      },
    );
    if (!affected) {
      throw AuthException.INVALID_REFRESH_TOKEN();
    }

    return this.buildTokens(user, { ...session, expiresAt }, secret);
  }

  async revoke(sessionId: string): Promise<void> {
    await this.sessionRepo.update(
      { id: sessionId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  // exceptSessionId: giữ lại phiên hiện tại (đổi mật khẩu)
  async revokeAllForUser(
    userId: string,
    exceptSessionId?: string,
  ): Promise<void> {
    await this.sessionRepo.update(
      {
        userId,
        revokedAt: IsNull(),
        ...(exceptSessionId && { id: Not(exceptSessionId) }),
      },
      { revokedAt: new Date() },
    );
  }

  // helpers
  private async buildTokens(
    user: User,
    session: Pick<UserSession, 'id' | 'expiresAt'>,
    secret: string,
  ): Promise<SessionTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      sid: session.id,
      role: user.role,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      expiresIn: this.configService.getOrThrow<number>('JWT_ACCESS_EXPIRES_IN'),
      refreshToken: buildRefreshToken(session.id, secret),
      refreshExpiresAt: session.expiresAt,
    };
  }

  private refreshExpiresAt(from: Date): Date {
    const days = this.configService.getOrThrow<number>(
      'REFRESH_TOKEN_TTL_DAYS',
    );

    return addMinutes(from, days * 24 * 60);
  }
}
