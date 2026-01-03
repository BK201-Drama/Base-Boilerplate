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
  // 通用 CRUD 方法
  getOne: async <T = any>(resource: string, id: string | number): Promise<T> => {
    await delay(300);
    // 返回模拟数据
    return { id, resource } as T;
  },

  getMany: async <T = any>(resource: string, config?: any): Promise<{ data: T[]; total?: number }> => {
    await delay(300);
    // 返回模拟数据列表
    const page = config?.params?.page || 1;
    const limit = config?.params?.limit || 10;
    const mockData: T[] = Array.from({ length: limit }, (_, i) => ({
      id: (page - 1) * limit + i + 1,
      resource,
    })) as T[];
    return {
      data: mockData,
      total: 100, // 模拟总数
    };
  },

  create: async <T = any>(resource: string, data?: any): Promise<T> => {
    await delay(300);
    return { id: Date.now(), ...data } as T;
  },

  update: async <T = any>(resource: string, id: string | number, data?: any): Promise<T> => {
    await delay(300);
    return { id, ...data } as T;
  },

  delete: async (resource: string, id: string | number): Promise<void> => {
    await delay(300);
    // Mock 删除操作
  },

  // 业务方法
  getStatistics: async (): Promise<Statistics> => {
    await delay(500);
    return mockStatistics;
  },
};


