/**
 * 共享类型定义
 * 
 * 这些类型可以被数据层和展示层共享
 * 展示层不应该直接导入 services，只应该导入 types
 */

// 公共类型
// API 响应类型
export interface ApiResponse<T = any> {
  data: T;
  total?: number;
  message?: string;
  success?: boolean;
}

// 分页参数
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// 排序参数
export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

// 过滤参数
export interface FilterParams {
  field: string;
  operator: 'eq' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte';
  value: any;
}

// Repository 公共接口
export interface IPublicRepository {
  // 通用 CRUD 方法（可选）
  getOne?: <T = any>(resource: string, id: string | number, config?: any) => Promise<T>;
  getMany?: <T = any>(resource: string, config?: any) => Promise<{ data: T[]; total?: number }>;
  create?: <T = any>(resource: string, data: any, config?: any) => Promise<T>;
  update?: <T = any>(resource: string, id: string | number, data: any, config?: any) => Promise<T>;
  delete?: (resource: string, id: string | number, config?: any) => Promise<void>;
  export?: (resource: string, config?: any) => Promise<Blob>;
  upload?: (resource: string, file: File, config?: any) => Promise<any>;
}

// 重新导出所有类型
export type { User, UserService } from './user.types';
export type { Statistics, StatisticsService } from './statistics.types';
