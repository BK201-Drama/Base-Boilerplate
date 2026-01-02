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
  [key: string]: any;
}

// 用户服务接口
export interface UserService {
  getUser: () => Promise<User | null>;
  logout: () => Promise<void>;
  isAuthenticated: () => Promise<boolean>;
  user: User | null;
}

