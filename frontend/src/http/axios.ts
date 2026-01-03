/**
 * Axios 实例
 * 
 * 统一的 axios 实例，使用分离的拦截器
 */

import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { requestInterceptor } from './interceptors/request.interceptor';
import { responseInterceptor } from './interceptors/response.interceptor';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// 创建 axios 实例
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 注册请求拦截器
axiosInstance.interceptors.request.use(
  requestInterceptor.onFulfilled,
  requestInterceptor.onRejected,
);

// 注册响应拦截器
axiosInstance.interceptors.response.use(
  responseInterceptor.onFulfilled,
  responseInterceptor.onRejected,
);

// HTTP 客户端接口
export interface HttpClient {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
  request: <T = any>(config: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
}

// 导出 HTTP 客户端实例
export const httpClient: HttpClient = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => {
    return axiosInstance.get<T>(url, config);
  },
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    return axiosInstance.post<T>(url, data, config);
  },
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    return axiosInstance.patch<T>(url, data, config);
  },
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => {
    return axiosInstance.delete<T>(url, config);
  },
  request: <T = any>(config: AxiosRequestConfig) => {
    return axiosInstance.request<T>(config);
  },
};


