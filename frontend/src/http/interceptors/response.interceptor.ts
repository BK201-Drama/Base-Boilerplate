/**
 * 响应拦截器
 * 
 * 处理响应错误，特别是 401 未授权错误
 * 
 * 注意：
 * 1. 登录和注册接口的错误（包括400、401等）不应该触发自动跳转，应该由 authProvider 处理
 * 2. 登录接口在账号密码错误时返回 400 Bad Request，而不是 401
 * 3. 只有已认证用户的请求返回 401/403 时才触发登出和跳转
 */

import type { AxiosResponse, AxiosError } from 'axios';
import { AUTH_ERROR_STATUS_CODES } from '../constants';

export const responseInterceptor = {
  onFulfilled: (response: AxiosResponse) => {
    return response;
  },
  onRejected: (error: AxiosError) => {
    // 排除所有认证相关接口的错误，这些应该由 authProvider 处理
    const url = error.config?.url || '';
    const isAuthEndpoint = 
      url.includes('/auth/login') || 
      url.includes('/auth/register') || 
      url.includes('/auth/wechat');
    
    // 只有非认证接口的 401/403 错误才触发自动登出和跳转
    // 认证接口的错误（包括400、401等）都应该由 authProvider 处理，不要在这里拦截
    const status = error.response?.status;
    if (status && (AUTH_ERROR_STATUS_CODES as readonly number[]).includes(status) && !isAuthEndpoint) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // 所有错误都继续抛出，让调用方处理
    return Promise.reject(error);
  },
};
