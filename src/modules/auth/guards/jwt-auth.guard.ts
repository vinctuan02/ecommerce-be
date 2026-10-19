import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../constants/auth.constant';
import { AuthException } from '../constants/auth.response';
import { AuthRequest, JwtPayload } from '../interfaces/auth.interface';

// verify access token ở header Authorization: Bearer <token>, gắn payload vào request.user
// không query db: user bị khoá / logout-all thì token cũ vẫn dùng được tới khi hết hạn
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthRequest>();
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    if (type !== 'Bearer' || !token) {
      throw AuthException.UNAUTHORIZED();
    }

    try {
      request.user = await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw AuthException.UNAUTHORIZED();
    }

    return true;
  }
}
