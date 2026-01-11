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

import { useCallback, useMemo, useState, useEffect } from 'react';
import { realRepository } from '@/repository';
import { mockRepository } from '@/mock';
import type { StatisticsService, Statistics } from '@/types/statistics.types';

// 根据环境变量选择 Repository
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const repository = USE_MOCK ? mockRepository : realRepository;

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
  // 直接使用 Repository，不通过 dataProvider.custom
  // 这样代码更清晰，dataProvider 保持简洁
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(false);

  // 获取统计数据
  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    try {
      const data = await repository.getStatistics();
      setStatistics(data);
      return data;
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始化时获取数据
  useEffect(() => {
    fetchStatistics().catch(() => {
      // 错误已在 fetchStatistics 中处理
    });
  }, [fetchStatistics]);

  // 获取统计数据（异步方法）
  const getStatistics = useCallback(async (): Promise<Statistics> => {
    // 如果已有缓存数据，直接返回
    if (statistics) {
      return statistics;
    }

    // 否则重新获取
    try {
      return await fetchStatistics();
    } catch (error) {
      // 错误时返回默认值
      console.error('Failed to fetch statistics:', error);
      return DEFAULT_STATISTICS;
    }
  }, [statistics, fetchStatistics]);

  // 刷新统计数据
  const refreshStatistics = useCallback(async (): Promise<void> => {
    try {
      await fetchStatistics();
    } catch (error) {
      console.error('Failed to refresh statistics:', error);
      throw error;
    }
  }, [fetchStatistics]);

  return {
    statistics,
    loading,
    getStatistics,
    refreshStatistics,
  };
};

