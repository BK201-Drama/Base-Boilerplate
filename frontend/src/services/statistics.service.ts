/**
 * Statistics Service - 统计数据服务
 * 
 * 数据层：负责统计数据相关的数据获取和业务逻辑
 * 
 * 说明：
 * - Services 负责从 API 获取数据
 * - 数据缓存由 Refine 的 React Query 自动处理，不需要手动管理
 * - Services 不依赖 Store 进行数据缓存
 */

import { useCallback } from 'react';
import { useCustom } from '@refinedev/core';
import type { StatisticsService } from '@/types/statistics.types';
import type { Statistics } from '@/types/statistics.types';

/**
 * 使用统计数据的服务 Hook
 * 
 * 这是一个数据层的 Hook，用于获取统计数据
 * 展示层不应该直接使用这个 Hook，应该通过 Container 组件来使用
 * 
 * 说明：
 * - 使用 Refine 的 useCustom hook 从 API 获取数据
 * - 数据缓存由 Refine 的 React Query 自动处理
 * - 不需要手动管理缓存或 Store
 */
export const useStatisticsService = (): StatisticsService => {
  // 使用 Refine 的 useCustom hook 获取数据
  // Refine 内部使用 React Query，会自动处理缓存、重试等
  const { data, isLoading, refetch } = useCustom<Statistics>({
    url: '/dashboard/statistics',
    method: 'get',
  });

  // 获取统计数据
  const getStatistics = useCallback(async (): Promise<Statistics> => {
    // 如果已经有缓存数据，直接返回
    if (data) {
      return data;
    }
    // 否则触发重新获取
    const result = await refetch();
    return (result.data as Statistics) || {
      totalUsers: 0,
      totalRoles: 0,
      totalPermissions: 0,
      operationLogs: 0,
    };
  }, [data, refetch]);

  // 刷新统计数据
  const refreshStatistics = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    statistics: data || null,
    loading: isLoading,
    getStatistics,
    refreshStatistics,
  };
};

