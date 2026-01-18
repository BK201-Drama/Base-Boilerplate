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
import { PaginationParams, CrudControllerConfig } from '../types/crud.types';

/**
 * 基础 CRUD 控制器类
 * 提供标准的 CRUD 端点
 */
export function BaseCrudController<
  TModel extends { id: string },
  TCreateDto,
  TUpdateDto,
>(
  config: CrudControllerConfig,
) {
  const {
    resource,
    requireAuth = true,
    createRoles,
    updateRoles,
    deleteRoles,
    enableBatchDelete = false,
  } = config;

  @Controller()
  class CrudController {
    constructor(
      public readonly service: BaseCrudService<TModel, TCreateDto, TUpdateDto, any>,
    ) {}

    @Post()
    @UseGuards(
      ...(requireAuth ? [JwtAuthGuard] : []),
      RolesGuard,
      PermissionsGuard,
    )
    @Roles(...(createRoles || []))
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
    @Roles(...(updateRoles || []))
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
    @Roles(...(deleteRoles || []))
    @Permissions(`${resource}:delete`)
    remove(@Param('id') id: string) {
      return this.service.remove(id);
    }
  }

  return CrudController;
}

