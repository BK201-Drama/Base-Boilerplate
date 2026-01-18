/**
 * 权限模型定义（TypeScript 方式）
 * 自动生成关联表 RolePermission
 */

import { ModelDefinition } from '../../src/common/generator/types/model.types';

const permissionModel: ModelDefinition = {
  name: 'Permission',
  tableName: 'permissions',
  description: '权限资源（RBAC系统）',
  
  fields: [
    {
      name: 'name',
      type: 'String',
      unique: true,
      description: '权限名称',
    },
    {
      name: 'code',
      type: 'String',
      unique: true,
      description: '权限代码',
    },
    {
      name: 'resource',
      type: 'String',
      description: '资源名称',
    },
    {
      name: 'action',
      type: 'String',
      description: '操作类型',
    },
    {
      name: 'description',
      type: 'String',
      optional: true,
      dbType: '@db.Text',
      description: '权限描述',
    },
  ],

  relations: [
    {
      field: 'roles',
      model: 'Role',
      type: 'many-to-many',
      junctionTable: {
        name: 'RolePermission',
        currentForeignKey: 'permissionId',
        relatedForeignKey: 'roleId',
        unique: true,
        cascadeDelete: true,
        mapName: 'role_permissions',
      },
    },
  ],
};

export default permissionModel;
