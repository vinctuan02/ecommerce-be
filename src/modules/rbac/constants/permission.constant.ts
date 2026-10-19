// Danh mục quyền, dạng `${resource}:${action}`.
// Thêm quyền mới: khai báo ở đây rồi gắn @RequirePermissions(...) ở endpoint.
// Lúc khởi động BE tự đồng bộ vào bảng permissions (xoá quyền không còn khai báo) và gán đủ cho role ADMIN.
export const PERMISSIONS = {
  USERS_READ: 'users:read',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  USERS_ASSIGN_ROLE: 'users:assign-role',

  ROLES_READ: 'roles:read',
  ROLES_CREATE: 'roles:create',
  ROLES_UPDATE: 'roles:update',
  ROLES_DELETE: 'roles:delete',

  FILES_READ: 'files:read',
  FILES_DELETE: 'files:delete',
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const PERMISSION_DESCRIPTIONS: Record<PermissionCode, string> = {
  'users:read': 'Xem danh sách, chi tiết người dùng',
  'users:create': 'Thêm người dùng',
  'users:update': 'Sửa thông tin, khoá / mở khoá người dùng',
  'users:delete': 'Xoá người dùng',
  'users:assign-role': 'Gán vai trò cho người dùng',

  'roles:read': 'Xem vai trò và quyền',
  'roles:create': 'Thêm vai trò',
  'roles:update': 'Sửa vai trò, bật / tắt quyền của vai trò',
  'roles:delete': 'Xoá vai trò',

  'files:read': 'Xem danh sách file',
  'files:delete': 'Xoá file',
};

export const PERMISSION_CODES = Object.values(PERMISSIONS);

export function splitPermission(code: PermissionCode) {
  const [resource, action] = code.split(':');
  return { resource, action };
}
