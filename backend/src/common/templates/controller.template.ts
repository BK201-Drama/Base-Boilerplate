/**
 * CRUD Controller 模板
 *
 * 使用方法：
 * 1. 将 {EntityName} 替换为实际的实体名称（首字母大写，如 Product）
 * 2. 将 {entityName} 替换为实际的实体名称（首字母小写，如 product）
 * 3. 将 {routePath} 替换为路由路径（如 products）
 * 4. 根据权限需求调整 @Roles 和 @Permissions 装饰器
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { {EntityName}Service } from './{entityName}.service';
import { Create{EntityName}Dto } from './dto/create-{entityName}.dto';
import { Update{EntityName}Dto } from './dto/update-{entityName}.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';

@Controller('{routePath}')
@UseGuards(JwtAuthGuard)
export class {EntityName}Controller {
  constructor(private readonly {entityName}Service: {EntityName}Service) {}

  @Post()
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles('admin') // TODO: 根据需要调整角色要求
  @Permissions('{entityName}:create') // TODO: 确保权限代码与权限表一致
  create(@Body() create{EntityName}Dto: Create{EntityName}Dto) {
    return this.{entityName}Service.create(create{EntityName}Dto);
  }

  @Get()
  @UseGuards(RolesGuard, PermissionsGuard)
  @Permissions('{entityName}:read')
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    return this.{entityName}Service.findAll({ page, limit });
  }

  @Get(':id')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Permissions('{entityName}:read')
  findOne(@Param('id') id: string) {
    return this.{entityName}Service.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Permissions('{entityName}:update')
  update(
    @Param('id') id: string,
    @Body() update{EntityName}Dto: Update{EntityName}Dto,
  ) {
    return this.{entityName}Service.update(id, update{EntityName}Dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles('admin') // TODO: 根据需要调整角色要求
  @Permissions('{entityName}:delete')
  remove(@Param('id') id: string) {
    return this.{entityName}Service.remove(id);
  }
}

