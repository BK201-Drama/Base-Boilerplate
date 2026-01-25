/**
 * HTTP 状态码常量
 * 
 * 定义常用的 HTTP 状态码，避免硬编码
 */

// 2xx Success
const OK = 200;
const CREATED = 201;
const NO_CONTENT = 204;

// 4xx Client Error
const BAD_REQUEST = 400;
const UNAUTHORIZED = 401;
const FORBIDDEN = 403;
const NOT_FOUND = 404;
const METHOD_NOT_ALLOWED = 405;
const CONFLICT = 409;
const UNPROCESSABLE_ENTITY = 422;

// 5xx Server Error
const INTERNAL_SERVER_ERROR = 500;
const BAD_GATEWAY = 502;
const SERVICE_UNAVAILABLE = 503;

export const HttpStatusCode = {
  OK,
  CREATED,
  NO_CONTENT,
  BAD_REQUEST,
  UNAUTHORIZED,
  FORBIDDEN,
  NOT_FOUND,
  METHOD_NOT_ALLOWED,
  CONFLICT,
  UNPROCESSABLE_ENTITY,
  INTERNAL_SERVER_ERROR,
  BAD_GATEWAY,
  SERVICE_UNAVAILABLE,
} as const;

/**
 * HTTP 状态码类型
 */
export type HttpStatusCodeType = typeof HttpStatusCode[keyof typeof HttpStatusCode];

/**
 * 需要触发登出的状态码
 * 
 * 注意：
 * - 401 (UNAUTHORIZED): 未认证，需要登出并重定向到登录页
 * - 403 (FORBIDDEN): 已认证但权限不足，不应该登出，应该显示错误提示
 */
export const AUTH_ERROR_STATUS_CODES = [
  HttpStatusCode.UNAUTHORIZED,
] as const;
