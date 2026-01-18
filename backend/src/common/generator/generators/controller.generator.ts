/**
 * Controller 生成器
 * 根据 ResourceDefinition 生成 Controller 类
 */

import { ResourceDefinition, RelationBindingConfig, RelationType } from '../types/resource.types';
import * as path from 'path';
import * as fs from 'fs';

export class ControllerGenerator {
  /**
   * 生成 Controller 代码
   * 生成完整的 Controller 类，支持扩展自定义方法
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
    
    // 生成多对多关系绑定端点（如果配置了独立端点）
    const bindingEndpoints = this.generateManyToManyBindingEndpoints(resource, resourceName, requireAuth, updateRoles);
    
    // 生成自定义端点
    const customEndpoints = this.generateCustomEndpoints(resource, resourceName, requireAuth);
    
    // 生成导入语句
    const createDtoName = `Create${className}Dto`;
    const updateDtoName = `Update${className}Dto`;
    const imports = this.generateImports(requireAuth, resource.operations, resource.customEndpoints, resource.relationBindings);
    const serviceVarName = this.toCamelCase(serviceName);

    return `${imports}
import { ${serviceName} } from './${resource.name}.service';
import { ${createDtoName} } from './dto/create-${resource.name}.dto';
import { ${updateDtoName} } from './dto/update-${resource.name}.dto';

/**
 * ${resource.description || `${className} CRUD Controller`}
 *
 * 自动生成的 CRUD 控制器，提供以下端点：
 * - POST /${routePath} - 创建
 * - GET /${routePath} - 分页列表
 * - GET /${routePath}/:id - 详情
 * - PATCH /${routePath}/:id - 更新
 * - DELETE /${routePath}/:id - 删除
 *
 * 注意：你可以在本类中添加自定义方法，例如：
 * \`\`\`typescript
 * @Get('custom-endpoint')
 * @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
 * @Permissions('${resourceName}:read')
 * customMethod(@Param('id') id: string) {
 *   return this.${serviceVarName}.customMethod(id);
 * }
 * \`\`\`
 */
@Controller('${routePath}')
${requireAuth ? '@UseGuards(JwtAuthGuard)' : ''}
export class ${className}Controller {
  constructor(private readonly ${serviceVarName}: ${serviceName}) {}
${endpoints}${bindingEndpoints}${customEndpoints}
}
`;
  }

  /**
   * 生成导入语句
   */
  private generateImports(
    requireAuth: boolean, 
    operations?: ResourceDefinition['operations'],
    customEndpoints?: ResourceDefinition['customEndpoints'],
    relationBindings?: ResourceDefinition['relationBindings']
  ): string {
    const imports = new Set<string>(['Controller']);
    
    if (operations?.create !== false) {
      imports.add('Post');
      imports.add('Body');
    }
    // 检查是否有独立的关系绑定端点需要Post和Delete
    if (relationBindings?.some(b => b.generateStandaloneEndpoints === true)) {
      imports.add('Post');
      imports.add('Delete');
      imports.add('Body');
    }
    if (operations?.list !== false || operations?.read !== false) {
      imports.add('Get');
      imports.add('Param');
    }
    if (operations?.update !== false) imports.add('Patch');
    if (operations?.delete !== false) imports.add('Delete');
    if (operations?.list !== false) {
      imports.add('Query');
      imports.add('ParseIntPipe');
      imports.add('DefaultValuePipe');
    }
    
    // 检查自定义端点需要的导入
    if (customEndpoints && customEndpoints.length > 0) {
      customEndpoints.forEach(endpoint => {
        if (endpoint.method === 'get') imports.add('Get');
        if (endpoint.method === 'post') imports.add('Post');
        if (endpoint.method === 'put') imports.add('Put');
        if (endpoint.method === 'patch') imports.add('Patch');
        if (endpoint.method === 'delete') imports.add('Delete');
        if (endpoint.params?.path && endpoint.params.path.length > 0) imports.add('Param');
        if (endpoint.params?.query && endpoint.params.query.length > 0) imports.add('Query');
        if (endpoint.params?.body && ['post', 'put', 'patch'].includes(endpoint.method)) {
          imports.add('Body');
        }
      });
    }
    
    if (requireAuth || operations?.create !== false || operations?.update !== false || operations?.delete !== false || 
        (customEndpoints && customEndpoints.some(e => e.requireAuth !== false))) {
      imports.add('UseGuards');
    }
    
    let importStr = `import {\n  ${Array.from(imports).join(',\n  ')},\n} from '@nestjs/common';`;
    
    if (requireAuth || (customEndpoints && customEndpoints.some(e => e.requireAuth !== false))) {
      importStr += `\nimport { JwtAuthGuard } from '@/auth/jwt-auth.guard';`;
    }
    
    importStr += `\nimport { RolesGuard } from '@/common/guards/roles.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Permissions } from '@/common/decorators/permissions.decorator';`;
    
