import { AuthProvider } from '@refinedev/core';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const authProvider: AuthProvider = {
  login: async ({ username, password }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        username,
        password,
      });

      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return {
          success: true,
          redirectTo: '/',
        };
      }

      return {
        success: false,
        error: {
          name: 'LoginError',
          message: '登录失败，请检查用户名和密码',
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          name: 'LoginError',
          message: error.response?.data?.message || '登录失败',
        },
      };
    }
  },

  logout: async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return {
      success: true,
      redirectTo: '/login',
    };
  },

  check: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await axios.get(`${API_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data) {
          return {
            authenticated: true,
          };
        }
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return {
          authenticated: false,
          redirectTo: '/login',
          error: {
            message: '身份验证失败',
            name: 'NotAuthenticated',
          },
        };
      }
    }

    return {
      authenticated: false,
      redirectTo: '/login',
      error: {
        message: '未登录',
        name: 'NotAuthenticated',
      },
    };
  },

  onError: async (error) => {
    if (error.status === 401 || error.status === 403) {
      return {
        logout: true,
        redirectTo: '/login',
        error,
      };
    }

    return { error };
  },

  getIdentity: async () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return {
        id: user.id,
        name: user.nickname || user.username,
        avatar: user.avatar,
        ...user,
      };
    }
    return null;
  },

  getPermissions: async () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      // 返回用户的所有权限
      const permissions = user.roles?.flatMap((role: any) =>
        role.permissions.map((p: any) => `${p.resource}:${p.action}`),
      ) || [];
      return permissions;
    }
    return [];
  },

  register: async ({ username, email, password, nickname }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        username,
        email,
        password,
        nickname,
      });

      if (response.data) {
        return {
          success: true,
          redirectTo: '/login',
        };
      }

      return {
        success: false,
        error: {
          name: 'RegisterError',
          message: '注册失败',
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          name: 'RegisterError',
          message: error.response?.data?.message || '注册失败',
        },
      };
    }
  },
};


