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

        // 如果没有结果，抛出错误
        const error = new Error(i18n.t('auth.loginFailedCheck'));
        (error as any).name = 'LoginError';
        throw error;
      } catch (error: any) {
        let errorMessage = error.message || i18n.t('auth.loginFailed');
        
        if (error.response?.data?.message) {
          const message = error.response.data.message;
          errorMessage = Array.isArray(message) ? message.join(', ') : message;
        }
        
        const loginError = new Error(errorMessage);
        (loginError as any).name = 'LoginError';
        (loginError as any).response = error.response;
        throw loginError;
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
    const token = localStorage.getItem('token');
    if ((error.status === 401 || error.status === 403) && token) {
      return {
        logout: true,
        redirectTo: '/login',
        error,
      };
    }

    // 其他错误（包括登录失败的错误）直接返回，让调用方处理
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
        // 提取错误消息，支持数组格式
        let errorMessage = error.message || i18n.t('auth.registerFailed');
        
        if (error.response?.data?.message) {
          const message = error.response.data.message;
          errorMessage = Array.isArray(message) ? message.join(', ') : message;
        }
        
        return {
          success: false,
          error: {
            name: 'RegisterError',
            message: errorMessage,
          },
        };
      }
    },
  };
};
