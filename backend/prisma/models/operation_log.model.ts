/**
 * 操作日志模型定义（装饰器方式）
 */

import { Model, Field, ManyToOne, Index } from '@/common/generator/decorators';

@Model('operation_log', '操作日志')
@Index(['userId']) // 外键索引（也可以省略，会自动添加）
@Index(['createdAt'])
export class OperationLog {
  @ManyToOne('User', { foreignKey: 'userId' })
  user: any;

  @Field('String', { description: 'HTTP 方法' })
  method: string;

  @Field('String', { description: '请求路径' })
  path: string;

  @Field('String', { optional: true, dbType: '@db.Text', description: '请求参数（JSON）' })
  params?: string;

  @Field('String', { optional: true, dbType: '@db.Text', description: '响应数据（JSON）' })
  response?: string;

  @Field('Int', { description: 'HTTP 状态码' })
  statusCode: number;

  @Field('String', { optional: true, description: 'IP 地址' })
  ip?: string;

  @Field('String', { optional: true, description: 'User Agent' })
  userAgent?: string;

  @Field('Int', { optional: true, description: '请求耗时（毫秒）' })
  duration?: number;
}
