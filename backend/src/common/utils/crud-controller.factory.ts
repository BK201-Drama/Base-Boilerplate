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
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { Roles } from '../decorators/roles.decorator';
import { Permissions } from '../decorators/permissions.decorator';
import { BaseCrudService } from '../services/base-crud.service';
import { CrudControllerConfig } from '../types/crud.types';

/**
 * 创建 CRUD Controller 的工厂函数
 *
 * 使用示例：
 * ```typescript
 * export const UsersController = createCrudController('user', {
 *   path: 'users',
 *   createRoles: ['admin'],
 *   deleteRoles: ['admin'],
 * })(UsersService);
 * ```
 */
export function createCrudController(config: CrudControllerConfig) {
  const {
    resource,
    path,
    requireAuth = true,
    createRoles = [],
    updateRoles = [],
    deleteRoles = [],
  } = config;

  // 如果没有指定 path，使用 resource 的复数形式
  const routePath = path || `${resource}s`;

  return function <
    TModel extends { id: string },
    TCreateDto,
    TUpdateDto,
    TService extends BaseCrudService<TModel, TCreateDto, TUpdateDto, any> = BaseCrudService<TModel, TCreateDto, TUpdateDto, any>,
  >(ServiceClass: new (...args: any[]) => TService) {
    @Controller(routePath)
    class CrudController {
      constructor(public readonly service: TService) {}

      @Post()
      @UseGuards(
        ...(requireAuth ? [JwtAuthGuard] : []),
        RolesGuard,
        PermissionsGuard,
      )
      @Roles(...createRoles)
      @Permissions(`${resource}:create`)
      create(@Body() createDto: TCreateDto) {
        return this.service.create(createDto);
      }

      @Get()
      @UseGuards(
        ...(requireAuth ? [JwtAuthGuard] : []),
        RolesGuard,
        PermissionsGuard,
      )
      @Permissions(`${resource}:read`)
      findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
      ) {
        return this.service.findAll({ page, limit });
      }

      @Get(':id')
      @UseGuards(
        ...(requireAuth ? [JwtAuthGuard] : []),
        RolesGuard,
        PermissionsGuard,
      )
      @Permissions(`${resource}:read`)
      findOne(@Param('id') id: string) {
        return this.service.findOne(id);
      }

      @Patch(':id')
      @UseGuards(
        ...(requireAuth ? [JwtAuthGuard] : []),
        RolesGuard,
        PermissionsGuard,
      )
      @Roles(...updateRoles)
      @Permissions(`${resource}:update`)
      update(@Param('id') id: string, @Body() updateDto: TUpdateDto) {
        return this.service.update(id, updateDto);
      }

      @Delete(':id')
      @UseGuards(
        ...(requireAuth ? [JwtAuthGuard] : []),
        RolesGuard,
        PermissionsGuard,
      )
      @Roles(...deleteRoles)
      @Permissions(`${resource}:delete`)
      remove(@Param('id') id: string) {
        return this.service.remove(id);
      }
    }

    return CrudController;
  };
}

/**
 * 简化版：只需要资源名称即可创建 Controller
 *
 * 使用示例：
 * ```typescript
 * export const UsersController = baseController('user')(UsersService);
 * ```
 *
 * 或者使用配置对象：
 * ```typescript
 * export const UsersController = baseController('user', {
 *   createRoles: ['admin'],
 *   deleteRoles: ['admin'],
 * })(UsersService);
 * ```
 */
export function baseController(
  resource: string,
  options?: Omit<CrudControllerConfig, 'resource'>,
) {
  return createCrudController({ resource, ...options });
}
