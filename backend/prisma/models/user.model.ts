/**
 * 用户模型定义（TypeScript 方式）
 * 自动生成关联表 UserRole
 */

import { ModelDefinition } from '../../src/common/generator/types/model.types';

const userModel: ModelDefinition = {
  name: 'User',
  tableName: 'users',
  description: '用户资源（RBAC系统）',
  
  fields: [
    {
      name: 'username',
      type: 'String',
      unique: true,
      description: '用户名',
    },
    {
      name: 'email',
      type: 'String',
      unique: true,
      description: '邮箱',
    },
    {
      name: 'password',
      type: 'String',
      description: '密码',
    },
    {
      name: 'nickname',
      type: 'String',
      optional: true,
      description: '昵称',
    },
    {
      name: 'avatar',
      type: 'String',
      optional: true,
      description: '头像URL',
    },
    {
      name: 'status',
      type: 'UserStatusEnum',
      default: 'active',
      description: '用户状态',
    },
  ],

  enums: [
    {
      name: 'UserStatusEnum',
      values: ['active', 'inactive', 'banned'],
    },
  ],

  relations: [
    {
      field: 'roles',
      model: 'Role',
      type: 'many-to-many',
      junctionTable: {
        name: 'UserRole',
        currentForeignKey: 'userId',
        relatedForeignKey: 'roleId',
        unique: true,
        cascadeDelete: true,
        mapName: 'user_roles',
      },
    },
  ],
};

export default userModel;
