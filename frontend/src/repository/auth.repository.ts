/**
 * Auth Repository 实现
 * 
 * 处理认证相关的 API 调用
 */

import { httpClient } from '@/http';
import type { User, IPublicRepository } from '@/types';

// 认证 Repository 接口
export interface AuthRepository extends IPublicRepository {
  login: (username: string, password: string) => Promise<{ access_token: string; user: User } | null>;
  logout: () => Promise<void>;
  checkAuth: (token: string) => Promise<boolean>;
  register: (data: { username: string; email: string; password: string; nickname?: string }) => Promise<boolean>;
  getProfile: (token: string) => Promise<User | null>;
}

export const authRepository: AuthRepository = {
  // 认证相关方法
  login: async (username: string, password: string) => {
    const response = await httpClient.post('/auth/login', { username, password });
    if (response.data.access_token) {
      return {
        access_token: response.data.access_token,
        user: response.data.user,
      };
    }
    return null;
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
    } catch {
      return false;
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
};

