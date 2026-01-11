# AI 辅助开发指南

本文档为 AI 助手（如 Cursor、GitHub Copilot）提供开发指引，帮助快速生成符合项目规范的代码。

## 项目技术栈

- **框架**: React 19 + TypeScript + Vite
- **UI**: Ant Design 6
- **B端框架**: Refine（核心！充分利用）
- **状态管理**: React Query（Refine 内置）
- **路由**: React Router 7
- **国际化**: i18next

## 核心开发模式

### 模式 1：CRUD 页面（最常见）

**使用 Refine 的现成组件和 hooks，不要自己造轮子！**

```tsx
// pages/[resource]/list.tsx - 列表页
import { List, useTable, EditButton, ShowButton, DeleteButton } from '@refinedev/antd';
import { Table, Space } from 'antd';

export const ResourceList = () => {
  const { tableProps } = useTable({
    sorters: { initial: [{ field: 'id', order: 'desc' }] },
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="name" title="名称" sorter />
        <Table.Column 
          title="操作"
          render={(_, record: any) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <ShowButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
```

```tsx
// pages/[resource]/create.tsx - 创建页
import { Create, useForm } from '@refinedev/antd';
import { Form, Input } from 'antd';

export const ResourceCreate = () => {
  const { formProps, saveButtonProps } = useForm();

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="名称" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </Form>
    </Create>
  );
};
```

```tsx
// pages/[resource]/edit.tsx - 编辑页
import { Edit, useForm } from '@refinedev/antd';
import { Form, Input } from 'antd';

export const ResourceEdit = () => {
  const { formProps, saveButtonProps } = useForm();

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="名称" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </Form>
    </Edit>
  );
};
```

```tsx
// pages/[resource]/show.tsx - 详情页
import { Show } from '@refinedev/antd';
import { useShow } from '@refinedev/core';
import { Typography } from 'antd';

export const ResourceShow = () => {
  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;
  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Typography.Title level={5}>名称</Typography.Title>
      <Typography.Text>{record?.name}</Typography.Text>
    </Show>
  );
};
```

### 模式 2：业务 API Hook（自定义接口）

**使用 useCustom，封装在 hooks/queries/ 目录**

```tsx
// hooks/queries/useXxx.ts
import { useCustom } from '@refinedev/core';

interface XxxData {
  // 定义返回数据类型
  field1: string;
  field2: number;
}

export const useXxx = (params?: { id?: string }) => {
  const query = useCustom<XxxData>({
    url: `/api/xxx${params?.id ? `/${params.id}` : ''}`,
    method: 'get',
    queryOptions: {
      enabled: params?.id !== undefined, // 条件启用
      staleTime: 5 * 60 * 1000, // 缓存 5 分钟
    },
  });

  return {
    data: query.data?.data ?? null,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    error: query.error,
    refetch: query.refetch,
  };
};
```

**然后在 hooks/queries/index.ts 导出：**
```tsx
export { useXxx } from './useXxx';
```

### 模式 3：添加 Mock 数据

**在 mock/data.mock.repository.ts 的 mockApiRoutes 中添加：**

```tsx
const mockApiRoutes = {
  // 现有路由...
  
  // 新增路由
  '/api/xxx': async () => {
    await delay(300);
    return {
      field1: 'mock value',
      field2: 100,
    };
  },
  
  // 带参数的路由
  '/api/xxx/:id': async (params) => {
    const match = params.url.match(/\/api\/xxx\/([^/]+)/);
    const id = match?.[1];
    await delay(300);
    return {
      id,
      field1: `data for ${id}`,
      field2: 200,
    };
  },
};
```

## 常用 Refine Hooks 速查

