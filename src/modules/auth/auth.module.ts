import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../users/user.module';
import { AuthController } from './controllers/auth.controller';
import { UserSession } from './entities/user-session.entity';
import { UserToken } from './entities/user-token.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AuthService } from './services/auth.service';
import { SessionService } from './services/session.service';
import { UserTokenService } from './services/user-token.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserSession, UserToken]),
    // global: module khác dùng @UseGuards(JwtAuthGuard) không cần import lại JwtModule
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
  ],
  providers: [
    AuthService,
    SessionService,
    UserTokenService,
    JwtAuthGuard,
    RolesGuard,
  ],
  controllers: [AuthController],
  exports: [JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
