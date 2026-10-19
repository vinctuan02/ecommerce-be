import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { CookieOptions, Request, Response } from 'express';
import { User, UserId } from '../../common/decorators/req.decorators';
import { REFRESH_TOKEN_COOKIE } from '../constants/auth.constant';
import { Public } from '../decorators/auth.decorator';
import {
  AuthResponseDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  TokenDto,
} from '../dto/auth.dto';
import type {
  AuthResult,
  JwtPayload,
  RequestContext,
} from '../interfaces/auth.interface';
import { AuthService } from '../services/auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('register')
  @ApiOkResponse({ type: AuthResponseDto })
  async register(
    @Body() data: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const result = await this.authService.register(data, this.getContext(req));
    return this.withRefreshCookie(res, result);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AuthResponseDto })
  async login(
    @Body() data: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const result = await this.authService.login(data, this.getContext(req));
    return this.withRefreshCookie(res, result);
  }

  // đọc refresh token từ cookie
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth(REFRESH_TOKEN_COOKIE)
  @ApiOkResponse({ type: AuthResponseDto })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const result = await this.authService.refresh(
      this.getRefreshToken(req),
      this.getContext(req),
    );
    return this.withRefreshCookie(res, result);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth(REFRESH_TOKEN_COOKIE)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(this.getRefreshToken(req));
    this.clearRefreshCookie(res);
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  async logoutAll(
    @UserId() userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logoutAll(userId);
    this.clearRefreshCookie(res);
  }

  @Get('me')
  async me(@UserId() userId: string) {
    return await this.authService.me(userId);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() data: TokenDto) {
    return await this.authService.verifyEmail(data.token);
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerification(@UserId() userId: string) {
    await this.authService.resendVerification(userId);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() data: ForgotPasswordDto) {
    await this.authService.forgotPassword(data.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() data: ResetPasswordDto) {
    await this.authService.resetPassword(data);
  }

  @Patch('change-password')
  async changePassword(
    @User() payload: JwtPayload,
    @Body() data: ChangePasswordDto,
  ) {
    return await this.authService.changePassword(payload, data);
  }

  // helpers
  // FE đi qua rewrite của Next nên req.ip là ip của server Next, cần trust proxy để lấy ip thật
  private getContext(req: Request): RequestContext {
    return {
      userAgent: req.headers['user-agent'] ?? null,
      ip: req.ip ?? null,
    };
  }

  private getRefreshToken(req: Request): string | undefined {
    return (req.cookies as Record<string, string> | undefined)?.[
      REFRESH_TOKEN_COOKIE
    ];
  }

  private withRefreshCookie(res: Response, result: AuthResult) {
    const { refreshToken, refreshExpiresAt, ...rest } = result;

    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      ...this.cookieOptions(),
      expires: refreshExpiresAt,
    });

    return rest;
  }

  private clearRefreshCookie(res: Response) {
    res.clearCookie(REFRESH_TOKEN_COOKIE, this.cookieOptions());
  }

  // Path=/ vì trình duyệt thấy /api/auth/... (qua rewrite), không phải /auth/...
  private cookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.configService.get<boolean>('COOKIE_SECURE', false),
      path: '/',
    };
  }
}
