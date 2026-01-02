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
  // 通用 HTTP 方法
  get: (url: string, config?: any) => httpClient.get(url, config),
  post: (url: string, data?: any, config?: any) => httpClient.post(url, data, config),
  patch: (url: string, data?: any, config?: any) => httpClient.patch(url, data, config),
  delete: (url: string, config?: any) => httpClient.delete(url, config),
  request: (config: any) => httpClient.request(config),

  // 业务方法
  getStatistics: async (): Promise<Statistics> => {
    const response = await httpClient.get('/dashboard/statistics');
    return response.data;
  },
};

