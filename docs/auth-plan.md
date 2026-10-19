# Plan module `auth`

> Cập nhật 2026-10-13. Phạm vi lấy từ [business-requirements.md](business-requirements.md) mục 1.1, 1.8 (đổi mật khẩu), 2.10 (vai trò).

Module dùng JWT access token ngắn hạn (15 phút, gửi qua header `Authorization: Bearer`) và refresh token dài hạn (30 ngày, nằm trong cookie httpOnly). Refresh token được lưu dạng hash trong bảng `user_sessions`, nên có thể đăng xuất từng thiết bị hoặc tất cả. FE gọi BE qua rewrite `/api/*` của Next, cùng origin, nên cookie `SameSite=Lax` chạy được mà không cần bật CORS.

Đăng nhập Google để sang giai đoạn sau (mục 9).

## 1. Danh sách chức năng

Cột "API" trỏ tới số thứ tự trong bảng API ở mục 5.

### Người dùng (khách, staff, admin dùng chung)

| # | Chức năng | Mô tả | API | Đợt |
| --- | --- | --- | --- | --- |
| F1 | Đăng ký | Đăng ký bằng email + mật khẩu, họ tên tuỳ chọn. Đăng ký xong thì đăng nhập luôn và nhận email xác thực | 1 | MVP |
| F2 | Xác thực email | Bấm link trong email (hạn 24 giờ) để xác thực tài khoản | 7 | MVP |
| F3 | Gửi lại email xác thực | Khi link cũ hết hạn hoặc chưa nhận được mail. Gửi lại thì link cũ hết hiệu lực | 8 | MVP |
| F4 | Đăng nhập | Đăng nhập bằng email + mật khẩu. Sai thì chỉ báo chung "sai email hoặc mật khẩu" | 2 | MVP |
| F5 | Giữ đăng nhập | Tự gia hạn phiên ngầm, không phải đăng nhập lại trong 30 ngày nếu vẫn dùng | 3 | MVP |
| F6 | Xem tài khoản đang đăng nhập | Lấy thông tin user hiện tại (tên, email, vai trò, avatar, đã xác thực chưa) | 6 | MVP |
| F7 | Quên mật khẩu | Nhập email để nhận link đặt lại mật khẩu (hạn 30 phút). Luôn báo "đã gửi" kể cả khi email không tồn tại | 9 | MVP |
| F8 | Đặt lại mật khẩu | Đặt mật khẩu mới bằng link trong email. Xong thì đăng xuất mọi thiết bị | 10 | MVP |
| F9 | Đổi mật khẩu | Khi đang đăng nhập, nhập mật khẩu cũ + mới. Xong thì đăng xuất các thiết bị khác, giữ thiết bị hiện tại | 11 | MVP |
| F10 | Đăng xuất | Đăng xuất thiết bị đang dùng | 4 | MVP |
| F11 | Đăng xuất mọi thiết bị | Thu hồi tất cả phiên đăng nhập của tài khoản | 5 | MVP |
| F12 | Đăng nhập bằng Google | Tự liên kết nếu email đã có tài khoản, chưa có thì tạo mới (coi như đã xác thực email) | — | Sau MVP |
| F13 | Xem thiết bị đang đăng nhập | Danh sách phiên (trình duyệt, IP, lần dùng cuối), đăng xuất từng phiên | — | Sau MVP |

### Phân quyền

| # | Chức năng | Mô tả | Đợt |
| --- | --- | --- | --- |
| F14 | Vai trò | Mỗi tài khoản có 1 vai trò: `CUSTOMER`, `STAFF`, `ADMIN` | MVP |
| F15 | Chặn route theo đăng nhập / vai trò | Mặc định mọi API phải đăng nhập; route công khai đánh dấu `@Public()`, route quản trị đánh dấu `@Roles(...)` | MVP |
| F16 | Đăng nhập trang admin | Dùng chung API login; FE admin không cho vào nếu vai trò là `CUSTOMER` | MVP |
| F17 | Tài khoản bị khoá | User `BLOCKED` không đăng nhập và không gia hạn phiên được (việc khoá/mở khoá nằm ở module `users`) | MVP |
| F18 | Tài khoản admin đầu tiên | Seed sẵn 1 admin để vào được trang quản trị sau khi bật guard | MVP |
| F19 | Quyền chi tiết theo vai trò | Tạo vai trò, gán quyền (vd: được hoàn tiền) — thuộc module `roles` | Sau MVP |

