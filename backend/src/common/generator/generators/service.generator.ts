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

    return `import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { BaseCrudService } from '../../common/services/base-crud.service';
import { ${className}Repository } from './${resource.name}.repository';
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
    i18n: I18nService,
  ) {
    super(repository, i18n);
  }
${hooks}
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
