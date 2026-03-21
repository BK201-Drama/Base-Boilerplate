# B端底座系统

一个基于 NestJS + Prisma + Refine + Ant Design 的前后端分离的 B 端项目底座，用于快速生成 B 端项目。

## 技术栈

### 后端
- **NestJS** - Node.js 企业级框架
- **Prisma** - 现代化 ORM
- **JWT** - 身份认证
- **RBAC** - 基于角色的访问控制
- **操作日志拦截器** - 自动记录用户操作
- **Excel 导入导出** - 基于 ExcelJS
- **文件上传下载** - 基于 Multer

### 前端
- **Refine** - React 企业级 CRUD 框架
- **Ant Design** - 企业级 UI 组件库
- **React Router** - 路由管理
- **Axios** - HTTP 客户端
- **TypeScript** - 类型安全

## 项目结构

```
Base-Boilerplate/
├── backend/          # 后端项目
│   ├── src/
│   │   ├── auth/     # 认证模块
│   │   ├── prisma/   # Prisma 服务
│   │   ├── files/    # 文件上传下载
│   │   ├── common/   # 公共模块（守卫、拦截器、装饰器）
│   │   └── ...
│   └── prisma/       # Prisma schema
├── frontend/         # 前端项目
│   ├── src/
│   │   ├── providers/  # dataProvider 和 authProvider
│   │   ├── components/ # 组件
│   │   ├── pages/      # 页面
│   │   └── ...
│   └── ...
└── README.md
```

## 快速开始

### Docker 一键启动（推荐）

```bash
docker compose up -d --build
```

启动后：
- 前端：http://localhost:5173
- 后端：http://localhost:3000/api
- 健康检查：http://localhost:3000/api/health


### 后端设置

1. 进入后端目录：
```bash
cd backend
```

2. 安装依赖：
```bash
npm install
```

3. 配置环境变量：
创建 `.env` 文件，参考以下配置：
```env
DATABASE_URL="postgresql://user:password@localhost:5432/base_boilerplate?schema=public"
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
UPLOAD_DEST=./uploads
MAX_FILE_SIZE=10485760
```

4. 初始化数据库：
```bash
npx prisma migrate dev
```

5. 生成 Prisma Client：
```bash
npx prisma generate
```

6. 启动开发服务器：
```bash
npm run start:dev
```

后端服务将在 `http://localhost:3000` 启动，API 前缀为 `/api`

### 前端设置

1. 进入前端目录：
```bash
cd frontend
```

2. 安装依赖：
```bash
npm install
```

3. 配置环境变量：
创建 `.env` 文件：
```env
VITE_API_URL=http://localhost:3000/api
```

4. 启动开发服务器：
```bash
npm run dev
```

前端应用将在 `http://localhost:5173` 启动

## 功能特性

### 后端功能

#### 1. JWT 认证
- 用户登录/注册
- Token 验证
- 自动刷新机制

#### 2. RBAC 权限系统
- 用户管理
- 角色管理
- 权限管理
- 基于装饰器的权限控制

使用示例：
```typescript
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles('admin')
@Permissions('user:create')
@Post()
async createUser() {
  // ...
}
```

#### 3. 操作日志拦截器
自动记录所有用户操作，包括：
- 请求方法、路径、参数
- 响应数据、状态码
- IP 地址、User-Agent
- 请求耗时

#### 4. Excel 导入导出
- 导出数据为 Excel
- 从 Excel 导入数据

#### 5. 文件上传下载
- 支持多种文件类型
- 文件大小限制
- 自动生成唯一文件名

### 前端功能

#### 1. 封装好的 dataProvider
已对接后端 API，支持：
- CRUD 操作
- 分页、排序、过滤
- 自定义请求

#### 2. 认证 Provider
- 登录/登出
- Token 管理
- 权限检查
- 用户信息获取

#### 3. 基础布局
- 响应式布局
- 侧边栏导航
- 顶部用户信息
- 主题配置

## API 接口

### 系统接口

- `GET /api` - 基础连通性检查
- `GET /api/health` - 健康检查（含数据库可用性）

### 认证接口

- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/profile` - 获取用户信息

### 文件接口

- `POST /api/files/upload` - 文件上传
- `GET /api/files/download/:filename` - 文件下载
- `GET /api/files/export/excel` - 导出 Excel
- `POST /api/files/import/excel` - 导入 Excel

## 数据库模型

### User (用户)
- id, username, email, password
- nickname, avatar, status
- roles (关联角色)

### Role (角色)
- id, name, code, description
- permissions (关联权限)
- users (关联用户)

### Permission (权限)
- id, name, code
- resource, action
- description

### OperationLog (操作日志)
- id, userId
- method, path, params
- response, statusCode
- ip, userAgent, duration
- createdAt

## 开发指南

### 添加新的资源

1. 在 Prisma schema 中添加模型
2. 运行 `npx prisma migrate dev`
3. 创建对应的 Controller 和 Service
4. 在前端添加对应的页面和路由

### 权限控制

使用装饰器进行权限控制：
```typescript
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('resource:action')
@Get()
async getResource() {
  // ...
}
```

### 公开接口

使用 `@Public()` 装饰器标记公开接口：
```typescript
@Public()
@Get()
async publicEndpoint() {
  // ...
}
```

## 注意事项

1. 生产环境请修改 JWT_SECRET
2. 配置正确的数据库连接
3. 设置合适的文件上传大小限制
4. 配置 CORS 允许的前端域名

## 工程化优化（本次新增）

- ✅ 新增 GitHub Actions CI：前后端分别执行 `lint + build`
- ✅ 新增后端健康检查接口：`GET /api/health`
- ✅ 健康检查返回 `status/db/timestamp/uptimeSec`，便于部署监控
- ✅ 新增 OpenAPI 文档：`/api/docs` 与 `/api/docs-json`
- ✅ 前端支持自动生成 API 类型：`npm run gen:api-types`

## P0 基线（已落地）

- 依赖管理统一为 npm（移除 backend 的 `yarn.lock`）
- 增加生产环境配置模板：`backend/env.production.example`
- 后端 CORS 在生产环境改为白名单（通过 `CORS_ORIGINS` 配置）
- CI 新增 Prisma schema 校验：`npx prisma validate`
- CI 新增前后端权限常量一致性校验脚本

## 权限脚手架（本次新增）

- 后端新增统一权限常量：`backend/src/common/permissions.ts`
- 前端新增统一权限常量：`frontend/src/constants/permissions.ts`
- `users/list` 示例已改为 `CanAccess + PERMISSIONS`，避免权限字符串散落

## Vibe Coding 工作流（已配置）

已新增以下文件，可直接用于“非 TDD 的快速交付流程”：

- `VIBE_CODING.md`：主流程（Prototype-first + Contract-first + BDD-lite + Risk-based + Observability）
- `templates/bdd-scenarios.md`：验收场景模板（Given/When/Then）
- `templates/risk-matrix.md`：风险分级模板（P0/P1/P2）
- `templates/observability-checklist.md`：可观测性上线检查清单

## 下一步建议优化点

- [ ] 增加 Playwright / e2e 冒烟测试
- [ ] 增加提交规范（commitlint + release-please）

## 许可证

MIT



