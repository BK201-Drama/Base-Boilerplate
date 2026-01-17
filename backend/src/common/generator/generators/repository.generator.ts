/**
 * Repository 生成器
 * 根据 ResourceDefinition 生成 Repository 类
 */

import { ResourceDefinition } from '../types/resource.types';
import * as path from 'path';
import * as fs from 'fs';

export class RepositoryGenerator {
  /**
   * 生成 Repository 代码
   */
  generateRepository(resource: ResourceDefinition): string {
    const className = this.toPascalCase(resource.name);
    const entityName = resource.prismaModel;
    const modelName = resource.pluralName || `${resource.name}s`;

    // 生成 defaultSelect
    const defaultSelect = this.generateDefaultSelect(resource);

    return `import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BaseCrudRepository } from '../../common/repositories/base-crud.repository';
import { ${entityName} } from '@prisma/client';

/**
 * ${resource.description || `${className} Repository`}
 * 数据访问层，负责与数据库交互
 */
@Injectable()
export class ${className}Repository extends BaseCrudRepository<
  ${entityName},
  any,
  any
> {
  protected readonly defaultPageSize = ${resource.defaultPageSize || 10};
  protected readonly defaultSelect = ${defaultSelect} as const;

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  protected getModelDelegate() {
    return this.prisma.${resource.name};
  }
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
    const repositoryDir = path.join(outputDir, resource.name);

    // 创建目录
    if (!fs.existsSync(repositoryDir)) {
      fs.mkdirSync(repositoryDir, { recursive: true });
    }

    const repositoryPath = path.join(repositoryDir, `${resource.name}.repository.ts`);
    if (!fs.existsSync(repositoryPath) || overwrite) {
      fs.writeFileSync(repositoryPath, this.generateRepository(resource));
    }
  }
}

