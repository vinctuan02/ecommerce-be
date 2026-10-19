import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '../constants/permission.constant';
import { RequirePermissions } from '../decorators/rbac.decorator';
import { CreateRoleDto, UpdateRoleDto } from '../dto/rbac.dto';
import { RbacService } from '../services/rbac.service';

@ApiTags('Role')
@Controller('roles')
export class RoleController {
  constructor(private readonly rbacService: RbacService) {}

  // create
  @Post()
  @RequirePermissions(PERMISSIONS.ROLES_CREATE)
  async create(@Body() data: CreateRoleDto) {
    return await this.rbacService.createRole(data);
  }

  // read: số role ít nên trả hết, không phân trang
  @Get()
  @RequirePermissions(PERMISSIONS.ROLES_READ)
  async getList() {
    return await this.rbacService.getRoles();
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.ROLES_READ)
  async getOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.rbacService.findRole(id);
  }

  // update: sửa thông tin, có permissionCodes thì thay toàn bộ quyền
  @Patch(':id')
  @RequirePermissions(PERMISSIONS.ROLES_UPDATE)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateRoleDto,
  ) {
    return await this.rbacService.updateRole(id, data);
  }

  // delete
  @Delete(':id')
  @RequirePermissions(PERMISSIONS.ROLES_DELETE)
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.rbacService.deleteRole(id);
  }
}
