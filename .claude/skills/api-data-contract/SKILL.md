---
name: api-data-contract
description: 前后端 API 与数据约定：基址、认证、列表/单条/创建/更新/删除的请求与响应格式、错误处理，用于保证接口一致时调用。
---

# 前后端 API 与数据约定

## 何时使用本技能
- 设计或实现新 API、或对接前后端列表/表单/详情时
- 需要统一分页、排序、错误码或响应格式时

## API 基址与前缀
- 后端默认：`http://localhost:3000`，前缀：`/api`
- 前端：`VITE_API_URL`（如 `http://localhost:3000/api`）
- 前端 repository 路径为 `/${resource}` 等，不再重复写 `/api`

## 认证
- 登录：`POST /auth/login`，成功返回 JWT（或含 token 的结构）
- 请求头：`Authorization: Bearer <token>`
- 前端 authProvider 存 token，请求拦截器自动带 token

## 列表 (getList)
- 请求：GET `/{resource}?page=1&pageSize=10&sortField=id&sortOrder=asc`（及 filters）
- 响应：`{ data: T[], total: number }`

## 单条 (getOne)
- 请求：GET `/{resource}/:id`
- 响应：实体对象 `T`

## 创建 (create)
- 请求：POST `/{resource}`，body 为创建 DTO
- 响应：创建后的实体 `T`

## 更新 (update)
- 请求：PATCH `/{resource}/:id`，body 为部分更新 DTO
- 响应：更新后的实体 `T`

## 删除 (delete)
- 请求：DELETE `/{resource}/:id`
- 响应：204 或空

## 错误处理
- 后端使用 NestJS 标准异常（UnauthorizedException、ForbiddenException、BadRequestException 等）
- 前端在 axios 响应拦截器中统一处理 401/403，跳转登录或提示无权限

## 类型对齐
- 后端实体与 DTO 与 Prisma 模型、前端 `types/` 一致
- 分页、排序、过滤参数命名前后端统一，便于 Refine 透传
