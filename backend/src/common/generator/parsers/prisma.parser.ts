/**
 * Prisma Schema 解析器
 * 从 Prisma Schema 文件中解析模型定义，转换为 ResourceDefinition
 */

import { ResourceDefinition, FieldConfig, FieldType } from '../types/resource.types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Prisma 字段类型到我们的字段类型的映射
 */
const PRISMA_TYPE_MAP: Record<string, FieldType> = {
  String: 'string',
  Int: 'number',
  Float: 'number',
  Boolean: 'boolean',
  DateTime: 'date',
  Json: 'json',
};

/**
 * 解析 Prisma Schema 文件
 */
export class PrismaSchemaParser {
  private schemaPath: string;
  private schemaContent: string;

  constructor(schemaPath?: string) {
    this.schemaPath =
      schemaPath || path.join(process.cwd(), 'prisma', 'schema.prisma');
    this.schemaContent = fs.readFileSync(this.schemaPath, 'utf-8');
  }

  /**
   * 解析所有模型
   */
  parseAllModels(): ResourceDefinition[] {
    const models = this.extractModels();
    return models.map((model) => this.parseModel(model));
  }

  /**
   * 解析单个模型
   */
  parseModel(modelName: string): ResourceDefinition {
    const modelBlock = this.extractModelBlock(modelName);
    if (!modelBlock) {
      throw new Error(`Model ${modelName} not found in schema`);
    }

    const fields = this.parseFields(modelBlock);
    const name = this.toCamelCase(modelName);
    const pluralName = this.pluralize(name);

    return {
      name,
      pluralName,
      prismaModel: modelName,
      fields,
      operations: {
        create: true,
        read: true,
        update: true,
        delete: true,
        list: true,
      },
      permissions: {
        resource: name,
        requireAuth: true,
      },
      defaultPageSize: 10,
    };
  }

  /**
   * 提取所有模型名称
   */
  private extractModels(): string[] {
    const modelRegex = /model\s+(\w+)\s*\{/g;
    const models: string[] = [];
    let match;

    while ((match = modelRegex.exec(this.schemaContent)) !== null) {
      models.push(match[1]);
    }

    return models;
  }

  /**
   * 提取模型块内容
   */
  private extractModelBlock(modelName: string): string | null {
    const modelRegex = new RegExp(
      `model\\s+${modelName}\\s*\\{([^}]+)\\}`,
      's',
    );
    const match = this.schemaContent.match(modelRegex);
    return match ? match[1] : null;
  }

  /**
   * 解析字段
   */
  private parseFields(modelBlock: string): FieldConfig[] {
    // 改进的正则表达式：更准确地匹配字段定义
    const fieldRegex = /(\w+)\s+(\w+(?:\[\])?)\s*([^@\n]*?)(?=\n\s*\w+\s+\w|$)/g;
    const fields: FieldConfig[] = [];
    let match;

    while ((match = fieldRegex.exec(modelBlock)) !== null) {
      const [, fieldName, fieldType, attributes] = match;

      // 跳过关系字段（包含 @relation）
      if (attributes.includes('@relation')) {
        continue;
      }

      // 跳过 id 字段（通常由系统管理）
      if (fieldName === 'id') {
        continue;
      }

      // 跳过自动生成的时间戳字段
      if (fieldName === 'createdAt' || fieldName === 'updatedAt') {
        continue;
      }

      // 跳过数组类型的关系字段（如 roles Role[]）
      if (fieldType.includes('[]') && !attributes.includes('@')) {
        // 如果字段类型是数组且没有其他属性，可能是关系字段
        continue;
      }

      // 检查是否是有效的字段定义（不是注释或其他内容）
      const trimmedAttributes = attributes.trim();
      if (trimmedAttributes.startsWith('//')) {
        continue;
      }

      const fieldConfig: FieldConfig = {
        name: fieldName,
        type: this.mapPrismaType(fieldType),
        required: !attributes.includes('?'),
        unique: attributes.includes('@unique'),
        includeInCreate: true,
        includeInUpdate: true,
        includeInList: true,
        includeInDetail: true,
      };

      // 解析默认值
      const defaultMatch = attributes.match(/@default\(([^)]+)\)/);
      if (defaultMatch) {
        fieldConfig.defaultValue = this.parseDefaultValue(defaultMatch[1]);
      }

      // 解析验证规则
      fieldConfig.validations = this.parseValidations(fieldName, fieldType, attributes);

      fields.push(fieldConfig);
    }

    return fields;
  }

  /**
   * 映射 Prisma 类型到我们的类型
   */
  private mapPrismaType(prismaType: string): FieldType {
    // 移除数组标记
    const baseType = prismaType.replace('[]', '');

    if (PRISMA_TYPE_MAP[baseType]) {
      return PRISMA_TYPE_MAP[baseType];
    }

    // 如果是未映射的类型，可能是枚举或关系，默认为 string
    return 'string';
  }

  /**
   * 解析默认值
   */
  private parseDefaultValue(value: string): any {
    // 移除引号
    const cleanValue = value.replace(/['"]/g, '');

    // 检查是否是函数调用
    if (cleanValue === 'now()') {
      return 'now()';
    }
    if (cleanValue === 'uuid()') {
      return 'uuid()';
    }

    // 尝试解析为数字
    if (!isNaN(Number(cleanValue))) {
      return Number(cleanValue);
    }

    // 尝试解析为布尔值
    if (cleanValue === 'true' || cleanValue === 'false') {
      return cleanValue === 'true';
    }

    return cleanValue;
  }

  /**
   * 解析验证规则
   */
  private parseValidations(
    fieldName: string,
    fieldType: string,
    attributes: string,
  ): FieldConfig['validations'] {
    const validations: FieldConfig['validations'] = [];

    // 必填验证
    if (!attributes.includes('?')) {
      validations.push({
        type: 'required',
        message: `validation.${fieldName}_required`,
      });
    }

    // Email 验证
    if (fieldName.toLowerCase().includes('email')) {
      validations.push({
        type: 'email',
        message: `validation.email_invalid`,
      });
    }

    return validations.length > 0 ? validations : undefined;
  }

  /**
   * 转换为驼峰命名
   */
  private toCamelCase(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  /**
   * 复数化
   */
  private pluralize(str: string): string {
    // 简单的复数化规则
    if (str.endsWith('y')) {
      return str.slice(0, -1) + 'ies';
    }
    if (str.endsWith('s') || str.endsWith('x') || str.endsWith('ch') || str.endsWith('sh')) {
      return str + 'es';
    }
    return str + 's';
  }
}

