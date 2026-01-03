/**
 * Data Repository 实现
 * 
 * 处理数据相关的 API 调用
 */

import { httpClient } from '@/http';
import type { Statistics, IPublicRepository } from '@/types';

// 数据 Repository 接口
export interface DataRepository extends IPublicRepository {
  // 业务方法
  getStatistics: () => Promise<Statistics>;
}

export const dataRepository: DataRepository = {
  // 通用 CRUD 方法（可选实现）
  getOne: async <T = any>(resource: string, id: string | number, config?: any): Promise<T> => {
    const response = await httpClient.get<T>(`/${resource}/${id}`, config);
    return response.data;
  },

  getMany: async <T = any>(resource: string, config?: any): Promise<{ data: T[]; total?: number }> => {
    const response = await httpClient.get<{ data: T[]; total?: number }>(`/${resource}`, config);
    return response.data;
  },

  create: async <T = any>(resource: string, data: any, config?: any): Promise<T> => {
    const response = await httpClient.post<T>(`/${resource}`, data, config);
    return response.data;
  },

  update: async <T = any>(resource: string, id: string | number, data: any, config?: any): Promise<T> => {
    const response = await httpClient.patch<T>(`/${resource}/${id}`, data, config);
    return response.data;
  },

  delete: async (resource: string, id: string | number, config?: any): Promise<void> => {
    await httpClient.delete(`/${resource}/${id}`, config);
  },

  // 业务方法
  getStatistics: async (): Promise<Statistics> => {
    const response = await httpClient.get('/dashboard/statistics');
    return response.data;
  },
};


