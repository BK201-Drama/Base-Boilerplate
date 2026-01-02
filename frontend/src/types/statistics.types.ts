/**
 * 统计数据相关类型定义
 */

// 统计数据类型
export interface Statistics {
  totalUsers?: number;
  totalRoles?: number;
  totalPermissions?: number;
  operationLogs?: number;
  [key: string]: any;
}

// 统计数据服务接口
export interface StatisticsService {
  getStatistics: () => Promise<Statistics>;
  refreshStatistics: () => Promise<void>;
  statistics: Statistics | null;
  loading: boolean;
}