### Hệ thống và bảo mật

| # | Chức năng | Mô tả | Đợt |
| --- | --- | --- | --- |
| F20 | Gửi email | Mail xác thực và mail đặt lại mật khẩu; gửi lỗi thì ghi log, không làm hỏng request | MVP |
| F21 | Giới hạn số lần gọi | Login, quên mật khẩu, gửi lại email xác thực: ví dụ 5 lần/phút/IP | MVP |
| F22 | Phát hiện token bị dùng lại | Refresh token cũ bị dùng lại (có thể do lộ) thì thu hồi phiên đó | MVP |
| F23 | Không lộ email tồn tại | Login và quên mật khẩu không cho biết email có trong hệ thống hay không | MVP |

## 2. Thư viện cần thêm

| Package | Dùng cho |
| --- | --- |
| `@nestjs/jwt` | Ký và verify access token. Không dùng passport, tự viết guard cho gọn |
| `cookie-parser` + `@types/cookie-parser` | Đọc cookie refresh token |
| `@nestjs/throttler` | Giới hạn số lần gọi login, forgot-password, resend |
| `nodemailer` + `@types/nodemailer` | Gửi mail (module `mail`) |

`bcryptjs` đã có sẵn. Token ngẫu nhiên tạo bằng `crypto.randomBytes`, hash bằng `sha256`: token đủ dài nên không cần bcrypt.

## 3. Cấu trúc thư mục

```
src/modules/auth/
  auth.module.ts
  controllers/auth.controller.ts
  services/
    auth.service.ts          # luồng nghiệp vụ: register, login, refresh, reset...
    session.service.ts       # tạo / xoay / thu hồi phiên, ký access token
    user-token.service.ts    # token 1 lần: xác thực email, reset mật khẩu
  entities/
    user-session.entity.ts
    user-token.entity.ts
  dto/auth.dto.ts
  guards/
    jwt-auth.guard.ts        # đăng ký global (APP_GUARD)
    roles.guard.ts           # đăng ký global, chạy sau jwt-auth
  decorators/auth.decorator.ts  # @Public(), @Roles(UserRole.ADMIN, ...)
  constants/
    auth.constant.ts         # tên bảng, TTL, tên cookie
    auth.response.ts         # AuthException
  enums/auth.enum.ts         # UserTokenType
  interfaces/auth.interface.ts # JwtPayload, AuthRequest, RequestContext, AuthResult
  utils/token.util.ts        # randomToken(), sha256()

src/modules/mail/
  mail.module.ts
  services/mail.service.ts
  templates/                 # verify-email, reset-password
```

## 4. Dữ liệu

### Sửa bảng `users`

| Cột | Kiểu | Ghi chú |
| --- | --- | --- |
| `role` | varchar(20), default `CUSTOMER` | Enum `UserRole`: `CUSTOMER`, `STAFF`, `ADMIN`. Phân quyền chi tiết theo permission để sang module `roles` |

`emailVerifiedAt` và `status` (`ACTIVE`/`BLOCKED`) đã có sẵn.

### Bảng mới `user_sessions`

Mỗi dòng là một thiết bị đang đăng nhập.

| Cột | Kiểu | Ghi chú |
| --- | --- | --- |
| `id` | uuid | Kế thừa `BaseUUIDEntity` |
| `userId` | uuid, FK `users`, `onDelete: CASCADE` | |
| `refreshTokenHash` | varchar(64) | sha256 của phần bí mật trong token, đổi mỗi lần refresh |
| `userAgent` | varchar(500), null | Hiển thị danh sách thiết bị sau này |
| `ip` | varchar(45), null | |
| `expiresAt` | timestamptz | Bằng `now + 30 ngày`, gia hạn mỗi lần refresh |
| `lastUsedAt` | timestamptz | |
| `revokedAt` | timestamptz, null | Khác null là phiên đã bị thu hồi |

Refresh token có dạng `<sessionId>.<secret>`. Khi refresh, BE tìm phiên theo `sessionId` rồi so `sha256(secret)` với `refreshTokenHash`:

- Khớp: sinh secret mới, cập nhật hash (xoay token).
- Không khớp: đây là token cũ bị dùng lại, có thể do lộ token. Thu hồi luôn phiên đó và trả 401.

### Bảng mới `user_tokens`

Token dùng 1 lần, gửi qua email.

