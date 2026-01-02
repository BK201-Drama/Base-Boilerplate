# 前端架构设计文档

## 架构概述

本项目采用**数据层与展示层分离**的架构模式，确保展示层可以完全独立于数据层，便于在不同平台（Web、H5、移动端等）复用展示层代码。

## 目录结构

```
src/
├── types/              # 类型定义层（共享）
│   ├── index.ts        # 基础类型定义
│   └── services.ts     # 服务接口类型定义
│
├── providers/          # 数据层：外部服务集成
│   ├── authProvider.ts # 认证提供者
│   └── dataProvider.ts # 数据提供者
│
├── services/           # 数据层：业务逻辑和数据获取
│   ├── user.service.ts
│   ├── statistics.service.ts
│   └── index.ts
│
├── components/         # 展示层：纯展示组件（Presenter）
│   ├── layout/        # 布局组件
│   └── dashboard/     # Dashboard 组件
│
├── containers/         # 容器层：连接数据层和展示层
│   ├── HeaderContainer.tsx
│   ├── DashboardContainer.tsx
│   └── index.ts
│
└── pages/              # 页面层：组合容器和布局
    ├── login/
    └── dashboard/
```

## 架构层次

### 1. 数据层（Data Layer）

**职责**：负责数据获取、业务逻辑处理和状态管理

#### 1.1 Providers（提供者）
- 位置：`src/providers/`
- 职责：集成外部服务（API、认证等）
- 示例：`authProvider.ts`、`dataProvider.ts`

#### 1.2 Services（服务）
- 位置：`src/services/`
- 职责：封装业务逻辑和数据获取
- 特点：
  - 使用 Hooks 形式（如 `useUserService`）
  - 通过 Providers 调用 API
  - 可以访问 Stores 进行状态管理
- 示例：`user.service.ts`、`statistics.service.ts`

#### 1.3 状态管理说明
- **数据缓存**：由 Refine 的 React Query 自动处理，无需手动管理
- **UI 状态**：可以通过以下方式管理：
  - React Context（适用于简单的全局 UI 状态）
  - URL 参数（适用于可分享的状态，如筛选条件）
  - localStorage（适用于需要持久化的用户偏好）
  - 组件本地状态（适用于组件内部状态）
- **全局消息**：由 Refine 的 `notificationProvider` 处理

### 2. 类型定义层（Types Layer）

**职责**：定义共享类型，供数据层和展示层使用

- 位置：`src/types/`
- 特点：
  - 展示层**只能**导入类型定义，不能导入 services 或 stores
  - 数据层和展示层共享类型定义
- 示例：`User`、`Statistics`、`UserService`

### 3. 展示层（Presentation Layer）

**职责**：纯展示，不包含任何业务逻辑

#### 3.1 Components（展示组件）
- 位置：`src/components/`
- 命名：以 `Presenter` 结尾（如 `HeaderPresenter`、`StatisticsPresenter`）
- 特点：
  - **纯函数组件**，只接收 props
  - **不导入** services、stores 或 providers
  - **不包含**任何业务逻辑
  - 所有数据通过 props 传入
  - 所有交互通过回调函数处理
- 示例：
  ```tsx
  // ✅ 正确：纯展示组件
  export const HeaderPresenter = ({ user, onLogout }: HeaderPresenterProps) => {
    return <div>...</div>;
  };
  
  // ❌ 错误：不应该在展示组件中导入服务
  import { useUserService } from '@/services'; // 禁止！
  ```

#### 3.2 Containers（容器组件）
- 位置：`src/containers/`
- 职责：
  - 从数据层获取数据（主要通过 services）
  - 处理业务逻辑
  - 将数据传递给展示组件
  - 处理展示组件的交互回调
- 特点：
  - **主要通过 Services 获取业务数据**
  - 对于纯 UI 状态（如侧边栏折叠），可以直接访问 Stores
  - Services 内部可以更新 Stores 来缓存数据
