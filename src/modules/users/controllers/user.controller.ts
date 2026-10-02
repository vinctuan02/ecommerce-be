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
import { CreateUserDto, GetListUserDto, UpdateUserDto } from '../dto/user.dto';
import { UserService } from '../services/user.service';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // create
  @Post()
  async create(@Body() data: CreateUserDto) {
    return await this.userService.create(data);
  }

  // read
  @Get()
  async getList(@Query() query: GetListUserDto) {
    return await this.userService.getList(query);
  }

  @Get(':id')
  async getOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.userService.findOne(id);
  }

  // update
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateUserDto,
  ) {
    return await this.userService.update(id, data);
  }

  // delete
  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.userService.delete(id);
  }
}
