/**
 * 权限 Hook
 * 
 * 提供权限检查功能
 */

import { useCallback, useMemo } from 'react';
import { usePermissions as useRefinePermissions } from '@refinedev/core';

export interface Permission {
  resource: string;
  action: string;
}

export interface UsePermissionsResult {
  /** 当前用户的所有权限列表 */
  permissions: string[];
  /** 是否正在加载权限 */
  isLoading: boolean;
  /** 检查是否有指定权限 */
  hasPermission: (resource: string, action: string) => boolean;
  /** 检查是否有多个权限（全部满足） */
  hasAllPermissions: (permissions: Permission[]) => boolean;
  /** 检查是否有多个权限中的任意一个 */
  hasAnyPermission: (permissions: Permission[]) => boolean;
  /** 检查是否是管理员 */
  isAdmin: boolean;
}

/**
 * 权限检查 Hook
 * 
 * @example
 * ```tsx
 * const { hasPermission, isAdmin } = usePermissions();
 * 
 * if (hasPermission('users', 'create')) {
 *   // 显示创建按钮
 * }
 * 
 * if (isAdmin) {
 *   // 显示管理员功能
 * }
 * ```
 */
export const usePermissions = (): UsePermissionsResult => {
  const { data: permissions = [], isLoading } = useRefinePermissions<string[]>();

  // 检查单个权限
  const hasPermission = useCallback(
    (resource: string, action: string): boolean => {
      const permissionKey = `${resource}:${action}`;
      return permissions.includes(permissionKey) || permissions.includes('*:*');
    },
    [permissions]
  );

  // 检查多个权限（全部满足）
  const hasAllPermissions = useCallback(
    (requiredPermissions: Permission[]): boolean => {
      return requiredPermissions.every(({ resource, action }) =>
        hasPermission(resource, action)
      );
    },
    [hasPermission]
  );

  // 检查多个权限（任意一个）
  const hasAnyPermission = useCallback(
    (requiredPermissions: Permission[]): boolean => {
      return requiredPermissions.some(({ resource, action }) =>
        hasPermission(resource, action)
      );
    },
    [hasPermission]
  );

  // 检查是否是管理员
  const isAdmin = useMemo(() => {
    return permissions.includes('*:*') || 
           permissions.some(p => p.startsWith('admin:') || p === 'admin');
  }, [permissions]);

  return {
    permissions,
    isLoading,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    isAdmin,
  };
};

