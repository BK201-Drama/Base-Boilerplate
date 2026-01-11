/**
 * 项目主配置文件
 * 
 * 这是整个项目的核心配置中心，所有项目相关的配置都在这里统一管理
 * 
 * 使用场景：
 * - 当需要将底座改造成外卖系统时，只需修改此文件
 * - 修改项目名称、路由、菜单等，无需到处查找替换
 * 
 * 配置项说明：
 * - projectInfo: 项目基本信息（名称、简称、ID等）
 * - routes: 路由配置
 * - menu: 菜单和资源配置
 */

import { DashboardOutlined, UserOutlined } from '@ant-design/icons';
import type { RouteConfig, MenuResource } from './types';

// ==================== 项目基本信息 ====================
export const projectInfo = {
  // 项目名称（完整名称）
  name: {
    zh: 'B端底座系统',
    en: 'B-Side Base System',
  },
  // 项目简称（用于侧边栏收起时显示）
  nameShort: {
    zh: 'B端',
    en: 'B-Side',
  },
  // 项目描述
  description: {
    zh: '一个通用的B端管理系统底座',
    en: 'A universal B-side management system base',
  },
  // Refine projectId（用于标识项目）
  projectId: 'base-boilerplate',
  // 欢迎语
  welcome: {
    zh: '欢迎登录',
    en: 'Welcome',
  },
} as const;

// ==================== 路由配置 ====================
export const routes: RouteConfig[] = [
  {
    path: '/',
    component: '@/pages/dashboard',
    name: 'Dashboard',
    index: true,
    public: false,
  },
  {
    path: '/users',
    component: '@/pages/users',
    name: 'users',
    public: false,
    children: [
      {
        path: '',
        component: 'list',
        name: 'UserList',
        index: true,
      },
      {
        path: 'create',
        component: 'create',
        name: 'UserCreate',
      },
      {
        path: 'edit/:id',
        component: 'edit',
        name: 'UserEdit',
      },
      {
        path: 'show/:id',
        component: 'show',
        name: 'UserShow',
      },
    ],
  },
  {
    path: '/login',
    component: '@/pages/login',
    name: 'Login',
    public: true,
  },
];

// ==================== 菜单配置 ====================
export const menu: MenuResource[] = [
  {
    name: 'dashboard',
    list: '/',
    meta: {
      label: 'common.dashboard', // 使用 i18n key，或直接使用字符串
      icon: <DashboardOutlined />, // 支持 antd icon 组件或字符串（如 '📊'）
    },
  },
  {
    name: 'users',
    list: '/users',
    create: '/users/create',
    edit: '/users/edit/:id',
    show: '/users/show/:id',
    meta: {
      label: '用户管理', // 直接使用字符串，或使用 i18n key
      icon: <UserOutlined />, // 支持 antd icon 组件或字符串（如 '👥'）
    },
  },
];
