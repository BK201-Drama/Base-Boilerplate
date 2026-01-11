/**
 * 配置类型定义
 */

import type { ReactNode } from 'react';

export interface RouteConfig {
  path: string;
  component: string;
  name: string;
  index?: boolean;
  public?: boolean;
  children?: RouteConfig[];
}

export interface MenuResource {
  name: string;
  list?: string;
  create?: string;
  edit?: string;
  show?: string;
  meta: {
    label: string;
    icon: ReactNode | string; // 支持 React 组件或字符串（emoji）
  };
}
