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
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

/**
 * 权限资源（RBAC系统）
 *
 * 自动生成的 CRUD 控制器，提供以下端点：
 * - POST /permissions - 创建
 * - GET /permissions - 分页列表
 * - GET /permissions/:id - 详情
 * - PATCH /permissions/:id - 更新
 * - DELETE /permissions/:id - 删除
 *
 * 注意：你可以在本类中添加自定义方法，例如：
 * ```typescript
 * @Get('custom-endpoint')
 * @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
 * @Permissions('permission:read')
 * customMethod(@Param('id') id: string) {
 *   return this.permissionService.customMethod(id);
 * }
 * ```
 */
@Controller('permissions')
@UseGuards(JwtAuthGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('admin')
  @Permissions('permission:create')
  create(@Body() createDto: CreatePermissionDto) {
    return this.permissionService.create(createDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions('permission:read')
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    return this.permissionService.findAll({ page, limit });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions('permission:read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.permissionService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('admin')
  @Permissions('permission:update')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdatePermissionDto) {
    return this.permissionService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('admin')
  @Permissions('permission:delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.permissionService.remove(id);
  }

  @Delete('batch')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('admin')
  @Permissions('permission:delete')
  batchDelete(@Body() body: { ids: number[] }) {
    return this.permissionService.removeMany(body.ids);
  }
}
