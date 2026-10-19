import { createHash, randomBytes } from 'crypto';
import { TOKEN_BYTES } from '../constants/auth.constant';

// chuỗi ngẫu nhiên an toàn cho url / cookie
export function randomToken(bytes = TOKEN_BYTES): string {
  return randomBytes(bytes).toString('base64url');
}

// token đã đủ ngẫu nhiên nên dùng sha256, không cần bcrypt
export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

// refresh token dạng `${sessionId}.${secret}`
export function buildRefreshToken(sessionId: string, secret: string): string {
  return `${sessionId}.${secret}`;
}

export function parseRefreshToken(
  token?: string | null,
): { sessionId: string; secret: string } | null {
  const [sessionId, secret, ...rest] = token?.split('.') ?? [];

  if (!sessionId || !secret || rest.length) {
    return null;
  }

  return { sessionId, secret };
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}
