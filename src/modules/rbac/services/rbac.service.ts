import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Not, Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { UserService } from '../../users/services/user.service';
import {
  PERMISSION_CACHE_TTL_MS,
  ROLE_ENTITY,
  ROLE_PERMISSION_TABLE,
  SystemRole,
  USER_ROLE_TABLE,
} from '../constants/rbac.constant';
import { RbacException } from '../constants/rbac.response';
import { CreateRoleDto, SetUserRolesDto, UpdateRoleDto } from '../dto/rbac.dto';
import { PermissionEntity } from '../entities/permission.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { Role } from '../entities/role.entity';
import { UserRole } from '../entities/user-role.entity';

// role trả về API: thay bảng nối rolePermissions bằng danh sách mã quyền
export type RoleDetail = Omit<Role, 'rolePermissions' | 'userRoles'> & {
  permissionCodes: string[];
  userCount: number;
};

@Injectable()
export class RbacService {
  // userId -> quyền, guard gọi mỗi request nên cache lại
  private readonly permissionCache = new Map<
    string,
    { codes: Set<string>; expiresAt: number }
  >();

  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(PermissionEntity)
    private readonly permissionRepo: Repository<PermissionEntity>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepo: Repository<RolePermission>,
    @InjectRepository(UserRole)
    private readonly userRoleRepo: Repository<UserRole>,
    private readonly userService: UserService,
  ) {}

  // permission
  async getPermissions(): Promise<PermissionEntity[]> {
    return this.permissionRepo.find({
      order: { resource: 'ASC', code: 'ASC' },
    });
  }

  // role: create
  async createRole(data: CreateRoleDto): Promise<RoleDetail> {
    const { permissionCodes = [], ...rest } = data;

    if (await this.roleRepo.exists({ where: { code: rest.code } })) {
      throw RbacException.ROLE_CODE_EXISTED();
    }

    const id = await this.roleRepo.manager.transaction(async (manager) => {
      const role = await manager.save(manager.create(Role, rest));
      await this.replaceRolePermissions(manager, role.id, permissionCodes);
      return role.id;
    });

    return this.findRole(id);
  }

  // role: read
  async getRoles(): Promise<RoleDetail[]> {
    const roles = await this.roleQuery()
      .orderBy(`${ROLE_ENTITY}.isSystem`, 'DESC')
      .addOrderBy(`${ROLE_ENTITY}.createdAt`, 'ASC')
      .getMany();

    return roles.map((role) => this.toDetail(role));
  }

  async findRole(id: string): Promise<RoleDetail> {
    const role = await this.roleQuery()
      .where(`${ROLE_ENTITY}.id = :id`, { id })
      .getOne();

    if (!role) {
      throw RbacException.ROLE_NOT_FOUND();
    }

    return this.toDetail(role);
  }

  async findRoleByCode(code: string): Promise<Role | null> {
    return this.roleRepo.findOne({ where: { code } });
  }

  // role: update. Có permissionCodes thì thay toàn bộ quyền, ADMIN luôn đủ quyền nên không cho sửa
  async updateRole(id: string, data: UpdateRoleDto): Promise<RoleDetail> {
    const { permissionCodes, ...rest } = data;
    const role = await this.findRole(id);

    if (permissionCodes && role.code === (SystemRole.ADMIN as string)) {
      throw RbacException.SYSTEM_ROLE_LOCKED();
    }

    await this.roleRepo.manager.transaction(async (manager) => {
      if (Object.keys(rest).length) {
        await manager.update(Role, id, rest);
      }
      if (permissionCodes) {
        await this.replaceRolePermissions(manager, id, permissionCodes);
      }
    });
    if (permissionCodes) {
      this.clearPermissionCache();
    }

    return this.findRole(id);
  }

  // role: delete, dòng nối user_roles / role_permissions bị xoá theo
  async deleteRole(id: string): Promise<void> {
    const role = await this.findRole(id);

    if (role.isSystem) {
      throw RbacException.SYSTEM_ROLE_LOCKED();
    }

    await this.roleRepo.delete(id);
    this.clearPermissionCache();
  }

  // user - role: thay toàn bộ role của user
  async setUserRoles(userId: string, data: SetUserRolesDto): Promise<User> {
    const { roleIds } = data;
    const user = await this.userService.findOne(userId);
    const roleCount = await this.roleRepo.countBy({ id: In(roleIds) });

    if (roleCount !== roleIds.length) {
      throw RbacException.ROLE_NOT_FOUND();
    }

    // không gỡ ADMIN của admin cuối cùng, tránh không ai vào được trang quản trị
    const removedAdmin = user.roles?.some(
      (role) =>
        role.code === (SystemRole.ADMIN as string) &&
        !roleIds.includes(role.id),
    );
    if (removedAdmin) {
      await this.ensureNotLastAdmin();
    }

    await this.userRoleRepo.manager.transaction(async (manager) => {
      await manager.delete(UserRole, {
        userId,
        ...(roleIds.length && { roleId: Not(In(roleIds)) }),
      });
      if (roleIds.length) {
        await manager
          .createQueryBuilder()
          .insert()
          .into(UserRole)
          .values(roleIds.map((roleId) => ({ userId, roleId })))
          .orIgnore()
          .execute();
      }
    });
    this.permissionCache.delete(userId);

    return this.userService.findOne(userId);
  }

  // gán thêm 1 role theo code (đăng ký, seed admin), đã có thì bỏ qua
  async assignRole(userId: string, code: SystemRole): Promise<void> {
    const role = await this.findRoleByCode(code);
    if (!role) {
      throw RbacException.ROLE_NOT_FOUND();
    }

    await this.userRoleRepo
      .createQueryBuilder()
      .insert()
      .values({ userId, roleId: role.id })
      .orIgnore()
      .execute();
    this.permissionCache.delete(userId);
  }

  // quyền của user = hợp quyền của mọi role user có
  async getUserPermissions(userId: string): Promise<string[]> {
    return [...(await this.getUserPermissionSet(userId))];
  }

  async getUserPermissionSet(userId: string): Promise<Set<string>> {
    const cached = this.permissionCache.get(userId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.codes;
    }

    const rows = await this.rolePermissionRepo
      .createQueryBuilder(ROLE_PERMISSION_TABLE)
      .select(`DISTINCT ${ROLE_PERMISSION_TABLE}.permissionCode`, 'code')
      .innerJoin(
        UserRole,
        USER_ROLE_TABLE,
        `${USER_ROLE_TABLE}.roleId = ${ROLE_PERMISSION_TABLE}.roleId`,
      )
      .where(`${USER_ROLE_TABLE}.userId = :userId`, { userId })
      .getRawMany<{ code: string }>();

    const codes = new Set(rows.map((row) => row.code));
    this.permissionCache.set(userId, {
      codes,
      expiresAt: Date.now() + PERMISSION_CACHE_TTL_MS,
    });

    return codes;
  }

  clearPermissionCache() {
    this.permissionCache.clear();
  }

  // xoá hết quyền cũ rồi ghi lại theo danh sách mới
  async replaceRolePermissions(
    manager: EntityManager,
    roleId: string,
    permissionCodes: string[],
  ): Promise<void> {
    await manager.delete(RolePermission, { roleId });
    if (permissionCodes.length) {
      await manager.insert(
        RolePermission,
        permissionCodes.map((permissionCode) => ({ roleId, permissionCode })),
      );
    }
  }

  // helpers
  private roleQuery() {
    return this.roleRepo
      .createQueryBuilder(ROLE_ENTITY)
      .leftJoinAndSelect(
        `${ROLE_ENTITY}.rolePermissions`,
        ROLE_PERMISSION_TABLE,
      )
      .loadRelationCountAndMap(
        `${ROLE_ENTITY}.userCount`,
        `${ROLE_ENTITY}.userRoles`,
      );
  }

  private toDetail(role: Role & { userCount?: number }): RoleDetail {
    const { rolePermissions = [], ...rest } = role;

    return {
      ...rest,
      userCount: role.userCount ?? 0,
      permissionCodes: rolePermissions
        .map((rolePermission) => rolePermission.permissionCode)
        .sort(),
    };
  }

  private async ensureNotLastAdmin() {
    const adminCount = await this.userRoleRepo
      .createQueryBuilder(USER_ROLE_TABLE)
      .innerJoin(`${USER_ROLE_TABLE}.role`, ROLE_ENTITY)
      .where(`${ROLE_ENTITY}.code = :code`, { code: SystemRole.ADMIN })
      .getCount();

    if (adminCount <= 1) {
      throw RbacException.LAST_ADMIN();
    }
  }
}
