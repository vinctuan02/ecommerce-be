import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../auth/constants/auth.constant';
import { AuthException } from '../../auth/constants/auth.response';
import { AuthRequest } from '../../auth/interfaces/auth.interface';
import type { PermissionCode } from '../constants/permission.constant';
import { PERMISSIONS_KEY } from '../constants/rbac.constant';
import { RbacService } from '../services/rbac.service';

// chạy sau JwtAuthGuard, so quyền của user (lấy từ db, có cache) với @RequirePermissions(...)
// không đọc quyền từ token nên bật / tắt quyền có hiệu lực ngay
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rbacService: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];

    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets)) {
      return true;
    }

    const required = this.reflector.getAllAndOverride<PermissionCode[]>(
      PERMISSIONS_KEY,
      targets,
    );
    if (!required?.length) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<AuthRequest>();
    if (!user) {
      throw AuthException.UNAUTHORIZED();
    }

    const owned = await this.rbacService.getUserPermissionSet(user.sub);
    if (!required.every((permission) => owned.has(permission))) {
      throw AuthException.FORBIDDEN();
    }

    return true;
  }
}
