import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compare, hashSync } from 'bcryptjs';
import { PASSWORD_SALT_ROUNDS } from '../../users/constants/user.constant';
import { User } from '../../users/entities/user.entity';
import { SystemRole } from '../../rbac/constants/rbac.constant';
import { RbacService } from '../../rbac/services/rbac.service';
import { UserStatus } from '../../users/enums/user.enum';
import { UserService } from '../../users/services/user.service';
import { AuthException } from '../constants/auth.response';
import {
  ChangePasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from '../dto/auth.dto';
import { UserTokenType } from '../enums/auth.enum';
import {
  AuthResult,
  AuthUser,
  JwtPayload,
  RequestContext,
} from '../interfaces/auth.interface';
import { SessionService } from './session.service';
import { UserTokenService } from './user-token.service';

// email không tồn tại vẫn chạy bcrypt.compare với hash này,
// để thời gian phản hồi như nhau, không dò được email nào đã đăng ký
const DUMMY_PASSWORD_HASH = hashSync('dummy-password', PASSWORD_SALT_ROUNDS);

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
    private readonly userTokenService: UserTokenService,
    private readonly rbacService: RbacService,
    private readonly configService: ConfigService,
  ) {}

  // đăng ký xong thì đăng nhập luôn
  async register(data: RegisterDto, ctx: RequestContext): Promise<AuthResult> {
    const user = await this.userService.create({
      email: data.email,
      password: data.password,
      fullName: data.fullName,
    });
    await this.rbacService.assignRole(user.id, SystemRole.CUSTOMER);

    await this.sendVerifyEmail(user);

    return this.startSession(await this.userService.findOne(user.id), ctx);
  }

  async login(data: LoginDto, ctx: RequestContext): Promise<AuthResult> {
    const user = await this.userService.findByEmailWithPassword(data.email);
    const isMatch = await compare(
      data.password,
      user?.passwordHash ?? DUMMY_PASSWORD_HASH,
    );

    if (!user || !isMatch) {
      throw AuthException.INVALID_CREDENTIALS();
    }
    this.ensureActive(user);

    return this.startSession(await this.userService.findOne(user.id), ctx);
  }

  async refresh(
    refreshToken: string | undefined,
    ctx: RequestContext,
  ): Promise<AuthResult> {
    const session = await this.sessionService.verify(refreshToken);
    const user = await this.userService.findOne(session.userId);

    if (user.status !== UserStatus.ACTIVE) {
      await this.sessionService.revoke(session.id);
    }
    this.ensureActive(user);

    const tokens = await this.sessionService.rotate(session, user, ctx);

    return { ...tokens, user: await this.withPermissions(user) };
  }

  // token sai / hết hạn vẫn coi như đã đăng xuất
  async logout(refreshToken: string | undefined): Promise<void> {
    try {
      const session = await this.sessionService.verify(refreshToken);
      await this.sessionService.revoke(session.id);
    } catch {
      // bỏ qua
    }
  }

  async logoutAll(userId: string): Promise<void> {
    await this.sessionService.revokeAllForUser(userId);
  }

  async me(userId: string): Promise<AuthUser> {
    return this.withPermissions(await this.userService.findOne(userId));
  }

  async verifyEmail(token: string): Promise<User> {
    const userId = await this.userTokenService.consume(
      token,
      UserTokenType.EMAIL_VERIFY,
    );
    const user = await this.userService.findOne(userId);

    if (!user.emailVerifiedAt) {
      await this.userService.markEmailVerified(userId);
    }

    return this.userService.findOne(userId);
  }

  async resendVerification(userId: string): Promise<void> {
    const user = await this.userService.findOne(userId);

    if (user.emailVerifiedAt) {
      throw AuthException.EMAIL_ALREADY_VERIFIED();
    }

    await this.sendVerifyEmail(user);
  }

  // luôn trả về thành công, không cho biết email có tồn tại hay không
  async forgotPassword(email: string): Promise<void> {
    const user = await this.userService.findByEmailWithPassword(email);

    if (user?.status === UserStatus.ACTIVE) {
      await this.sendResetPasswordEmail(user);
    }
  }

  // đặt lại xong thì đăng xuất mọi thiết bị
  async resetPassword(data: ResetPasswordDto): Promise<void> {
    const userId = await this.userTokenService.consume(
      data.token,
      UserTokenType.PASSWORD_RESET,
    );

    await this.userService.updatePassword(userId, data.newPassword);
    await this.sessionService.revokeAllForUser(userId);
  }

  // đổi xong thì đăng xuất các thiết bị khác, giữ phiên hiện tại
  async changePassword(
    payload: JwtPayload,
    data: ChangePasswordDto,
  ): Promise<User> {
    const user = await this.userService.findOneWithPassword(payload.sub);

    if (!(await compare(data.currentPassword, user.passwordHash))) {
      throw AuthException.WRONG_CURRENT_PASSWORD();
    }
    if (data.currentPassword === data.newPassword) {
      throw AuthException.SAME_PASSWORD();
    }

    await this.userService.updatePassword(user.id, data.newPassword);
    await this.sessionService.revokeAllForUser(user.id, payload.sid);

    return this.userService.findOne(user.id);
  }

  // helpers
  private async startSession(
    user: User,
    ctx: RequestContext,
  ): Promise<AuthResult> {
    const tokens = await this.sessionService.create(user, ctx);

    return { ...tokens, user: await this.withPermissions(user) };
  }

  private async withPermissions(user: User): Promise<AuthUser> {
    return Object.assign(user, {
      permissions: await this.rbacService.getUserPermissions(user.id),
    });
  }

  private ensureActive(user: User) {
    if (user.status !== UserStatus.ACTIVE) {
      throw AuthException.ACCOUNT_BLOCKED();
    }
  }

  // TODO: chuyển sang MailService khi có module mail, tạm in link ra log
  private async sendVerifyEmail(user: User) {
    const token = await this.userTokenService.issue(
      user.id,
      UserTokenType.EMAIL_VERIFY,
    );

    this.logger.log(
      `[verify-email] ${user.email}: ${this.feUrl('/verify-email', token)}`,
    );
  }

  private async sendResetPasswordEmail(user: User) {
    const token = await this.userTokenService.issue(
      user.id,
      UserTokenType.PASSWORD_RESET,
    );

    this.logger.log(
      `[reset-password] ${user.email}: ${this.feUrl('/reset-password', token)}`,
    );
  }

  private feUrl(path: string, token: string): string {
    const url = new URL(path, this.configService.getOrThrow<string>('FE_URL'));
    url.searchParams.set('token', token);

    return url.toString();
  }
}
