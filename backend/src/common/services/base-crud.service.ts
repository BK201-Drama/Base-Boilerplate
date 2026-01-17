import { Injectable, NotFoundException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import type {
  PaginationParams,
  PaginatedResult,
  FindManyOptions,
  CreateOptions,
  UpdateOptions,
} from '../types/crud.types';
import type { IBaseCrudRepository } from '../repositories/base-crud.repository';

/**
 * 基础 CRUD 服务类
 * 提供通用的 CRUD 操作方法
 *
 * 使用 Repository 层进行数据访问，实现分层架构：
 * Controller -> Service -> Repository -> Database
 */
@Injectable()
export abstract class BaseCrudService<
  TModel extends { id: string },
  TCreateDto,
  TUpdateDto,
  TModelName extends string,
> {
  protected abstract readonly modelName: TModelName;
  protected abstract readonly defaultSelect?: any;
  protected abstract readonly defaultPageSize: number;

  constructor(
    protected readonly repository: IBaseCrudRepository<TModel, any, any>,
    protected readonly i18n: I18nService,
  ) {}

  /**
   * 创建前处理
   */
  protected async beforeCreate(data: TCreateDto): Promise<any> {
    return data;
  }

  /**
   * 创建后处理
   */
  protected async afterCreate(result: TModel): Promise<TModel> {
    return result;
  }

  /**
   * 更新前处理
   */
  protected async beforeUpdate(id: string, data: TUpdateDto): Promise<any> {
    return data;
  }

  /**
   * 更新后处理
   */
  protected async afterUpdate(result: TModel): Promise<TModel> {
    return result;
  }

  /**
   * 删除前处理
   */
  protected async beforeDelete(id: string): Promise<void> {
    // 可以在这里添加删除前的验证逻辑
  }

  /**
   * 创建记录
   */
  async create(
    createDto: TCreateDto,
    options?: CreateOptions<TModel>,
  ): Promise<TModel> {
    const processedData = await this.beforeCreate(createDto);
    const result = await this.repository.create(processedData, options);
    return this.afterCreate(result);
  }

  /**
   * 分页查询
   */
  async findAll(
    pagination?: PaginationParams,
    options?: FindManyOptions<TModel>,
  ): Promise<PaginatedResult<TModel>> {
    return this.repository.findAll(pagination, options);
  }

  /**
   * 查询所有记录（不分页）
   */
  async findMany(options?: FindManyOptions<TModel>): Promise<TModel[]> {
    return this.repository.findMany(options);
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
  ): Promise<TModel> {
    const result = await this.repository.findOne(id, options);

    if (!result) {
      throw new NotFoundException(
        this.i18n.t(`${this.modelName}.not_found`, {
          args: { id },
        }),
      );
    }

    return result;
  }

  /**
   * 根据条件查询单条记录
   */
  async findFirst(
    options?: FindManyOptions<TModel>,
  ): Promise<TModel | null> {
    return this.repository.findFirst(options);
  }

  /**
   * 更新记录
   */
  async update(
    id: string,
    updateDto: TUpdateDto,
    options?: UpdateOptions<TModel>,
  ): Promise<TModel> {
    // 先检查记录是否存在
    await this.findOne(id);

    const processedData = await this.beforeUpdate(id, updateDto);
    const result = await this.repository.update(id, processedData, options);
    return this.afterUpdate(result);
  }

  /**
   * 删除记录
   */
  async remove(id: string): Promise<{ message: string }> {
    await this.beforeDelete(id);
    await this.findOne(id); // 确保记录存在
    await this.repository.delete(id);

    return {
      message: this.i18n.t(`${this.modelName}.deleted_success`),
    };
  }

  /**
   * 批量删除
   */
  async removeMany(ids: string[]): Promise<{ message: string; count: number }> {
    const count = await this.repository.deleteMany(ids);

    return {
      message: this.i18n.t(`${this.modelName}.batch_deleted_success`),
      count,
    };
  }

  /**
   * 统计数量
   */
  async count(where?: any): Promise<number> {
    return this.repository.count(where);
  }

  /**
   * 检查记录是否存在
   */
  async exists(id: string): Promise<boolean> {
    return this.repository.exists(id);
  }

  /**
   * 批量创建
   */
  async createMany(
    data: TCreateDto[],
    options?: CreateOptions<TModel>,
  ): Promise<{ count: number }> {
    const processedData = await Promise.all(
      data.map((item) => this.beforeCreate(item)),
    );

    const count = await this.repository.createMany(processedData, options);
    return { count };
  }

  /**
   * 批量更新
   */
  async updateMany(
    ids: string[],
    data: TUpdateDto,
    options?: UpdateOptions<TModel>,
  ): Promise<{ count: number }> {
    const processedData = await this.beforeUpdate(ids[0], data);
    const count = await this.repository.updateMany(ids, processedData, options);
    return { count };
  }

  /**
   * 根据条件查询并分页
   */
  async findManyWithPagination(
    where: any,
    pagination?: PaginationParams,
    options?: Omit<FindManyOptions<TModel>, 'where'>,
  ): Promise<PaginatedResult<TModel>> {
    return this.findAll(pagination, {
      ...options,
      where,
    });
  }

  /**
   * 根据唯一字段查询
   */
  async findByUniqueField(
    field: string,
    value: any,
    options?: {
      select?: any;
      include?: any;
    },
  ): Promise<TModel | null> {
    return this.findFirst({
      where: {
        [field]: value,
      },
      select: options?.select || this.defaultSelect,
      include: options?.include,
    });
  }
}
