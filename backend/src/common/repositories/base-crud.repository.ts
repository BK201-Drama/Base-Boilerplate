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
  TModel extends { id: number },
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
    id: number,
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
    id: number,
    data: TUpdateData,
    options?: UpdateOptions<TModel>,
  ): Promise<TModel>;

  /**
   * 删除记录
   */
  delete(id: number): Promise<void>;

  /**
   * 批量删除
   */
  deleteMany(ids: number[]): Promise<number>;

  /**
   * 统计数量
   */
  count(where?: any): Promise<number>;

  /**
   * 检查记录是否存在
   */
  exists(id: number): Promise<boolean>;

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
    ids: number[],
    data: TUpdateData,
    options?: UpdateOptions<TModel>,
  ): Promise<number>;

  /**
   * 根据多个 ID 查询记录（细粒度方法）
   */
  findByIds(
    ids: number[],
    options?: {
      select?: any;
      include?: any;
    },
  ): Promise<TModel[]>;

  /**
   * 根据条件查询多条记录（细粒度方法，与 findMany 类似但更明确）
   */
  findByCondition(
    where: any,
    options?: {
      select?: any;
      include?: any;
      orderBy?: any;
      take?: number;
      skip?: number;
    },
  ): Promise<TModel[]>;
}

/**
 * 基础 CRUD Repository 抽象类
 * 提供基于 Prisma 的默认实现
 */
export abstract class BaseCrudRepository<
  TModel extends { id: number },
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

    // Prisma 不允许同时使用 select 和 include
    const queryOptions: any = {
      data,
    };

    if (options?.include) {
      // 如果提供了 include，就不使用 select
      queryOptions.include = options.include;
    } else {
      // 否则使用 select
      queryOptions.select = options?.select || this.defaultSelect;
    }

    return model.create(queryOptions);
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

    // Prisma 不允许同时使用 select 和 include
    const queryOptions: any = {
      skip,
      take: limit,
      where: options?.where,
      orderBy: options?.orderBy || { createdAt: 'desc' },
    };

    if (options?.include) {
      // 如果提供了 include，就不使用 select
      queryOptions.include = options.include;
    } else {
      // 否则使用 select
      queryOptions.select = options?.select || this.defaultSelect;
    }

    const [data, total] = await Promise.all([
      model.findMany(queryOptions),
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

    // Prisma 不允许同时使用 select 和 include
    const queryOptions: any = {
      where: options?.where,
      orderBy: options?.orderBy || { createdAt: 'desc' },
    };

    if (options?.include) {
      // 如果提供了 include，就不使用 select
      queryOptions.include = options.include;
    } else {
      // 否则使用 select
      queryOptions.select = options?.select || this.defaultSelect;
    }

    return model.findMany(queryOptions);
  }

  /**
   * 根据 ID 查询单条记录
   */
  async findOne(
    id: number,
    options?: {
      select?: any;
      include?: any;
    },
  ): Promise<TModel | null> {
    const model = this.getModelDelegate();

    // Prisma 不允许同时使用 select 和 include
    const queryOptions: any = {
      where: { id },
    };

    if (options?.include) {
      // 如果提供了 include，就不使用 select
      queryOptions.include = options.include;
    } else {
      // 否则使用 select
      queryOptions.select = options?.select || this.defaultSelect;
    }

    return model.findUnique(queryOptions);
  }

  /**
   * 根据条件查询单条记录
   */
  async findFirst(
    options?: FindManyOptions<TModel>,
  ): Promise<TModel | null> {
    const model = this.getModelDelegate();

    // Prisma 不允许同时使用 select 和 include
    const queryOptions: any = {
      where: options?.where,
      orderBy: options?.orderBy,
    };

    if (options?.include) {
      // 如果提供了 include，就不使用 select
      queryOptions.include = options.include;
    } else {
      // 否则使用 select
      queryOptions.select = options?.select || this.defaultSelect;
    }

    return model.findFirst(queryOptions);
  }

  /**
   * 更新记录
   */
  async update(
    id: number,
    data: TUpdateData,
    options?: UpdateOptions<TModel>,
  ): Promise<TModel> {
    const model = this.getModelDelegate();

    // Prisma 不允许同时使用 select 和 include
    const queryOptions: any = {
      where: { id },
      data,
    };

    if (options?.include) {
      // 如果提供了 include，就不使用 select
      queryOptions.include = options.include;
    } else {
      // 否则使用 select
      queryOptions.select = options?.select || this.defaultSelect;
    }

    return model.update(queryOptions);
  }

  /**
   * 删除记录
   */
  async delete(id: number): Promise<void> {
    const model = this.getModelDelegate();
    await model.delete({
      where: { id },
    });
  }

  /**
   * 批量删除
   */
  async deleteMany(ids: number[]): Promise<number> {
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
  async exists(id: number): Promise<boolean> {
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
    ids: number[],
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

  /**
   * 根据多个 ID 查询记录（细粒度方法）
   */
  async findByIds(
    ids: number[],
    options?: {
      select?: any;
      include?: any;
    },
  ): Promise<TModel[]> {
    if (ids.length === 0) {
      return [];
    }

    const model = this.getModelDelegate();

    // Prisma 不允许同时使用 select 和 include
    const queryOptions: any = {
      where: {
        id: {
          in: ids,
        },
      },
    };

    if (options?.include) {
      // 如果提供了 include，就不使用 select
      queryOptions.include = options.include;
    } else {
      // 否则使用 select
      queryOptions.select = options?.select || this.defaultSelect;
    }

    return model.findMany(queryOptions);
  }

  /**
   * 根据条件查询多条记录（细粒度方法）
   */
  async findByCondition(
    where: any,
    options?: {
      select?: any;
      include?: any;
      orderBy?: any;
      take?: number;
      skip?: number;
    },
  ): Promise<TModel[]> {
    const model = this.getModelDelegate();

    // Prisma 不允许同时使用 select 和 include
    const queryOptions: any = {
      where,
      orderBy: options?.orderBy,
      take: options?.take,
      skip: options?.skip,
    };

    if (options?.include) {
      // 如果提供了 include，就不使用 select
      queryOptions.include = options.include;
    } else {
      // 否则使用 select
      queryOptions.select = options?.select || this.defaultSelect;
    }

    return model.findMany(queryOptions);
  }
}

