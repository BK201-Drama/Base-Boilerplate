/**
 * Prisma 模型装饰器
 * 类似 TypeORM 的装饰器风格，简化模型定义
 */

import 'reflect-metadata';
import { ModelDefinition, FieldDefinition, RelationDefinition, EnumDefinition, IndexDefinition } from '../types/model.types';

// 确保 reflect-metadata 已加载
if (typeof Reflect !== 'undefined' && !Reflect.getMetadata) {
  try {
    require('reflect-metadata');
  } catch (e) {
    // ignore
  }
}

// 元数据键
const MODEL_METADATA_KEY = 'prisma:model';
const FIELDS_METADATA_KEY = 'prisma:fields';
const RELATIONS_METADATA_KEY = 'prisma:relations';
const ENUMS_METADATA_KEY = 'prisma:enums';
const INDEXES_METADATA_KEY = 'prisma:indexes';

export interface FieldOptions {
  unique?: boolean;
  optional?: boolean;
  default?: string;
  dbType?: string;
  description?: string;
}

export interface ManyToManyOptions {
  junctionTable?: string; // 中间表名称，如 'UserRole'
  mapName?: string; // 数据库表名，如 'user_roles'
  unique?: boolean; // 是否唯一约束
  cascadeDelete?: boolean; // 是否级联删除
}

export interface OneToManyOptions {
  foreignKey?: string;
  cascadeDelete?: boolean;
}

export interface OneToOneOptions {
  foreignKey?: string;
  optional?: boolean;
  cascadeDelete?: boolean;
}

export interface ManyToOneOptions {
  foreignKey?: string; // 外键字段名，如 'userId'
  cascadeDelete?: boolean; // 是否级联删除
  optional?: boolean; // 关系是否可选
}

/**
 * 模型装饰器
 * @param tableName 数据库表名（可选，默认使用类名的复数形式）
 * @param description 模型描述
 */
export function Model(tableName?: string, description?: string): ClassDecorator {
  return function (target: any) {
    const modelName = target.name;
    Reflect.defineMetadata(MODEL_METADATA_KEY, {
      name: modelName,
      tableName,
      description,
    }, target);
  };
}

/**
 * 字段装饰器
 */
export function Field(type: string, options: FieldOptions = {}): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    const fields = Reflect.getMetadata(FIELDS_METADATA_KEY, target.constructor) || [];
    fields.push({
      name: propertyKey as string,
      type,
      ...options,
    });
    Reflect.defineMetadata(FIELDS_METADATA_KEY, fields, target.constructor);
  };
}

/**
 * 多对多关系装饰器
 */
export function ManyToMany(
  relatedModel: (() => any) | string,
  options: ManyToManyOptions = {},
): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    const relations = Reflect.getMetadata(RELATIONS_METADATA_KEY, target.constructor) || [];
    
    // 支持字符串或函数引用
    let relatedModelName: string;
    if (typeof relatedModel === 'string') {
      relatedModelName = relatedModel;
    } else {
      try {
        const relatedModelClass = relatedModel();
        relatedModelName = relatedModelClass?.name || relatedModelClass?.toString().match(/class (\w+)/)?.[1] || 'Unknown';
      } catch (e) {
        // 如果无法解析，使用属性名推断
        const fieldName = propertyKey as string;
        relatedModelName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1, -1); // 移除末尾的 's'
      }
    }
    
    // 自动推断中间表名称和外键
    const currentModelName = target.constructor.name;
    const junctionTableName = options.junctionTable || `${currentModelName}${relatedModelName}`;
    const currentForeignKey = `${currentModelName.charAt(0).toLowerCase() + currentModelName.slice(1)}Id`;
    const relatedForeignKey = `${relatedModelName.charAt(0).toLowerCase() + relatedModelName.slice(1)}Id`;
    
    relations.push({
      field: propertyKey as string,
      model: relatedModelName,
      type: 'many-to-many',
      junctionTable: {
        name: junctionTableName,
        currentForeignKey,
        relatedForeignKey,
        unique: options.unique ?? true,
        cascadeDelete: options.cascadeDelete ?? true,
        mapName: options.mapName,
      },
    });
    Reflect.defineMetadata(RELATIONS_METADATA_KEY, relations, target.constructor);
  };
}

/**
 * 一对多关系装饰器
 */
