/**
 * 报告相关类型定义
 */

// 用户报告数据类型
export interface UserReport {
  userId: string;
  username: string;
  totalOrders: number;
  totalAmount: number;
  lastLoginAt: string;
  status: 'active' | 'inactive';
  [key: string]: any;
}
