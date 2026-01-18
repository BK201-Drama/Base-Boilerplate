/**
 * Service 生成器
 * 根据 ResourceDefinition 生成 Service 类
 */

import { ResourceDefinition } from '../types/resource.types';
import * as path from 'path';
import * as fs from 'fs';

export class ServiceGenerator {
  /**
   * 生成 Service 代码
   */
  generateService(resource: ResourceDefinition): string {
    const className = this.toPascalCase(resource.name);
    const entityName = resource.prismaModel;
    const modelName = resource.pluralName || `${resource.name}s`;
    const createDtoName = `Create${className}Dto`;
    const updateDtoName = `Update${className}Dto`;

    // 生成 defaultSelect
    const defaultSelect = this.generateDefaultSelect(resource);

    // 生成生命周期钩子
    const hooks = this.generateHooks(resource);

    // 生成关联查询方法（如果有joins配置）
    const joinMethods = this.generateJoinMethods(resource, className);

    // 生成自定义端点对应的方法（如果有customEndpoints配置）
    const customEndpointMethods = this.generateCustomEndpointMethods(resource, className);

    // 检查需要注入的其他 Repository（用于内存拼接策略）
    const requiredRepositories = this.getRequiredRepositories(resource);
    const repositoryImports = this.generateRepositoryImports(requiredRepositories);
    const repositoryInjections = this.generateRepositoryInjections(requiredRepositories);

    return `import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { BaseCrudService } from '../../common/services/base-crud.service';
import { ${className}Repository } from './${resource.name}.repository';${repositoryImports}
import { ${createDtoName} } from './dto/create-${resource.name}.dto';
import { ${updateDtoName} } from './dto/update-${resource.name}.dto';
import { ${entityName} } from '@prisma/client';

@Injectable()
export class ${className}Service extends BaseCrudService<
  ${entityName},
  ${createDtoName},
  ${updateDtoName},
  '${modelName}'
> {
  protected readonly modelName = '${modelName}' as const;
  protected readonly defaultPageSize = ${resource.defaultPageSize || 10};
  protected readonly defaultSelect = ${defaultSelect} as const;

  constructor(
    repository: ${className}Repository,
    i18n: I18nService${repositoryInjections}
  ) {
    super(repository, i18n);
  }
${joinMethods}${hooks}${customEndpointMethods}
}
`;
  }

  /**
   * 生成 defaultSelect
   */
  private generateDefaultSelect(resource: ResourceDefinition): string {
    const fields = resource.fields.filter(
      (f) => f.includeInList !== false && f.name !== 'password',
    );

    if (resource.defaultSelect) {
      return JSON.stringify(resource.defaultSelect, null, 2);
    }

    const select: Record<string, boolean> = {
      id: true,
    };

    fields.forEach((field) => {
      if (field.type !== 'relation') {
        select[field.name] = true;
      }
    });

    // 添加时间戳字段（如果存在）
    if (resource.fields.some((f) => f.name === 'createdAt')) {
      select.createdAt = true;
    }
    if (resource.fields.some((f) => f.name === 'updatedAt')) {
      select.updatedAt = true;
    }

    return JSON.stringify(select, null, 2);
  }

  /**
   * 生成关联查询方法
   */
  private generateJoinMethods(resource: ResourceDefinition, className: string): string {
    if (!resource.joins || resource.joins.length === 0) {
      return '';
    }

    const methods: string[] = [];
    
    // 检查是否有使用 memory 策略的关联
    const hasMemoryStrategy = resource.joins.some(join => 
      join.joinStrategy === 'memory' || this.hasMemoryStrategyInNested(join.nested)
    );

    if (hasMemoryStrategy) {
      // 混合策略：部分使用 SQL JOIN，部分使用内存拼接
      const sqlJoins = resource.joins.filter(join => 
        !join.joinStrategy || join.joinStrategy === 'sql'
      );
      const memoryJoins = resource.joins.filter(join => 
        join.joinStrategy === 'memory'
      );

      // 生成混合策略的方法
      if (sqlJoins.length > 0 || memoryJoins.length > 0) {
        methods.push(this.generateMemoryJoinMethods(resource, className, sqlJoins, memoryJoins, true));
        methods.push(this.generateMemoryJoinMethods(resource, className, sqlJoins, memoryJoins, false));
      }
    } else {
      // 全部使用 SQL JOIN 策略
      const includeConfig = this.generateIncludeConfig(resource.joins, true);
      const detailIncludeConfig = this.generateIncludeConfig(resource.joins, false);

      // 重写 findAll 方法以包含关联数据
      if (includeConfig && includeConfig !== 'undefined') {
        methods.push(`
  /**
   * 分页查询（包含关联数据，使用 SQL JOIN）
   */
  async findAll(pagination?: { page?: number; limit?: number }, options?: any) {
    return super.findAll(pagination, {
      ...options,
      include: ${includeConfig},
    });
  }`);
      }

      // 重写 findOne 方法以包含关联数据
      if (detailIncludeConfig && detailIncludeConfig !== 'undefined') {
        methods.push(`
  /**
   * 根据ID查询（包含关联数据，使用 SQL JOIN）
   */
  async findOne(id: string, options?: any) {
    return super.findOne(id, {
      ...options,
      include: ${detailIncludeConfig},
    });
  }`);
      }
    }

    return methods.join('\n');
  }

