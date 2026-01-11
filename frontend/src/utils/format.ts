/**
 * 格式化工具函数
 */

/**
 * 格式化日期时间
 * @param date 日期字符串或 Date 对象
 * @param format 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 */
export const formatDateTime = (
  date: string | Date | number | undefined | null,
  format: string = 'YYYY-MM-DD HH:mm:ss'
): string => {
  if (!date) return '-';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * 格式化日期
 * @param date 日期字符串或 Date 对象
 */
export const formatDate = (date: string | Date | number | undefined | null): string => {
  return formatDateTime(date, 'YYYY-MM-DD');
};

/**
 * 格式化时间
 * @param date 日期字符串或 Date 对象
 */
export const formatTime = (date: string | Date | number | undefined | null): string => {
  return formatDateTime(date, 'HH:mm:ss');
};

/**
 * 格式化数字（添加千分位）
 * @param num 数字
 * @param decimals 小数位数，默认 0
 */
export const formatNumber = (
  num: number | string | undefined | null,
  decimals: number = 0
): string => {
  if (num === undefined || num === null || num === '') return '-';
  
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return '-';
  
  return n.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * 格式化金额
 * @param amount 金额
 * @param decimals 小数位数，默认 2
 * @param prefix 前缀，默认 '¥'
 */
export const formatMoney = (
  amount: number | string | undefined | null,
  decimals: number = 2,
  prefix: string = '¥'
): string => {
  const formatted = formatNumber(amount, decimals);
  if (formatted === '-') return formatted;
  return `${prefix}${formatted}`;
};

/**
 * 格式化百分比
 * @param value 数值（0-1 之间或 0-100）
 * @param decimals 小数位数，默认 2
 * @param isRatio 是否是比例（0-1），默认 false
 */
export const formatPercent = (
  value: number | string | undefined | null,
  decimals: number = 2,
  isRatio: boolean = false
): string => {
  if (value === undefined || value === null || value === '') return '-';
  
  let n = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(n)) return '-';
  
  if (isRatio) {
    n = n * 100;
  }
  
  return `${n.toFixed(decimals)}%`;
};

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @param decimals 小数位数，默认 2
 */
export const formatFileSize = (
  bytes: number | undefined | null,
  decimals: number = 2
): string => {
  if (bytes === undefined || bytes === null || bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

/**
 * 截断字符串
 * @param str 字符串
 * @param maxLength 最大长度
 * @param suffix 后缀，默认 '...'
 */
export const truncate = (
  str: string | undefined | null,
  maxLength: number,
  suffix: string = '...'
): string => {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
};

/**
 * 格式化相对时间（多久之前）
 * @param date 日期字符串或 Date 对象
 */
export const formatRelativeTime = (date: string | Date | number | undefined | null): string => {
  if (!date) return '-';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (seconds < 60) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 30) return `${days}天前`;
  if (months < 12) return `${months}个月前`;
  return `${years}年前`;
};
