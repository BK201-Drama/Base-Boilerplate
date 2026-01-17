import { Controller, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { BaseCrudService } from '../services/base-crud.service';

/**
 * CRUD Controller 配置选项
 */
export interface CrudControllerOptions {
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
  /**
   * 是否启用批量删除端点
   */
  enableBatchDelete?: boolean;
}

/**
 * CRUD Controller 装饰器
 *
 * 使用示例：
 * ```typescript
 * @CrudController('user')
 * export class UsersController {
 *   constructor(public readonly service: UsersService) {}
 * }
 * ```
 *
 * 或者使用自定义配置：
 * ```typescript
 * @CrudController('user', { path: 'users', createRoles: ['admin'] })
 * export class UsersController {
 *   constructor(public readonly service: UsersService) {}
 * }
 * ```
 */
export function CrudController(
  resource: string,
  options: CrudControllerOptions = {},
): ClassDecorator {
  const {
    path,
    requireAuth = true,
    createRoles = [],
    updateRoles = [],
    deleteRoles = [],
    enableBatchDelete = false,
  } = options;

  // 如果没有指定 path，使用 resource 的复数形式
  const routePath = path || `${resource}s`;

  return function (target: any) {
    // 应用 Controller 装饰器
    Controller(routePath)(target);

    // 如果需要认证，应用 JwtAuthGuard
    if (requireAuth) {
      UseGuards(JwtAuthGuard)(target);
    }

    // 存储配置到类的元数据中，供后续使用
    Reflect.defineMetadata('crud:resource', resource, target);
    Reflect.defineMetadata('crud:path', routePath, target);
    Reflect.defineMetadata('crud:requireAuth', requireAuth, target);
    Reflect.defineMetadata('crud:createRoles', createRoles, target);
    Reflect.defineMetadata('crud:updateRoles', updateRoles, target);
    Reflect.defineMetadata('crud:deleteRoles', deleteRoles, target);
    Reflect.defineMetadata('crud:enableBatchDelete', enableBatchDelete, target);
  };
}

/**
 * 获取 CRUD Controller 配置
 */
export function getCrudConfig(target: any) {
  return {
    resource: Reflect.getMetadata('crud:resource', target),
    path: Reflect.getMetadata('crud:path', target),
    requireAuth: Reflect.getMetadata('crud:requireAuth', target) ?? true,
    createRoles: Reflect.getMetadata('crud:createRoles', target) ?? [],
    updateRoles: Reflect.getMetadata('crud:updateRoles', target) ?? [],
    deleteRoles: Reflect.getMetadata('crud:deleteRoles', target) ?? [],
    enableBatchDelete: Reflect.getMetadata('crud:enableBatchDelete', target) ?? false,
  };
}

