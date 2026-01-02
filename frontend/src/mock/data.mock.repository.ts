/**
 * Mock Data Repository 实现
 * 
 * 处理数据相关的 Mock API 调用
 */

import type { DataRepository } from '@/repository/data.repository';
import type { Statistics } from '@/types';
import { delay } from './mock.utils';

// Mock 统计数据
const mockStatistics: Statistics = {
  totalUsers: 1250,
  totalRoles: 8,
  totalPermissions: 32,
  operationLogs: 15680,
};

export const dataMockRepository: DataRepository = {
  // 通用 HTTP 方法
  get: async (url: string, _config?: any) => {
    await delay(300);
    const data = url === '/dashboard/statistics' ? mockStatistics : null;
    return { data } as any;
  },

  post: async (_url: string, data?: any, _config?: any) => {
    await delay(300);
    return { data: data || null } as any;
  },

  patch: async (_url: string, data?: any, _config?: any) => {
    await delay(300);
    return { data: data || null } as any;
  },

  delete: async (_url: string, _config?: any) => {
    await delay(300);
    return { data: null } as any;
  },

  request: async (config: any) => {
    await delay(500);
    const data = config.url === '/dashboard/statistics' && config.method === 'get' 
      ? mockStatistics 
      : null;
    return { data } as any;
  },

  // 业务方法
  getStatistics: async (): Promise<Statistics> => {
    await delay(500);
    return mockStatistics;
  },
};

