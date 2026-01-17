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

/**
 * CRUD Controller 配置
 */
export interface CrudControllerConfig {
  /**
   * 资源名称（用于权限检查，如 'user'）
   */
  resource: string;
  /**
   * 路由路径（如 'users'），如果不提供则使用 resource 的复数形式
   */
  path?: string;
  /**
   * 是否需要认证（默认：true）
   */
  requireAuth?: boolean;
  /**
   * 创建操作需要的角色
   */
  createRoles?: string[];
  /**
   * 更新操作需要的角色
   */
  updateRoles?: string[];
  /**
   * 删除操作需要的角色
   */
  deleteRoles?: string[];
}

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
  >(ServiceClass: new (...args: any[]) => BaseCrudService<TModel, TCreateDto, TUpdateDto, any>) {
    @Controller(routePath)
    class CrudController {
      constructor(public readonly service: ServiceClass) {}

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
