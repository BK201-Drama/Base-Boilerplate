/**
 * 用户相关类型定义
 */

// 用户类型
export interface User {
  id: string | number;
  name?: string;
  username?: string;
  nickname?: string;
  email?: string;
  avatar?: string;
  status?: 'active' | 'inactive';
  roles?: UserRole[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

// 用户角色
export interface UserRole {
  id: string | number;
  name: string;
  permissions?: Permission[];
}

// 权限
export interface Permission {
  resource: string;
  action: string;
}