| Cột | Kiểu | Ghi chú |
| --- | --- | --- |
| `id` | uuid | |
| `userId` | uuid, FK `users`, `onDelete: CASCADE` | |
| `type` | varchar(30) | Enum `UserTokenType`: `EMAIL_VERIFY`, `PASSWORD_RESET` |
| `tokenHash` | varchar(64), unique | |
| `expiresAt` | timestamptz | `EMAIL_VERIFY`: 24 giờ, `PASSWORD_RESET`: 30 phút |
| `usedAt` | timestamptz, null | |

Mỗi lần phát token mới, xoá các token chưa dùng cùng `userId` + `type`, để link cũ hết hiệu lực.

## 5. API

Tất cả response vẫn được `ResponseInterceptor` bọc thành `{ statusCode, message, messageCode, data }`. Bảng dưới chỉ ghi phần `data`.

| # | Method + path | Auth | Input | Output (`data`) |
| --- | --- | --- | --- | --- |
| 1 | `POST /auth/register` | Public | `RegisterDto` | `AuthResponse` + set cookie |
| 2 | `POST /auth/login` | Public | `LoginDto` | `AuthResponse` + set cookie |
| 3 | `POST /auth/refresh` | Cookie | (cookie `refresh_token`) | `AuthResponse` + set cookie mới |
| 4 | `POST /auth/logout` | Cookie | (cookie `refresh_token`) | không có, xoá cookie |
| 5 | `POST /auth/logout-all` | Bearer | | không có, xoá cookie |
| 6 | `GET /auth/me` | Bearer | | `AuthUser` |
| 7 | `POST /auth/verify-email` | Public | `TokenDto` | `AuthUser` |
| 8 | `POST /auth/resend-verification` | Bearer | | không có |
| 9 | `POST /auth/forgot-password` | Public | `ForgotPasswordDto` | không có, luôn trả 200 |
| 10 | `POST /auth/reset-password` | Public | `ResetPasswordDto` | không có |
| 11 | `PATCH /auth/change-password` | Bearer | `ChangePasswordDto` | `AuthUser` (phiên hiện tại giữ nguyên) |

### DTO input

Validate theo cách `CreateUserDto` đang làm: email `trim().toLowerCase()`, mật khẩu 8–72 ký tự (`PASSWORD_MIN_LENGTH`/`PASSWORD_MAX_LENGTH`).

```ts
class RegisterDto {
  email: string;           // IsEmail, MaxLength 255
  password: string;        // 8–72
  fullName?: string;       // MaxLength 255
}

class LoginDto {
  email: string;
  password: string;        // chỉ check IsString + MaxLength 72, không check độ dài tối thiểu
}

class TokenDto {
  token: string;           // lấy từ link trong email
}

class ForgotPasswordDto {
  email: string;
}

class ResetPasswordDto {
  token: string;
  newPassword: string;     // 8–72
}

class ChangePasswordDto {
  currentPassword: string;
  newPassword: string;     // 8–72, phải khác currentPassword
}
```

### Output

```ts
class AuthUser {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerifiedAt: Date | null;
  avatar: FileEntity | null;   // kèm urlRead, giống GET /users/:id
}

class AuthResponse {
  accessToken: string;
  expiresIn: number;           // giây, 900
  user: AuthUser;
}

// payload của access token, gắn vào request.user
interface JwtPayload {
  sub: string;                 // user id, @UserId() đang đọc field này
  sid: string;                 // session id
  role: UserRole;
}
```

Cookie refresh: `refresh_token=<sessionId>.<secret>; HttpOnly; SameSite=Lax; Path=/; Max-Age=30 ngày`, thêm `Secure` khi `COOKIE_SECURE=true`. Để `Path=/` vì trình duyệt thấy đường dẫn `/api/auth/...` (qua rewrite) chứ không phải `/auth/...` như BE thấy, nên đặt `Path=/auth` thì trình duyệt sẽ không gửi cookie.

### Lỗi (`AuthException` trong `auth.response.ts`)

