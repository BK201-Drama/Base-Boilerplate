import type { DataProvider } from '@refinedev/core';
import axios from 'axios';
import type { AxiosInstance } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// 创建 axios 实例
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加 token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器 - 处理错误
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export const dataProvider: DataProvider = {
  getList: async ({ resource, pagination, filters, sorters, meta }) => {
    const { current = 1, pageSize = 10 } = pagination ?? {};

    const params: any = {
      page: current,
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

    const { data } = await axiosInstance.get(`/${resource}`, { params });

    return {
      data: data.data || data,
      total: data.total || data.length,
    };
  },

  getOne: async ({ resource, id, meta }) => {
    const { data } = await axiosInstance.get(`/${resource}/${id}`);
    return {
      data: data.data || data,
    };
  },

  create: async ({ resource, variables, meta }) => {
    const { data } = await axiosInstance.post(`/${resource}`, variables);
    return {
      data: data.data || data,
    };
  },

  update: async ({ resource, id, variables, meta }) => {
    const { data } = await axiosInstance.patch(`/${resource}/${id}`, variables);
    return {
      data: data.data || data,
    };
  },

  deleteOne: async ({ resource, id, meta }) => {
    const { data } = await axiosInstance.delete(`/${resource}/${id}`);
    return {
      data: data.data || data,
    };
  },

  getApiUrl: () => {
    return API_URL;
  },

  custom: async ({ url, method, filters, sorters, payload, query, headers }) => {
    let requestUrl = `${url}?`;

    if (sorters) {
      const sorter = sorters[0];
      requestUrl = `${requestUrl}&sort=${sorter.field}:${sorter.order}`;
    }

    if (filters) {
      filters.forEach((filter) => {
        requestUrl = `${requestUrl}&${filter.field}=${filter.value}`;
      });
    }

    if (query) {
      Object.keys(query).forEach((key) => {
        requestUrl = `${requestUrl}&${key}=${query[key]}`;
      });
    }

    const { data } = await axiosInstance({
      url: requestUrl,
      method,
      data: payload,
      headers: headers || {},
    });

    return { data };
  },
};



