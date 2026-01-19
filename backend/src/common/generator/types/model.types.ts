/**
 * 模型定义类型
 */

export interface FieldDefinition {
  name: string;
  type: string; // Prisma 类型：String, Int, Boolean, DateTime, etc.
  optional?: boolean; // 是否可选（使用 ?）
  unique?: boolean; // 是否唯一
  default?: string; // 默认值，如 'autoincrement()', 'now()', 'active'
  dbType?: string; // 数据库类型，如 '@db.Text', '@db.VarChar(255)'
  description?: string; // 字段描述
  relation?: RelationDefinition; // 关系定义（用于一对一、一对多）
}

export interface JunctionTableConfig {
  name: string; // 关联表名称，如 'UserRole'
  currentForeignKey: string; // 当前模型的外键字段名，如 'userId'
  relatedForeignKey: string; // 关联模型的外键字段名，如 'roleId'
  unique?: boolean; // 是否在联合外键上创建唯一约束
  cascadeDelete?: boolean; // 是否级联删除
  mapName?: string; // 数据库表名映射，如 'user_roles'
}

export interface RelationDefinition {
  field: string; // 关系字段名，如 'roles', 'permissions', 'user'
  model: string; // 关联的模型名称，如 'Role', 'Permission', 'User'
  type: 'one-to-one' | 'one-to-many' | 'many-to-many' | 'many-to-one'; // 关系类型
  junctionTable?: JunctionTableConfig; // 多对多关系的关联表配置
  foreignKey?: string; // 外键字段名（用于一对一、一对多、多对一）
  cascadeDelete?: boolean; // 是否级联删除
  optional?: boolean; // 关系是否可选
}

export interface IndexDefinition {
  fields: string[]; // 索引字段数组，如 ['userId'] 或 ['userId', 'createdAt']
  unique?: boolean; // 是否唯一索引
  name?: string; // 索引名称（可选）
}

export interface ModelDefinition {
  name: string; // 模型名称，如 'User', 'Role'
  tableName?: string; // 数据库表名，如 'users', 'roles'（可选，默认使用 name 的复数形式）
  description?: string; // 模型描述
  fields: FieldDefinition[]; // 字段定义
  relations?: RelationDefinition[]; // 关系定义
  enums?: EnumDefinition[]; // 枚举定义（如果模型需要定义枚举）
  indexes?: IndexDefinition[]; // 索引定义
}

export interface EnumDefinition {
  name: string; // 枚举名称
  values: string[]; // 枚举值数组
}
