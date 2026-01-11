/**
 * 权限控制组件
 * 
 * 用于控制组件/元素的显示权限
 */

import React from 'react';
import { usePermissions, type Permission } from '@/hooks/usePermissions';

export interface CanAccessProps {
  /** 子元素 */
  children: React.ReactNode;
  /** 需要的单个权限 - 资源名 */
  resource?: string;
  /** 需要的单个权限 - 操作名 */
  action?: string;
  /** 需要的多个权限（全部满足） */
  permissions?: Permission[];
  /** 需要的多个权限中的任意一个 */
  anyPermissions?: Permission[];
  /** 无权限时的回退内容 */
  fallback?: React.ReactNode;
  /** 是否只有管理员可见 */
  adminOnly?: boolean;
}

/**
 * 权限控制组件
 * 
 * @example
 * ```tsx
 * // 单个权限检查
 * <CanAccess resource="users" action="create">
 *   <CreateButton />
 * </CanAccess>
 * 
 * // 多个权限检查（全部满足）
 * <CanAccess permissions={[
 *   { resource: 'users', action: 'edit' },
 *   { resource: 'users', action: 'delete' }
 * ]}>
 *   <AdminPanel />
 * </CanAccess>
 * 
 * // 任意一个权限满足
 * <CanAccess anyPermissions={[
 *   { resource: 'users', action: 'edit' },
 *   { resource: 'users', action: 'view' }
 * ]}>
 *   <UserInfo />
 * </CanAccess>
 * 
 * // 仅管理员可见
 * <CanAccess adminOnly>
 *   <SystemSettings />
 * </CanAccess>
 * 
 * // 带回退内容
 * <CanAccess resource="users" action="delete" fallback={<span>无权限</span>}>
 *   <DeleteButton />
 * </CanAccess>
 * ```
 */
export const CanAccess: React.FC<CanAccessProps> = ({
  children,
  resource,
  action,
  permissions,
  anyPermissions,
  fallback = null,
  adminOnly = false,
}) => {
  const { hasPermission, hasAllPermissions, hasAnyPermission, isAdmin, isLoading } = usePermissions();

  // 加载中时不显示
  if (isLoading) {
    return null;
  }

  // 检查是否有权限
  let hasAccess = false;

  // 管理员检查
  if (adminOnly) {
    hasAccess = isAdmin;
  }
  // 单个权限检查
  else if (resource && action) {
    hasAccess = hasPermission(resource, action);
  }
  // 多个权限检查（全部满足）
  else if (permissions && permissions.length > 0) {
    hasAccess = hasAllPermissions(permissions);
  }
  // 任意一个权限满足
  else if (anyPermissions && anyPermissions.length > 0) {
    hasAccess = hasAnyPermission(anyPermissions);
  }
  // 没有指定权限要求，默认允许
  else {
    hasAccess = true;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default CanAccess;
