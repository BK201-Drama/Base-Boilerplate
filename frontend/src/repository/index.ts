/**
 * Repository 统一导出
 *
 * 合并 DataRepository 和 AuthRepository
 */

import { dataRepository } from './data.repository';
import { authRepository } from './auth.repository';
import type { DataRepository } from './data.repository';
import type { AuthRepository } from './auth.repository';

// 完整的 Repository 接口（合并 DataRepository 和 AuthRepository）
export interface Repository extends DataRepository, AuthRepository {}

// 合并为完整的 Repository
export const realRepository: Repository = {
  ...dataRepository,
  ...authRepository,
};

// 导出类型
export type { DataRepository, AuthRepository };

// 导出单独的 repository（用于需要单独使用的情况）
export { authRepository } from './auth.repository';
export { dataRepository } from './data.repository';
