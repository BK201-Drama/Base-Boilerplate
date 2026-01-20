/**
 * 用户模型定义（装饰器方式）
 * 自动生成关联表 UserRole
 */

import { Model, Field, ManyToMany, Index } from '@/common/generator/decorators';

// 枚举定义
export enum UserStatusEnum {
  active = 'active',
  inactive = 'inactive',
  banned = 'banned',
}

@Model('users', '用户资源（RBAC系统）')
@Index(['wechatOpenId'])
@Index(['wechatUnionId'])
export class User {
  @Field('String', { unique: true, optional: true, description: '用户名' })
  username?: string;

  @Field('String', { unique: true, optional: true, description: '邮箱' })
  email?: string;

  @Field('String', { optional: true, description: '密码' })
  password?: string;

  @Field('String', { optional: true, description: '昵称' })
  nickname?: string;

  @Field('String', { optional: true, description: '头像URL' })
  avatar?: string;

  @Field('String', { unique: true, optional: true, description: '微信 OpenID' })
  wechatOpenId?: string;

  @Field('String', { optional: true, description: '微信 UnionID' })
  wechatUnionId?: string;

  @Field('String', { optional: true, description: '微信昵称' })
  wechatNickname?: string;

  @Field('String', { optional: true, description: '微信头像' })
  wechatAvatar?: string;

  @Field('UserStatusEnum', { default: 'active', description: '用户状态' })
  status: string;

  @ManyToMany('Role', {
    junctionTable: 'UserRole',
    mapName: 'user_roles',
  })
  roles: any[];
}
