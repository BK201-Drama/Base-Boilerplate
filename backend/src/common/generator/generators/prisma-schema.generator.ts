/**
 * Prisma Schema 生成器
 * 根据 ResourceDefinition 生成 Prisma Schema 模型定义
 */

import { ResourceDefinition, FieldConfig } from '../types/resource.types';
import * as path from 'path';
import * as fs from 'fs';

export class PrismaSchemaGenerator {
  /**
   * 生成 Prisma Schema 模型定义
   */
  generateModel(resource: ResourceDefinition): string {
    const modelName = resource.prismaModel;
    const fields = this.generateFields(resource);
    const mapName = this.toSnakeCase(resource.name);

    return `// ${resource.description || `${modelName} 模型`}
model ${modelName} {
${fields}

  @@map("${mapName}")
}
`;
  }

  /**
   * 生成字段定义
   */
  private generateFields(resource: ResourceDefinition): string {
    const fields: string[] = [];

    // ID 字段
    fields.push('  id        Int      @id @default(autoincrement())');

    // 普通字段
    resource.fields.forEach((field) => {
      if (field.type === 'relation') {
        // 关联字段会在后面单独处理
        return;
      }

      const fieldDef = this.generateFieldDefinition(field, resource.prismaModel);
      if (fieldDef) {
        fields.push(fieldDef);
      }
    });

    // 关联字段（外键）
    if (resource.joins) {
      resource.joins.forEach((join) => {
        const foreignKeyField = `${join.field}Id`;
        // 检查是否已经存在（可能配置中已经定义了）
        const alreadyExists = resource.fields.some(f => f.name === foreignKeyField);
        if (!alreadyExists) {
          // 判断是否可选：如果字段名是复数，可能是 many-to-many，不需要外键
          const isPlural = join.field.endsWith('s') || join.field.endsWith('ies');
          if (!isPlural) {
            // 只有非复数关系才需要外键（many-to-one 或 one-to-one）
            const optional = '?'; // 默认可选，避免循环依赖
            fields.push(`  ${foreignKeyField} String${optional}`);
          }
        }
      });
    }

    // 时间戳字段
    if (resource.fields.some((f) => f.name === 'createdAt') || 
        resource.fields.some((f) => f.name === 'updatedAt')) {
      // 如果配置中没有，自动添加
      if (!resource.fields.some((f) => f.name === 'createdAt')) {
        fields.push('  createdAt DateTime @default(now())');
      }
      if (!resource.fields.some((f) => f.name === 'updatedAt')) {
        fields.push('  updatedAt DateTime @updatedAt');
      }
    } else {
      // 默认添加时间戳
      fields.push('  createdAt DateTime @default(now())');
      fields.push('  updatedAt DateTime @updatedAt');
    }

    // 关联关系定义
    if (resource.joins) {
      fields.push(''); // 空行分隔
      resource.joins.forEach((join) => {
        const relationDef = this.generateRelationDefinition(join, resource.prismaModel);
        if (relationDef) {
          fields.push(relationDef);
        }
      });
    }

    return fields.join('\n');
  }

  /**
   * 生成字段定义
   */
  private generateFieldDefinition(field: FieldConfig, modelName: string): string | null {
    const prismaType = this.mapFieldTypeToPrisma(field, modelName);
    if (!prismaType) {
      return null;
    }

    const optional = field.required === false ? '?' : '';
    const unique = field.unique ? ' @unique' : '';
    const defaultValue = this.generateDefaultValue(field);
    const dbType = this.generateDbType(field);

    // Prisma 语法：可选标记在类型后面，如 String? 而不是 name? String
    let fieldDef = `  ${field.name} ${prismaType}${optional}${dbType}${defaultValue}${unique}`;

    // 添加注释
    if (field.description) {
      fieldDef = `  // ${field.description}\n${fieldDef}`;
    }

    return fieldDef;
  }

