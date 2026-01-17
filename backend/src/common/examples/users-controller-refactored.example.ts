/**
 * 使用 baseController 重构 UsersController 的示例
 *
 * 这个示例展示了如何将传统的 Controller 重构为使用 baseController
 */

import { baseController } from '../utils/crud-controller.factory';
import { UsersService } from '../../users/users.service';

// ============================================
// 重构前：传统方式（65 行代码）
// ============================================
/*
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles('admin')
  @Permissions('user:create')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(RolesGuard, PermissionsGuard)
  @Permissions('user:read')
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    return this.usersService.findAll({ page, limit });
  }

  @Get(':id')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Permissions('user:read')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Permissions('user:update')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles('admin')
  @Permissions('user:delete')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
*/

// ============================================
// 重构后：使用 baseController（1 行代码）
// ============================================
export const UsersController = baseController('user', {
  createRoles: ['admin'],
  deleteRoles: ['admin'],
})(UsersService);

// ============================================
// 代码对比
// ============================================
// 重构前：65 行代码
// 重构后：1 行代码
// 代码减少：98.5%
//
// 功能完全相同：
// ✅ 所有 CRUD 端点
// ✅ 权限控制
// ✅ 认证守卫
// ✅ 参数验证
// ✅ 角色检查

