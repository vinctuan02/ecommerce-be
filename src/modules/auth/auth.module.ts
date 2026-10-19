import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RbacModule } from '../rbac/rbac.module';
import { UserModule } from '../users/user.module';
import { AuthController } from './controllers/auth.controller';
import { UserSession } from './entities/user-session.entity';
import { UserToken } from './entities/user-token.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './services/auth.service';
import { SessionService } from './services/session.service';
import { UserTokenService } from './services/user-token.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserSession, UserToken]),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.getOrThrow<number>('JWT_ACCESS_EXPIRES_IN'),
        },
      }),
    }),
    UserModule,
    RbacModule,
  ],
  providers: [
    AuthService,
    SessionService,
    UserTokenService,
    // guard global, chạy theo thứ tự khai báo: xác thực token rồi mới kiểm tra quyền.
    // mặc định mọi route phải đăng nhập, route công khai gắn @Public()
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
