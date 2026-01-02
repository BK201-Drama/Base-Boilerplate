import { create } from 'zustand';

/**
 * 应用级别状态类型（通用）
 */
export interface AppConfig {
  // API 配置
  apiUrl: string;
  // 应用版本
  version: string;
  // 环境
  environment: 'development' | 'production' | 'test';
}

/**
 * App Store - 管理应用级别的状态（通用）
 * 包括应用配置、全局设置等
 * 
 * 这是通用 store，适用于所有业务场景
 */
interface AppState {
  // 应用配置
  config: AppConfig | null;
  setConfig: (config: AppConfig) => void;

  // 应用初始化状态
  initialized: boolean;
  setInitialized: (initialized: boolean) => void;

  // 全局错误信息
  globalError: string | null;
  setGlobalError: (error: string | null) => void;
  clearGlobalError: () => void;

  // 全局成功消息
  globalSuccess: string | null;
  setGlobalSuccess: (message: string | null) => void;
  clearGlobalSuccess: () => void;

  // 应用统计信息（可选）
  stats: {
    totalUsers?: number;
    totalRoles?: number;
    totalPermissions?: number;
    [key: string]: any;
  };
  setStats: (stats: AppState['stats']) => void;
  updateStat: (key: string, value: any) => void;

  // 重置所有状态
  reset: () => void;
}

const initialState = {
  config: null,
  initialized: false,
  globalError: null,
  globalSuccess: null,
  stats: {},
};

/**
 * App Store
 */
export const useAppStore = create<AppState>((set) => ({
  ...initialState,

  setConfig: (config) => set({ config }),

  setInitialized: (initialized) => set({ initialized }),

  setGlobalError: (error) => set({ globalError: error }),
  clearGlobalError: () => set({ globalError: null }),

  setGlobalSuccess: (message) => set({ globalSuccess: message }),
  clearGlobalSuccess: () => set({ globalSuccess: null }),

  setStats: (stats) => set({ stats }),
  updateStat: (key, value) =>
    set((state) => ({
      stats: {
        ...state.stats,
        [key]: value,
      },
    })),

  reset: () => set(initialState),
}));

