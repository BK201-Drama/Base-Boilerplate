/**
 * 共享类型定义
 * 
 * 这些类型可以被数据层和展示层共享
 * 展示层不应该直接导入 services，只应该导入 types
 */

// 用户相关类型
export interface User {
  id: string | number;
  name?: string;
  username?: string;
  nickname?: string;
  email?: string;
  avatar?: string;
  [key: string]: any;
}

// 统计数据类型
export interface Statistics {
  totalUsers?: number;
  totalRoles?: number;
  totalPermissions?: number;
  operationLogs?: number;
  [key: string]: any;
}

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

