import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiForbiddenResponse } from '@nestjs/swagger';
import type { PermissionCode } from '../constants/permission.constant';
import { PERMISSIONS_KEY } from '../constants/rbac.constant';

// route cần đủ tất cả các quyền này, không gắn thì chỉ cần đăng nhập
export const RequirePermissions = (...permissions: PermissionCode[]) =>
  applyDecorators(
    SetMetadata(PERMISSIONS_KEY, permissions),
    ApiForbiddenResponse({
      description: `Cần quyền: ${permissions.join(', ')}`,
    }),
  );
