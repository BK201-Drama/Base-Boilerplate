/**
 * Mock Data Repository 实现
 * 
 * 处理数据相关的 Mock API 调用
 */

import type { DataRepository } from '@/repository/data.repository';
import type { Statistics } from '@/types';
import type { UserReport } from '@/types/report.types';
import { delay } from './mock.utils';
import { getAllMockUsers } from './mock_data/user';

// Mock 统计数据
const mockStatistics: Statistics = {
  totalUsers: 1250,
  totalRoles: 8,
  totalPermissions: 32,
  operationLogs: 15680,
};

// 内存中的用户数据（支持 CRUD 操作）
let mockUserData = getAllMockUsers(100);

export const dataMockRepository: DataRepository = {
  // 通用 CRUD 方法
  getOne: async <T = any>(resource: string, id: string | number): Promise<T> => {
    await delay(300);
    
    if (resource === 'users') {
      const user = mockUserData.find(u => u.id === Number(id));
      if (user) {
        return user as T;
      }
      throw new Error(`User with id ${id} not found`);
    }
    
    // 其他资源返回模拟数据
    return { id, resource } as T;
  },

  getMany: async <T = any>(resource: string, config?: any): Promise<{ data: T[]; total?: number }> => {
    await delay(300);
    
    if (resource === 'users') {
      const page = config?.params?.page || 1;
      const limit = config?.params?.limit || 10;
      const start = (page - 1) * limit;
      const end = start + limit;
      
      // 支持排序
      let sortedData = [...mockUserData];
      if (config?.params?.sort) {
        const [field, order] = config.params.sort.split(':');
        sortedData.sort((a: any, b: any) => {
          if (order === 'asc') {
            return a[field] > b[field] ? 1 : -1;
          }
          return a[field] < b[field] ? 1 : -1;
        });
      }
      
      // 支持筛选
      if (config?.params?.status) {
        sortedData = sortedData.filter((u: any) => u.status === config.params.status);
      }
      if (config?.params?.username_like) {
        sortedData = sortedData.filter((u: any) => 
          u.username?.includes(config.params.username_like)
        );
      }
      
      return {
        data: sortedData.slice(start, end) as T[],
        total: sortedData.length,
      };
    }
    
    // 其他资源返回通用模拟数据
    const page = config?.params?.page || 1;
    const limit = config?.params?.limit || 10;
    const mockData: T[] = Array.from({ length: limit }, (_, i) => ({
      id: (page - 1) * limit + i + 1,
      resource,
    })) as T[];
    return {
      data: mockData,
      total: 100,
    };
  },

  create: async <T = any>(resource: string, data?: any): Promise<T> => {
    await delay(300);
    
    if (resource === 'users') {
      const newUser = {
        id: Date.now(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: data?.status || 'active',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data?.username || Date.now()}`,
        roles: data?.roles || [{ id: 2, name: 'user', permissions: [{ resource: 'dashboard', action: 'view' }] }],
      };
      mockUserData.unshift(newUser);
      return newUser as T;
    }
    
    return { id: Date.now(), ...data } as T;
  },

  update: async <T = any>(resource: string, id: string | number, data?: any): Promise<T> => {
    await delay(300);
    
    if (resource === 'users') {
      const index = mockUserData.findIndex(u => u.id === Number(id));
      if (index !== -1) {
        mockUserData[index] = {
          ...mockUserData[index],
          ...data,
          updatedAt: new Date().toISOString(),
        };
        return mockUserData[index] as T;
      }
      throw new Error(`User with id ${id} not found`);
    }
    
    return { id, ...data } as T;
  },

  delete: async (resource: string, id: string | number): Promise<void> => {
    await delay(300);
    
    if (resource === 'users') {
      const index = mockUserData.findIndex(u => u.id === Number(id));
      if (index !== -1) {
        mockUserData.splice(index, 1);
        return;
      }
      throw new Error(`User with id ${id} not found`);
    }
  },

  // 业务方法
  getStatistics: async (): Promise<Statistics> => {
    await delay(500);
    return mockStatistics;
  },

  getUserReport: async (userId: string): Promise<UserReport> => {
    await delay(500);
    return {
      userId,
      username: `user_${userId}`,
      totalOrders: Math.floor(Math.random() * 100),
      totalAmount: Math.floor(Math.random() * 10000),
      lastLoginAt: new Date().toISOString(),
      status: 'active',
    };
  },
};