  /**
   * 映射字段类型到 Prisma 类型
   */
  private mapFieldTypeToPrisma(field: FieldConfig, modelName: string): string | null {
    switch (field.type) {
      case 'string':
        return 'String';
      case 'number':
        return 'Int';
      case 'boolean':
        return 'Boolean';
      case 'date':
        return 'DateTime';
      case 'enum':
        if (field.enumValues && field.enumValues.length > 0) {
          // 生成枚举类型名称（使用模型名+字段名避免冲突）
          const enumName = `${modelName}${this.toPascalCase(field.name)}Enum`;
          return enumName;
        }
        return 'String';
      case 'json':
        return 'Json';
      case 'relation':
        // 关联字段单独处理
        return null;
      default:
        return 'String';
    }
  }

  /**
   * 生成数据库类型注解
   */
  private generateDbType(field: FieldConfig): string {
    if (field.type === 'string' && field.name.toLowerCase().includes('content')) {
      return ' @db.Text';
    }
    if (field.type === 'string' && field.name.toLowerCase().includes('description')) {
      return ' @db.Text';
    }
    return '';
  }

  /**
   * 生成默认值
   */
  private generateDefaultValue(field: FieldConfig): string {
    if (field.defaultValue !== undefined) {
      // 如果是枚举类型，默认值不需要引号
      if (field.type === 'enum') {
        return ` @default(${field.defaultValue})`;
      }
      if (typeof field.defaultValue === 'string') {
        return ` @default("${field.defaultValue}")`;
      }
      if (typeof field.defaultValue === 'number') {
        return ` @default(${field.defaultValue})`;
      }
      if (typeof field.defaultValue === 'boolean') {
        return ` @default(${field.defaultValue})`;
      }
    }
    return '';
  }

  /**
   * 生成关联关系定义
   */
  private generateRelationDefinition(
    join: NonNullable<ResourceDefinition['joins']>[0],
    currentModel: string,
  ): string | null {
    const fieldName = join.field;
    const relatedModel = join.model;
    const foreignKeyField = `${fieldName}Id`;

    // 判断关联类型（根据字段名判断）
    // 如果字段名是复数形式，可能是 one-to-many 或 many-to-many
    const isPlural = fieldName.endsWith('s') || fieldName.endsWith('ies');
    
    if (isPlural) {
      // one-to-many 或 many-to-many
      // 对于 many-to-many，需要中间表，这里简化为 one-to-many
      return `  ${fieldName} ${relatedModel}[]`;
    } else {
      // many-to-one 或 one-to-one
      // 判断是否必填：如果配置中 includeInCreate 为 true 且 required，则必填
      const optional = '?'; // 默认可选，避免循环依赖问题
      return `  ${fieldName} ${relatedModel}${optional} @relation(fields: [${foreignKeyField}], references: [id])`;
    }
  }

  /**
   * 生成枚举类型定义
   */
  generateEnums(resource: ResourceDefinition): string[] {
    const enums: string[] = [];
    const enumMap = new Map<string, string[]>(); // 用于去重

    resource.fields.forEach((field) => {
      if (field.type === 'enum' && field.enumValues && field.enumValues.length > 0) {
        // 使用模型名+字段名避免枚举名称冲突
        const enumName = `${resource.prismaModel}${this.toPascalCase(field.name)}Enum`;
        if (!enumMap.has(enumName)) {
          enumMap.set(enumName, field.enumValues);
        }
      }
    });

    // 生成枚举定义
    enumMap.forEach((values, enumName) => {
      const enumDef = `enum ${enumName} {
  ${values.map((v) => `  ${v}`).join('\n')}
}

`;
      enums.push(enumDef);
    });

    return enums;
  }

  /**
   * 写入独立的 Prisma Schema 文件（每个模型一个文件）
   */
  writeToSchemaFile(
    resource: ResourceDefinition,
    schemaPath?: string,
    useSeparateFiles: boolean = true,
  ): void {
    if (useSeparateFiles) {
      this.writeToSeparateFile(resource);
      // 同时更新主 schema 文件（合并所有独立文件）
      this.mergeSchemaFiles();
    } else {
      this.writeToMainSchemaFile(resource, schemaPath);
    }
  }

