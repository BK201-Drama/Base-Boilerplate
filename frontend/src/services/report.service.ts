/**
 * User Report Service - 用户报告服务
 * 
 * 数据层：负责用户报告相关的数据获取和业务逻辑
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

import { useCallback, useState, useEffect } from 'react';
import { realRepository } from '@/repository';
import { mockRepository } from '@/mock';
import type { UserReportService, UserReport } from '@/types/report.types';

// 根据环境变量选择 Repository
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const repository = USE_MOCK ? mockRepository : realRepository;

/**
 * 用户报告服务 Hook
 * 
 * @param userId 用户ID
 * @returns UserReportService 用户报告服务接口
 * 
 * @example
 * ```tsx
 * const reportService = useUserReportService('123');
 * const { userReport, loading, refreshUserReport } = reportService;
 * ```
 */
export const useUserReportService = (userId: string): UserReportService => {
  // 直接使用 Repository，不通过 dataProvider.custom
  // 这样代码更清晰，dataProvider 保持简洁
  const [userReport, setUserReport] = useState<UserReport | null>(null);
  const [loading, setLoading] = useState(false);

  // 获取用户报告
  const fetchUserReport = useCallback(async () => {
    if (!userId) return null;
    
    setLoading(true);
    try {
      const data = await repository.getUserReport(userId);
      setUserReport(data);
      return data;
    } catch (error) {
      console.error('Failed to fetch user report:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // 初始化时获取数据
  useEffect(() => {
    if (userId) {
      fetchUserReport().catch(() => {
        // 错误已在 fetchUserReport 中处理
      });
    }
  }, [userId, fetchUserReport]);

  // 获取用户报告（异步方法）
  const getUserReport = useCallback(async (): Promise<UserReport> => {
    // 如果已有缓存数据，直接返回
    if (userReport) {
      return userReport;
    }

    // 否则重新获取
    try {
      const data = await fetchUserReport();
      return data || null;
    } catch (error) {
      // 错误时抛出异常
      console.error('Failed to fetch user report:', error);
      throw error;
    }
  }, [userReport, fetchUserReport]);

  // 刷新用户报告
  const refreshUserReport = useCallback(async (): Promise<void> => {
    try {
      await fetchUserReport();
    } catch (error) {
      console.error('Failed to refresh user report:', error);
      throw error;
    }
  }, [fetchUserReport]);

  return {
    userReport,
    loading,
    getUserReport,
    refreshUserReport,
  };
};

