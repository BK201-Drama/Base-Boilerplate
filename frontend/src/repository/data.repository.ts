/**
 * Data Repository 实现
 * 
 * 纯 HTTP 层，负责：
 * 1. 标准 CRUD 操作
 * 2. 自定义业务 API 调用（通过 custom 方法）
 * 
 * 不包含业务逻辑，只做 HTTP 请求转发
 */

import { httpClient } from '@/http/axios';
import type { IPublicRepository, CustomRequestParams } from '@/types';

// 数据 Repository 接口（继承公共接口即可）
export interface DataRepository extends IPublicRepository {}

export const dataRepository: DataRepository = {
  // ==================== 标准 CRUD 方法 ====================
  
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

  // ==================== 自定义业务 API ====================
  
  /**
   * 通用自定义请求方法
   * 
   * 用于 DataProvider.custom，支持 useCustom hook
   * 可以调用任意业务 API
   */
  custom: async <T = any>(params: CustomRequestParams): Promise<T> => {
    const { url, method, payload, query, headers } = params;
    
    const config: any = {
      params: query,
      headers,
    };

    let response;
    switch (method) {
      case 'get':
        response = await httpClient.get<T>(url, config);
        break;
      case 'post':
        response = await httpClient.post<T>(url, payload, config);
        break;
      case 'put':
        response = await httpClient.request<T>({ url, method: 'put', data: payload, ...config });
        break;
      case 'patch':
        response = await httpClient.patch<T>(url, payload, config);
        break;
      case 'delete':
        response = await httpClient.delete<T>(url, config);
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    return response.data;
  },
};
