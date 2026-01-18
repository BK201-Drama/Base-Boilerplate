import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { BaseCrudRepository } from '@/common/repositories/base-crud.repository';
import { Permission } from '@prisma/client';

/**
 * Permission Repository
 * 
 * 数据访问层，负责与数据库交互，提供细粒度的 ORM 操作方法。
 * 
 * 本 Repository 继承 BaseCrudRepository，已提供以下细粒度方法：
 * - create(data, options?) - 创建单条记录
 * - findOne(id, options?) - 根据 ID 查询单条记录
 * - findByIds(ids, options?) - 根据多个 ID 查询记录
 * - findMany(options?) - 根据条件查询多条记录
 * - findByCondition(where, options?) - 根据条件查询（更明确的接口）
 * - findAll(pagination?, options?) - 分页查询
 * - findFirst(options?) - 根据条件查询第一条记录
 * - update(id, data, options?) - 更新单条记录
 * - delete(id) - 删除单条记录
 * - deleteMany(ids) - 批量删除
 * - count(where?) - 统计数量
 * - exists(id) - 检查记录是否存在
 * - createMany(data[], options?) - 批量创建
 * - updateMany(ids, data, options?) - 批量更新
 * 
 * Service 层应该使用这些 Repository 方法来组装业务逻辑，而不是直接使用 ORM。
 * 
 * 根据 Schema 字段自动生成的方法：
 * - 如果存在 status 字段（string 类型）：自动生成 updateStatus(id, status) 方法
 * - 如果存在 isActive 字段（boolean 类型）：自动生成 activate(id), deactivate(id), toggleActive(id) 方法
 * - 如果存在 deletedAt 字段（date 类型）：自动生成 softDelete(id), restore(id), findActive() 方法
 * - 如果存在 isDeleted 字段（boolean 类型）：自动生成 softDelete(id), restore(id), findActive() 方法
 * - 如果存在 enabled 字段（boolean 类型）：自动生成 enable(id), disable(id) 方法
 * 
 * 如果需要添加更多自定义的细粒度方法，可以在此类中扩展：
 * ```typescript
 * async findByStatus(status: string) {
 *   return this.findByCondition({ status });
 * }
 * ```
 */
@Injectable()
export class PermissionRepository extends BaseCrudRepository<
  Permission,
  any,
  any
> {
  protected readonly defaultPageSize = 10;
  protected readonly defaultSelect = {
  "id": true,
  "Text": true
} as const;

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  protected getModelDelegate() {
    return this.prisma.permission;
  }

}
