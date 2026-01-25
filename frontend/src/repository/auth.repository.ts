/**
 * Auth Repository 实现
 * 
 * 处理认证相关的 API 调用
 */

import { httpClient } from '@/http/axios';
import type { User } from '@/types';

// 认证 Repository 接口
export interface AuthRepository {
  login: (username: string, password: string) => Promise<{ access_token: string; user: User } | null>;
  logout: () => Promise<void>;
  checkAuth: (token: string) => Promise<boolean>;
  register: (data: { username: string; email: string; password: string; nickname?: string }) => Promise<boolean>;
  getProfile: (token: string) => Promise<User | null>;
  getWechatAuthUrl: (redirectUri: string, state?: string) => Promise<string>;
  wechatLogin: (code: string, state?: string) => Promise<{ access_token: string; user: User } | null>;
}

export const authRepository: AuthRepository = {
  // 认证相关方法
  login: async (username: string, password: string) => {
    try {
      const response = await httpClient.post('/auth/login', { username, password });
      if (response.data.access_token) {
        return {
          access_token: response.data.access_token,
          user: response.data.user,
        };
      }
      return null;
    } catch (error: any) {
      // 重新抛出错误，让 authProvider 处理
      throw error;
    }
  },

  logout: async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  checkAuth: async (token: string) => {
    try {
      const response = await httpClient.get('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return !!response.data;
    } catch {
      return false;
    }
  },

  register: async (data: { username: string; email: string; password: string; nickname?: string }) => {
    try {
      const response = await httpClient.post('/auth/register', data);
      return !!response.data;
    } catch (error: any) {
      throw error;
    }
  },

  getProfile: async (token: string) => {
    try {
      const response = await httpClient.get('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch {
      return null;
    }
  },

  getWechatAuthUrl: async (redirectUri: string, state?: string) => {
    try {
      const params = new URLSearchParams({ redirectUri });
      if (state) {
        params.append('state', state);
      }
      const response = await httpClient.get(`/auth/wechat/auth-url?${params.toString()}`);
      return response.data.authUrl;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to get WeChat auth URL';
      throw new Error(errorMessage);
    }
  },

  wechatLogin: async (code: string, state?: string) => {
    try {
      const response = await httpClient.post('/auth/wechat/login', { code, state });
      if (response.data.access_token) {
        return {
          access_token: response.data.access_token,
          user: response.data.user,
        };
      }
      return null;
    } catch (error: any) {
      throw error;
    }
  },
};