  /**
   * 检查嵌套关联中是否有 memory 策略
   */
  private hasMemoryStrategyInNested(nested?: ResourceDefinition['joins']): boolean {
    if (!nested || nested.length === 0) {
      return false;
    }
    return nested.some(join => 
      join.joinStrategy === 'memory' || this.hasMemoryStrategyInNested(join.nested)
    );
  }

  /**
   * 生成内存拼接策略的查询方法
   */
  private generateMemoryJoinMethods(
    resource: ResourceDefinition,
    className: string,
    sqlJoins: ResourceDefinition['joins'],
    memoryJoins: ResourceDefinition['joins'],
    forList: boolean
  ): string {
    const methodName = forList ? 'findAll' : 'findOne';
    const methodComment = forList 
      ? '分页查询（包含关联数据，部分使用内存拼接）'
      : '根据ID查询（包含关联数据，部分使用内存拼接）';
    const methodParams = forList
      ? 'pagination?: { page?: number; limit?: number }, options?: any'
      : 'id: string, options?: any';

    // 生成 SQL JOIN 的 include 配置
    const sqlIncludeConfig = sqlJoins && sqlJoins.length > 0
      ? this.generateIncludeConfig(sqlJoins, forList)
      : 'undefined';

    // 生成内存拼接逻辑
    const memoryJoinCode = this.generateMemoryJoinCode(memoryJoins, forList, resource.prismaModel);

    if (forList) {
      return `
  /**
   * ${methodComment}
   */
  async ${methodName}(${methodParams}) {
    // 先查询主表数据（包含 SQL JOIN 的关联）
    const result = await super.findAll(pagination, {
      ...options,
      ${sqlIncludeConfig !== 'undefined' ? `include: ${sqlIncludeConfig},` : ''}
    });

    // 内存拼接关联数据
    ${memoryJoinCode}

    return result;
  }`;
    } else {
      return `
  /**
   * ${methodComment}
   */
  async ${methodName}(${methodParams}) {
    // 先查询主表数据（包含 SQL JOIN 的关联）
    const result = await super.findOne(id, {
      ...options,
      ${sqlIncludeConfig !== 'undefined' ? `include: ${sqlIncludeConfig},` : ''}
    });

    if (!result) {
      return null;
    }

    // 内存拼接关联数据
    ${memoryJoinCode}

    return result;
  }`;
    }
  }

  /**
   * 获取需要注入的 Repository 列表（用于内存拼接策略）
   */
  private getRequiredRepositories(resource: ResourceDefinition): string[] {
    if (!resource.joins) {
      return [];
    }

    const repositories = new Set<string>();
    
    const collectRepositories = (joins: ResourceDefinition['joins']) => {
      if (!joins) return;
      
      joins.forEach(join => {
        if (join.joinStrategy === 'memory') {
          repositories.add(join.model);
        }
        if (join.nested) {
          collectRepositories(join.nested);
        }
      });
    };

    collectRepositories(resource.joins);
    return Array.from(repositories);
  }

  /**
   * 生成 Repository 导入语句
   */
  private generateRepositoryImports(repositoryModels: string[]): string {
    if (repositoryModels.length === 0) {
      return '';
    }

    return repositoryModels.map(model => {
      const repositoryName = `${model}Repository`;
      const resourceName = this.toCamelCase(model);
      return `\nimport { ${repositoryName} } from '../${resourceName}/${resourceName}.repository';`;
    }).join('');
  }

  /**
   * 生成 Repository 注入代码
   */
  private generateRepositoryInjections(repositoryModels: string[]): string {
    if (repositoryModels.length === 0) {
      return '';
    }

    return repositoryModels.map(model => {
      const repositoryName = `${model}Repository`;
      const repositoryVarName = this.toCamelCase(repositoryName);
      return `,\n    private readonly ${repositoryVarName}: ${repositoryName}`;
    }).join('');
  }