| Hàm | HTTP | `messageCode` | Khi nào |
| --- | --- | --- | --- |
| `INVALID_CREDENTIALS` | 401 | `auth.error.invalidCredentials` | Sai email hoặc mật khẩu (không nói rõ cái nào sai) |
| `ACCOUNT_BLOCKED` | 403 | `auth.error.accountBlocked` | `status = BLOCKED`, áp dụng cả cho login lẫn refresh |
| `UNAUTHORIZED` | 401 | `auth.error.unauthorized` | Thiếu, sai hoặc hết hạn access token |
| `INVALID_REFRESH_TOKEN` | 401 | `auth.error.invalidRefreshToken` | Cookie thiếu/sai, phiên hết hạn hoặc đã thu hồi, token bị dùng lại |
| `FORBIDDEN` | 403 | `auth.error.forbidden` | Không đủ role |
| `INVALID_TOKEN` | 400 | `auth.error.invalidToken` | Token email sai, hết hạn hoặc đã dùng |
| `EMAIL_ALREADY_VERIFIED` | 400 | `auth.error.emailAlreadyVerified` | Resend khi đã xác thực rồi |
| `WRONG_CURRENT_PASSWORD` | 400 | `auth.error.wrongCurrentPassword` | Đổi mật khẩu, sai mật khẩu cũ |
| `SAME_PASSWORD` | 400 | `auth.error.samePassword` | Đổi mật khẩu, mới trùng cũ |
| (throttler) | 429 | `auth.error.tooManyRequests` | Vượt giới hạn gọi |

Register trùng email dùng lại `UserException.EMAIL_EXISTED` (409).

## 6. Service

### `AuthService`

| Hàm | Làm gì |
| --- | --- |
| `register(dto, ctx)` | Gọi `UserService.create` với role `CUSTOMER` → phát token `EMAIL_VERIFY` và gửi mail → tạo phiên → trả `AuthResponse` |
| `login(dto, ctx)` | `UserService.findByEmailWithPassword` → `bcrypt.compare` (nếu không tìm thấy user vẫn so với một hash giả, để thời gian trả về như nhau) → check `BLOCKED` → tạo phiên |
| `refresh(rawToken, ctx)` | `SessionService.rotate` → check user còn `ACTIVE` → ký access token mới |
| `logout(rawToken)` | `SessionService.revoke` theo `sessionId`. Token sai thì vẫn trả 200 |
| `logoutAll(userId)` | `SessionService.revokeAllForUser` |
| `me(userId)` | `UserService.findOne` |
| `verifyEmail(token)` | `UserTokenService.consume(token, EMAIL_VERIFY)` → `UserService.markEmailVerified` |
| `resendVerification(userId)` | Đã xác thực thì báo lỗi; chưa thì phát token mới và gửi mail |
| `forgotPassword(email)` | Có user `ACTIVE` thì phát token `PASSWORD_RESET` và gửi mail; không có thì không làm gì. Luôn trả 200 |
| `resetPassword(dto)` | `consume(token, PASSWORD_RESET)` → `UserService.updatePassword` → thu hồi toàn bộ phiên |
| `changePassword(payload, dto)` | So mật khẩu cũ, mới phải khác cũ → cập nhật → thu hồi mọi phiên **trừ** phiên hiện tại (`payload.sid`) |

`ctx = { userAgent, ip }` lấy từ request trong controller.

### `SessionService`

| Hàm | Làm gì |
| --- | --- |
| `create(user, ctx)` | Tạo dòng `user_sessions` → trả `{ refreshToken, accessToken, expiresIn }` |
| `verify(rawToken)` | Tách `sessionId.secret` → kiểm tra hạn và trạng thái thu hồi → so hash; sai thì thu hồi phiên |
| `rotate(session, user, ctx)` | Sinh secret mới, gia hạn `expiresAt`. Update có điều kiện theo hash cũ, 2 request cùng lúc thì chỉ 1 cái thắng |
| `revoke(sessionId)` | Đặt `revokedAt = now` |
| `revokeAllForUser(userId, exceptSessionId?)` | Thu hồi hàng loạt |

### `UserTokenService`

| Hàm | Làm gì |
| --- | --- |
| `issue(userId, type)` | Xoá token cũ cùng loại → tạo token mới → trả raw token để ghép vào link |
| `consume(rawToken, type)` | Tìm theo hash + type, còn hạn, `usedAt` null → đặt `usedAt` → trả `userId`. Không hợp lệ thì `INVALID_TOKEN` |

### `MailService` (module `mail`)

- `sendVerifyEmail(user, token)`: gửi link `${FE_URL}/verify-email?token=...`
- `sendResetPassword(user, token)`: gửi link `${FE_URL}/reset-password?token=...`

