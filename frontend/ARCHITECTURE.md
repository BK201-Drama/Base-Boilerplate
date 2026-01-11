# 前端架构设计文档

## 架构概述

本项目**充分利用 Refine 框架**，采用极简分层架构：
- AI 快速理解和生成代码
- 开发者快速上手
- 后续二次开发

## 核心理念

> **不要重复造轮子，直接使用 Refine！**

- **CRUD 操作**：直接使用 Refine 的 `useList`, `useOne`, `useCreate`, `useUpdate`, `useDelete`
- **业务 API**：直接使用 Refine 的 `useCustom`
- **用户身份**：直接使用 Refine 的 `useGetIdentity`, `useLogout`
- **认证授权**：使用 Refine 的 `authProvider`
- **数据缓存**：由 Refine 的 React Query 自动处理

## 目录结构

```
src/
├── types/              # 类型定义
│   ├── index.ts        # 类型导出
│   ├── user.types.ts   # 用户类型
│   └── ...
│
├── hooks/              # 全局通用 Hooks（多处复用）
│   └── usePermissions.ts   # 权限检查
│
├── providers/          # Refine Providers
│   ├── data.provider.ts    # 数据提供者
│   └── auth.provider.ts    # 认证提供者
│
├── repository/         # HTTP 实现层
│   ├── data.repository.ts  # 数据 API
│   └── auth.repository.ts  # 认证 API
│
├── mock/               # Mock 数据层
│   ├── data.mock.repository.ts
│   └── mock_data/
│
├── components/         # 展示组件
│   ├── layout/         # 布局组件
│   ├── dashboard/      # Dashboard 组件
│   └── auth/           # 权限组件
│
├── pages/              # 页面组件（直接使用 Refine hooks）
│   ├── dashboard/
│   │   └── index.tsx       # 页面 + useCustom
│   ├── users/
│   │   ├── list.tsx        # useTable
│   │   ├── create.tsx      # useForm
│   │   └── edit.tsx        # useForm
│   └── login/
│
└── config/             # 配置
    ├── project.config.tsx  # 项目配置
    └── theme.config.ts     # 主题配置
```

## Hooks 放置原则

采用**就近原则**：

| 场景 | 放置位置 | 示例 |
|------|----------|------|
| 全局复用 | `hooks/` | `usePermissions` |
| 页面特定 | `pages/xxx/` | `pages/orders/useOrderFilter.ts` |
| 组件特定 | `components/xxx/` | `components/user-card/useUserCard.ts` |

**核心原则**：优先直接使用 Refine hooks，只有当逻辑确实需要复用或封装时才抽取。

## 架构层次

```
┌─────────────────────────────────────────────────────────┐
│                      Pages 页面层                        │
│  直接使用 Refine hooks (useTable, useCustom 等)         │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              Refine Core (内置 React Query)             │
│  useList, useOne, useCreate, useUpdate, useCustom...   │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              Providers (dataProvider, authProvider)     │
│  将 Refine 请求转发给 Repository                        │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              Repository (HTTP 实现)                      │
│  真实 API / Mock 数据                                    │
└─────────────────────────────────────────────────────────┘
```

## 开发模式

### 1. CRUD 页面开发

直接使用 Refine 组件和 hooks：

```tsx
// pages/users/list.tsx
import { List, useTable, EditButton, DeleteButton } from '@refinedev/antd';
import { Table } from 'antd';

export const UserList = () => {
  const { tableProps } = useTable();

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="username" title="用户名" />
        <Table.Column dataIndex="email" title="邮箱" />
        <Table.Column 
          title="操作"
          render={(_, record) => (
            <>
              <EditButton recordItemId={record.id} />
              <DeleteButton recordItemId={record.id} />
            </>
          )}
        />
      </Table>
    </List>
  );
};
```

### 2. 业务 API 开发

直接使用 `useCustom`：

```tsx
// pages/dashboard/index.tsx
import { useCustom } from '@refinedev/core';
import type { Statistics } from '@/types';

export const Dashboard = () => {
  const { data, isLoading } = useCustom<Statistics>({
    url: '/dashboard/statistics',
    method: 'get',
    queryOptions: {
      staleTime: 5 * 60 * 1000, // 5 分钟缓存
    },
  });

  const statistics = data?.data || { totalUsers: 0, totalOrders: 0 };

  return <StatisticsPresenter statistics={statistics} loading={isLoading} />;
};
```

### 3. 用户身份信息

直接使用 Refine hooks：

```tsx
// components/layout/header.tsx
import { useGetIdentity, useLogout } from '@refinedev/core';
import type { User } from '@/types';

export const Header = () => {
  const { data: user } = useGetIdentity<User>();
  const { mutate: logout } = useLogout();

  return (
    <div>
      <span>{user?.username}</span>
      <button onClick={() => logout()}>退出</button>
    </div>
  );
};
```

### 4. Mock 数据开发

在 `mock/data.mock.repository.ts` 的 `custom` 方法中添加 Mock 路由：

