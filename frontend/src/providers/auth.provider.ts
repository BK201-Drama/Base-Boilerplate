/**
 * Auth Provider
 * 
 * 通过依赖注入 Repository，Provider 只负责调用，不关心数据来源
 */

import type { AuthProvider } from '@refinedev/core';
import i18n from '../i18n';
import type { Repository } from '@/repository';

// 创建 Provider 工厂函数
export const createAuthProvider = (repository: Repository): AuthProvider => {
  return {
    login: async ({ username, password }) => {
      try {
        const result = await repository.login(username, password);

        if (result) {
          localStorage.setItem('token', result.access_token);
          localStorage.setItem('user', JSON.stringify(result.user));
          return {
            success: true,
            redirectTo: '/',
          };
        }

        return {
          success: false,
          error: {
            name: 'LoginError',
            message: i18n.t('auth.loginFailedCheck'),
          },
        };
      } catch (error: any) {
        return {
          success: false,
          error: {
            name: 'LoginError',
            message: error.response?.data?.message || i18n.t('auth.loginFailed'),
          },
        };
      }
    },

    logout: async () => {
      await repository.logout();
      return {
        success: true,
        redirectTo: '/login',
      };
    },

    check: async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const isAuthenticated = await repository.checkAuth(token);
        if (isAuthenticated) {
          return {
            authenticated: true,
          };
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return {
            authenticated: false,
            redirectTo: '/login',
            error: {
              message: i18n.t('auth.authFailed'),
              name: 'NotAuthenticated',
            },
          };
        }
      }

      return {
        authenticated: false,
        redirectTo: '/login',
        error: {
          message: i18n.t('auth.notLoggedIn'),
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
      try {
        const user = JSON.parse(userStr);
        return {
          id: user.id,
          name: user.nickname || user.username,
          avatar: user.avatar,
          ...user,
        };
      } catch {
        return null;
      }
    }
    return null;
  },

  getPermissions: async () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const permissions = user.roles?.flatMap((role: any) =>
          role.permissions.map((p: any) => `${p.resource}:${p.action}`),
        ) || [];
        return permissions;
      } catch {
        return [];
      }
    }
    return [];
  },

    register: async ({ username, email, password, nickname }) => {
      try {
        const success = await repository.register({ username, email, password, nickname });

        if (success) {
          return {
            success: true,
            redirectTo: '/login',
          };
        }

        return {
          success: false,
          error: {
            name: 'RegisterError',
            message: i18n.t('auth.registerFailed'),
          },
        };
      } catch (error: any) {
        return {
          success: false,
          error: {
            name: 'RegisterError',
            message: error.response?.data?.message || i18n.t('auth.registerFailed'),
          },
        };
      }
    },
  };
};
