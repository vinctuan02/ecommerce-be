import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/enums/user.enum';
import { ROLES_KEY } from '../constants/auth.constant';
import { AuthException } from '../constants/auth.response';
import { AuthRequest } from '../interfaces/auth.interface';

// chạy sau JwtAuthGuard, so request.user.role với @Roles(...)
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles?.length) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<AuthRequest>();

    if (!user) {
      throw AuthException.UNAUTHORIZED();
    }
    if (!roles.includes(user.role)) {
      throw AuthException.FORBIDDEN();
    }

    return true;
  }
}
