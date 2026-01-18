/**
 * Module 生成器
 * 根据 ResourceDefinition 生成 Module 类
 */

import { ResourceDefinition } from '../types/resource.types';
import * as path from 'path';
import * as fs from 'fs';

export class ModuleGenerator {
  /**
   * 生成 Module 代码
   */
  generateModule(resource: ResourceDefinition): string {
    const className = this.toPascalCase(resource.name);
    const serviceName = `${className}Service`;
    const controllerName = `${className}Controller`;

    // 检测需要导入的其他 Module（用于内存拼接策略的 Repository）
    const requiredModules = this.getRequiredModules(resource);
    const moduleImports = this.generateModuleImports(requiredModules);

    return `import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';${moduleImports}
import { ${serviceName} } from './${resource.name}.service';
import { ${controllerName} } from './${resource.name}.controller';
import { ${className}Repository } from './${resource.name}.repository';

@Module({
  imports: [PrismaModule${requiredModules.length > 0 ? ',' + requiredModules.map(m => `\n    ${m}Module`).join(',') : ''}],
  controllers: [${controllerName}],
  providers: [${className}Repository, ${serviceName}],
  exports: [${serviceName}],
})
export class ${className}Module {}
`;
  }

  /**
   * 获取需要导入的其他 Module（用于内存拼接策略）
   */
  private getRequiredModules(resource: ResourceDefinition): string[] {
    if (!resource.joins) {
      return [];
    }

    const modules = new Set<string>();
    
    const collectModules = (joins: ResourceDefinition['joins']) => {
      if (!joins) return;
      
      joins.forEach(join => {
        if (join.joinStrategy === 'memory') {
          modules.add(join.model);
        }
        if (join.nested) {
          collectModules(join.nested);
        }
      });
    };

    collectModules(resource.joins);
    return Array.from(modules);
  }

  /**
   * 生成 Module 导入语句
   */
  private generateModuleImports(moduleModels: string[]): string {
    if (moduleModels.length === 0) {
      return '';
    }

    return moduleModels.map(model => {
      const moduleName = `${model}Module`;
      const resourceName = this.toCamelCase(model);
      return `\nimport { ${moduleName} } from '@/${resourceName}/${resourceName}.module';`;
    }).join('');
  }

  /**
   * 转换为 camelCase
   */
  private toCamelCase(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
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
    const moduleDir = path.join(outputDir, resource.name);

    // 创建目录
    if (!fs.existsSync(moduleDir)) {
      fs.mkdirSync(moduleDir, { recursive: true });
    }

    const modulePath = path.join(moduleDir, `${resource.name}.module.ts`);
    if (!fs.existsSync(modulePath) || overwrite) {
      fs.writeFileSync(modulePath, this.generateModule(resource));
    }
  }
}
