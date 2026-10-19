import { Request } from 'express';
import { User } from '../../users/entities/user.entity';

// payload của access token, guard gắn vào request.user
export interface JwtPayload {
  sub: string; // user id
  sid: string; // session id
}

export type AuthRequest = Request & { user?: JwtPayload };

// thông tin thiết bị lấy từ request, lưu vào user_sessions
export interface RequestContext {
  userAgent: string | null;
  ip: string | null;
}

// kết quả tạo / xoay phiên
export interface SessionTokens {
  accessToken: string;
  expiresIn: number; // giây
  refreshToken: string; // `${sessionId}.${secret}`
  refreshExpiresAt: Date;
}

// kết quả login / register / refresh, controller tách refreshToken ra cookie
export interface AuthResult extends SessionTokens {
  user: AuthUser;
}

// user đang đăng nhập kèm danh sách quyền, FE dùng để ẩn / hiện chức năng
export type AuthUser = User & { permissions: string[] };
