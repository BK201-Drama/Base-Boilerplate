import {
  Get,
  Post,
  Patch,
  Delete,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
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
    const createMethod = function (this: any, dto: any) {
      return this.service.create(dto);
    };
    createMethod.toString = () => 'create';
    
    // 设置 Body 参数元数据
    const bodyMetadata = {
      [`${0}:body`]: {
        index: 0,
        data: undefined,
        pipes: [],
      },
    };
    Reflect.defineMetadata(ROUTE_ARGS_METADATA, bodyMetadata, target.prototype, 'create');
    
    const createDescriptor: PropertyDescriptor = {
      value: createMethod,
      writable: true,
      configurable: true,
    };
    Post()(target.prototype, 'create', createDescriptor);
    UseGuards(RolesGuard, PermissionsGuard)(
      target.prototype,
      'create',
      createDescriptor,
    );
    if (createRoles.length > 0) {
      Roles(...createRoles)(target.prototype, 'create', createDescriptor);
    }
    Permissions(`${resource}:create`)(target.prototype, 'create', createDescriptor);

    // 查询列表方法
    const findAllMethod = function (this: any, page?: number, limit?: number) {
      return this.service.findAll({ page, limit });
    };
    findAllMethod.toString = () => 'findAll';
    
    // 设置 Query 参数元数据
    const queryMetadata = {
      [`${0}:query`]: {
        index: 0,
        data: 'page',
        pipes: [new DefaultValuePipe(1), new ParseIntPipe()],
      },
      [`${1}:query`]: {
        index: 1,
        data: 'limit',
        pipes: [new DefaultValuePipe(10), new ParseIntPipe()],
      },
    };
    Reflect.defineMetadata(ROUTE_ARGS_METADATA, queryMetadata, target.prototype, 'findAll');
    
    const findAllDescriptor: PropertyDescriptor = {
      value: findAllMethod,
      writable: true,
      configurable: true,
    };
    Get()(target.prototype, 'findAll', findAllDescriptor);
    UseGuards(RolesGuard, PermissionsGuard)(
      target.prototype,
      'findAll',
      findAllDescriptor,
    );
    Permissions(`${resource}:read`)(target.prototype, 'findAll', findAllDescriptor);

    // 查询单条方法
    const findOneMethod = function (this: any, id: number) {
      return this.service.findOne(id);
    };
    findOneMethod.toString = () => 'findOne';
    
    // 设置 Param 参数元数据（添加 ParseIntPipe）
    const paramMetadata = {
      [`${0}:param`]: {
        index: 0,
        data: 'id',
        pipes: [new ParseIntPipe()],
      },
    };
    Reflect.defineMetadata(ROUTE_ARGS_METADATA, paramMetadata, target.prototype, 'findOne');
    
    const findOneDescriptor: PropertyDescriptor = {
      value: findOneMethod,
      writable: true,
      configurable: true,
    };
    Get(':id')(target.prototype, 'findOne', findOneDescriptor);
    UseGuards(RolesGuard, PermissionsGuard)(
      target.prototype,
      'findOne',
      findOneDescriptor,
    );
    Permissions(`${resource}:read`)(target.prototype, 'findOne', findOneDescriptor);

    // 更新方法
    const updateMethod = function (this: any, id: number, dto: any) {
      return this.service.update(id, dto);
    };
    updateMethod.toString = () => 'update';
    
    // 设置 Param 和 Body 参数元数据（添加 ParseIntPipe）
    const updateMetadata = {
      [`${0}:param`]: {
        index: 0,
        data: 'id',
        pipes: [new ParseIntPipe()],
      },
      [`${1}:body`]: {
        index: 1,
        data: undefined,
        pipes: [],
      },
    };
    Reflect.defineMetadata(ROUTE_ARGS_METADATA, updateMetadata, target.prototype, 'update');
    
    const updateDescriptor: PropertyDescriptor = {
      value: updateMethod,
      writable: true,
      configurable: true,
    };
    Patch(':id')(target.prototype, 'update', updateDescriptor);
    UseGuards(RolesGuard, PermissionsGuard)(
      target.prototype,
      'update',
      updateDescriptor,
    );
    if (updateRoles.length > 0) {
      Roles(...updateRoles)(target.prototype, 'update', updateDescriptor);
    }
    Permissions(`${resource}:update`)(target.prototype, 'update', updateDescriptor);

    // 删除方法
    const removeMethod = function (this: any, id: number) {
      return this.service.remove(id);
    };
    removeMethod.toString = () => 'remove';
    
    // 设置 Param 参数元数据（添加 ParseIntPipe）
    const removeMetadata = {
      [`${0}:param`]: {
        index: 0,
        data: 'id',
        pipes: [new ParseIntPipe()],
      },
    };
    Reflect.defineMetadata(ROUTE_ARGS_METADATA, removeMetadata, target.prototype, 'remove');
    
    const removeDescriptor: PropertyDescriptor = {
      value: removeMethod,
      writable: true,
      configurable: true,
    };
    Delete(':id')(target.prototype, 'remove', removeDescriptor);
    UseGuards(RolesGuard, PermissionsGuard)(
      target.prototype,
      'remove',
      removeDescriptor,
    );
    if (deleteRoles.length > 0) {
      Roles(...deleteRoles)(target.prototype, 'remove', removeDescriptor);
    }
    Permissions(`${resource}:delete`)(target.prototype, 'remove', removeDescriptor);
  };
}

