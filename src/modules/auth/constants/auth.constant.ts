import { UserTokenType } from '../enums/auth.enum';

// tên bảng
export const USER_SESSION_ENTITY = 'user_sessions';
export const USER_TOKEN_ENTITY = 'user_tokens';

// cookie chứa refresh token, Path=/ vì FE gọi qua rewrite /api/*
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

// metadata key cho decorator
export const IS_PUBLIC_KEY = 'isPublic';
export const ROLES_KEY = 'roles';

// số byte ngẫu nhiên của refresh token / token gửi qua email
export const TOKEN_BYTES = 32;

// thời hạn token gửi qua email (phút)
export const UserTokenTtlMinutes: Record<UserTokenType, number> = {
  [UserTokenType.EMAIL_VERIFY]: 24 * 60,
  [UserTokenType.PASSWORD_RESET]: 30,
};
