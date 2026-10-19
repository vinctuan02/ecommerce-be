import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../users/user.module';
import { PermissionController } from './controllers/permission.controller';
import { RoleController } from './controllers/role.controller';
import { UserRoleController } from './controllers/user-role.controller';
import { PermissionEntity } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { Role } from './entities/role.entity';
import { UserRole } from './entities/user-role.entity';
import { PermissionsGuard } from './guards/permissions.guard';
import { RbacSeedService } from './services/rbac-seed.service';
import { RbacService } from './services/rbac.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Role,
      PermissionEntity,
      RolePermission,
      UserRole,
    ]),
    UserModule,
  ],
  providers: [RbacService, RbacSeedService, PermissionsGuard],
  controllers: [RoleController, PermissionController, UserRoleController],
  exports: [RbacService, PermissionsGuard],
})
export class RbacModule {}
