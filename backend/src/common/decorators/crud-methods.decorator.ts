import {
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { RolesGuard } from '../guards/roles.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { Roles } from './roles.decorator';
import { Permissions } from './permissions.decorator';
import { getCrudConfig } from './crud-controller.decorator';

/**
 * 为 Controller 类添加 CRUD 方法的装饰器
 *
 * 这个装饰器会自动为类添加标准的 CRUD 方法
 */
export function CrudMethods(): ClassDecorator {
  return function (target: any) {
    const config = getCrudConfig(target);
    const { resource, createRoles, updateRoles, deleteRoles } = config;

    // 创建方法
    const createMethod = function (this: any, @Body() dto: any) {
      return this.service.create(dto);
    };
    createMethod.toString = () => 'create';
    Post()(target.prototype, 'create', {
      value: createMethod,
      writable: true,
      configurable: true,
    });
    UseGuards(RolesGuard, PermissionsGuard)(
      target.prototype,
      'create',
      createMethod,
    );
    if (createRoles.length > 0) {
      Roles(...createRoles)(target.prototype, 'create', createMethod);
    }
    Permissions(`${resource}:create`)(target.prototype, 'create', createMethod);

    // 查询列表方法
    const findAllMethod = function (
      this: any,
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
      @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    ) {
      return this.service.findAll({ page, limit });
    };
    findAllMethod.toString = () => 'findAll';
    Get()(target.prototype, 'findAll', {
      value: findAllMethod,
      writable: true,
      configurable: true,
    });
    UseGuards(RolesGuard, PermissionsGuard)(
      target.prototype,
      'findAll',
      findAllMethod,
    );
    Permissions(`${resource}:read`)(target.prototype, 'findAll', findAllMethod);

    // 查询单条方法
    const findOneMethod = function (this: any, @Param('id') id: string) {
      return this.service.findOne(id);
    };
    findOneMethod.toString = () => 'findOne';
    Get(':id')(target.prototype, 'findOne', {
      value: findOneMethod,
      writable: true,
      configurable: true,
    });
    UseGuards(RolesGuard, PermissionsGuard)(
      target.prototype,
      'findOne',
      findOneMethod,
    );
    Permissions(`${resource}:read`)(target.prototype, 'findOne', findOneMethod);

    // 更新方法
    const updateMethod = function (
      this: any,
      @Param('id') id: string,
      @Body() dto: any,
    ) {
      return this.service.update(id, dto);
    };
    updateMethod.toString = () => 'update';
    Patch(':id')(target.prototype, 'update', {
      value: updateMethod,
      writable: true,
      configurable: true,
    });
    UseGuards(RolesGuard, PermissionsGuard)(
      target.prototype,
      'update',
      updateMethod,
    );
    if (updateRoles.length > 0) {
      Roles(...updateRoles)(target.prototype, 'update', updateMethod);
    }
    Permissions(`${resource}:update`)(target.prototype, 'update', updateMethod);

    // 删除方法
    const removeMethod = function (this: any, @Param('id') id: string) {
      return this.service.remove(id);
    };
    removeMethod.toString = () => 'remove';
    Delete(':id')(target.prototype, 'remove', {
      value: removeMethod,
      writable: true,
      configurable: true,
    });
    UseGuards(RolesGuard, PermissionsGuard)(
      target.prototype,
      'remove',
      removeMethod,
    );
    if (deleteRoles.length > 0) {
      Roles(...deleteRoles)(target.prototype, 'remove', removeMethod);
    }
    Permissions(`${resource}:delete`)(target.prototype, 'remove', removeMethod);
  };
}

