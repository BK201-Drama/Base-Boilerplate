/**
 * Controller 生成器
 * 根据 ResourceDefinition 生成 Controller 类
 */

import { ResourceDefinition } from '../types/resource.types';
import * as path from 'path';
import * as fs from 'fs';

export class ControllerGenerator {
  /**
   * 生成 Controller 代码
   */
  generateController(resource: ResourceDefinition): string {
    const className = this.toPascalCase(resource.name);
    const serviceName = `${className}Service`;
    const routePath = resource.path || resource.pluralName || `${resource.name}s`;
    const resourceName = resource.permissions?.resource || resource.name;

    // 生成权限配置
    const createRoles = resource.permissions?.createRoles || [];
    const updateRoles = resource.permissions?.updateRoles || [];
    const deleteRoles = resource.permissions?.deleteRoles || [];
    const requireAuth = resource.permissions?.requireAuth !== false;

    // 生成操作端点
    const endpoints = this.generateEndpoints(resource, resourceName, requireAuth, createRoles, updateRoles, deleteRoles);

    return `import { Controller } from '@nestjs/common';
import { ${serviceName} } from './${resource.name}.service';
import { baseController } from '../common/utils/crud-controller.factory';

/**
 * ${resource.description || `${className} CRUD Controller`}
 *
 * 自动生成的 CRUD 控制器，提供以下端点：
 * - POST /${routePath} - 创建
 * - GET /${routePath} - 分页列表
 * - GET /${routePath}/:id - 详情
 * - PATCH /${routePath}/:id - 更新
 * - DELETE /${routePath}/:id - 删除
 */
export const ${className}Controller = baseController('${resourceName}', {
  path: '${routePath}',
  ${requireAuth ? '' : 'requireAuth: false,'}
  ${createRoles.length > 0 ? `createRoles: [${createRoles.map(r => `'${r}'`).join(', ')}],` : ''}
  ${updateRoles.length > 0 ? `updateRoles: [${updateRoles.map(r => `'${r}'`).join(', ')}],` : ''}
  ${deleteRoles.length > 0 ? `deleteRoles: [${deleteRoles.map(r => `'${r}'`).join(', ')}],` : ''}
})(${serviceName});
`;
  }

  /**
   * 生成端点（如果使用传统方式而不是 baseController）
   */
  private generateEndpoints(
    resource: ResourceDefinition,
    resourceName: string,
    requireAuth: boolean,
    createRoles: string[],
    updateRoles: string[],
    deleteRoles: string[],
  ): string {
    const className = this.toPascalCase(resource.name);
    const routePath = resource.path || resource.pluralName || `${resource.name}s`;
    const createDtoName = `Create${className}Dto`;
    const updateDtoName = `Update${className}Dto`;

    const endpoints: string[] = [];

    if (resource.operations?.create !== false) {
      endpoints.push(`
  @Post()
  @UseGuards(${requireAuth ? 'JwtAuthGuard, ' : ''}RolesGuard, PermissionsGuard)
  ${createRoles.length > 0 ? `@Roles(${createRoles.map(r => `'${r}'`).join(', ')})` : ''}
  @Permissions('${resourceName}:create')
  create(@Body() createDto: ${createDtoName}) {
    return this.service.create(createDto);
  }`);
    }

    if (resource.operations?.list !== false) {
      endpoints.push(`
  @Get()
  @UseGuards(${requireAuth ? 'JwtAuthGuard, ' : ''}RolesGuard, PermissionsGuard)
  @Permissions('${resourceName}:read')
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    return this.service.findAll({ page, limit });
  }`);
    }

    if (resource.operations?.read !== false) {
      endpoints.push(`
  @Get(':id')
  @UseGuards(${requireAuth ? 'JwtAuthGuard, ' : ''}RolesGuard, PermissionsGuard)
  @Permissions('${resourceName}:read')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }`);
    }

    if (resource.operations?.update !== false) {
      endpoints.push(`
  @Patch(':id')
  @UseGuards(${requireAuth ? 'JwtAuthGuard, ' : ''}RolesGuard, PermissionsGuard)
  ${updateRoles.length > 0 ? `@Roles(${updateRoles.map(r => `'${r}'`).join(', ')})` : ''}
  @Permissions('${resourceName}:update')
  update(@Param('id') id: string, @Body() updateDto: ${updateDtoName}) {
    return this.service.update(id, updateDto);
  }`);
    }

    if (resource.operations?.delete !== false) {
      endpoints.push(`
  @Delete(':id')
  @UseGuards(${requireAuth ? 'JwtAuthGuard, ' : ''}RolesGuard, PermissionsGuard)
  ${deleteRoles.length > 0 ? `@Roles(${deleteRoles.map(r => `'${r}'`).join(', ')})` : ''}
  @Permissions('${resourceName}:delete')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }`);
    }

    return endpoints.join('\n');
  }

  /**
   * 转换为 PascalCase
   */
  private toPascalCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * 写入文件
   */
  writeFile(
    resource: ResourceDefinition,
    outputDir: string,
    overwrite: boolean = false,
  ): void {
    const controllerDir = path.join(outputDir, resource.name);

    // 创建目录
    if (!fs.existsSync(controllerDir)) {
      fs.mkdirSync(controllerDir, { recursive: true });
    }

    const controllerPath = path.join(controllerDir, `${resource.name}.controller.ts`);
    if (!fs.existsSync(controllerPath) || overwrite) {
      fs.writeFileSync(controllerPath, this.generateController(resource));
    }
  }
}

