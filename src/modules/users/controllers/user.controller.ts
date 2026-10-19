import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '../../rbac/constants/permission.constant';
import { RequirePermissions } from '../../rbac/decorators/rbac.decorator';
import { CreateUserDto, GetListUserDto, UpdateUserDto } from '../dto/user.dto';
import { UserService } from '../services/user.service';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // create
  @Post()
  @RequirePermissions(PERMISSIONS.USERS_CREATE)
  async create(@Body() data: CreateUserDto) {
    return await this.userService.create(data);
  }

  // read
  @Get()
  @RequirePermissions(PERMISSIONS.USERS_READ)
  async getList(@Query() query: GetListUserDto) {
    return await this.userService.getList(query);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.USERS_READ)
  async getOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.userService.findOne(id);
  }

  // update
  @Patch(':id')
  @RequirePermissions(PERMISSIONS.USERS_UPDATE)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateUserDto,
  ) {
    return await this.userService.update(id, data);
  }

  // delete
  @Delete(':id')
  @RequirePermissions(PERMISSIONS.USERS_DELETE)
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.userService.delete(id);
  }
}
