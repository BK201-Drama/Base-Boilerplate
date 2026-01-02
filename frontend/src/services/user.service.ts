/**
 * User Service - 用户数据服务
 * 
 * 数据层：负责用户相关的数据获取和业务逻辑
 * 通过 Refine hooks 获取用户数据
 * Refine hooks 内部使用 Providers（authProvider）来调用 API
 */

import { useGetIdentity, useLogout } from '@refinedev/core';
import { useCallback } from 'react';
import type { UserService } from '@/types/user.types';

/**
 * 使用 Refine 的用户服务 Hook
 * 
 * 这是一个数据层的 Hook，用于获取用户数据和执行用户相关操作
 * 展示层不应该直接使用这个 Hook，应该通过 Container 组件来使用
 */
export const useRefineUserService = (): UserService => {
  const { data: user } = useGetIdentity();
  const { mutate: logout } = useLogout();

  return {
    user: user || null,
    getUser: useCallback(async () => user || null, [user]),
    logout: useCallback(async () => {
      await logout();
    }, [logout]),
    isAuthenticated: useCallback(async () => !!user, [user]),
  };
};

