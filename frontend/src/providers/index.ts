/**
 * Providers 统一导出
 * 
 * 通过依赖注入 Repository，根据环境变量注入不同的实现
 * Provider 代码完全干净，只负责调用注入的 Repository
 * 
 * 使用方式：
 * - 正常开发：yarn dev (使用真实后端)
 * - Mock 模式：yarn mock (使用 mock 数据)
 */

import { createDataProvider } from './data.provider';
import { createAuthProvider } from './auth.provider';
import { realRepository } from '@/repository';
import { mockRepository } from '@/mock';

// 根据环境变量选择 Repository
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const repository = USE_MOCK ? mockRepository : realRepository;

// 通过依赖注入创建 Providers
export const dataProvider = createDataProvider(repository);
export const authProvider = createAuthProvider(repository);

// 开发环境下输出提示信息
if (import.meta.env.DEV) {
  if (USE_MOCK) {
    console.log('🔧 [Providers] 使用 Mock 模式 - 数据不会连接真实后端');
  } else {
    console.log('🌐 [Providers] 使用真实后端模式');
  }
}

export type { DataProvider, AuthProvider } from '@refinedev/core';

