/**
 * Data Provider
 * 
 * Refine 的数据提供者，负责：
 * 1. 标准 CRUD 操作 (getList, getOne, create, update, delete)
 * 2. 自定义业务 API (custom) - 支持 useCustom hook
 * 
 * 通过依赖注入 Repository，Provider 只负责调用，不关心数据来源（真实 API / Mock）
 */

import type { DataProvider } from '@refinedev/core';
import type { Repository } from '@/repository';

// 创建 Provider 工厂函数
export const createDataProvider = (repository: Repository): DataProvider => {
  return {
    // ==================== 标准 CRUD 操作 ====================
    
    getList: async ({ resource, pagination, filters, sorters }) => {
      const paginationObj = pagination as { current?: number; pageSize?: number; mode?: string } | undefined;
      const page = (paginationObj?.mode === 'off' ? undefined : paginationObj?.current) ?? 1;
      const pageSize = paginationObj?.pageSize ?? 10;

      const params: Record<string, any> = {
        page,
        limit: pageSize,
      };

      // 处理排序
      if (sorters && sorters.length > 0) {
        const sorter = sorters[0];
        params.sort = `${sorter.field}:${sorter.order === 'asc' ? 'asc' : 'desc'}`;
      }

      // 处理过滤
      if (filters && filters.length > 0) {
        filters.forEach((filter) => {
          if (filter.operator === 'eq') {
            params[filter.field] = filter.value;
          } else if (filter.operator === 'contains') {
            params[`${filter.field}_like`] = filter.value;
          }
        });
      }

      const result = await repository.getMany(resource, { params });
      return {
        data: result.data,
        total: result.total || result.data.length,
      };
    },

    getOne: async ({ resource, id }) => {
      const data = await repository.getOne(resource, id);
      return { data };
    },

    create: async ({ resource, variables }) => {
      const data = await repository.create(resource, variables);
      return { data };
    },

    update: async ({ resource, id, variables }) => {
      const data = await repository.update(resource, id, variables);
      return { data };
    },

    deleteOne: async ({ resource, id }) => {
      // 先获取要删除的数据
      let deletedData: any = { id };
      try {
        deletedData = await repository.getOne(resource, id);
      } catch {
        // 如果获取失败，使用默认值
      }

      await repository.delete(resource, id);
      return { data: deletedData };
    },

    getApiUrl: () => {
      return import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    },

    // ==================== 自定义业务 API ====================
    
    /**
     * 处理自定义业务 API 请求
     * 
     * 用于 useCustom hook 调用非标准 CRUD 的业务接口
     * 例如：统计数据、报告、导出等
     * 
     * @example
     * ```tsx
     * // 在 hooks/queries/ 中创建业务 hook
     * const { data } = useCustom({
     *   url: '/dashboard/statistics',
     *   method: 'get',
     * });
     * ```
     */
    custom: async ({ url, method, payload, query, headers }) => {
      // 调用 Repository 的通用请求方法
      // 类型转换以匹配 Repository 接口
      const supportedMethods = ['get', 'post', 'put', 'patch', 'delete'] as const;
      const normalizedMethod = supportedMethods.includes(method as any) 
        ? method as 'get' | 'post' | 'put' | 'patch' | 'delete'
        : 'get';
      
      const data = await repository.custom({
        url,
        method: normalizedMethod,
        payload,
        query: query as Record<string, any> | undefined,
        headers,
      });
      return { data };
    },
  };
};
