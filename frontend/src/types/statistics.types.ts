/**
 * 统计数据相关类型定义
 */

// Dashboard 统计数据类型
export interface Statistics {
  totalUsers?: number;
  totalRoles?: number;
  totalPermissions?: number;
  operationLogs?: number;
  [key: string]: any;
}
