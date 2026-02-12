---
name: add-new-resource
description: 新增 CRUD 资源的标准流程：从 Prisma 建模到后端 CRUD 与权限，再到前端类型、路由与列表/新建/编辑/详情页，以及检查清单。
---

# 新增 CRUD 资源标准流程

## 何时使用本技能
- 需要新增一个完整资源（如订单、产品）时
- 希望按固定步骤保证前后端一致、不遗漏时

## 1. 后端 - 数据模型
- 在 `backend/prisma/schema.prisma` 中定义 Model（字段、关联、@@map）
- 执行：`cd backend && npx prisma migrate dev --name xxx`，再 `npx prisma generate`

## 2. 后端 - CRUD 代码
- **方式 A（推荐）**：使用代码生成器。在 `common/generator/examples/` 参考现有 `resource.json` 编写新资源的 `resource.json`，运行生成器得到 Controller、Service、Module、DTO、Repository，在 `app.module` 中注册新 Module。
- **方式 B**：手写。在 `modules/` 下新建模块，使用 `common` 的 BaseCrudController、BaseCrudService、BaseCrudRepository 及 `@CrudController()`，风格与 user/role/permission 一致。

## 3. 后端 - 权限
- 在 Permission 表或种子中增加 `resource:create`、`resource:read`、`resource:update`、`resource:delete`
- Controller 上使用 `@Permissions('resource:create')` 等

## 4. 前端 - 类型与 resource
- 在 `frontend/src/types/` 增加或扩展类型（如 `order.types.ts`），与后端实体一致
- 确定 resource 名称（如 `orders`），与后端路由一致

## 5. 前端 - 路由与菜单
- 在 `config/project.config.tsx`（或项目路由配置）中注册 resource、路由、菜单项

## 6. 前端 - 页面
- 在 `pages/` 下建立对应目录（如 `orders/`）
- 实现 `list.tsx`（useTable）、`create.tsx`（useForm）、`edit.tsx`（useForm）、`show.tsx`（useOne）
- 列表用 `useList({ resource: 'orders', pagination, sorters })`，表单用 `useForm`，与 dataProvider 对应

## 7. 前端 - 权限
- 按权限隐藏菜单或按钮时，使用 `CanAccess` 或 `usePermissions` 判断 `resource:create` 等

## 检查清单
- [ ] Prisma schema 已 migrate 且 generate
- [ ] 后端接口用 Postman/curl 可调通，鉴权接口带 token
- [ ] 前端 resource 与后端一致
- [ ] 列表分页/排序与后端参数一致
- [ ] 新建/编辑表单字段与后端 DTO 一致