```tsx
// mock/data.mock.repository.ts
custom: async <T = any>(params: CustomRequestParams): Promise<T> => {
  const { url, method } = params;
  
  if (url === '/dashboard/statistics' && method === 'get') {
    return { totalUsers: 100, totalOrders: 500 } as T;
  }
  
  if (url === '/orders/summary' && method === 'get') {
    return { total: 1000, pending: 50 } as T;
  }
  
  throw new Error(`Mock API not found: ${method.toUpperCase()} ${url}`);
},
```

## 添加新功能指南

### 添加新的 CRUD 资源

1. **定义类型** (`types/xxx.types.ts`)
2. **添加路由和菜单** (`config/project.config.tsx`)
3. **创建页面** (`pages/xxx/list.tsx`, `create.tsx`, `edit.tsx`, `show.tsx`)
4. **添加 Mock 数据** (`mock/mock_data/xxx.ts`)

### 添加新的业务 API

1. **定义返回类型** (`types/xxx.types.ts`)
2. **在页面中使用 `useCustom`**
3. **添加 Mock 路由** (`mock/data.mock.repository.ts`)

### 示例：添加订单统计 API

```tsx
// 1. 类型定义 - types/order.types.ts
export interface OrderSummary {
  total: number;
  pending: number;
  completed: number;
}

// 2. 页面使用 - pages/orders/dashboard.tsx
import { useCustom } from '@refinedev/core';
import type { OrderSummary } from '@/types';

export const OrderDashboard = () => {
  const { data, isLoading } = useCustom<OrderSummary>({
    url: '/orders/summary',
    method: 'get',
  });

  const summary = data?.data;

  if (isLoading) return <Spin />;

  return (
    <div>
      <p>总订单: {summary?.total}</p>
      <p>待处理: {summary?.pending}</p>
    </div>
  );
};

// 3. Mock 数据 - mock/data.mock.repository.ts
// 在 custom 方法中添加：
if (url === '/orders/summary' && method === 'get') {
  return { total: 1000, pending: 50, completed: 950 } as T;
}
```

## 最佳实践

### ✅ 推荐做法

1. **直接使用 Refine hooks**
   ```tsx
   // ✅ 正确
   const { tableProps } = useTable();
   const { data } = useOne({ resource: 'users', id: userId });
   const { data } = useCustom({ url: '/api/stats', method: 'get' });
   ```

2. **利用 React Query 的缓存**
   ```tsx
   // ✅ 正确：设置 staleTime 避免重复请求
   useCustom({
     url: '/api/data',
     method: 'get',
     queryOptions: { staleTime: 5 * 60 * 1000 },
   });
   ```

3. **复杂逻辑就近放置**
   ```tsx
   // pages/orders/useOrderFilter.ts - 页面特定逻辑
   export const useOrderFilter = () => {
     const [filters, setFilters] = useState(...);
     // 复杂的筛选逻辑
     return { filters, updateFilter };
   };
   ```

### ❌ 避免做法

1. **不要手动管理 loading/error 状态**
   ```tsx
   // ❌ 错误：React Query 已经处理了
   const [loading, setLoading] = useState(false);
   useEffect(() => {
     setLoading(true);
     fetchData().then(setData).finally(() => setLoading(false));
   }, []);
   ```

2. **不要创建多余的抽象层**
   ```tsx
   // ❌ 错误：不需要 Service/Container 层
   const useStatistics = () => {
     const { data } = useCustom({ url: '/stats', method: 'get' });
     return { statistics: data?.data };
   };
   
   // ✅ 正确：直接在页面使用
   const { data } = useCustom({ url: '/stats', method: 'get' });
   ```

## 与 AI 协作开发

本架构设计特别考虑了 AI 辅助开发：

1. **极简层级**：页面 → Refine → Provider → Repository
2. **模式统一**：所有页面遵循相同模式
3. **命名规范**：类型以 `types` 结尾，hooks 以 `use` 开头
4. **示例丰富**：参考现有代码即可快速开发

### AI 开发提示词示例

```
请帮我创建一个订单管理模块：
1. 参考 pages/users/ 创建 CRUD 页面
2. 在 Dashboard 页面添加订单统计，使用 useCustom 调用 /orders/summary
3. 在 mock/data.mock.repository.ts 添加 Mock 数据
```

## 总结

| 场景 | 解决方案 |
|------|----------|
| CRUD 列表 | `useTable` + `<List>` |
| CRUD 创建 | `useForm` + `<Create>` |
| CRUD 编辑 | `useForm` + `<Edit>` |
| CRUD 详情 | `useShow` + `<Show>` |
| 业务 API | `useCustom` |
| 用户身份 | `useGetIdentity` |
| 登出 | `useLogout` |
| 数据缓存 | React Query 自动处理 |
| 权限控制 | `usePermissions` + `<CanAccess>` |
| Mock 开发 | `VITE_USE_MOCK=true` |

**核心原则：直接使用 Refine，不要封装！**
