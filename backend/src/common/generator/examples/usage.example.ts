/**
 * CRUD 代码生成器使用示例
 *
 * 这个文件展示了如何使用代码生成器的各种功能
 */

import { CodeGenerator, PrismaSchemaParser } from '../index';
import { ResourceDefinition } from '../types/resource.types';

// ============================================
// 示例 1: 从 Prisma Schema 自动生成
// ============================================

async function example1_FromPrismaSchema() {
  console.log('示例 1: 从 Prisma Schema 自动生成\n');

  const parser = new PrismaSchemaParser();
  const generator = new CodeGenerator();

  // 解析 User 模型
  const resource = parser.parseModel('User');

  // 生成代码
  generator.generate(resource, {
    overwrite: false,
    updateAppModule: true,
    generateI18n: true,
  });
}

// ============================================
// 示例 2: 手动定义资源并生成
// ============================================

async function example2_ManualDefinition() {
  console.log('示例 2: 手动定义资源并生成\n');

  const resource: ResourceDefinition = {
    name: 'product',
    pluralName: 'products',
    prismaModel: 'Product',
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
          {
            type: 'min',
            value: 2,
            message: 'validation.name_min_length',
          },
        ],
      },
      {
        name: 'price',
        type: 'number',
        required: true,
        includeInCreate: true,
        includeInUpdate: true,
        includeInList: true,
        includeInDetail: true,
        validations: [
          {
            type: 'required',
            message: 'validation.price_required',
          },
          {
            type: 'min',
            value: 0,
            message: 'validation.price_min',
          },
        ],
      },
      {
        name: 'description',
        type: 'string',
        required: false,
        includeInCreate: true,
        includeInUpdate: true,
        includeInList: false,
        includeInDetail: true,
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
      resource: 'product',
      createRoles: ['admin'],
      updateRoles: ['admin', 'manager'],
      deleteRoles: ['admin'],
      requireAuth: true,
    },
    defaultPageSize: 20,
    hooks: {
      beforeCreate: true,
      beforeUpdate: true,
      beforeDelete: true,
    },
  };

  const generator = new CodeGenerator();
  generator.generate(resource, {
    overwrite: false,
    updateAppModule: true,
    generateI18n: true,
  });
}

// ============================================
// 示例 3: 从配置文件加载
// ============================================

async function example3_FromConfigFile() {
  console.log('示例 3: 从配置文件加载\n');

  const fs = require('fs');
  const path = require('path');

  const configPath = path.join(__dirname, 'product.resource.json');
  const configContent = fs.readFileSync(configPath, 'utf-8');
  const resource: ResourceDefinition = JSON.parse(configContent);

  const generator = new CodeGenerator();
  generator.generate(resource, {
    overwrite: false,
    updateAppModule: true,
    generateI18n: true,
  });
}

// ============================================
// 示例 4: 批量生成多个资源
// ============================================

async function example4_BatchGeneration() {
  console.log('示例 4: 批量生成多个资源\n');

  const parser = new PrismaSchemaParser();
  const generator = new CodeGenerator();

  // 解析所有模型
  const models = parser.parseAllModels();

  // 过滤掉不需要生成的模型（如中间表）
  const resourcesToGenerate = models.filter(
    (model) => !model.name.includes('Role') && !model.name.includes('Permission'),
  );

  // 批量生成
  resourcesToGenerate.forEach((resource) => {
    generator.generate(resource, {
      overwrite: false,
      updateAppModule: false, // 最后统一更新
      generateI18n: true,
    });
  });

  console.log('\n✅ 批量生成完成！');
  console.log('⚠️  请手动更新 AppModule 以导入所有生成的模块');
}

// ============================================
// 示例 5: 自定义生成选项
// ============================================

async function example5_CustomOptions() {
  console.log('示例 5: 自定义生成选项\n');

  const parser = new PrismaSchemaParser();
  const generator = new CodeGenerator();

  const resource = parser.parseModel('User');

  // 只生成 DTO 和 Service，不生成 Controller 和 Module
  generator.generate(resource, {
    overwrite: false,
    generateDto: true,
    generateService: true,
    generateController: false,
    generateModule: false,
    updateAppModule: false,
    generateI18n: false,
  });
}

// ============================================
// 运行示例
// ============================================

// 取消注释以运行特定示例：

// example1_FromPrismaSchema();
// example2_ManualDefinition();
// example3_FromConfigFile();
// example4_BatchGeneration();
// example5_CustomOptions();

