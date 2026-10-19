# Phân quyền (RBAC)

> Cập nhật 2026-10-19. Thay cho cột `users.role` và `@Roles(...)` trong [auth-plan.md](auth-plan.md) mục 7.

## Mô hình

```
users ──< user_roles >── roles ──< role_permissions >── permissions
```

Bảng nối khai báo thành entity riêng (không dùng `@ManyToMany`), khoá chính là cặp 2 cột, có `createdAt` (thời điểm gán):

| Entity | Bảng | Cột |
| --- | --- | --- |
| `UserRole` | `user_roles` | `userId`, `roleId` (FK `ON DELETE CASCADE`) |
| `RolePermission` | `role_permissions` | `roleId`, `permissionCode` (FK `ON DELETE CASCADE`) |

API vẫn trả `user.roles` (danh sách role) và `role.permissionCodes` (danh sách mã quyền), không trả bảng nối.

- **User N-N Role**: một user có thể có nhiều vai trò. Quyền của user là hợp quyền của mọi vai trò.
- **Role N-N Permission**: vai trò tạo / sửa / xoá trên FE (`/admin/roles`), chọn quyền ở tab Quyền trong form vai trò.
- **Permission** có dạng `resource:action` (vd `users:read`). Quyền **khai báo trong code**, không tạo qua API: quyền chỉ có nghĩa khi có endpoint dùng nó.

### Role hệ thống

Tạo sẵn lúc khởi động, không xoá được:

| Mã | Ý nghĩa |
| --- | --- |
| `ADMIN` | Luôn có đủ mọi quyền, kể cả quyền mới thêm. Không sửa quyền được. Không gỡ được ADMIN của admin cuối cùng |
| `CUSTOMER` | Gán mặc định khi đăng ký. Hiện chưa có quyền nào, sửa quyền được |

## Thêm quyền cho endpoint mới

1. Khai báo trong [permission.constant.ts](../src/modules/rbac/constants/permission.constant.ts): thêm vào `PERMISSIONS` và `PERMISSION_DESCRIPTIONS`.
2. Gắn vào endpoint:

   ```ts
   @Get()
   @RequirePermissions(PERMISSIONS.PRODUCTS_READ)
   async getList() { ... }
   ```

   Gắn nhiều quyền thì phải có **đủ tất cả**. Không gắn thì chỉ cần đăng nhập. Route công khai gắn `@Public()`.

3. Khởi động lại BE: quyền mới tự vào bảng `permissions` và gán cho `ADMIN`. Quyền đã xoá khỏi code thì bị xoá khỏi DB, các vai trò mất quyền đó.
4. FE: thêm mã quyền vào `PERMISSIONS` trong `ecommerce-fe/src/features/rbac/types.ts` nếu cần ẩn / hiện chức năng, và tên resource vào `RESOURCE_LABELS`.

## Kiểm tra quyền

- `JwtAuthGuard` và `PermissionsGuard` đăng ký global (`APP_GUARD` trong `AuthModule`), chạy theo thứ tự đó.
- Quyền **không nằm trong JWT**: guard đọc từ DB, có cache trong bộ nhớ 30 giây, xoá ngay khi đổi quyền của vai trò / vai trò của user. Bật / tắt quyền có hiệu lực ngay, không chờ token hết hạn.
- Chạy nhiều instance BE thì instance khác cập nhật chậm tối đa 30 giây (`PERMISSION_CACHE_TTL_MS`).
- `GET /auth/me`, login, refresh trả kèm `user.permissions` để FE ẩn / hiện menu và nút. FE chỉ ẩn cho gọn, BE vẫn chặn ở từng endpoint.

## Quyền hiện có

| Endpoint | Quyền |
| --- | --- |
| `GET /users`, `GET /users/:id` | `users:read` |
| `POST /users` | `users:create` |
| `PATCH /users/:id` | `users:update` |
| `DELETE /users/:id` | `users:delete` |
| `PUT /users/:id/roles` | `users:assign-role` |
| `GET /roles`, `GET /roles/:id`, `GET /permissions` | `roles:read` |
| `POST /roles` | `roles:create` |
| `PATCH /roles/:id` (có `permissionCodes` thì thay toàn bộ quyền) | `roles:update` |
| `DELETE /roles/:id` | `roles:delete` |
| `GET /bucket`, `GET /bucket/:id`, `GET /bucket/files`, `GET /bucket/files/:id` | `files:read` |
| `DELETE /bucket/:id`, `DELETE /bucket/files/:id` | `files:delete` |
| Upload (`POST /bucket*`), lấy URL đọc / tải (`/bucket/:id/read`, `/download`) | chỉ cần đăng nhập (khách cần upload avatar) |
| `/auth/*` | xem `auth.controller.ts` |

## Tài khoản admin đầu tiên

Đặt trong `.env`:

```
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=...
```

Lúc khởi động: email chưa có tài khoản thì tạo (cần `ADMIN_PASSWORD`), có rồi thì gán thêm `ADMIN`. Dùng được để lấy lại quyền nếu lỡ khoá hết admin.

## Việc còn lại

- Chuyển `DB_SYNCHRONIZE` sang migration trước khi lên production. Lần đổi này bỏ cột `users.role`, synchronize xoá luôn dữ liệu cột đó.
- Xoá user / khoá user chưa chặn trường hợp đó là admin cuối cùng.
- Nhật ký thao tác (BR 2.10) chưa làm.