Khi dev, thêm container [Mailpit](https://github.com/axllent/mailpit) vào `docker-compose.yml` (SMTP 1025, giao diện web 8025) để xem mail mà không gửi ra ngoài. Lỗi gửi mail chỉ ghi log, không làm hỏng request register/forgot.

### Bổ sung `UserService`

- `findByEmailWithPassword(email)`: query `addSelect('users.passwordHash')`, vì cột này đang để `select: false`.
- `markEmailVerified(id)`
- `updatePassword(id, newPassword)`: hash bằng `PASSWORD_SALT_ROUNDS`.

`AuthModule` import `UserModule` (đã export `UserService`) và `MailModule`.

## 7. Guard và decorator

- **`JwtAuthGuard` (global):** route có `@Public()` thì cho qua. Còn lại đọc `Authorization: Bearer`, verify, rồi gán `request.user = JwtPayload`. Guard không query DB, nên khi user bị khoá hoặc logout-all, access token cũ vẫn dùng được tối đa 15 phút. Mức này chấp nhận được; refresh sẽ bị chặn ngay.
- **`RolesGuard` (global):** route không có `@Roles()` thì chỉ cần đăng nhập. Có thì so `request.user.role`.
- Sửa `UserId` / `User` trong `common/decorators/req.decorators.ts` để trả đúng kiểu `JwtPayload`. Hiện `User` đang khai báo trả `string`.
- Khi bật guard global, cần gắn `@Public()` cho `GET /` của `AppController`, gắn `@Roles(ADMIN, STAFF)` cho `UserController`, và quyết định quyền cho `/bucket` (mục 10).
- `swagger.config.ts`: thêm `addBearerAuth()` để thử API có token ngay trên Swagger.

## 8. Biến môi trường mới

Thêm vào `env.validation.schema.ts` và `.env.example`:

| Biến | Mặc định | Ghi chú |
| --- | --- | --- |
| `JWT_ACCESS_SECRET` | (bắt buộc) | Chuỗi ngẫu nhiên ≥ 32 ký tự |
| `JWT_ACCESS_EXPIRES_IN` | `900` | Giây |
| `REFRESH_TOKEN_TTL_DAYS` | `30` | |
| `COOKIE_SECURE` | `false` | `true` ở production |
| `FE_URL` | `http://localhost:3000` | Ghép link trong email |
| `EMAIL_VERIFY_TTL_HOURS` | `24` | |
| `PASSWORD_RESET_TTL_MINUTES` | `30` | |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM` | `localhost`, `1025`, rỗng, rỗng, `no-reply@localhost` | Mặc định trỏ vào Mailpit |

## 9. Thứ tự làm

1. Thêm `role` vào `User`, enum `UserRole`, tạo 2 entity mới. Nếu đã chuyển sang migration thì viết migration ở bước này.
2. `token.util.ts`, `UserTokenService`, `SessionService`.
3. `AuthService` + `AuthController` cho register, login, refresh, logout, me. Test bằng Swagger.
4. `JwtAuthGuard`, `RolesGuard`, `@Public`, `@Roles`, bật global, gắn decorator cho các controller đang có.
5. Module `mail` + Mailpit, rồi đến verify-email, resend, forgot, reset.
6. change-password, logout-all, throttler cho login / forgot / resend (ví dụ 5 lần/phút/IP).
7. Seed 1 tài khoản admin (script hoặc migration), để vào được trang admin sau khi bật guard.
8. FE: trang đăng nhập; axios interceptor gắn Bearer token và tự gọi `/auth/refresh` khi gặp 401.
9. Sau MVP: `POST /auth/google { idToken }`, verify bằng `google-auth-library`. Nếu email đã tồn tại thì liên kết vào tài khoản đó, chưa có thì tạo mới với `emailVerifiedAt = now`.

## 10. Cần chốt

Cột "Đề xuất" là mặc định đang dùng trong plan này.

| Câu hỏi | Đề xuất |
| --- | --- |
| Chưa xác thực email có được đăng nhập không? | Được đăng nhập, nhưng chặn đặt hàng cho tới khi xác thực (check ở module `orders`) |
| Register xong có tự đăng nhập luôn không? | Có, trả `AuthResponse` giống login |
| Staff/admin có dùng chung bảng `users` và trang login với khách không? | Dùng chung, phân biệt bằng `role`. FE admin chặn nếu role là `CUSTOMER` |
| `/bucket` ai được gọi? | Upload: mọi user đã đăng nhập (khách cần upload avatar). Liệt kê / xoá: chỉ admin/staff |
| Gộp giỏ guest khi login (BR 1.5) | Để module `cart` lo: FE gọi `POST /cart/merge` ngay sau khi login, auth không xử lý việc này |
