import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthRequest, JwtPayload } from '../../auth/interfaces/auth.interface';

// chỉ dùng ở route đã qua JwtAuthGuard
export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<AuthRequest>();
    return request.user!.sub;
  },
);

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<AuthRequest>();
    return request.user!;
  },
);