| Hook | 用途 | 示例 |
|------|------|------|
| `useTable` | 表格数据 + 分页排序筛选 | `const { tableProps } = useTable()` |
| `useForm` | 表单处理 | `const { formProps, saveButtonProps } = useForm()` |
| `useList` | 获取列表数据 | `const { data } = useList({ resource: 'users' })` |
| `useOne` | 获取单条数据 | `const { data } = useOne({ resource: 'users', id })` |
| `useCreate` | 创建数据 | `const { mutate } = useCreate()` |
| `useUpdate` | 更新数据 | `const { mutate } = useUpdate()` |
| `useDelete` | 删除数据 | `const { mutate } = useDelete()` |
| `useCustom` | 自定义 API | `const { data } = useCustom({ url, method })` |
| `useShow` | 详情页数据 | `const { queryResult } = useShow()` |

## 文件命名规范

```
src/
├── types/
│   └── [resource].types.ts      # 类型定义
├── hooks/queries/
│   └── use[Resource].ts         # 业务查询 hook
├── pages/[resource]/
│   ├── index.tsx               # 入口（通常导出 list）
│   ├── list.tsx                # 列表页
│   ├── create.tsx              # 创建页
│   ├── edit.tsx                # 编辑页
│   └── show.tsx                # 详情页
└── components/[resource]/
    └── [Component].tsx         # 资源相关组件
```

## 添加新资源的步骤

假设要添加"订单"（orders）资源：

### 1. 定义类型

```tsx
// types/order.types.ts
export interface Order {
  id: string | number;
  orderNo: string;
  status: 'pending' | 'completed' | 'cancelled';
  amount: number;
  userId: string;
  createdAt: string;
}
```

### 2. 添加路由和菜单

```tsx
// config/project.config.tsx
export const routes: RouteConfig[] = [
  // ... 其他路由
  {
    path: '/orders',
    component: '@/pages/orders',
    name: 'orders',
    public: false,
    children: [
      { path: '', component: 'list', name: 'OrderList', index: true },
      { path: 'create', component: 'create', name: 'OrderCreate' },
      { path: 'edit/:id', component: 'edit', name: 'OrderEdit' },
      { path: 'show/:id', component: 'show', name: 'OrderShow' },
    ],
  },
];

export const menu: MenuResource[] = [
  // ... 其他菜单
  {
    name: 'orders',
    list: '/orders',
    create: '/orders/create',
    edit: '/orders/edit/:id',
    show: '/orders/show/:id',
    meta: {
      label: '订单管理',
      icon: <ShoppingCartOutlined />,
    },
  },
];
```

### 3. 创建页面

参考上面的"模式 1：CRUD 页面"创建 4 个页面文件。

### 4. 添加 Mock 数据

```tsx
// mock/mock_data/order.ts
export const mockOrders = [
  { id: 1, orderNo: 'ORD001', status: 'completed', amount: 100, userId: '1' },
  { id: 2, orderNo: 'ORD002', status: 'pending', amount: 200, userId: '2' },
];
```

在 `mock/data.mock.repository.ts` 的 `getMany` 和 `getOne` 中添加 orders 资源处理。

## AI 提示词模板

### 创建新的 CRUD 模块

```
请为我创建一个 [资源名] 管理模块，包含：
1. 类型定义 (types/[resource].types.ts)
2. 列表页、创建页、编辑页、详情页 (pages/[resource]/)
3. 路由和菜单配置 (config/project.config.tsx)
4. Mock 数据 (mock/)

字段包括：[列出字段及类型]

请参考现有的 users 模块实现。
```

### 创建业务 API Hook

```
请创建一个查询 Hook：use[Name]
- API 路径：/api/xxx
- 返回数据类型：[描述]
- 参考 hooks/queries/useStatistics.ts 的模式
- 同时在 mock 中添加对应的 Mock 数据
```

### 添加新功能到现有页面

```
请在 [页面路径] 添加以下功能：
1. [功能描述]
2. 使用 Refine 的 [具体 hook] 实现
3. 保持与现有代码风格一致
```

## 注意事项

1. **优先使用 Refine 内置功能**，不要自己实现已有的功能
2. **保持代码简洁**，不要创建多余的抽象层
3. **利用 React Query 缓存**，设置合适的 staleTime
4. **类型定义要完整**，便于 TypeScript 类型推断
5. **Mock 数据要真实**，便于前端独立开发

