/**
 * User Service - 用户数据服务
 * 
 * 数据层：负责用户相关的数据获取和业务逻辑
 * 
 * 架构说明：
 * - Services 层作为跨平台抽象层，定义业务接口
 * - 当前实现使用 Refine hooks（Web 平台）
 * - 未来可替换为 Taro、Electron IPC 等实现
 * - Refine hooks 内部使用 Providers（authProvider）来调用 API
 * 
 * 使用方式：
 * - Containers 层通过此 Service 获取用户数据
 * - 展示层不应该直接使用此 Service
 */

import { useCallback, useMemo } from 'react';
import { useGetIdentity, useLogout } from '@refinedev/core';
import type { UserService } from '@/types/user.types';

/**
 * 用户服务 Hook
 * 
 * @returns UserService 用户服务接口
 * 
 * @example
 * ```tsx
 * const userService = useUserService();
 * const { user, isAuthenticated, logout } = userService;
 * ```
 */
export const useUserService = (): UserService => {
  const { data: user, isLoading } = useGetIdentity();
  const { mutate: logout, isLoading: isLoggingOut } = useLogout();

  // 当前用户（带默认值）
  const currentUser = useMemo(() => {
    return user || null;
  }, [user]);

  // 获取用户信息（异步方法）
  const getUser = useCallback(async () => {
    return currentUser;
  }, [currentUser]);

  // 登出
  const handleLogout = useCallback(async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      logout(
        {},
        {
          onSuccess: () => {
            resolve();
          },
          onError: (error) => {
            console.error('Failed to logout:', error);
            reject(error);
          },
        },
      );
    });
  }, [logout]);

  // 检查是否已认证
  const isAuthenticated = useCallback(async (): Promise<boolean> => {
    return !!currentUser;
  }, [currentUser]);

  return {
    user: currentUser,
    getUser,
    logout: handleLogout,
    isAuthenticated,
  };
};

/**
 * @deprecated 使用 useUserService 替代
 * 保持向后兼容的导出
 */
export const useRefineUserService = useUserService;

