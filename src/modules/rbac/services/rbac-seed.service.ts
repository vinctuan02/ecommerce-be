import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, In, Repository } from 'typeorm';
import { UserService } from '../../users/services/user.service';
import {
  PERMISSION_CODES,
  PERMISSION_DESCRIPTIONS,
  splitPermission,
} from '../constants/permission.constant';
import { SystemRole } from '../constants/rbac.constant';
import { PermissionEntity } from '../entities/permission.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { Role } from '../entities/role.entity';
import { RbacService } from './rbac.service';

const SYSTEM_ROLES: Record<SystemRole, { name: string; description: string }> =
  {
    [SystemRole.ADMIN]: {
      name: 'Quản trị viên',
      description: 'Toàn quyền, tự có mọi quyền mới',
    },
    [SystemRole.CUSTOMER]: {
      name: 'Khách hàng',
      description: 'Gán mặc định khi đăng ký',
    },
  };

// chạy mỗi lần khởi động: đồng bộ danh mục quyền, tạo role hệ thống, tạo / gán tài khoản admin từ env
@Injectable()
export class RbacSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RbacSeedService.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(PermissionEntity)
    private readonly permissionRepo: Repository<PermissionEntity>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepo: Repository<RolePermission>,
    private readonly rbacService: RbacService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    await this.syncPermissions();
    await this.syncSystemRoles();
    await this.ensureAdminUser();
    this.rbacService.clearPermissionCache();
  }

  private async syncPermissions() {
    await this.permissionRepo.upsert(
      PERMISSION_CODES.map((code) => ({
        code,
        ...splitPermission(code),
        description: PERMISSION_DESCRIPTIONS[code],
      })),
      ['code'],
    );
    // quyền đã bỏ khỏi code: xoá luôn, dòng nối role_permissions bị xoá theo
    await this.permissionRepo.delete({ code: Not(In(PERMISSION_CODES)) });
  }

  private async syncSystemRoles() {
    for (const [code, info] of Object.entries(SYSTEM_ROLES)) {
      const existed = await this.roleRepo.findOne({ where: { code } });
      if (!existed) {
        await this.roleRepo.save(
          this.roleRepo.create({ code, ...info, isSystem: true }),
        );
      } else if (!existed.isSystem) {
        await this.roleRepo.update(existed.id, { isSystem: true });
      }
    }

    // ADMIN luôn có đủ quyền, kể cả quyền mới thêm
    const admin = await this.roleRepo.findOneOrFail({
      where: { code: SystemRole.ADMIN },
    });
    await this.rolePermissionRepo
      .createQueryBuilder()
      .insert()
      .values(
        PERMISSION_CODES.map((permissionCode) => ({
          roleId: admin.id,
          permissionCode,
        })),
      )
      .orIgnore()
      .execute();
  }

  // ADMIN_EMAIL: chưa có user thì tạo (cần ADMIN_PASSWORD), có rồi thì đảm bảo có role ADMIN
  private async ensureAdminUser() {
    const email = this.configService.get<string>('ADMIN_EMAIL');
    if (!email) {
      return;
    }

    let user = await this.userService.findByEmailWithPassword(email);
    if (!user) {
      const password = this.configService.get<string>('ADMIN_PASSWORD');
      if (!password) {
        this.logger.warn(
          `ADMIN_EMAIL=${email} chưa có tài khoản, cần ADMIN_PASSWORD để tạo`,
        );
        return;
      }
      user = await this.userService.create({
        email,
        password,
        fullName: 'Admin',
      });
      this.logger.log(`Đã tạo tài khoản admin ${email}`);
    }

    await this.rbacService.assignRole(user.id, SystemRole.ADMIN);
  }
}
