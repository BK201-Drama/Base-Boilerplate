/**
 * 资源定义类型
 * 参考 Refine 的资源（Resource）概念，定义数据模型和操作配置
 */

/**
 * 字段类型定义
 */
export type FieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'enum'
  | 'relation'
  | 'json';

/**
 * 字段配置
 */
export interface FieldConfig {
  /**
   * 字段名称
   */
  name: string;
  /**
   * 字段类型
   */
  type: FieldType;
  /**
   * 是否必填
   */
  required?: boolean;
  /**
   * 是否唯一
   */
  unique?: boolean;
  /**
   * 默认值
   */
  defaultValue?: any;
  /**
   * 是否在创建时包含
   */
  includeInCreate?: boolean;
  /**
   * 是否在更新时包含
   */
  includeInUpdate?: boolean;
  /**
   * 是否在列表查询时包含
   */
  includeInList?: boolean;
  /**
   * 是否在详情查询时包含
   */
  includeInDetail?: boolean;
  /**
   * 验证规则
   */
  validations?: ValidationRule[];
  /**
   * 关联关系配置（仅 relation 类型）
   */
  relation?: RelationConfig;
  /**
   * 枚举值（仅 enum 类型）
   */
  enumValues?: string[];
  /**
   * 字段描述
   */
  description?: string;
}

/**
 * 验证规则
 */
export interface ValidationRule {
  /**
   * 验证类型
   */
  type: 'required' | 'email' | 'min' | 'max' | 'pattern' | 'custom';
  /**
   * 验证参数
   */
  value?: any;
  /**
   * 错误消息（i18n key）
   */
  message?: string;
}

/**
 * 关联关系配置
 */
export interface RelationConfig {
  /**
   * 关联模型名称
   */
  model: string;
  /**
   * 关联类型：one-to-one, one-to-many, many-to-many
   */
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  /**
   * 是否在查询时包含关联数据
   */
  includeInQuery?: boolean;
  /**
   * 关联字段选择
   */
  select?: string[];
}

/**
 * CRUD 操作配置
 */
export interface CrudOperationsConfig {
  /**
   * 是否启用创建操作
   */
  create?: boolean;
  /**
   * 是否启用读取操作
   */
  read?: boolean;
  /**
   * 是否启用更新操作
   */
  update?: boolean;
  /**
   * 是否启用删除操作
   */
  delete?: boolean;
  /**
   * 是否启用批量删除
   */
  batchDelete?: boolean;
  /**
   * 是否启用列表查询
   */
  list?: boolean;
}

/**
 * 权限配置
 */
export interface PermissionConfig {
  /**
   * 资源名称（用于权限检查）
   */
  resource: string;
  /**
   * 创建操作需要的角色
   */
  createRoles?: string[];
  /**
   * 更新操作需要的角色
   */
  updateRoles?: string[];
  /**
   * 删除操作需要的角色
   */
  deleteRoles?: string[];
  /**
   * 是否需要认证（默认：true）
   */
  requireAuth?: boolean;
}

/**
 * 资源定义
 * 这是核心配置，类似于 Refine 的 Resource 定义
 */
export interface ResourceDefinition {
  /**
   * 资源名称（单数，如 'user'）
   */
  name: string;
  /**
   * 资源名称（复数，如 'users'）
   */
  pluralName?: string;
  /**
   * 路由路径（如 'users'），如果不提供则使用 pluralName
   */
  path?: string;
  /**
   * Prisma 模型名称（如 'User'）
   */
  prismaModel: string;
  /**
   * 字段配置列表
   */
  fields: FieldConfig[];
  /**
   * CRUD 操作配置
   */
  operations?: CrudOperationsConfig;
  /**
   * 权限配置
   */
  permissions?: PermissionConfig;
  /**
   * 默认分页大小
   */
  defaultPageSize?: number;
  /**
   * 默认选择字段（用于查询优化）
   */
  defaultSelect?: Record<string, boolean>;
  /**
   * 自定义 Service 方法
   */
  customMethods?: string[];
  /**
   * 生命周期钩子配置
   */
  hooks?: {
    beforeCreate?: boolean;
    afterCreate?: boolean;
    beforeUpdate?: boolean;
    afterUpdate?: boolean;
    beforeDelete?: boolean;
  };
  /**
   * 描述信息
   */
  description?: string;
}

/**
 * 代码生成选项
 */
export interface CodeGenerationOptions {
  /**
   * 输出目录
   */
  outputDir?: string;
  /**
   * 是否覆盖已存在的文件
   */
  overwrite?: boolean;
  /**
   * 是否生成 DTO 文件
   */
  generateDto?: boolean;
  /**
   * 是否生成 Repository 文件
   */
  generateRepository?: boolean;
  /**
   * 是否生成 Service 文件
   */
  generateService?: boolean;
  /**
   * 是否生成 Controller 文件
   */
  generateController?: boolean;
  /**
   * 是否生成 Module 文件
   */
  generateModule?: boolean;
  /**
   * 是否更新 AppModule
   */
  updateAppModule?: boolean;
  /**
   * 是否生成国际化文件
   */
  generateI18n?: boolean;
}