    return importStr;
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
    const serviceName = `${className}Service`;
    const serviceVarName = this.toCamelCase(serviceName);
    const routePath = resource.path || resource.pluralName || `${resource.name}s`;
    const createDtoName = `Create${className}Dto`;
    const updateDtoName = `Update${className}Dto`;

    const endpoints: string[] = [];

    // 如果类级别已经应用了 JwtAuthGuard，方法级别就不需要重复
    const methodGuards = requireAuth ? 'RolesGuard, PermissionsGuard' : 'JwtAuthGuard, RolesGuard, PermissionsGuard';

    if (resource.operations?.create !== false) {
      endpoints.push(`
  @Post()
  @UseGuards(${methodGuards})
  ${createRoles.length > 0 ? `@Roles(${createRoles.map(r => `'${r}'`).join(', ')})` : ''}
  @Permissions('${resourceName}:create')
  create(@Body() createDto: ${createDtoName}) {
    return this.${serviceVarName}.create(createDto);
  }`);
    }

    if (resource.operations?.list !== false) {
      endpoints.push(`
  @Get()
  @UseGuards(${methodGuards})
  @Permissions('${resourceName}:read')
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    return this.${serviceVarName}.findAll({ page, limit });
  }`);
    }

    if (resource.operations?.read !== false) {
      endpoints.push(`
  @Get(':id')
  @UseGuards(${methodGuards})
  @Permissions('${resourceName}:read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.${serviceVarName}.findOne(id);
  }`);
    }

    if (resource.operations?.update !== false) {
      endpoints.push(`
  @Patch(':id')
  @UseGuards(${methodGuards})
  ${updateRoles.length > 0 ? `@Roles(${updateRoles.map(r => `'${r}'`).join(', ')})` : ''}
  @Permissions('${resourceName}:update')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: ${updateDtoName}) {
    return this.${serviceVarName}.update(id, updateDto);
  }`);
    }

    if (resource.operations?.delete !== false) {
      endpoints.push(`
  @Delete(':id')
  @UseGuards(${methodGuards})
  ${deleteRoles.length > 0 ? `@Roles(${deleteRoles.map(r => `'${r}'`).join(', ')})` : ''}
  @Permissions('${resourceName}:delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.${serviceVarName}.remove(id);
  }`);
    }
    
    // 批量删除
    if (resource.operations?.batchDelete === true) {
      endpoints.push(`
  @Delete('batch')
  @UseGuards(${methodGuards})
  ${deleteRoles.length > 0 ? `@Roles(${deleteRoles.map(r => `'${r}'`).join(', ')})` : ''}
  @Permissions('${resourceName}:delete')
  batchDelete(@Body() body: { ids: number[] }) {
    return this.${serviceVarName}.removeMany(body.ids);
  }`);
    }

