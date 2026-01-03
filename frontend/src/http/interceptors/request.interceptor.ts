/**
 * 请求拦截器
 * 
 * 在发送请求前添加 token 到请求头
 */

import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

export const requestInterceptor = {
  onFulfilled: (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  onRejected: (error: any) => {
    return Promise.reject(error);
  },
};