  /**
   * 生成内存拼接代码（使用 Repository 而不是直接使用 Prisma）
   */
  private generateMemoryJoinCode(
    memoryJoins: ResourceDefinition['joins'],
    forList: boolean,
    prismaModel: string
  ): string {
    if (!memoryJoins || memoryJoins.length === 0) {
      return '';
    }

    const code: string[] = [];
    const entityVar = forList ? 'item' : 'result';

    memoryJoins.forEach((join) => {
      const fieldName = join.field;
      const modelName = join.model;
      const repositoryVarName = this.toCamelCase(`${modelName}Repository`);
      
      // 构建 select 对象
      let selectConfig = 'undefined';
      if (join.select && join.select.length > 0) {
        const selectObj: Record<string, boolean> = {};
        join.select.forEach(field => {
          selectObj[field] = true;
        });
        // 格式化为代码字符串
        const selectFields = join.select.map(f => `${f}: true`).join(', ');
        selectConfig = `{\n        ${selectFields}\n      }`;
      }

      // 收集关联 ID（通常外键字段是 field + 'Id'）
      const idField = `${fieldName}Id`;
      
      if (forList) {
        code.push(`
    // 拼接 ${fieldName} (${modelName}) - 内存拼接策略
    const ${fieldName}Ids = [...new Set(result.data.map(item => item.${idField}).filter(Boolean))];`);
        code.push(`    if (${fieldName}Ids.length > 0) {`);
        code.push(`      const ${fieldName}Data = await this.${repositoryVarName}.findByIds(${fieldName}Ids, {
        select: ${selectConfig}
      });`);
        code.push(`      
      const ${fieldName}Map = new Map(${fieldName}Data.map(item => [item.id, item]));
      result.data.forEach(${entityVar} => {
        ${entityVar}.${fieldName} = ${entityVar}.${idField} ? ${fieldName}Map.get(${entityVar}.${idField}) || null : null;
      });`);
        code.push(`    }`);
      } else {
        code.push(`
    // 拼接 ${fieldName} (${modelName}) - 内存拼接策略
    if (result.${idField}) {
      const ${fieldName}Data = await this.${repositoryVarName}.findOne(result.${idField}, {
        select: ${selectConfig}
      });
      result.${fieldName} = ${fieldName}Data || null;
    }`);
      }

      // 处理嵌套关联（仅支持 SQL JOIN，因为内存拼接嵌套关联过于复杂）
      if (join.nested && join.nested.length > 0) {
        code.push(`
    // 注意：嵌套关联建议使用 SQL JOIN 策略，内存拼接嵌套关联需要手动实现`);
      }
    });

    return code.join('\n');
  }

  /**
   * 生成 Prisma include 配置
   */
  private generateIncludeConfig(joins: ResourceDefinition['joins'], forList: boolean): string {
    if (!joins || joins.length === 0) {
      return 'undefined';
    }

    const include: Record<string, any> = {};

    joins.forEach((join) => {
      // 检查是否应该在当前查询中包含
      if (forList && join.includeInList === false) {
        return;
      }
      if (!forList && join.includeInDetail === false) {
        return;
      }

      const fieldName = join.field || this.toCamelCase(join.model);
      
      // 处理嵌套关联
      if (join.nested && join.nested.length > 0) {
        // 有嵌套关联时，必须使用 include（不能使用 select）
        const nestedInclude: Record<string, any> = {};
        join.nested.forEach((nestedJoin) => {
          const nestedFieldName = nestedJoin.field || this.toCamelCase(nestedJoin.model);
          if (nestedJoin.select && nestedJoin.select.length > 0) {
            const nestedSelect: Record<string, boolean> = {};
            nestedJoin.select.forEach((field) => {
              nestedSelect[field] = true;
            });
            nestedInclude[nestedFieldName] = { select: nestedSelect };
          } else {
            nestedInclude[nestedFieldName] = true;
          }
        });
        include[fieldName] = {
          include: nestedInclude,
        };
      } else if (join.select && join.select.length > 0) {
        // 没有嵌套关联，且指定了select字段，使用select
        const select: Record<string, boolean> = {};
        join.select.forEach((field) => {
          select[field] = true;
        });
        include[fieldName] = { select };
      } else {
        // 没有嵌套关联，也没有指定select，包含所有字段
        include[fieldName] = true;
      }
    });

    if (Object.keys(include).length === 0) {
      return 'undefined';
    }

    // 生成格式化的代码字符串
    return this.formatIncludeObject(include);
  }

  /**
   * 格式化 include 对象为代码字符串
   */
  private formatIncludeObject(include: Record<string, any>): string {
    // 递归格式化对象
    const formatValue = (val: any, indent: string = '      '): string => {
      if (val === true) {
        return 'true';
      }
      if (typeof val === 'object' && val !== null) {
        const lines: string[] = ['{'];
        const entries = Object.entries(val);
        entries.forEach(([key, value], index) => {
          const isLast = index === entries.length - 1;
          const formattedValue = formatValue(value, indent + '  ');
          lines.push(`${indent}${key}: ${formattedValue}${isLast ? '' : ','}`);
        });
        // 修正缩进：移除最后两格缩进
        const closingIndent = indent.length >= 2 ? indent.slice(2) : '';
        lines.push(`${closingIndent}}`);
        return lines.join('\n');
      }
      return String(val);
    };

    return formatValue(include, '      ');
  }