- 示例：
  ```tsx
  export const HeaderContainer = () => {
    // ✅ 正确：容器组件可以导入服务
    const userService = useUserService();
    
    const handleLogout = async () => {
      await userService.logout();
    };
    
    // 将数据传递给展示组件
    return <HeaderPresenter user={userService.user} onLogout={handleLogout} />;
  };
  ```

#### 3.3 Pages（页面组件）
- 位置：`src/pages/`
- 职责：组合容器组件和布局
- 特点：尽可能简单，主要负责路由和布局组合

## 架构原则

### 1. 依赖方向

```
Pages → Containers → Components (展示层)
         ↓
      Services (数据层)
         ↓
      Providers (数据层 - API 适配器)
```

**规则**：
- 展示层（Components）**不能**依赖数据层（Services/Providers）
- 容器层（Containers）**主要通过 Services 获取数据**
- 数据缓存由 Refine 的 React Query 自动处理，无需手动管理
- 页面层（Pages）**只能**依赖容器层

### 2. 数据流向

```
Providers (API) → Services (业务逻辑) → Containers → Components
                                          ↑         ↓
                                          └─────────┘
                                          (回调函数)
```

**说明**：
- Services 从 Providers 获取数据
- Refine 的 React Query 自动处理数据缓存、重试、刷新等
- Containers 通过 Services 获取数据，无需关心缓存逻辑
- 数据缓存完全由 Refine 框架管理，无需手动处理

### 3. 类型共享

- 展示层和容器层共享类型定义（`src/types/`）
- 展示层**只能**导入类型，不能导入服务

## 如何创建新功能

### 示例：创建用户列表功能

#### 1. 定义类型（`src/types/index.ts`）
```typescript
export interface UserListParams {
  page: number;
  limit: number;
}
```

#### 2. 创建服务（`src/services/user-list.service.ts`）
```typescript
export const useUserListService = () => {
  // 数据获取逻辑
  return { users, loading, fetchUsers };
};
```

#### 3. 创建展示组件（`src/components/user-list/user-list.presenter.tsx`）
```typescript
export interface UserListPresenterProps {
  users: User[];
  loading: boolean;
  onRefresh: () => void;
}

export const UserListPresenter = ({ users, loading, onRefresh }: UserListPresenterProps) => {
  // 纯展示逻辑
};
```

#### 4. 创建容器组件（`src/containers/UserListContainer.tsx`）
```typescript
export const UserListContainer = () => {
  const userListService = useUserListService();
  
  return (
    <UserListPresenter
      users={userListService.users}
      loading={userListService.loading}
      onRefresh={userListService.fetchUsers}
    />
  );
};
```

#### 5. 创建页面（`src/pages/users/index.tsx`）
```typescript
export const UsersPage = () => {
  return <UserListContainer />;
};
```

## 如何适配 H5

由于展示层完全独立于数据层，创建 H5 版本只需要：

1. **复用展示组件**：直接使用 `src/components/` 中的展示组件
2. **创建 H5 容器**：在 H5 项目中创建新的容器组件，连接 H5 的数据层
3. **保持类型一致**：确保类型定义保持一致

### H5 项目结构示例

```
h5-project/
├── components/         # 复用 Web 项目的展示组件
│   └── (从 Web 项目复制或共享)
├── containers/         # H5 专用的容器组件
│   └── (连接 H5 的数据层)
├── services/          # H5 的数据层
└── types/             # 共享类型定义
```

## 最佳实践

### ✅ 推荐做法

1. **展示组件保持纯净**
   ```tsx
   // ✅ 正确
   export const UserCard = ({ user, onClick }: UserCardProps) => {
     return <div onClick={onClick}>{user.name}</div>;
   };
   ```

2. **容器组件处理业务逻辑**
   ```tsx
   // ✅ 正确
   export const UserCardContainer = () => {
     const userService = useUserService();
     const handleClick = () => { /* 业务逻辑 */ };
     return <UserCard user={userService.user} onClick={handleClick} />;
   };
   ```

3. **使用类型定义**
   ```tsx
   // ✅ 正确
   import type { User } from '@/types';
   ```

### ❌ 避免做法

