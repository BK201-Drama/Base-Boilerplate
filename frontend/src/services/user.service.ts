/**
 * User Service - 用户数据服务
 * 
 * 通过 Refine hooks 获取用户数据
 * Refine hooks 内部使用 Providers（authProvider）来调用 API
 */

import { useGetIdentity, useLogout } from '@refinedev/core';
import { useCallback } from 'react';

export interface User {
  id: string | number;
  name?: string;
  username?: string;
  nickname?: string;
  email?: string;
  avatar?: string;
  [key: string]: any;
}

export interface UserService {
  getUser: () => Promise<User | null>;
  logout: () => Promise<void>;
  isAuthenticated: () => Promise<boolean>;
}

export const useRefineUserService = (): UserService & { user: User | null } => {
  const { data: user } = useGetIdentity();
  const { mutate: logout } = useLogout();

  return {
    user: user || null,
    getUser: useCallback(async () => user || null, [user]),
    logout: useCallback(async () => logout(), [logout]),
    isAuthenticated: useCallback(async () => !!user, [user]),
  };
};

