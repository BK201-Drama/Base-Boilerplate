/**
 * 角色模型定义（装饰器方式）
 */

import { Model, Field, ManyToMany } from '@/common/generator/decorators';

@Model('roles', '角色资源（RBAC系统）')
export class Role {
  @Field('String', { unique: true, description: '角色名称' })
  name: string;

  @Field('String', { unique: true, description: '角色代码' })
  code: string;

  @Field('String', { optional: true, dbType: '@db.Text', description: '角色描述' })
  description?: string;

  @ManyToMany('Permission', {
    junctionTable: 'RolePermission',
  })
  permissions: any[];
}
