import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '../constants/permission.constant';
import { RequirePermissions } from '../decorators/rbac.decorator';
import { RbacService } from '../services/rbac.service';

@ApiTags('Permission')
@Controller('permissions')
export class PermissionController {
  constructor(private readonly rbacService: RbacService) {}

  // danh mục quyền khai báo trong code, chỉ đọc
  @Get()
  @RequirePermissions(PERMISSIONS.ROLES_READ)
  async getList() {
    return await this.rbacService.getPermissions();
  }
}
