/**
 * 配置加载器
 * 封装所有配置处理逻辑，将配置转换为应用可直接使用的格式
 */

import React from 'react';
import { Route } from 'react-router-dom';
import type { TFunction } from 'react-i18next';
import { routes, menu, projectInfo } from './project.config';
import { getComponent } from './component.registry';
import type { RouteConfig } from './types';

/**
 * 递归渲染路由
 */
function renderRoutes(routes: RouteConfig[], parentPath?: string): React.ReactNode {
  return routes.map((route) => {
    const currentPath = parentPath || route.component;
    const component = getComponent(route.component, parentPath);

    // 如果有子路由
    if (route.children && route.children.length > 0) {
      return (
        <Route key={route.path} path={route.path}>
          {route.index && (
            <Route index element={React.createElement(component)} />
          )}
          {renderRoutes(route.children, currentPath)}
        </Route>
      );
    }

    // 如果是 index 路由
    if (route.index) {
      return (
        <Route key={route.path || 'index'} index element={React.createElement(component)} />
      );
    }

    // 普通路由
    return (
      <Route
        key={route.path}
        path={route.path}
        element={React.createElement(component)}
      />
    );
  });
}

/**
 * 转换菜单配置为 Refine resources 格式
 */
export function getResources(t: TFunction) {
  return menu.map((resource) => ({
    name: resource.name,
    list: resource.list,
    create: resource.create,
    edit: resource.edit,
    show: resource.show,
    meta: {
      label: resource.meta.label.startsWith('common.')
        ? t(resource.meta.label)
        : resource.meta.label,
      icon: resource.meta.icon,
    },
  }));
}

/**
 * 获取受保护的路由（需要登录）
 */
export function getProtectedRoutes(): React.ReactNode {
  const protectedRoutes = routes.filter((route) => !route.public);
  return renderRoutes(protectedRoutes);
}

/**
 * 获取公共路由（无需登录）
 */
export function getPublicRoutes(): React.ReactNode {
  const publicRoutes = routes.filter((route) => route.public);
  return publicRoutes.map((route) => {
    const component = getComponent(route.component);
    return (
      <Route
        key={route.path}
        path={route.path}
        element={React.createElement(component)}
      />
    );
  });
}

/**
 * 获取 Refine 配置选项
 */
export function getRefineOptions() {
  return {
    syncWithLocation: true,
    warnWhenUnsavedChanges: true,
    projectId: projectInfo.projectId,
  };
}