    return endpoints.join('\n');
  }

  /**
   * 生成关系绑定端点（支持所有关系类型）
   */
  private generateManyToManyBindingEndpoints(
    resource: ResourceDefinition,
    resourceName: string,
    defaultRequireAuth: boolean,
    updateRoles: string[],
  ): string {
    if (!resource.relationBindings || resource.relationBindings.length === 0) {
      return '';
    }

    const className = this.toPascalCase(resource.name);
    const serviceName = `${className}Service`;
    const serviceVarName = this.toCamelCase(serviceName);
    const endpoints: string[] = [];

    // 如果类级别已经应用了 JwtAuthGuard，方法级别就不需要重复
    const methodGuards = defaultRequireAuth ? 'RolesGuard, PermissionsGuard' : 'JwtAuthGuard, RolesGuard, PermissionsGuard';

    resource.relationBindings.forEach((binding) => {
      // 只生成配置了独立端点的绑定
      if (binding.generateStandaloneEndpoints !== true) {
        return;
      }

      const relationType = this.determineRelationType(binding);
      const fieldName = binding.field;
      const dtoFieldName = binding.dtoFieldName || this.generateDtoFieldName(binding, relationType);
      const bindMethodName = `bind${this.toPascalCase(fieldName)}`;
      const unbindMethodName = `unbind${this.toPascalCase(fieldName)}`;

      if (relationType === 'many-to-many') {
        // 多对多关系：绑定和解绑端点
        // 绑定端点：POST /:id/bind-{field}
        endpoints.push(`
  /**
   * 绑定${binding.description || fieldName}
   * POST /${resource.path || resource.pluralName || `${resource.name}s`}/:id/bind-${fieldName}
   */
  @Post(':id/bind-${fieldName}')
  @UseGuards(${methodGuards})
  ${updateRoles.length > 0 ? `@Roles(${updateRoles.map(r => `'${r}'`).join(', ')})` : ''}
  @Permissions('${resourceName}:update')
  ${bindMethodName}(@Param('id', ParseIntPipe) id: number, @Body() body: { ${dtoFieldName}: number[] }) {
    return this.${serviceVarName}.update(id, { ${dtoFieldName}: body.${dtoFieldName} } as any);
  }`);

        // 解绑端点：DELETE /:id/unbind-{field}/:relatedId
        endpoints.push(`
  /**
   * 解绑${binding.description || fieldName}
   * DELETE /${resource.path || resource.pluralName || `${resource.name}s`}/:id/unbind-${fieldName}/:relatedId
   */
  @Delete(':id/unbind-${fieldName}/:relatedId')
  @UseGuards(${methodGuards})
  ${updateRoles.length > 0 ? `@Roles(${updateRoles.map(r => `'${r}'`).join(', ')})` : ''}
  @Permissions('${resourceName}:update')
  ${unbindMethodName}(@Param('id', ParseIntPipe) id: number, @Param('relatedId', ParseIntPipe) relatedId: number) {
    // 获取当前绑定，移除指定的关联
    return this.${serviceVarName}.update(id, { ${dtoFieldName}: [] } as any).then(async (result) => {
      // 重新绑定除了被移除的之外的所有关联
      const currentBindings = await this.${serviceVarName}.findOne(id);
      const currentIds = (currentBindings as any).${fieldName}?.map((item: any) => item.id) || [];
      const newIds = currentIds.filter((itemId: string) => itemId !== relatedId);
      return this.${serviceVarName}.update(id, { ${dtoFieldName}: newIds } as any);
    });
  }`);
      } else {
        // 一对一和一对多关系：设置端点
        endpoints.push(`
  /**
   * 设置${binding.description || fieldName}
   * POST /${resource.path || resource.pluralName || `${resource.name}s`}/:id/set-${fieldName}
   */
  @Post(':id/set-${fieldName}')
  @UseGuards(${methodGuards})
  ${updateRoles.length > 0 ? `@Roles(${updateRoles.map(r => `'${r}'`).join(', ')})` : ''}
  @Permissions('${resourceName}:update')
  ${bindMethodName}(@Param('id', ParseIntPipe) id: number, @Body() body: { ${dtoFieldName}: number | null }) {
    return this.${serviceVarName}.update(id, { ${dtoFieldName}: body.${dtoFieldName} } as any);
  }`);

        // 清除端点：DELETE /:id/unbind-{field}
        endpoints.push(`
  /**
   * 清除${binding.description || fieldName}
   * DELETE /${resource.path || resource.pluralName || `${resource.name}s`}/:id/unbind-${fieldName}
   */
  @Delete(':id/unbind-${fieldName}')
  @UseGuards(${methodGuards})
  ${updateRoles.length > 0 ? `@Roles(${updateRoles.map(r => `'${r}'`).join(', ')})` : ''}
  @Permissions('${resourceName}:update')
  ${unbindMethodName}(@Param('id', ParseIntPipe) id: number) {
    return this.${serviceVarName}.update(id, { ${dtoFieldName}: null } as any);
  }`);
      }
    });

    return endpoints.length > 0 ? '\n' + endpoints.join('\n') : '';
  }

  /**
   * 判断关系类型
   */
  private determineRelationType(binding: RelationBindingConfig): RelationType {
    if (binding.relationType) {
      return binding.relationType;
    }
    if (binding.junctionModel) {
      return 'many-to-many';
    }
    const isPlural = binding.field.endsWith('s') || binding.field.endsWith('ies');
    return isPlural ? 'one-to-many' : 'one-to-one';
  }

  /**
   * 生成DTO字段名
   */
  private generateDtoFieldName(binding: RelationBindingConfig, relationType: RelationType): string {
    if (binding.dtoFieldName) {
      return binding.dtoFieldName;
    }
    if (relationType === 'many-to-many') {
      const camelCase = this.toCamelCase(binding.relatedModel);
      return `${camelCase}Ids`;
    } else {
      if (binding.foreignKeyField) {
        return binding.foreignKeyField;
      }
      const isPlural = binding.field.endsWith('s') || binding.field.endsWith('ies');
      if (isPlural) {
        const camelCase = this.toCamelCase(binding.relatedModel);
        return `${camelCase}Id`;
      } else {
        return `${binding.field}Id`;
      }
    }
  }

  /**
   * 生成自定义端点
   */
  private generateCustomEndpoints(
    resource: ResourceDefinition,
    resourceName: string,
    defaultRequireAuth: boolean,
  ): string {
    if (!resource.customEndpoints || resource.customEndpoints.length === 0) {
      return '';
    }

    const className = this.toPascalCase(resource.name);
    const serviceName = `${className}Service`;
    const serviceVarName = this.toCamelCase(serviceName);
    const endpoints: string[] = [];

    resource.customEndpoints.forEach(endpoint => {
      const methodName = endpoint.serviceMethod || this.generateServiceMethodName(endpoint.path, endpoint.method);
      const requireAuth = endpoint.requireAuth !== undefined ? endpoint.requireAuth : defaultRequireAuth;
      const methodDecorator = this.getMethodDecorator(endpoint.method);
      const pathDecorator = endpoint.path ? `@${methodDecorator}('${endpoint.path}')` : `@${methodDecorator}()`;
      
      // 生成参数装饰器和参数
      const params: string[] = [];
      const paramDecorators: string[] = [];
      
      // 路径参数
      if (endpoint.params?.path) {
        endpoint.params.path.forEach(param => {
          const paramName = param.replace(':', '');
          paramDecorators.push(`@Param('${paramName}') ${paramName}: string`);
          params.push(`${paramName}: string`);
        });
      }
      
      // 查询参数
      if (endpoint.params?.query && endpoint.params.query.length > 0) {
        const queryParams = endpoint.params.query.map(q => {
          const optional = q.required ? '' : '?';
          const tsType = this.mapTypeToTypeScript(q.type);
          return `${q.name}${optional}: ${tsType}`;
        }).join(', ');
        paramDecorators.push(`@Query() query: { ${queryParams} }`);
        params.push(`query`);
      }
      
      // 请求体参数
      if (endpoint.params?.body && ['post', 'put', 'patch'].includes(endpoint.method)) {
        const bodyType = endpoint.params.body.type || 'any';
        paramDecorators.push(`@Body() body: ${bodyType}`);
        params.push(`body`);
      }

      const paramsStr = params.length > 0 ? params.join(', ') : '';
      const paramDecoratorsStr = paramDecorators.length > 0 ? '\n    ' + paramDecorators.join(',\n    ') : '';

      // 生成权限和角色装饰器
      // 如果类级别已经应用了 JwtAuthGuard，方法级别就不需要重复
      const guards: string[] = [];
      // 只有在类级别没有应用 JwtAuthGuard，或者当前端点需要认证但类级别不需要时，才添加 JwtAuthGuard
      if (!defaultRequireAuth && requireAuth) {
        guards.push('JwtAuthGuard');
      }
      guards.push('RolesGuard', 'PermissionsGuard');
      
      const rolesDecorator = endpoint.roles && endpoint.roles.length > 0
        ? `\n  @Roles(${endpoint.roles.map(r => `'${r}'`).join(', ')})`
        : '';
      
      const permissionDecorator = endpoint.permission
        ? `\n  @Permissions('${endpoint.permission}')`
        : '';

      const comment = endpoint.description 
        ? `\n  /**\n   * ${endpoint.description}\n   */`
        : '';

      const controllerMethodName = this.toCamelCase(methodName);
      // 生成方法调用参数（只传变量名，不传类型）
      const callParams = params.map(p => {
        // 提取变量名（去掉类型声明）
        const match = p.match(/^(\w+)(?::|$)/);
        return match ? match[1] : p;
      }).join(', ');
      
      endpoints.push(`${comment}
  ${pathDecorator}
  @UseGuards(${guards.join(', ')})
${rolesDecorator}${permissionDecorator}
  ${controllerMethodName}(${paramDecoratorsStr}) {
    return this.${serviceVarName}.${methodName}(${callParams});
  }`);
    });

    return endpoints.length > 0 ? '\n' + endpoints.join('\n') : '';
  }

  /**
   * 获取 HTTP 方法装饰器名称
   */
  private getMethodDecorator(method: string): string {
    const decorators: Record<string, string> = {
      'get': 'Get',
      'post': 'Post',
      'put': 'Put',
      'patch': 'Patch',
      'delete': 'Delete',
    };
    return decorators[method.toLowerCase()] || 'Get';
  }

  /**
   * 根据路径和方法生成 Service 方法名称
   */
  private generateServiceMethodName(path: string, method: string): string {
    const cleanPath = path.replace(/:[^/]+/g, '');
    const parts = cleanPath.split('/').filter(Boolean);
    // 将连字符转换为驼峰命名
    const camelPath = parts.map((p, i) => {
      const camel = p.split('-').map((word, idx) => 
        idx === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
      ).join('');
      return i === 0 ? camel : camel.charAt(0).toUpperCase() + camel.slice(1);
    }).join('');
    const prefix = method === 'get' ? 'get' : method === 'post' ? 'create' : 
                   ['put', 'patch'].includes(method) ? 'update' : method === 'delete' ? 'delete' : '';
    return `${prefix}${camelPath.charAt(0).toUpperCase()}${camelPath.slice(1)}`;
  }

  /**
   * 映射类型到 TypeScript 类型
   */
  private mapTypeToTypeScript(type: string): string {
    const typeMap: Record<string, string> = {
      'string': 'string',
      'number': 'number',
      'boolean': 'boolean',
      'date': 'Date',
    };
    return typeMap[type] || 'any';
  }

  /**
   * 转换为 PascalCase
   */
  private toPascalCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * 转换为 camelCase
   */
  private toCamelCase(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
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

