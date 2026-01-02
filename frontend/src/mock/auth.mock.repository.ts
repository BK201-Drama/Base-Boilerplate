/**
 * Mock Auth Repository 实现
 * 
 * 处理认证相关的 Mock API 调用
 */

import type { AuthRepository } from '@/repository/auth.repository';
import type { User } from '@/types';
import { delay } from './mock.utils';

// Mock 用户数据
const mockUser: User = {
  id: '1',
  username: 'admin',
  nickname: '管理员',
  email: 'admin@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
  roles: [
    {
      id: '1',
      name: 'admin',
      permissions: [
        { resource: 'users', action: 'read' },
        { resource: 'users', action: 'write' },
        { resource: 'roles', action: 'read' },
        { resource: 'roles', action: 'write' },
      ],
    },
  ],
};

// Mock Token
const mockToken = 'mock-jwt-token-123456789';

export const authMockRepository: AuthRepository = {
  login: async (username: string, password: string) => {
    await delay(500);
    if (username && password) {
      return {
        access_token: mockToken,
        user: mockUser,
      };
    }
    return null;
  },

  logout: async () => {
    await delay(200);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  checkAuth: async (token: string) => {
    await delay(200);
    return token === mockToken;
  },

  register: async (data: { username: string; email: string; password: string; nickname?: string }) => {
    await delay(500);
    return !!(data.username && data.email && data.password);
  },

  getProfile: async (token: string) => {
    await delay(200);
    if (token === mockToken) {
      return mockUser;
    }
    return null;
  },
};

