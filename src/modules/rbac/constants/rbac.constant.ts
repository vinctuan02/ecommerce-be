// tên bảng, dùng làm alias khi query
export const ROLE_ENTITY = 'roles';
export const PERMISSION_ENTITY = 'permissions';

// bảng nối N-N
export const USER_ROLE_TABLE = 'user_roles';
export const ROLE_PERMISSION_TABLE = 'role_permissions';

// metadata key của @RequirePermissions
export const PERMISSIONS_KEY = 'permissions';

// role do hệ thống tạo sẵn, không xoá được
export enum SystemRole {
  ADMIN = 'ADMIN', // luôn có đủ mọi quyền, không sửa quyền được
  CUSTOMER = 'CUSTOMER', // gán mặc định khi đăng ký
}

// mã role: chữ in hoa, số, gạch dưới (vd: STAFF, WAREHOUSE_MANAGER)
export const ROLE_CODE_PATTERN = /^[A-Z][A-Z0-9_]*$/;

// cache quyền của user trong bộ nhớ, xoá ngay khi đổi role / quyền.
// TTL để các instance khác (nếu chạy nhiều instance) cũng cập nhật sau tối đa chừng này
export const PERMISSION_CACHE_TTL_MS = 30_000;
