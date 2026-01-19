/**
 * 权限模型定义（装饰器方式）
 * 自动生成关联表 RolePermission
 */

import { Model, Field, ManyToMany } from '@/common/generator/decorators';

@Model('permissions', '权限资源（RBAC系统）')
export class Permission {
  @Field('String', { unique: true, description: '权限名称' })
  name: string;

  @Field('String', { unique: true, description: '权限代码' })
  code: string;

  @Field('String', { description: '资源名称' })
  resource: string;

  @Field('String', { description: '操作类型' })
  action: string;

  @Field('String', { optional: true, dbType: '@db.Text', description: '权限描述' })
  description?: string;

  @ManyToMany('Role', {
    junctionTable: 'RolePermission',
    mapName: 'role_permissions',
  })
  roles: any[];
}
