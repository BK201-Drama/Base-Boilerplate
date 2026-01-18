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
    
    // 生成自定义端点
    const customEndpoints = this.generateCustomEndpoints(resource, resourceName, requireAuth);
    
    // 生成导入语句
    const createDtoName = `Create${className}Dto`;
    const updateDtoName = `Update${className}Dto`;
    const imports = this.generateImports(requireAuth, resource.operations, resource.customEndpoints);
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
${endpoints}${customEndpoints}
}
`;
  }

  /**
   * 生成导入语句
   */
  private generateImports(
    requireAuth: boolean, 
    operations?: ResourceDefinition['operations'],
    customEndpoints?: ResourceDefinition['customEndpoints']
  ): string {
    const imports = new Set<string>(['Controller']);
    
    if (operations?.create !== false) {
      imports.add('Post');
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

    if (resource.operations?.create !== false) {
      endpoints.push(`
  @Post()
  @UseGuards(${requireAuth ? 'JwtAuthGuard, ' : ''}RolesGuard, PermissionsGuard)
  ${createRoles.length > 0 ? `@Roles(${createRoles.map(r => `'${r}'`).join(', ')})` : ''}
  @Permissions('${resourceName}:create')
  create(@Body() createDto: ${createDtoName}) {
    return this.${serviceVarName}.create(createDto);
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
    return this.${serviceVarName}.findAll({ page, limit });
  }`);
    }

    if (resource.operations?.read !== false) {
      endpoints.push(`
  @Get(':id')
  @UseGuards(${requireAuth ? 'JwtAuthGuard, ' : ''}RolesGuard, PermissionsGuard)
  @Permissions('${resourceName}:read')
  findOne(@Param('id') id: string) {
    return this.${serviceVarName}.findOne(id);
  }`);
    }

    if (resource.operations?.update !== false) {
      endpoints.push(`
  @Patch(':id')
  @UseGuards(${requireAuth ? 'JwtAuthGuard, ' : ''}RolesGuard, PermissionsGuard)
  ${updateRoles.length > 0 ? `@Roles(${updateRoles.map(r => `'${r}'`).join(', ')})` : ''}
  @Permissions('${resourceName}:update')
  update(@Param('id') id: string, @Body() updateDto: ${updateDtoName}) {
    return this.${serviceVarName}.update(id, updateDto);
  }`);
    }

    if (resource.operations?.delete !== false) {
      endpoints.push(`
  @Delete(':id')
  @UseGuards(${requireAuth ? 'JwtAuthGuard, ' : ''}RolesGuard, PermissionsGuard)
  ${deleteRoles.length > 0 ? `@Roles(${deleteRoles.map(r => `'${r}'`).join(', ')})` : ''}
  @Permissions('${resourceName}:delete')
  remove(@Param('id') id: string) {
    return this.${serviceVarName}.remove(id);
  }`);
    }
    
    // 批量删除
    if (resource.operations?.batchDelete === true) {
      endpoints.push(`
  @Delete('batch')
  @UseGuards(${requireAuth ? 'JwtAuthGuard, ' : ''}RolesGuard, PermissionsGuard)
  ${deleteRoles.length > 0 ? `@Roles(${deleteRoles.map(r => `'${r}'`).join(', ')})` : ''}
  @Permissions('${resourceName}:delete')
  batchDelete(@Body() body: { ids: string[] }) {
    return this.${serviceVarName}.deleteMany(body.ids);
  }`);
    }

    return endpoints.join('\n');
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
      const guards: string[] = [];
      if (requireAuth) guards.push('JwtAuthGuard');
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

