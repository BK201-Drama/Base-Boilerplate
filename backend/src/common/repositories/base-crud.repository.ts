/**
 * 基础 CRUD Repository 接口
 * 定义数据访问层的标准接口
 */

import {
  PaginationParams,
  PaginatedResult,
  FindManyOptions,
  CreateOptions,
  UpdateOptions,
} from '../types/crud.types';

/**
 * 基础 CRUD Repository 接口
 */
export interface IBaseCrudRepository<
  TModel extends { id: string },
  TCreateData,
  TUpdateData,
> {
  /**
   * 创建记录
   */
  create(data: TCreateData, options?: CreateOptions<TModel>): Promise<TModel>;

  /**
   * 分页查询
   */
  findAll(
    pagination?: PaginationParams,
    options?: FindManyOptions<TModel>,
  ): Promise<PaginatedResult<TModel>>;

  /**
   * 查询所有记录（不分页）
   */
  findMany(options?: FindManyOptions<TModel>): Promise<TModel[]>;

  /**
   * 根据 ID 查询单条记录
   */
  findOne(
    id: string,
    options?: {
      select?: any;
      include?: any;
    },
  ): Promise<TModel | null>;

  /**
   * 根据条件查询单条记录
   */
  findFirst(options?: FindManyOptions<TModel>): Promise<TModel | null>;

  /**
   * 更新记录
   */
  update(
    id: string,
    data: TUpdateData,
    options?: UpdateOptions<TModel>,
  ): Promise<TModel>;

  /**
   * 删除记录
   */
  delete(id: string): Promise<void>;

  /**
   * 批量删除
   */
  deleteMany(ids: string[]): Promise<number>;

  /**
   * 统计数量
   */
  count(where?: any): Promise<number>;

  /**
   * 检查记录是否存在
   */
  exists(id: string): Promise<boolean>;

  /**
   * 批量创建
   */
  createMany(
    data: TCreateData[],
    options?: CreateOptions<TModel>,
  ): Promise<number>;

  /**
   * 批量更新
   */
  updateMany(
    ids: string[],
    data: TUpdateData,
    options?: UpdateOptions<TModel>,
  ): Promise<number>;
}

/**
 * 基础 CRUD Repository 抽象类
 * 提供基于 Prisma 的默认实现
 */
export abstract class BaseCrudRepository<
  TModel extends { id: string },
  TCreateData,
  TUpdateData,
> implements IBaseCrudRepository<TModel, TCreateData, TUpdateData>
{
  protected abstract readonly defaultSelect?: any;
  protected abstract readonly defaultPageSize: number;

  /**
   * 获取 Prisma 模型委托器
   */
  protected abstract getModelDelegate(): any;

  /**
   * 创建记录
   */
  async create(
    data: TCreateData,
    options?: CreateOptions<TModel>,
  ): Promise<TModel> {
    const model = this.getModelDelegate();
    return model.create({
      data,
      select: options?.select || this.defaultSelect,
      include: options?.include,
    });
  }

  /**
   * 分页查询
   */
  async findAll(
    pagination?: PaginationParams,
    options?: FindManyOptions<TModel>,
  ): Promise<PaginatedResult<TModel>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || this.defaultPageSize;
    const skip = (page - 1) * limit;

    const model = this.getModelDelegate();

    const [data, total] = await Promise.all([
      model.findMany({
        skip,
        take: limit,
        where: options?.where,
        select: options?.select || this.defaultSelect,
        include: options?.include,
        orderBy: options?.orderBy || { createdAt: 'desc' },
      }),
      model.count({
        where: options?.where,
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 查询所有记录（不分页）
   */
  async findMany(options?: FindManyOptions<TModel>): Promise<TModel[]> {
    const model = this.getModelDelegate();

    return model.findMany({
      where: options?.where,
      select: options?.select || this.defaultSelect,
      include: options?.include,
      orderBy: options?.orderBy || { createdAt: 'desc' },
    });
  }

  /**
   * 根据 ID 查询单条记录
   */
  async findOne(
    id: string,
    options?: {
      select?: any;
      include?: any;
    },
  ): Promise<TModel | null> {
    const model = this.getModelDelegate();

    return model.findUnique({
      where: { id },
      select: options?.select || this.defaultSelect,
      include: options?.include,
    });
  }

  /**
   * 根据条件查询单条记录
   */
  async findFirst(
    options?: FindManyOptions<TModel>,
  ): Promise<TModel | null> {
    const model = this.getModelDelegate();

    return model.findFirst({
      where: options?.where,
      select: options?.select || this.defaultSelect,
      include: options?.include,
      orderBy: options?.orderBy,
    });
  }

  /**
   * 更新记录
   */
  async update(
    id: string,
    data: TUpdateData,
    options?: UpdateOptions<TModel>,
  ): Promise<TModel> {
    const model = this.getModelDelegate();

    return model.update({
      where: { id },
      data,
      select: options?.select || this.defaultSelect,
      include: options?.include,
    });
  }

  /**
   * 删除记录
   */
  async delete(id: string): Promise<void> {
    const model = this.getModelDelegate();
    await model.delete({
      where: { id },
    });
  }

  /**
   * 批量删除
   */
  async deleteMany(ids: string[]): Promise<number> {
    const model = this.getModelDelegate();

    const result = await model.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return result.count;
  }

  /**
   * 统计数量
   */
  async count(where?: any): Promise<number> {
    const model = this.getModelDelegate();
    return model.count({ where });
  }

  /**
   * 检查记录是否存在
   */
  async exists(id: string): Promise<boolean> {
    const model = this.getModelDelegate();
    const count = await model.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * 批量创建
   */
  async createMany(
    data: TCreateData[],
    options?: CreateOptions<TModel>,
  ): Promise<number> {
    const model = this.getModelDelegate();

    const result = await model.createMany({
      data,
      skipDuplicates: true,
    });

    return result.count;
  }

  /**
   * 批量更新
   */
  async updateMany(
    ids: string[],
    data: TUpdateData,
    options?: UpdateOptions<TModel>,
  ): Promise<number> {
    const model = this.getModelDelegate();

    const result = await model.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data,
    });

    return result.count;
  }
}