  /**
   * 转换为驼峰命名
   */
  private toCamelCase(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  /**
   * 生成生命周期钩子
   */
  private generateHooks(resource: ResourceDefinition): string {
    const hooks: string[] = [];
    const className = this.toPascalCase(resource.name);
    const createDtoName = `Create${className}Dto`;
    const updateDtoName = `Update${className}Dto`;

    if (resource.hooks?.beforeCreate) {
      hooks.push(`
  protected async beforeCreate(data: ${createDtoName}): Promise<any> {
    // TODO: 实现创建前处理逻辑
    return data;
  }`);
    }

    if (resource.hooks?.afterCreate) {
      hooks.push(`
  protected async afterCreate(result: ${resource.prismaModel}): Promise<${resource.prismaModel}> {
    // TODO: 实现创建后处理逻辑
    return result;
  }`);
    }

    if (resource.hooks?.beforeUpdate) {
      hooks.push(`
  protected async beforeUpdate(id: string, data: ${updateDtoName}): Promise<any> {
    // TODO: 实现更新前处理逻辑
    return data;
  }`);
    }

    if (resource.hooks?.afterUpdate) {
      hooks.push(`
  protected async afterUpdate(result: ${resource.prismaModel}): Promise<${resource.prismaModel}> {
    // TODO: 实现更新后处理逻辑
    return result;
  }`);
    }

    if (resource.hooks?.beforeDelete) {
      hooks.push(`
  protected async beforeDelete(id: string): Promise<void> {
    // TODO: 实现删除前验证逻辑
  }`);
    }

    return hooks.join('\n');
  }

  /**
   * 生成自定义端点对应的方法
   */
  private generateCustomEndpointMethods(resource: ResourceDefinition, className: string): string {
    if (!resource.customEndpoints || resource.customEndpoints.length === 0) {
      return '';
    }

    const methods: string[] = [];

    resource.customEndpoints.forEach(endpoint => {
      const methodName = endpoint.serviceMethod || this.generateServiceMethodName(endpoint.path, endpoint.method);
      const methodComment = endpoint.description || `自定义接口：${endpoint.method.toUpperCase()} ${endpoint.path}`;
      
      // 生成参数
      const params: string[] = [];
      
      // 路径参数
      if (endpoint.params?.path) {
        endpoint.params.path.forEach(param => {
          params.push(`${param}: string`);
        });
      }
      
      // 查询参数
      if (endpoint.params?.query && endpoint.params.query.length > 0) {
        const queryParams = endpoint.params.query.map(q => {
          const optional = q.required ? '' : '?';
          return `${q.name}${optional}: ${q.type}`;
        }).join(', ');
        params.push(`query: { ${queryParams} }`);
      }
      
      // 请求体参数
      if (endpoint.params?.body && ['post', 'put', 'patch'].includes(endpoint.method)) {
        const bodyType = endpoint.params.body.type || 'any';
        params.push(`body: ${bodyType}`);
      }

      const paramsStr = params.length > 0 ? params.join(', ') : '';

      methods.push(`
  /**
   * ${methodComment}
   */
  async ${methodName}(${paramsStr}) {
    // TODO: 实现自定义接口逻辑
    throw new Error('Method not implemented');
  }`);
    });

    return methods.length > 0 ? '\n' + methods.join('\n') : '';
  }

  /**
   * 根据路径和方法生成 Service 方法名称
   */
  private generateServiceMethodName(path: string, method: string): string {
    const cleanPath = path.replace(/:[^/]+/g, '');
    const parts = cleanPath.split('/').filter(Boolean);
    const camelPath = parts.map((p, i) => i === 0 ? p : p.charAt(0).toUpperCase() + p.slice(1)).join('');
    const prefix = method === 'get' ? 'get' : method === 'post' ? 'create' : 
                   ['put', 'patch'].includes(method) ? 'update' : method === 'delete' ? 'delete' : '';
    return `${prefix}${camelPath.charAt(0).toUpperCase()}${camelPath.slice(1)}`;
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
    const serviceDir = path.join(outputDir, resource.name);

    // 创建目录
    if (!fs.existsSync(serviceDir)) {
      fs.mkdirSync(serviceDir, { recursive: true });
    }

    const servicePath = path.join(serviceDir, `${resource.name}.service.ts`);
    if (!fs.existsSync(servicePath) || overwrite) {
      fs.writeFileSync(servicePath, this.generateService(resource));
    }
  }
}