1. **不要在展示组件中导入服务**
   ```tsx
   // ❌ 错误
   import { useUserService } from '@/services';
   export const UserCard = () => {
     const userService = useUserService(); // 禁止！
   };
   ```

2. **不要在页面组件中直接使用服务**
   ```tsx
   // ❌ 错误（应该通过容器组件）
   export const UsersPage = () => {
     const userService = useUserService(); // 应该放在 Container 中
   };
   ```

3. **不要手动管理数据缓存**
   ```tsx
   // ❌ 错误：不需要手动管理缓存
   export const UserListContainer = () => {
     const [users, setUsers] = useState([]);
     useEffect(() => {
       fetchUsers().then(setUsers); // 手动管理缓存
     }, []);
     return <UserListPresenter users={users} />;
   };
   
   // ✅ 正确：使用 Service，Refine 自动处理缓存
   export const UserListContainer = () => {
     const userService = useUserListService(); // Refine 自动缓存
     return <UserListPresenter users={userService.users} />;
   };
   ```

## 状态管理最佳实践

### ✅ 推荐的状态管理方式

1. **数据缓存：由 Refine 自动处理**
   ```tsx
   // ✅ 正确：Refine 的 React Query 自动处理缓存
   export const useUserListService = () => {
     const { data, isLoading } = useList({ resource: 'users' });
     // 数据自动缓存，无需手动管理
     return { users: data?.data, loading: isLoading };
   };
   ```

2. **UI 状态：使用 React Context（如果需要）**
   ```tsx
   // ✅ 正确：简单的全局 UI 状态使用 Context
   const ThemeContext = createContext({ theme: 'light', setTheme: () => {} });
   
   export const LayoutContainer = () => {
     const { theme } = useContext(ThemeContext);
     return <LayoutPresenter theme={theme} />;
   };
   ```

3. **用户偏好：使用 localStorage**
   ```tsx
   // ✅ 正确：需要持久化的用户偏好使用 localStorage
   export const useUserPreferences = () => {
     const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
       return localStorage.getItem('sidebarCollapsed') === 'true';
     });
     
     const toggleSidebar = () => {
       const newValue = !sidebarCollapsed;
       setSidebarCollapsed(newValue);
       localStorage.setItem('sidebarCollapsed', String(newValue));
     };
     
     return { sidebarCollapsed, toggleSidebar };
   };
   ```

4. **可分享状态：使用 URL 参数**
   ```tsx
   // ✅ 正确：筛选条件等可分享状态使用 URL
   export const UserListContainer = () => {
     const [searchParams, setSearchParams] = useSearchParams();
     const status = searchParams.get('status') || 'all';
     // ...
   };
   ```

### ❌ 不推荐的做法

1. **手动管理数据缓存**
   ```tsx
   // ❌ 错误：不需要手动管理缓存
   const [users, setUsers] = useState([]);
   useEffect(() => {
     fetchUsers().then(setUsers);
   }, []);
   ```

2. **使用全局 Store 管理业务数据**
   ```tsx
   // ❌ 错误：业务数据应该通过 Services 获取
   const users = useUserStore(state => state.users);
   ```

## 总结

通过这种架构设计：

1. ✅ **展示层完全独立**：可以在任何平台复用
2. ✅ **数据层统一管理**：业务逻辑集中处理
3. ✅ **数据缓存自动化**：Refine 的 React Query 自动处理，无需手动管理
4. ✅ **类型安全**：通过 TypeScript 类型定义保证接口一致性
5. ✅ **易于测试**：展示组件可以独立测试
6. ✅ **易于维护**：职责清晰，代码组织良好
7. ✅ **架构简洁**：无需额外的状态管理库，减少复杂度

**状态管理总结**：
- ✅ **数据缓存**：由 Refine 的 React Query 自动处理（无需 Stores）
- ✅ **UI 状态**：使用 React Context、localStorage 或组件状态
- ✅ **全局消息**：由 Refine 的 notificationProvider 处理
- ❌ **不需要全局 Store**：减少复杂度，提高可维护性

