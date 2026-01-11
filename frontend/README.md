# B端底座系统 - 前端

一个通用的 B 端管理系统底座，基于 React + TypeScript + Vite + Refine + Ant Design 构建。

## 特性

- 🚀 **现代技术栈**：React 19 + TypeScript + Vite 7
- 📦 **开箱即用**：基于 Refine 框架，内置 CRUD 操作
- 🎨 **美观的 UI**：Ant Design 6 组件库
- 🌍 **国际化**：内置中英文支持
- 🔐 **权限控制**：完整的认证和权限管理
- 🧪 **Mock 模式**：支持前后端分离开发
- 📱 **跨平台设计**：数据层与展示层分离，便于适配多端

## 快速开始

### 环境要求

- Node.js >= 18
- Yarn >= 1.22 或 npm >= 9

### 安装依赖

```bash
yarn install
```

### 配置环境变量

```bash
# 复制环境变量示例文件
cp .env.example .env.local

# 编辑配置
vim .env.local
```

### 启动开发服务器

```bash
# 正常模式（需要后端 API）
yarn dev

# Mock 模式（无需后端）
yarn mock
```

### 构建生产版本

```bash
yarn build
```

## 项目结构

```
src/
├── types/              # 类型定义
├── hooks/              # 自定义 Hooks
│   ├── usePermissions.ts   # 权限检查
│   └── queries/            # 业务查询 hooks (useCustom)
├── providers/          # Refine Providers
├── repository/         # HTTP 实现层
├── mock/               # Mock 数据层
├── components/         # 展示组件
│   ├── auth/           # 权限组件
│   ├── dashboard/      # Dashboard 组件
│   ├── error/          # 错误处理组件
│   └── layout/         # 布局组件
├── pages/              # 页面（直接使用 Refine hooks）
├── config/             # 配置文件
├── http/               # HTTP 客户端
├── i18n/               # 国际化
└── utils/              # 工具函数
```

## 架构设计

项目**充分利用 Refine 框架**，采用简洁的分层架构：

```
Pages (直接使用 Refine hooks)
   ↓
Hooks (业务查询 hooks)
   ↓
Refine Core (useList, useCustom 等)
   ↓
Providers → Repository
```

**核心理念**：不要重复造轮子，充分利用 Refine！

详细架构说明请参考 [ARCHITECTURE.md](./ARCHITECTURE.md)

## 可用脚本

| 命令 | 说明 |
|------|------|
| `yarn dev` | 启动开发服务器 |
| `yarn mock` | 启动 Mock 模式 |
| `yarn build` | 构建生产版本 |
| `yarn preview` | 预览生产构建 |
| `yarn lint` | 运行 ESLint 检查 |
| `yarn lint:fix` | 运行 ESLint 并自动修复 |
| `yarn format` | 格式化代码 |
| `yarn format:check` | 检查代码格式 |

## 配置说明

### 项目配置

主要配置文件位于 `src/config/project.config.tsx`：

- `projectInfo`：项目基本信息（名称、描述等）
- `routes`：路由配置
- `menu`：菜单配置

### 主题配置

主题配置位于 `src/config/theme.config.ts`，支持：

- 亮色主题
- 暗色主题
- 紧凑主题

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `VITE_API_URL` | 后端 API 地址 | `http://localhost:3000/api` |
| `VITE_USE_MOCK` | 是否启用 Mock 模式 | `false` |

## 添加新功能

### 添加新页面

1. 在 `src/pages/` 下创建页面组件
2. 在 `src/config/project.config.tsx` 中添加路由和菜单配置
3. （可选）创建对应的 Service 和 Container

### 添加业务接口

1. 在 `hooks/queries/` 创建查询 Hook（使用 `useCustom`）
2. 在 `mock/data.mock.repository.ts` 添加 Mock 路由
3. 在页面中使用 Hook

详细指南请参考 [AI_DEVELOPMENT_GUIDE.md](./AI_DEVELOPMENT_GUIDE.md)

## 代码规范

项目使用以下工具保证代码质量：

- **ESLint**：代码检查
- **Prettier**：代码格式化
- **Husky**：Git hooks
- **lint-staged**：提交前检查

提交代码前会自动运行 lint 和格式化检查。

## 相关文档

- [架构设计文档](./ARCHITECTURE.md)
- [AI 开发指南](./AI_DEVELOPMENT_GUIDE.md) - 便于 AI 辅助开发
- [开发指南](./DEVELOPMENT_GUIDE.md)

## 技术栈

- [React](https://react.dev/) - UI 框架
- [TypeScript](https://www.typescriptlang.org/) - 类型安全
- [Vite](https://vite.dev/) - 构建工具
- [Refine](https://refine.dev/) - B 端框架
- [Ant Design](https://ant.design/) - UI 组件库
- [React Router](https://reactrouter.com/) - 路由
- [i18next](https://www.i18next.com/) - 国际化
- [Axios](https://axios-http.com/) - HTTP 客户端

## License

MIT
