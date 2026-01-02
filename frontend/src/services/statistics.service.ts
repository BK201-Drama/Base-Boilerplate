/**
 * Statistics Service - 统计数据服务
 * 
 * 数据层：负责统计数据相关的数据获取和业务逻辑
 * 
 * 架构说明：
 * - Services 层作为跨平台抽象层，定义业务接口
 * - 当前实现使用 Refine hooks（Web 平台）
 * - 未来可替换为 Taro、Electron IPC 等实现
 * - 数据缓存由 Refine 的 React Query 自动处理
 * 
 * 使用方式：
 * - Containers 层通过此 Service 获取数据
 * - 展示层不应该直接使用此 Service
 */

import { useCallback, useMemo } from 'react';
import { useCustom } from '@refinedev/core';
import type { StatisticsService, Statistics } from '@/types/statistics.types';

// 默认统计数据
const DEFAULT_STATISTICS: Statistics = {
  totalUsers: 0,
  totalRoles: 0,
  totalPermissions: 0,
  operationLogs: 0,
};

/**
 * 统计数据服务 Hook
 * 
 * @returns StatisticsService 统计数据服务接口
 * 
 * @example
 * ```tsx
 * const statisticsService = useStatisticsService();
 * const { statistics, loading, refreshStatistics } = statisticsService;
 * ```
 */
export const useStatisticsService = (): StatisticsService => {
  const queryResult = useCustom<Statistics>({
    url: '/dashboard/statistics',
    method: 'get',
  });

  // 获取统计数据（带默认值）
  // useCustom 返回的数据结构：{ data: T }
  const statistics = useMemo(() => {
    return (queryResult as any).data?.data || null;
  }, [(queryResult as any).data]);

  // 获取统计数据（异步方法）
  const getStatistics = useCallback(async (): Promise<Statistics> => {
    // 如果已有缓存数据，直接返回
    if ((queryResult as any).data?.data) {
      return (queryResult as any).data.data;
    }

    // 否则触发重新获取
    try {
      const result = await (queryResult as any).refetch();
      return (result.data?.data as Statistics) || DEFAULT_STATISTICS;
    } catch (error) {
      // 错误时返回默认值
      console.error('Failed to fetch statistics:', error);
      return DEFAULT_STATISTICS;
    }
  }, [queryResult]);

  // 刷新统计数据
  const refreshStatistics = useCallback(async (): Promise<void> => {
    try {
      await (queryResult as any).refetch();
    } catch (error) {
      console.error('Failed to refresh statistics:', error);
      throw error;
    }
  }, [queryResult]);

  return {
    statistics,
    loading: (queryResult as any).isLoading || false,
    getStatistics,
    refreshStatistics,
  };
};

