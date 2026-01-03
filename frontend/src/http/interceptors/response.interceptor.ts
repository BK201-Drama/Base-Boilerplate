/**
 * 响应拦截器
 * 
 * 处理响应错误，特别是 401 未授权错误
 */

import type { AxiosResponse, AxiosError } from 'axios';

export const responseInterceptor = {
  onFulfilled: (response: AxiosResponse) => {
    return response;
  },
  onRejected: (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
};


