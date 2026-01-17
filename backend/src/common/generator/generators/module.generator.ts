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

    return `import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ${serviceName} } from './${resource.name}.service';
import { ${controllerName} } from './${resource.name}.controller';
import { ${className}Repository } from './${resource.name}.repository';

@Module({
  imports: [PrismaModule],
  controllers: [${controllerName}],
  providers: [${className}Repository, ${serviceName}],
  exports: [${serviceName}],
})
export class ${className}Module {}
`;
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
