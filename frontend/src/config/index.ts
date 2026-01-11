/**
 * 配置模块统一导出
 * 
 * 核心配置文件：project.config.tsx
 * 所有项目相关的配置都在那里统一管理
 */

// 主配置
export { projectInfo, routes, menu } from './project.config';

// 配置加载器（推荐使用）
export {
  getResources,
  getProtectedRoutes,
  getPublicRoutes,
  getRefineOptions,
} from './config.loader';

// 类型定义
export type { RouteConfig, MenuResource } from './types';

// 组件注册表
export { getComponent, componentRegistry } from './component.registry';

