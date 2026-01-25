import type { AxiosResponse, AxiosError } from 'axios';
import { HttpStatusCode } from '@/http/constants';

export const responseInterceptor = {
  onFulfilled: (response: AxiosResponse) => {
    return response;
  },
  onRejected: (error: AxiosError) => {
    const url = error.config?.url || '';
    const isAuthEndpoint = 
      url.includes('/auth/login') || 
      url.includes('/auth/register') || 
      url.includes('/auth/wechat');
    
    const status = error.response?.status;
    if (status === HttpStatusCode.UNAUTHORIZED && !isAuthEndpoint) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  },
};