  /**
   * 写入独立的模型文件
   */
  private writeToSeparateFile(resource: ResourceDefinition): void {
    const modelsDir = path.join(process.cwd(), 'prisma', 'models');
    
    // 创建 models 目录
    if (!fs.existsSync(modelsDir)) {
      fs.mkdirSync(modelsDir, { recursive: true });
    }

    const modelFileName = `${this.toKebabCase(resource.name)}.prisma`;
    const modelFilePath = path.join(modelsDir, modelFileName);

    // 检查文件是否已存在
    if (fs.existsSync(modelFilePath)) {
      console.log(`ℹ️  模型文件已存在: ${modelFileName}，跳过生成`);
      return;
    }

    // 生成枚举
    const enums = this.generateEnums(resource);
    const enumContent = enums.length > 0 ? enums.join('\n') + '\n\n' : '';

    // 生成模型
    const modelContent = this.generateModel(resource);

    // 写入独立文件
    const fileContent = enumContent + modelContent;
    fs.writeFileSync(modelFilePath, fileContent, 'utf-8');
    console.log(`✅ 模型文件已生成: prisma/models/${modelFileName}`);
  }

  /**
   * 合并所有独立的 schema 文件到主 schema.prisma
   */
  private mergeSchemaFiles(): void {
    const modelsDir = path.join(process.cwd(), 'prisma', 'models');
    const mainSchemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');

    if (!fs.existsSync(modelsDir)) {
      return;
    }

    // 读取主 schema 的完整内容
    let mainSchemaContent = '';
    if (fs.existsSync(mainSchemaPath)) {
      mainSchemaContent = fs.readFileSync(mainSchemaPath, 'utf-8');
    }

    // 提取基础部分（generator 和 datasource）
    const baseMatch = mainSchemaContent.match(/(generator[\s\S]*?datasource[\s\S]*?)(?=\n\n|enum|model|$)/m);
    let baseContent = '';
    if (baseMatch) {
      baseContent = baseMatch[1].trim();
    } else {
      // 如果没有找到，使用默认的基础内容
      baseContent = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}`;
    }

    // 提取主 schema 中已有的枚举和模型（保留手动定义的）
    const existingEnums = new Map<string, string>();
    const existingModels = new Map<string, string>();

    // 提取已有枚举
    const existingEnumMatches = mainSchemaContent.match(/enum\s+(\w+)\s*\{[\s\S]*?\}/g);
    if (existingEnumMatches) {
      existingEnumMatches.forEach(enumDef => {
        const enumName = enumDef.match(/enum\s+(\w+)/)?.[1];
        if (enumName) {
          existingEnums.set(enumName, enumDef);
        }
      });
    }

    // 提取已有模型（排除 models 目录中生成的）
    const modelFiles = fs.readdirSync(modelsDir)
      .filter(file => file.endsWith('.prisma'))
      .map(file => {
        const content = fs.readFileSync(path.join(modelsDir, file), 'utf-8');
        const modelMatch = content.match(/model\s+(\w+)/);
        return modelMatch ? modelMatch[1] : null;
      })
      .filter(Boolean) as string[];

    const existingModelMatches = mainSchemaContent.match(/model\s+(\w+)\s*\{[\s\S]*?\n\}/g);
    if (existingModelMatches) {
      existingModelMatches.forEach(modelDef => {
        const modelName = modelDef.match(/model\s+(\w+)/)?.[1];
        // 只保留不在 models 目录中的模型（手动定义的）
        if (modelName && !modelFiles.includes(modelName)) {
          existingModels.set(modelName, modelDef);
        }
      });
    }

    // 读取所有模型文件
    const prismaFiles = fs.readdirSync(modelsDir)
      .filter(file => file.endsWith('.prisma'))
      .sort();

    // 收集所有枚举和模型（从独立文件）
    const newEnums: string[] = [];
    const newModels: string[] = [];

    prismaFiles.forEach((file) => {
      const filePath = path.join(modelsDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      
      // 提取枚举
      const enumMatches = fileContent.match(/enum\s+(\w+)\s*\{[\s\S]*?\}/g);
      if (enumMatches) {
        enumMatches.forEach(enumDef => {
          const enumName = enumDef.match(/enum\s+(\w+)/)?.[1];
          if (enumName && !existingEnums.has(enumName) && !newEnums.some(e => e.includes(`enum ${enumName}`))) {
            newEnums.push(enumDef);
          }
        });
      }

      // 提取模型
      const modelMatches = fileContent.match(/model\s+(\w+)\s*\{[\s\S]*?\n\}/g);
      if (modelMatches) {
        modelMatches.forEach(modelDef => {
          const modelName = modelDef.match(/model\s+(\w+)/)?.[1];
          if (modelName && !existingModels.has(modelName) && !newModels.some(m => m.includes(`model ${modelName}`))) {
            newModels.push(modelDef);
          }
        });
      }
    });

    // 合并所有内容：基础配置 + 已有枚举 + 新枚举 + 已有模型 + 新模型
    const allEnums = [...existingEnums.values(), ...newEnums];
    const allModels = [...existingModels.values(), ...newModels];

    const mergedContent = [
      baseContent,
      '',
      ...allEnums,
      '',
      ...allModels,
    ].filter(Boolean).join('\n\n');

    // 写入主 schema 文件
    fs.writeFileSync(mainSchemaPath, mergedContent, 'utf-8');
    console.log(`✅ 已合并 ${prismaFiles.length} 个模型文件到 schema.prisma（保留 ${existingModels.size} 个已有模型）`);
  }

  /**
   * 写入主 Schema 文件（旧方法，保持向后兼容）
   */
  private writeToMainSchemaFile(
    resource: ResourceDefinition,
    schemaPath: string = path.join(process.cwd(), 'prisma', 'schema.prisma'),
  ): void {
    // 读取现有 schema
    let existingContent = '';
    if (fs.existsSync(schemaPath)) {
      existingContent = fs.readFileSync(schemaPath, 'utf-8');
    }

    // 检查模型是否已存在
    const modelRegex = new RegExp(`model\\s+${resource.prismaModel}\\s*\\{`, 'g');
    if (modelRegex.test(existingContent)) {
      console.log(`ℹ️  模型 ${resource.prismaModel} 已在 Schema 中存在，跳过生成`);
      return;
    }

    // 生成枚举
    const enums = this.generateEnums(resource);
    const enumContent = enums.join('\n');

    // 生成模型
    const modelContent = this.generateModel(resource);

    // 追加到文件
    let newContent = existingContent;
    
    // 添加枚举（如果不存在）
    enums.forEach((enumDef) => {
      const enumName = enumDef.match(/enum\s+(\w+)/)?.[1];
      if (enumName && !existingContent.includes(`enum ${enumName}`)) {
        // 在 generator 和 datasource 之后添加枚举
        const insertPoint = existingContent.lastIndexOf('datasource');
        if (insertPoint > 0) {
          const afterDatasource = existingContent.indexOf('\n\n', insertPoint);
          if (afterDatasource > 0) {
            newContent =
              existingContent.slice(0, afterDatasource + 2) +
              enumDef +
              existingContent.slice(afterDatasource + 2);
            existingContent = newContent;
          }
        }
      }
    });

    // 添加模型
    newContent = newContent.trim() + '\n\n' + modelContent;

    // 写入文件
    fs.writeFileSync(schemaPath, newContent, 'utf-8');
    console.log(`✅ Prisma Schema 已更新: ${resource.prismaModel}`);
  }

  /**
   * 转换为 kebab-case（用于文件名）
   */
  private toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase();
  }

  /**
   * 转换为 PascalCase
   */
  private toPascalCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * 转换为 snake_case
   */
  private toSnakeCase(str: string): string {
    return str
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '')
      .replace(/_+/g, '_');
  }

  /**
   * 获取 Prisma 类型（用于关联）
   */
  private getPrismaType(modelName: string): string {
    // 简化处理，假设都是 String ID
    return 'String';
  }
}
