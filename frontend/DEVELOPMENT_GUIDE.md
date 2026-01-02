# 前端开发指南

## 两种开发方式

### ✅ 方式 A：小项目 - 直接在 Providers 开发

**适用场景**：纯 Web 应用、小到中型项目、快速开发

```typescript
// 1. 在 providers 中实现 API 调用
// providers/dataProvider.ts
export const dataProvider: DataProvider = {
  getList: async ({ resource, pagination }) => {
    const { data } = await axiosInstance.get(`/${resource}`, { params });
    return { data, total: data.total };
  },
};

// 2. 在组件中直接使用 Refine hooks
// pages/users/index.tsx
import { useList } from '@refinedev/core';

export const UserList = () => {
  const { data, isLoading } = useList({
    resource: 'users',
    pagination: { current: 1, pageSize: 10 },
  });
  
  return <List><Table dataSource={data?.data} loading={isLoading} /></List>;
};
```

**优点**：简单直接，符合 Refine 最佳实践，开发速度快

---

### ✅ 方式 B：大项目 - 通过 Services 层开发

**适用场景**：需要跨平台复用（H5 + Electron）、大型项目、需要更好的测试性

```typescript
// 1. Providers 保持不变（Refine 必需）
// providers/dataProvider.ts
export const dataProvider: DataProvider = { ... };

// 2. 创建 Services 层（业务抽象）
// services/user.service.ts
export const useUserListService = () => {
  return useList({ resource: 'users' });
};

// 3. 在 Container 中使用 Service
// containers/UserListContainer.tsx
export const UserListContainer = () => {
  const { data, isLoading } = useUserListService();
  return <UserListPresenter users={data?.data} isLoading={isLoading} />;
};

// 4. 创建纯展示组件
// components/UserListPresenter.tsx
export const UserListPresenter = ({ users, isLoading }) => {
  return <Table dataSource={users} loading={isLoading} />;
};
```

**优点**：组件可跨平台复用，易于测试，关注点分离清晰

---

## 架构说明

### Providers（适配器层）

**Refine 框架必需的适配器，封装实际的 API 调用**

- `authProvider`: 处理认证流程（login, logout, check, getIdentity）
- `dataProvider`: 处理 CRUD 操作（getList, getOne, create, update, delete）
- 位置：`src/providers/`
- **不能移除**，因为 Refine 框架依赖它们

### Services（业务抽象层，可选）

**在 Providers 之上，提供业务接口抽象**

- 定义业务接口（如 UserService）
- 可以有不同实现：
  - **Refine 实现**：通过 Refine hooks（内部使用 Providers）
  - **IPC 实现**：直接通过 IPC 通信（绕过 Providers，用于 Electron）
- 位置：`src/services/`
- **可选**，只在需要跨平台复用时使用

### Stores（状态管理）

**管理客户端状态，与数据获取分离**

- **通用 Store** (`common/`): UI、App 配置、权限、用户管理
- **业务 Store** (`business/`): 订单、产品等业务状态
- 位置：`src/stores/`
- 详见：`src/stores/README.md`

---

## 决策指南

### 选择方式 A（直接在 Providers 开发）如果：

- ✅ 项目规模小到中等
- ✅ 纯 Web 应用，不需要 Electron
- ✅ 需要快速开发
- ✅ 团队熟悉 Refine

### 选择方式 B（通过 Services 层开发）如果：

- ✅ 项目规模大
- ✅ 需要跨平台复用（H5 + Electron）
- ✅ 需要更好的测试性
- ✅ 需要更清晰的关注点分离

---

## 目录结构

```
src/
├── providers/          # 必需：Refine 适配器
│   ├── authProvider.ts
│   └── dataProvider.ts
├── services/           # 可选：业务抽象层（方式 B 使用）
│   └── user.service.ts
├── stores/             # 状态管理
│   ├── common/         # 通用 Store
│   └── business/       # 业务 Store
├── components/         # 展示组件
├── containers/          # 容器组件（方式 B 使用）
└── pages/              # 页面组件
    └── users/
        └── index.tsx   # 可以直接使用 Refine hooks（方式 A）
```

---

## 总结

- **小项目**：直接在 Providers 开发，组件使用 Refine hooks ✅ **完全合法**
- **大项目**：通过 Services 层开发 ✅ **完全合法**
- **前端底座**：提供两种方式，让使用者根据项目规模选择

两种方式都是合法的，选择哪种取决于项目需求！
