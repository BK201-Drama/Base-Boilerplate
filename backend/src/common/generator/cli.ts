#!/usr/bin/env node

/**
 * CRUD 代码生成 CLI 工具
 *
 * 使用方法：
 * npm run generate:crud <model-name>
 * npm run generate:crud <model-name> -- --from-schema
 * npm run generate:crud <model-name> -- --config <config-file>
 */

import { CodeGenerator } from './code-generator';
import { PrismaSchemaParser } from './parsers/prisma.parser';
import { ResourceDefinition } from './types/resource.types';
import * as fs from 'fs';
import * as path from 'path';

// 解析命令行参数
const args = process.argv.slice(2);
const modelName = args[0];
const fromSchema = args.includes('--from-schema');
const configFile = args.find((arg) => arg.startsWith('--config='))?.split('=')[1];
const overwrite = args.includes('--overwrite');
const modulesDir = args.find((arg) => arg.startsWith('--modulesDir='))?.split('=')[1];

if (!modelName) {
  console.error('❌ 错误: 请提供模型名称');
  console.log('\n使用方法:');
  console.log('  npm run generate:crud <model-name>');
  console.log('  npm run generate:crud <model-name> -- --from-schema');
  console.log('  npm run generate:crud <model-name> -- --config <config-file>');
  console.log('  npm run generate:crud <model-name> -- --overwrite');
  console.log('  npm run generate:crud <model-name> -- --modulesDir=modules');
  console.log('  npm run generate:crud <model-name> -- --modulesDir=modules/takeout');
  process.exit(1);
}

async function main() {
  const generator = new CodeGenerator();
  let resource: ResourceDefinition;

  try {
    if (configFile) {
      // 从配置文件加载
      console.log(`📄 从配置文件加载: ${configFile}`);
      const configPath = path.resolve(configFile);
      if (!fs.existsSync(configPath)) {
        throw new Error(`配置文件不存在: ${configPath}`);
      }
      const configContent = fs.readFileSync(configPath, 'utf-8');
      resource = JSON.parse(configContent) as ResourceDefinition;
    } else if (fromSchema) {
      // 从 Prisma Schema 解析
      console.log(`🔍 从 Prisma Schema 解析模型: ${modelName}`);
      const parser = new PrismaSchemaParser();
      resource = parser.parseModel(modelName);
    } else {
      // 使用默认配置
      console.log(`⚙️  使用默认配置生成: ${modelName}`);
      resource = createDefaultResource(modelName);
    }

    // 生成代码
    generator.generate(resource, {
      overwrite,
      modulesDir,
      generateDto: true,
      generateService: true,
      generateController: true,
      generateModule: true,
      updateAppModule: true,
      generateI18n: true,
    });

    const className = toPascalCase(resource.name);
    const modulePath = modulesDir
      ? `src/${modulesDir}/${resource.name}/`
      : `src/${resource.name}/`;
    console.log('\n📚 下一步:');
    console.log(`1. 检查生成的文件: ${modulePath}`);
    console.log(`2. 根据需要调整 Service 和 Controller`);
    console.log(`3. 确保 AppModule 已正确导入 ${className}Module`);
    console.log(`4. 运行应用并测试 API 端点\n`);
  } catch (error) {
    console.error('❌ 生成失败:', error.message);
    process.exit(1);
  }
}

/**
 * 创建默认资源定义
 */
function createDefaultResource(modelName: string): ResourceDefinition {
  const pascalName = modelName.charAt(0).toUpperCase() + modelName.slice(1);
  const pluralName = modelName.endsWith('s') ? modelName : `${modelName}s`;

  return {
    name: modelName,
    pluralName,
    prismaModel: pascalName,
    fields: [
      {
        name: 'name',
        type: 'string',
        required: true,
        includeInCreate: true,
        includeInUpdate: true,
        includeInList: true,
        includeInDetail: true,
        validations: [
          {
            type: 'required',
            message: 'validation.name_required',
          },
        ],
      },
    ],
    operations: {
      create: true,
      read: true,
      update: true,
      delete: true,
      list: true,
    },
    permissions: {
      resource: modelName,
      requireAuth: true,
    },
    defaultPageSize: 10,
  };
}

/**
 * 转换为 PascalCase
 */
function toPascalCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

main();