export function OneToMany(
  relatedModel: () => any,
  options: OneToManyOptions = {},
): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    const relations = Reflect.getMetadata(RELATIONS_METADATA_KEY, target.constructor) || [];
    const relatedModelClass = relatedModel();
    const relatedModelName = relatedModelClass.name;
    
    relations.push({
      field: propertyKey as string,
      model: relatedModelName,
      type: 'one-to-many',
      foreignKey: options.foreignKey,
      cascadeDelete: options.cascadeDelete,
    });
    Reflect.defineMetadata(RELATIONS_METADATA_KEY, relations, target.constructor);
  };
}

/**
 * 一对一关系装饰器
 */
export function OneToOne(
  relatedModel: () => any,
  options: OneToOneOptions = {},
): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    const relations = Reflect.getMetadata(RELATIONS_METADATA_KEY, target.constructor) || [];
    const relatedModelClass = relatedModel();
    const relatedModelName = relatedModelClass.name;
    
    relations.push({
      field: propertyKey as string,
      model: relatedModelName,
      type: 'one-to-one',
      foreignKey: options.foreignKey,
      optional: options.optional,
      cascadeDelete: options.cascadeDelete,
    });
    Reflect.defineMetadata(RELATIONS_METADATA_KEY, relations, target.constructor);
  };
}

/**
 * 多对一关系装饰器
 */
export function ManyToOne(
  relatedModel: (() => any) | string,
  options: ManyToOneOptions = {},
): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    const relations = Reflect.getMetadata(RELATIONS_METADATA_KEY, target.constructor) || [];
    
    // 支持字符串或函数引用
    let relatedModelName: string;
    if (typeof relatedModel === 'string') {
      relatedModelName = relatedModel;
    } else {
      try {
        const relatedModelClass = relatedModel();
        relatedModelName = relatedModelClass?.name || relatedModelClass?.toString().match(/class (\w+)/)?.[1] || 'Unknown';
      } catch (e) {
        // 如果无法解析，使用属性名推断
        const fieldName = propertyKey as string;
        relatedModelName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
      }
    }
    
    // 自动推断外键字段名
    const foreignKey = options.foreignKey || `${relatedModelName.charAt(0).toLowerCase() + relatedModelName.slice(1)}Id`;
    
    relations.push({
      field: propertyKey as string,
      model: relatedModelName,
      type: 'many-to-one', // many-to-one 关系
      foreignKey,
      cascadeDelete: options.cascadeDelete,
      optional: options.optional,
    });
    Reflect.defineMetadata(RELATIONS_METADATA_KEY, relations, target.constructor);
  };
}

/**
 * 索引装饰器
 * 类似 TypeORM 的 @Index() 装饰器
 * 
 * 使用示例：
 * @Index(['userId'])
 * @Index(['createdAt'])
 * @Index(['userId', 'createdAt'], { unique: true })
 */
export function Index(fields: string | string[], options?: { unique?: boolean; name?: string }): ClassDecorator {
  return function (target: any) {
    const indexes = Reflect.getMetadata(INDEXES_METADATA_KEY, target) || [];
    const fieldArray = Array.isArray(fields) ? fields : [fields];
    indexes.push({
      fields: fieldArray,
      unique: options?.unique,
      name: options?.name,
    });
    Reflect.defineMetadata(INDEXES_METADATA_KEY, indexes, target);
  };
}

/**
 * 枚举装饰器
 */
export function Enum(name: string, values: string[]): ClassDecorator {
  return function (target: any) {
    const enums = Reflect.getMetadata(ENUMS_METADATA_KEY, target) || [];
    enums.push({ name, values });
    Reflect.defineMetadata(ENUMS_METADATA_KEY, enums, target);
  };
}

/**
 * 从类中提取模型定义
 */
export function extractModelDefinition(target: any): ModelDefinition | null {
  const modelMeta = Reflect.getMetadata(MODEL_METADATA_KEY, target);
  if (!modelMeta) {
    return null;
  }

  const fields: FieldDefinition[] = Reflect.getMetadata(FIELDS_METADATA_KEY, target) || [];
  const relations: RelationDefinition[] = Reflect.getMetadata(RELATIONS_METADATA_KEY, target) || [];
  let enums: EnumDefinition[] = Reflect.getMetadata(ENUMS_METADATA_KEY, target) || [];
  const indexes: IndexDefinition[] = Reflect.getMetadata(INDEXES_METADATA_KEY, target) || [];

  // 尝试从模块中提取枚举（如果类文件中也导出了枚举）
  // 这需要调用方传入模块对象，暂时先使用元数据中的枚举

  return {
    name: modelMeta.name,
    tableName: modelMeta.tableName,
    description: modelMeta.description,
    fields,
    relations,
    enums: enums.length > 0 ? enums : undefined,
    indexes: indexes.length > 0 ? indexes : undefined,
  };
}
