---
name: base-boilerplate-overview
description: B 端底座项目总览：NestJS + Prisma + Refine + Ant Design 技术栈与目录结构，用于理解整体架构与前后端分工。
---

# Base-Boilerplate 项目总览

## 何时使用本技能
- 需要了解项目整体技术选型、目录结构或前后端职责时
- 新接手或生成代码前需要统一上下文时

## 项目定位
基于 **NestJS + Prisma + Refine + Ant Design** 的前后端分离 B 端底座，用于快速生成 B 端项目。

## 技术栈

### 后端 (backend/)
- **NestJS** - Node.js 企业级框架
- **Prisma** - ORM，schema 在 `backend/prisma/schema.prisma`
- **JWT** - 身份认证（auth 模块）
- **RBAC** - User / Role / Permission
- 操作日志拦截器、Excel 导入导出、文件上传（files 模块）
- 通用 CRUD：`common/` 下的 BaseCrudController、BaseCrudService、BaseCrudRepository

### 前端 (frontend/)
- **Refine** - React 企业级 CRUD 框架，优先使用 Refine 自带能力
- **Ant Design** - UI 组件库
- **React Router** - 路由
- **Axios** - HTTP（`http/axios.ts`，由 repository 调用）
- **TypeScript** - 全项目类型安全

## 目录结构（简要）

```
Base-Boilerplate/
├── backend/src/
│   ├── auth/           # JWT 认证
│   ├── prisma/         # PrismaService
│   ├── files/          # 文件上传下载
│   ├── common/         # 守卫、装饰器、BaseCRUD、代码生成器
│   ├── modules/rbac/   # user, role, permission
│   └── i18n/
├── frontend/src/
│   ├── providers/      # dataProvider, authProvider
│   ├── repository/     # data.repository, auth.repository
│   ├── pages/          # 页面，直接使用 Refine hooks
│   ├── components/     # 布局、dashboard、auth
│   ├── config/         # 路由、主题、项目配置
│   └── types/
└── .claude/skills/     # 本技能目录
```

## 开发注意
- 后端 API 前缀：`/api`，前端 `VITE_API_URL`
- 新增资源：Prisma schema → migrate → 后端 CRUD → 前端 resource + 页面
- 权限：后端 `@Permissions('resource:action')`、`@Roles`，前端 `CanAccess`、`usePermissions`
