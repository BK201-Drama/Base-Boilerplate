/**
 * Mock 公共工具函数
 * 
 * 包含所有 Mock 实现共享的工具函数
 */

// 模拟延迟，让 mock 数据更真实
export const delay = (ms: number = 500) => new Promise((resolve) => setTimeout(resolve, ms));

