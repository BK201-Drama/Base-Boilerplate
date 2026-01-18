import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

/**
 * 角色资源（RBAC系统）
 *
 * 自动生成的 CRUD 控制器，提供以下端点：
 * - POST /roles - 创建
 * - GET /roles - 分页列表
 * - GET /roles/:id - 详情
 * - PATCH /roles/:id - 更新
 * - DELETE /roles/:id - 删除
 *
 * 注意：你可以在本类中添加自定义方法，例如：
 * ```typescript
 * @Get('custom-endpoint')
 * @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
 * @Permissions('role:read')
 * customMethod(@Param('id') id: string) {
 *   return this.roleService.customMethod(id);
 * }
 * ```
 */
@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('admin')
  @Permissions('role:create')
  create(@Body() createDto: CreateRoleDto) {
    return this.roleService.create(createDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions('role:read')
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    return this.roleService.findAll({ page, limit });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions('role:read')
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('admin')
  @Permissions('role:update')
  update(@Param('id') id: string, @Body() updateDto: UpdateRoleDto) {
    return this.roleService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('admin')
  @Permissions('role:delete')
  remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }

  @Delete('batch')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('admin')
  @Permissions('role:delete')
  batchDelete(@Body() body: { ids: string[] }) {
    return this.roleService.removeMany(body.ids);
  }
}
