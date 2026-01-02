/**
 * 服务层类型定义
 * 
 * 定义各个服务的接口，确保服务层的一致性
 */

import type { User, Statistics } from './index';

/**
 * 用户服务接口
 */
export interface UserService {
  getUser: () => Promise<User | null>;
  logout: () => Promise<void>;
  isAuthenticated: () => Promise<boolean>;
  user: User | null;
}

/**
 * 统计数据服务接口
 */
export interface StatisticsService {
  getStatistics: () => Promise<Statistics>;
  refreshStatistics: () => Promise<void>;
  statistics: Statistics | null;
  loading: boolean;
}

