import { Body, Controller, Param, ParseUUIDPipe, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '../constants/permission.constant';
import { RequirePermissions } from '../decorators/rbac.decorator';
import { SetUserRolesDto } from '../dto/rbac.dto';
import { RbacService } from '../services/rbac.service';

@ApiTags('User')
@Controller('users')
export class UserRoleController {
  constructor(private readonly rbacService: RbacService) {}

  // thay toàn bộ role của user
  @Put(':id/roles')
  @RequirePermissions(PERMISSIONS.USERS_ASSIGN_ROLE)
  async setRoles(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: SetUserRolesDto,
  ) {
    return await this.rbacService.setUserRoles(id, data);
  }
}
