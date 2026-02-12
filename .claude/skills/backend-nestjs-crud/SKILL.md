---
name: backend-nestjs-crud
description: 后端 NestJS/Prisma/RBAC 开发约定：Controller/Service/Repository 分层、守卫与装饰器、CRUD 与代码生成，适用于编辑 backend 目录下代码时调用。
---

# 后端开发技能 (NestJS)

## 何时使用本技能
- 在 `backend/` 下新增或修改 Controller、Service、Module、DTO、Repository 时
- 需要了解认证、权限、Prisma、分页或代码生成器用法时

## 模块与分层
- **Controller**：只做参数校验与调用 Service，不写业务逻辑
- **Service**：业务逻辑，可注入 Repository 或 PrismaService
- **Repository**：数据访问，继承或使用 `BaseCrudRepository`（`common/repositories/`）
- 新增 CRUD 资源时优先使用 **BaseCrudController / BaseCrudService / BaseCrudRepository** 与 `@CrudController()` 装饰器

## 认证与权限
- 需要登录：`@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)`
- 权限：`@Permissions('resource:action')`，如 `user:create`、`user:read`、`user:update`、`user:delete`
- 角色：`@Roles('admin')` 等
- 公开接口：`@Public()`，无需 JWT

## Prisma
- Schema：`backend/prisma/schema.prisma`
- 修改后：`npx prisma migrate dev`、`npx prisma generate`
- 查询尽量用 Prisma 类型，避免 any

## CRUD 与分页
- 列表支持 `page`、`pageSize`、`sortField`、`sortOrder`，与前端 Refine 对齐
- 列表返回：`{ data: T[], total: number }`，单条直接返回实体

## 代码生成
- 基于 `resource.json` 的生成器在 `common/generator/`，文档见 `common/docs/GUIDE.md`
- 参考 `common/generator/examples/` 下的 resource.json 生成 Controller、Service、Module、DTO、Repository

## 其他
- 操作日志由 `OperationLogInterceptor` 统一记录
- 国际化：`src/i18n/` 下 zh/、en/
- 文件上传下载：`files` 模块，配置 `UPLOAD_DEST`、`MAX_FILE_SIZE`
