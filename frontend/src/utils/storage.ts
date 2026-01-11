/**
 * 本地存储工具函数
 */

const PREFIX = 'app_';

/**
 * 设置 localStorage
 * @param key 键名
 * @param value 值
 */
export const setStorage = <T>(key: string, value: T): void => {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(`${PREFIX}${key}`, serializedValue);
  } catch (error) {
    console.error('Failed to set storage:', error);
  }
};

/**
 * 获取 localStorage
 * @param key 键名
 * @param defaultValue 默认值
 */
export const getStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const serializedValue = localStorage.getItem(`${PREFIX}${key}`);
    if (serializedValue === null) {
      return defaultValue;
    }
    return JSON.parse(serializedValue) as T;
  } catch (error) {
    console.error('Failed to get storage:', error);
    return defaultValue;
  }
};

/**
 * 移除 localStorage
 * @param key 键名
 */
export const removeStorage = (key: string): void => {
  try {
    localStorage.removeItem(`${PREFIX}${key}`);
  } catch (error) {
    console.error('Failed to remove storage:', error);
  }
};

/**
 * 清空所有以 PREFIX 开头的 localStorage
 */
export const clearStorage = (): void => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Failed to clear storage:', error);
  }
};

/**
 * 设置 sessionStorage
 * @param key 键名
 * @param value 值
 */
export const setSessionStorage = <T>(key: string, value: T): void => {
  try {
    const serializedValue = JSON.stringify(value);
    sessionStorage.setItem(`${PREFIX}${key}`, serializedValue);
  } catch (error) {
    console.error('Failed to set session storage:', error);
  }
};

/**
 * 获取 sessionStorage
 * @param key 键名
 * @param defaultValue 默认值
 */
export const getSessionStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const serializedValue = sessionStorage.getItem(`${PREFIX}${key}`);
    if (serializedValue === null) {
      return defaultValue;
    }
    return JSON.parse(serializedValue) as T;
  } catch (error) {
    console.error('Failed to get session storage:', error);
    return defaultValue;
  }
};

/**
 * 移除 sessionStorage
 * @param key 键名
 */
export const removeSessionStorage = (key: string): void => {
  try {
    sessionStorage.removeItem(`${PREFIX}${key}`);
  } catch (error) {
    console.error('Failed to remove session storage:', error);
  }
};

/**
 * 清空所有以 PREFIX 开头的 sessionStorage
 */
export const clearSessionStorage = (): void => {
  try {
    const keys = Object.keys(sessionStorage);
    keys.forEach((key) => {
      if (key.startsWith(PREFIX)) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Failed to clear session storage:', error);
  }
};

