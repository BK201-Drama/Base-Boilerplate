/**
 * Data Provider
 * 
 * 通过依赖注入 Repository，Provider 只负责调用，不关心数据来源
 */

import type { DataProvider } from '@refinedev/core';
import type { Repository } from '@/repository';

// 创建 Provider 工厂函数
export const createDataProvider = (repository: Repository): DataProvider => {
  return {
  getList: async ({ resource, pagination, filters, sorters }) => {
    const paginationObj = pagination as { current?: number; pageSize?: number; mode?: string } | undefined;
    const page = (paginationObj?.mode === 'off' ? undefined : paginationObj?.current) ?? 1;
    const pageSize = paginationObj?.pageSize ?? 10;

    const params: any = {
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

    custom: async ({ url }) => {
      // 对于业务接口，建议在 Service 层直接使用 Repository
      // 而不是通过 dataProvider.custom 处理
      // 这样可以保持 dataProvider 简洁，只处理标准 CRUD
      throw new Error(
        `Custom request is not supported. Please use Repository methods directly in Service layer for '${url}'. ` +
        `See examples in src/services/statistics.service.ts or src/services/report.service.ts`
      );
    },
  };
};
