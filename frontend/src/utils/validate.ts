/**
 * 验证工具函数
 */

/**
 * 验证邮箱格式
 * @param email 邮箱地址
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 验证手机号格式（中国大陆）
 * @param phone 手机号
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * 验证 URL 格式
 * @param url URL 地址
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * 验证身份证号格式（中国大陆 18 位）
 * @param idCard 身份证号
 */
export const isValidIdCard = (idCard: string): boolean => {
  const idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
  return idCardRegex.test(idCard);
};

/**
 * 验证密码强度
 * @param password 密码
 * @returns 密码强度等级 (0-4)
 */
export const getPasswordStrength = (password: string): number => {
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
  
  return Math.min(strength, 4);
};

/**
 * 验证用户名格式
 * @param username 用户名
 * @param minLength 最小长度，默认 3
 * @param maxLength 最大长度，默认 20
 */
export const isValidUsername = (
  username: string,
  minLength: number = 3,
  maxLength: number = 20
): boolean => {
  const usernameRegex = new RegExp(`^[a-zA-Z][a-zA-Z0-9_]{${minLength - 1},${maxLength - 1}}$`);
  return usernameRegex.test(username);
};

/**
 * 检查字符串是否为空
 * @param value 字符串
 */
export const isEmpty = (value: string | undefined | null): boolean => {
  return value === undefined || value === null || value.trim() === '';
};

/**
 * 检查是否为数字
 * @param value 值
 */
export const isNumber = (value: any): boolean => {
  if (typeof value === 'number') return !isNaN(value);
  if (typeof value === 'string') return !isNaN(parseFloat(value)) && isFinite(Number(value));
  return false;
};

/**
 * 检查是否为整数
 * @param value 值
 */
export const isInteger = (value: any): boolean => {
  return isNumber(value) && Number.isInteger(Number(value));
};

/**
 * 检查是否为正数
 * @param value 值
 */
export const isPositive = (value: any): boolean => {
  return isNumber(value) && Number(value) > 0;
};

/**
 * Ant Design Form 验证规则工厂
 */
export const formRules = {
  /** 必填 */
  required: (message: string = '此字段为必填项') => ({
    required: true,
    message,
  }),
  
  /** 邮箱 */
  email: (message: string = '请输入有效的邮箱地址') => ({
    type: 'email' as const,
    message,
  }),
  
  /** 最小长度 */
  minLength: (min: number, message?: string) => ({
    min,
    message: message || `最少需要 ${min} 个字符`,
  }),
  
  /** 最大长度 */
  maxLength: (max: number, message?: string) => ({
    max,
    message: message || `最多允许 ${max} 个字符`,
  }),
  
  /** 手机号 */
  phone: (message: string = '请输入有效的手机号') => ({
    pattern: /^1[3-9]\d{9}$/,
    message,
  }),
  
  /** URL */
  url: (message: string = '请输入有效的 URL') => ({
    type: 'url' as const,
    message,
  }),
  
  /** 数字 */
  number: (message: string = '请输入数字') => ({
    pattern: /^\d+(\.\d+)?$/,
    message,
  }),
  
  /** 整数 */
  integer: (message: string = '请输入整数') => ({
    pattern: /^\d+$/,
    message,
  }),
  
  /** 自定义正则 */
  pattern: (pattern: RegExp, message: string) => ({
    pattern,
    message,
  }),
};

