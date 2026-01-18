/**
 * 代码生成器核心类
 * 协调各个生成器，生成完整的 CRUD 代码
 */

import { ResourceDefinition, CodeGenerationOptions } from './types/resource.types';
import { DtoGenerator } from './generators/dto.generator';
import { RepositoryGenerator } from './generators/repository.generator';
import { ServiceGenerator } from './generators/service.generator';
import { ControllerGenerator } from './generators/controller.generator';
import { ModuleGenerator } from './generators/module.generator';
import { PrismaSchemaGenerator } from './generators/prisma-schema.generator';
import * as path from 'path';
import * as fs from 'fs';

export class CodeGenerator {
  private dtoGenerator: DtoGenerator;
  private repositoryGenerator: RepositoryGenerator;
  private serviceGenerator: ServiceGenerator;
  private controllerGenerator: ControllerGenerator;
  private moduleGenerator: ModuleGenerator;
  private prismaSchemaGenerator: PrismaSchemaGenerator;

  constructor() {
    this.dtoGenerator = new DtoGenerator();
    this.repositoryGenerator = new RepositoryGenerator();
    this.serviceGenerator = new ServiceGenerator();
    this.controllerGenerator = new ControllerGenerator();
    this.moduleGenerator = new ModuleGenerator();
    this.prismaSchemaGenerator = new PrismaSchemaGenerator();
  }

  /**
   * 生成完整的 CRUD 代码
   */
  generate(
    resource: ResourceDefinition,
    options: CodeGenerationOptions = {},
  ): void {
    const {
      outputDir = path.join(process.cwd(), 'src'),
      overwrite = false,
      generateDto = true,
      generateRepository = true,
      generateService = true,
      generateController = true,
      generateModule = true,
      generatePrismaSchema = true,
    } = options;

    console.log(`\n🚀 开始生成 ${resource.name} 的 CRUD 代码...\n`);

    // 生成 DTO
    if (generateDto) {
      console.log(`📝 生成 DTO 文件...`);
      this.dtoGenerator.writeFiles(resource, outputDir, overwrite);
      console.log(`✅ DTO 文件已生成`);
    }

    // 生成 Repository
    if (generateRepository) {
      console.log(`🗄️  生成 Repository 文件...`);
      this.repositoryGenerator.writeFile(resource, outputDir, overwrite);
      console.log(`✅ Repository 文件已生成`);
    }

    // 生成 Service
    if (generateService) {
      console.log(`🔧 生成 Service 文件...`);
      this.serviceGenerator.writeFile(resource, outputDir, overwrite);
      console.log(`✅ Service 文件已生成`);
    }

    // 生成 Controller
    if (generateController) {
      console.log(`🎮 生成 Controller 文件...`);
      this.controllerGenerator.writeFile(resource, outputDir, overwrite);
      console.log(`✅ Controller 文件已生成`);
    }

    // 生成 Module
    if (generateModule) {
      console.log(`📦 生成 Module 文件...`);
      this.moduleGenerator.writeFile(resource, outputDir, overwrite);
      console.log(`✅ Module 文件已生成`);
    }

    // 更新 AppModule
    if (options.updateAppModule) {
      console.log(`📋 更新 AppModule...`);
      this.updateAppModule(resource, outputDir);
      console.log(`✅ AppModule 已更新`);
    }

    // 生成国际化文件
    if (options.generateI18n) {
      console.log(`🌐 生成国际化文件...`);
      this.generateI18nFiles(resource, outputDir);
      console.log(`✅ 国际化文件已生成`);
    }

    // 生成 Prisma Schema
    if (generatePrismaSchema) {
      console.log(`📋 生成 Prisma Schema...`);
      const useSeparateFiles = options.useSeparateSchemaFiles !== false; // 默认 true
      this.prismaSchemaGenerator.writeToSchemaFile(resource, undefined, useSeparateFiles);
      console.log(`✅ Prisma Schema 已生成`);
    }

    console.log(`\n✨ ${resource.name} 的 CRUD 代码生成完成！\n`);
  }

  /**
   * 更新 AppModule
   */
  private updateAppModule(
    resource: ResourceDefinition,
    outputDir: string,
  ): void {
    const appModulePath = path.join(outputDir, 'app.module.ts');

    if (!fs.existsSync(appModulePath)) {
      console.warn(`⚠️  AppModule 文件不存在: ${appModulePath}`);
      return;
    }

    const content = fs.readFileSync(appModulePath, 'utf-8');
    const className = this.toPascalCase(resource.name);
    const moduleName = `${className}Module`;

    // 检查是否已经导入
    if (content.includes(moduleName)) {
      console.log(`ℹ️  ${moduleName} 已在 AppModule 中注册`);
      return;
    }

    // 添加导入
    const importStatement = `import { ${moduleName} } from './${resource.name}/${resource.name}.module';`;
    const importsMatch = content.match(/import\s+.*from\s+['"]\.\/.*['"];?/g);

    if (importsMatch) {
      const lastImport = importsMatch[importsMatch.length - 1];
      const newContent = content.replace(
        lastImport,
        `${lastImport}\n${importStatement}`,
      );
      fs.writeFileSync(appModulePath, newContent);
    }

    // 添加到 @Module 装饰器的 imports 数组
    // 匹配 @Module({ imports: [...] }) 中的 imports 数组
    const moduleDecoratorMatch = content.match(/@Module\s*\(\s*\{[^}]*imports:\s*\[([^\]]+)\]/s);
    if (moduleDecoratorMatch) {
      const importsArray = moduleDecoratorMatch[1];
      // 检查是否已经存在
      if (importsArray.includes(moduleName)) {
        console.log(`ℹ️  ${moduleName} 已在 AppModule 的 imports 中`);
        return;
      }
      const newImportsArray = `${importsArray}\n    ${moduleName},`;
      const newContent = content.replace(
        /(@Module\s*\(\s*\{[^}]*imports:\s*\[)([^\]]+)(\])/s,
        `$1${newImportsArray}\n  $3`,
      );
      fs.writeFileSync(appModulePath, newContent);
    }
  }

  /**
   * 生成国际化文件
   */
  private generateI18nFiles(
    resource: ResourceDefinition,
    outputDir: string,
  ): void {
    const i18nDir = path.join(outputDir, 'i18n');
    const modelName = resource.pluralName || `${resource.name}s`;

    // 生成中文翻译
    const zhPath = path.join(i18nDir, 'zh', `${resource.name}.json`);
    const zhContent = {
      not_found: `${this.toPascalCase(resource.name)} 未找到`,
      deleted_success: `${this.toPascalCase(resource.name)} 删除成功`,
      batch_deleted_success: `批量删除 ${this.toPascalCase(resource.name)} 成功`,
    };

    if (!fs.existsSync(path.dirname(zhPath))) {
      fs.mkdirSync(path.dirname(zhPath), { recursive: true });
    }
    fs.writeFileSync(zhPath, JSON.stringify(zhContent, null, 2));

    // 生成英文翻译
    const enPath = path.join(i18nDir, 'en', `${resource.name}.json`);
    const enContent = {
      not_found: `${this.toPascalCase(resource.name)} not found`,
      deleted_success: `${this.toPascalCase(resource.name)} deleted successfully`,
      batch_deleted_success: `Batch deleted ${this.toPascalCase(resource.name)} successfully`,
    };

    if (!fs.existsSync(path.dirname(enPath))) {
      fs.mkdirSync(path.dirname(enPath), { recursive: true });
    }
    fs.writeFileSync(enPath, JSON.stringify(enContent, null, 2));
  }

  /**
   * 转换为 PascalCase
   */
  private toPascalCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
