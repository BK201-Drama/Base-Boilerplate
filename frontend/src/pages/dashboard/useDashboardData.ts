/**
 * Dashboard 页面专用 Hook
 *
 * 就近原则：页面特定逻辑放在页面目录下
 */

import { useCustom } from '@refinedev/core';
import type { Statistics } from '@/types';

/**
 * 获取 Dashboard 统计数据
 */
export const useDashboardData = () => {
  const { data, isLoading, isError, refetch } = useCustom<Statistics>({
    url: '/dashboard/statistics',
    method: 'get',
    queryOptions: {
      staleTime: 5 * 60 * 1000, // 5 分钟缓存
    },
  });

  // 提供默认值，简化页面使用
  const statistics: Statistics = data?.data || {
    totalUsers: 0,
    totalRoles: 0,
    totalPermissions: 0,
    operationLogs: 0,
  };

  return {
    statistics,
    isLoading,
    isError,
    refetch,
  };
};

