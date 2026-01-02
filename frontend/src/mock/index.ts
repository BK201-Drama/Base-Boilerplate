/**
 * Mock Repository 统一导出
 * 
 * 合并 DataMockRepository 和 AuthMockRepository
 */

import { dataMockRepository } from './data.mock.repository';
import { authMockRepository } from './auth.mock.repository';
import type { Repository } from '@/repository';

// 合并为完整的 Mock Repository
export const mockRepository: Repository = {
  ...dataMockRepository,
  ...authMockRepository,
};

