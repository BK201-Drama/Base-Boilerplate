/**
 * 角色模型定义（TypeScript 方式）
 */

import { ModelDefinition } from '../../src/common/generator/types/model.types';

const roleModel: ModelDefinition = {
  name: 'Role',
  tableName: 'roles',
  description: '角色资源（RBAC系统）',
  
  fields: [
    {
      name: 'name',
      type: 'String',
      unique: true,
      description: '角色名称',
    },
    {
      name: 'code',
      type: 'String',
      unique: true,
      description: '角色代码',
    },
    {
      name: 'description',
      type: 'String',
      optional: true,
      dbType: '@db.Text',
      description: '角色描述',
    },
  ],

  relations: [
    {
      field: 'permissions',
      model: 'Permission',
      type: 'many-to-many',
      junctionTable: {
        name: 'RolePermission',
        currentForeignKey: 'roleId',
        relatedForeignKey: 'permissionId',
        unique: true,
        cascadeDelete: true,
      },
    },
  ],
};

export default roleModel;
