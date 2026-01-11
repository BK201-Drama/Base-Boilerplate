/**
 * 组件注册表
 * 将配置中的组件路径映射到实际的 React 组件
 */

import React from 'react';
import { Dashboard } from '@/pages/dashboard';
import { Login } from '@/pages/login';
import { UserList, UserCreate, UserEdit, UserShow } from '@/pages/users';

// 组件映射表
export const componentRegistry: Record<string, React.ComponentType<any>> = {
  // Dashboard
  '@/pages/dashboard': Dashboard,
  
  // Login
  '@/pages/login': Login,
  
  // Users - 完整路径
  '@/pages/users/list': UserList,
  '@/pages/users/create': UserCreate,
  '@/pages/users/edit': UserEdit,
  '@/pages/users/show': UserShow,
};

/**
 * 根据组件路径获取组件
 */
export function getComponent(componentPath: string, parentPath?: string): React.ComponentType<any> {
  // 如果是完整路径
  if (componentRegistry[componentPath]) {
    return componentRegistry[componentPath];
  }
  
  // 如果是相对路径，需要从父路径推断
  if (parentPath && componentPath) {
    const fullPath = `${parentPath}/${componentPath}`;
    if (componentRegistry[fullPath]) {
      return componentRegistry[fullPath];
    }
  }
  
  // 如果找不到，返回一个错误组件
  const ErrorComponent: React.FC = () => (
    <div style={{ padding: '20px' }}>
      <h2>组件未找到</h2>
      <p>路径: {componentPath}</p>
      {parentPath && <p>父路径: {parentPath}</p>}
    </div>
  );
  return ErrorComponent;
}

