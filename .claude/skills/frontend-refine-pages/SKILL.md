---
name: frontend-refine-pages
description: 前端 Refine + Ant Design 约定：hooks、providers、repository、页面结构，适用于编辑 frontend/src 下代码时调用。
---

# 前端开发技能 (Refine)

## 何时使用本技能
- 在 `frontend/src/` 下新增或修改页面、组件、providers、repository 时
- 需要确认该用哪个 Refine hook、数据如何请求、权限如何控制时

## 核心理念
**直接使用 Refine，不重复造轮子。** 优先用 Refine 的 hooks 与组件，再考虑自定义封装。

## 数据与请求
- **CRUD**：`useList`、`useOne`、`useCreate`、`useUpdate`、`useDelete`，resource 与后端路由一致（如 `users`、`roles`）
- **业务 API**：`useCustom`，在 dataProvider 中通过 `repository.custom()` 发请求
- **身份**：`useGetIdentity`、`useLogout`
- **权限**：`usePermissions`（`hooks/usePermissions.ts`）、`CanAccess` 组件

## 分层
- **providers/**：dataProvider、authProvider 必需，内部调用 repository
- **repository/**：纯 HTTP，`data.repository.ts`、`auth.repository.ts`，不写业务逻辑
- **pages/**：直接使用 Refine hooks；复杂时在同目录放 `useXxxData` 等 hook
- **components/**：展示与布局；hooks 全局复用放 `hooks/`，页面/组件专属放对应目录

## 路由与资源
- 路由与菜单在 `config/project.config.tsx` 等配置中注册
- 新增列表/新建/编辑/详情时，resource 与后端一致，并挂好路由

## UI 与类型
- 使用 **Ant Design** 组件（Table、Form、Button、Modal 等）
- 主题与全局样式：`config/theme.config.ts`、`index.css`
- 实体类型在 `types/`，与后端返回结构对齐

## 注意
- 不随意加中间层；仅在有跨平台复用或明显抽象收益时考虑 Service/Container（见 DEVELOPMENT_GUIDE.md）
