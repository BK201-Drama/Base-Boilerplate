/**
 * CRUD 相关类型定义
 */

/**
 * 分页参数
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * 分页结果
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 查询选项
 */
export interface FindManyOptions<T> {
  where?: any;
  select?: any;
  include?: any;
  orderBy?: any;
}

/**
 * 创建选项
 */
export interface CreateOptions<T> {
  select?: any;
  include?: any;
}

/**
 * 更新选项
 */
export interface UpdateOptions<T> {
  select?: any;
  include?: any;
}

