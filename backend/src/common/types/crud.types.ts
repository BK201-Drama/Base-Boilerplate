/**
 * CRUD 相关类型定义
 */

/**
 * CRUD 控制器配置
 */
export interface CrudControllerConfig {
  /**
   * 资源名称（用于权限检查，如 'user'）
   */
  resource: string;
  /**
   * 路由路径（如 'users'），如果不提供则使用 resource 的复数形式
   */
  path?: string;
  /**
   * 是否需要认证（默认：true）
   */
  requireAuth?: boolean;
  /**
   * 创建操作需要的角色
   */
  createRoles?: string[];
  /**
   * 更新操作需要的角色
   */
  updateRoles?: string[];
  /**
   * 删除操作需要的角色
   */
  deleteRoles?: string[];
  /**
   * 是否启用批量删除
   */
  enableBatchDelete?: boolean;
}

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

