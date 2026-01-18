# CRUD 代码生成器完整指南

本文档包含代码生成器的完整使用指南，包括工作流程、AI 提示词模板、Repository 架构和自动生成方法。

## 📚 目录

- [工作流程](#工作流程)
- [AI 提示词模板](#ai-提示词模板)
- [Repository 架构](#repository-架构)
- [自动生成方法](#自动生成方法)

---

## 工作流程

### 工作流程概览

```
┌─────────────────┐
│  产品文档/      │
│  技术文档       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  AI 生成        │
│  resource.json  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  代码生成器     │
│  生成 CRUD 代码 │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  检查与调整     │
│  测试与部署     │
└─────────────────┘
```

### 详细步骤

#### 步骤 1: 准备文档

收集以下文档：

1. **产品文档**
   - 实体定义和描述
   - 字段列表及业务规则
   - 权限要求
   - 业务逻辑说明

2. **技术文档**
   - Prisma Schema 定义
   - 数据库表结构
   - API 接口要求
   - 关联关系说明

#### 步骤 2: AI 生成 resource.json

使用 AI（如 ChatGPT、Claude、Cursor 等）生成 `resource.json` 配置文件。

**提示词模板：** 参考下面的 [AI 提示词模板](#ai-提示词模板)

**示例命令（在 Cursor 中）：**
```
请根据以下文档生成 resource.json：

[粘贴产品文档和技术文档]

参考示例：backend/src/common/generator/examples/product.resource.json
```

#### 步骤 3: 保存配置文件

将 AI 生成的配置保存为 JSON 文件：

```bash
# 创建 resources 目录（如果不存在）
mkdir -p resources

# 保存配置文件
# 例如：resources/order.json
```

#### 步骤 4: 验证配置（可选）

检查 JSON 格式是否正确：

```bash
# 使用 jq 验证（如果已安装）
cat resources/order.json | jq .

# 或使用 Node.js
node -e "JSON.parse(require('fs').readFileSync('resources/order.json', 'utf-8'))"
```

#### 步骤 5: 生成 CRUD 代码

使用代码生成器生成代码：

```bash
# 从配置文件生成
npm run generate:crud order -- --config resources/order.json

# 如果需要覆盖已存在的文件
npm run generate:crud order -- --config resources/order.json --overwrite
```

#### 步骤 6: 检查生成的文件

检查生成的文件结构：

```
src/
  order/
    dto/
      create-order.dto.ts
      update-order.dto.ts
    order.repository.ts
    order.service.ts
    order.controller.ts
    order.module.ts
```

#### 步骤 7: 调整生成的代码

根据业务需求调整：

1. **Service 层**
   - 实现生命周期钩子（beforeCreate, afterCreate 等）
   - 添加自定义业务逻辑方法

2. **Controller 层**
   - 调整权限配置
   - 添加自定义端点（如果需要）

3. **DTO 层**
   - 调整验证规则
   - 添加自定义验证器

#### 步骤 8: 测试

1. **编译检查**
   ```bash
   npm run build
   ```

2. **运行应用**
   ```bash
   npm run start:dev
   ```

3. **测试 API**
   - 使用 Postman 或 curl 测试各个端点
   - 验证权限控制
   - 验证数据验证规则

### 完整示例

#### 示例：订单管理模块

**1. 产品文档**
```
订单管理模块
- 订单包含：订单号（唯一）、总金额、用户ID、产品列表
- 权限：管理员可以创建/更新/删除，普通用户只能查看自己的订单
- 业务规则：订单号自动生成，总金额不能为负数
```

**2. 技术文档**
```prisma
model Order {
  id          String   @id @default(uuid())
  orderNumber String   @unique
  totalAmount Float
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  products    Product[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**3. AI 生成 resource.json**
```json
{
  "name": "order",
  "pluralName": "orders",
  "path": "orders",
  "prismaModel": "Order",
  "description": "订单资源",
  "fields": [
    {
      "name": "orderNumber",
      "type": "string",
      "required": true,
      "includeInCreate": false,
      "includeInUpdate": false,
      "includeInList": true,
      "includeInDetail": true,
      "description": "订单号（自动生成）"
    },
    {
      "name": "totalAmount",
      "type": "number",
      "required": true,
      "includeInCreate": true,
      "includeInUpdate": true,
      "includeInList": true,
      "includeInDetail": true,
      "validations": [
        { "type": "required", "message": "validation.totalAmount_required" },
        { "type": "min", "value": 0, "message": "validation.totalAmount_min" }
      ],
      "description": "订单总金额"
    }
  ],
  "joins": [
    {
      "model": "User",
      "field": "user",
      "includeInList": true,
      "includeInDetail": true,
      "select": ["id", "username", "email"]
    },
    {
      "model": "Product",
      "field": "products",
      "includeInList": true,
      "includeInDetail": true,
      "select": ["id", "name", "price"]
    }
  ],
  "operations": {
    "create": true,
    "read": true,
    "update": true,
    "delete": true,
    "list": true
  },
  "permissions": {
    "resource": "order",
    "createRoles": ["admin"],
    "updateRoles": ["admin"],
    "deleteRoles": ["admin"],
    "requireAuth": true
  },
  "defaultPageSize": 20,
  "hooks": {
    "beforeCreate": true
  }
}
```

**4. 生成代码**
```bash
npm run generate:crud order -- --config resources/order.json
```

**5. 调整生成的代码**

在 `order.service.ts` 中实现 `beforeCreate` 钩子：
```typescript
protected async beforeCreate(data: CreateOrderDto): Promise<any> {
  // 自动生成订单号
  return {
    ...data,
    orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };
}
```

---

## AI 提示词模板

### 基础模板

```
请根据以下产品文档和技术文档，生成一个 resource.json 配置文件。

## 产品文档
[粘贴产品文档内容]

## 技术文档
[粘贴技术文档内容，包括 Prisma Schema 等]

## 要求
1. 根据文档中的实体定义，生成完整的 resource.json 配置
2. 确保字段类型、验证规则、权限配置等符合文档要求
3. 如果文档中提到关联关系，请配置 joins 字段
4. 参考以下示例格式：

[粘贴 resource.json 示例]

## 输出
只输出 JSON 格式的 resource.json 配置，不要包含其他说明文字。
```

### 详细模板（推荐）

```
你是一个专业的后端开发助手。请根据提供的产品文档和技术文档，生成一个符合规范的 resource.json 配置文件。

## 产品文档
[粘贴产品需求文档，包括：
- 实体名称和描述
- 字段列表及业务规则
- 权限要求
- 业务逻辑说明
]

## 技术文档
[粘贴技术文档，包括：
- Prisma Schema 定义
- 数据库表结构
- API 接口要求
- 关联关系说明
]

## 配置要求

### 1. 基本信息
- `name`: 资源名称（单数，小写，如 "product"）
- `pluralName`: 复数形式（如 "products"）
- `path`: 路由路径（如 "products"）
- `prismaModel`: Prisma 模型名称（首字母大写，如 "Product"）
- `description`: 资源描述

### 2. 字段配置 (fields)
每个字段需要包含：
- `name`: 字段名称
- `type`: 字段类型（string, number, boolean, date, enum, relation）
- `required`: 是否必填
- `includeInCreate`: 是否在创建时包含
- `includeInUpdate`: 是否在更新时包含
- `includeInList`: 是否在列表查询时包含
- `includeInDetail`: 是否在详情查询时包含
- `validations`: 验证规则数组
- `description`: 字段描述

### 3. 验证规则 (validations)
根据业务需求添加：
- `type`: "required" | "email" | "min" | "max" | "pattern"
- `value`: 验证参数值
- `message`: 错误消息（i18n key，格式：validation.field_name_required）

### 4. 操作配置 (operations)
- `create`: 是否启用创建
- `read`: 是否启用读取
- `update`: 是否启用更新
- `delete`: 是否启用删除
- `list`: 是否启用列表查询
- `batchDelete`: 是否启用批量删除

### 5. 权限配置 (permissions)
- `resource`: 资源名称（用于权限检查）
- `createRoles`: 创建操作需要的角色数组
- `updateRoles`: 更新操作需要的角色数组
- `deleteRoles`: 删除操作需要的角色数组
- `requireAuth`: 是否需要认证（默认：true）

### 6. 多表关联配置 (joins)
如果需要在查询时包含关联表数据，配置 joins：
```json
{
  "joins": [
    {
      "model": "User",
      "field": "user",
      "joinStrategy": "sql",
      "includeInList": true,
      "includeInDetail": true,
      "select": ["id", "username", "email"]
    }
  ]
}
```

### 7. 生命周期钩子 (hooks)
根据业务需求启用：
- `beforeCreate`: 创建前处理
- `afterCreate`: 创建后处理
- `beforeUpdate`: 更新前处理
- `afterUpdate`: 更新后处理
- `beforeDelete`: 删除前处理

### 8. 自定义接口端点 (customEndpoints)
如果需要生成除标准 CRUD 之外的自定义接口，配置 customEndpoints：

```json
{
  "customEndpoints": [
    {
      "path": "statistics",
      "method": "get",
      "description": "获取统计数据",
      "requireAuth": true,
      "roles": ["admin"],
      "permission": "order:read",
      "params": {
        "query": [
          {
            "name": "startDate",
            "type": "date",
            "required": false,
            "description": "开始日期"
          }
        ]
      }
    }
  ]
}
```

**配置说明：**
- `path`: 端点路径（相对于资源路径）
- `method`: HTTP 方法（'get', 'post', 'put', 'patch', 'delete'）
- `description`: 端点描述（可选）
- `serviceMethod`: Service 方法名称（可选，不提供则自动生成）
- `requireAuth`: 是否需要认证（可选，默认继承资源的 requireAuth）
- `roles`: 需要的角色列表（可选）
- `permission`: 需要的权限（格式：'resource:action'）
- `params`: 参数配置
  - `path`: 路径参数数组
  - `query`: 查询参数数组
  - `body`: 请求体参数（仅 POST/PUT/PATCH）

参考示例文件（按场景分类）：
- `../generator/examples/ecommerce/product.resource.json` - 基础 CRUD 示例
- `../generator/examples/ecommerce/order-product-binding.resource.json` - 多表关联示例
- `../generator/examples/rbac/user-rbac.resource.json` - 多对多关系绑定示例
- `../generator/examples/content/article-tag-binding.resource.json` - 自定义端点示例

更多示例请查看 `../generator/examples/README.md`

## 输出格式
只输出 JSON 格式的 resource.json 配置，确保：
1. JSON 格式正确，可以解析
2. 所有必填字段都已包含
3. 字段类型与 Prisma Schema 一致
4. 验证规则符合业务需求
5. 权限配置符合安全要求

开始生成：
```

---

## Repository 架构

### 架构原则

本代码生成器遵循**分层架构**原则，确保各层职责清晰：

```
Controller (控制器层)
    ↓
Service (业务逻辑层)
    ↓
Repository (数据访问层)
    ↓
ORM (Prisma)
    ↓
Database (数据库)
```

### Repository 层的职责

Repository 层是**对接 ORM 的最小操作粒度的函数集合**，提供细粒度的数据访问方法。

#### 核心原则

1. **Repository 只负责数据访问**：提供细粒度的 ORM 操作方法
2. **Service 使用 Repository 组装业务**：Service 层通过调用 Repository 的方法来组装业务逻辑
3. **禁止 Service 直接使用 ORM**：Service 层不应该直接使用 Prisma 或其他 ORM

### BaseCrudRepository 提供的方法

生成的 Repository 继承 `BaseCrudRepository`，自动获得以下细粒度方法：

#### 基础 CRUD 方法

- `create(data, options?)` - 创建单条记录
- `findOne(id, options?)` - 根据 ID 查询单条记录
- `findByIds(ids, options?)` - 根据多个 ID 查询记录（细粒度方法）
- `findMany(options?)` - 根据条件查询多条记录
- `findByCondition(where, options?)` - 根据条件查询（更明确的接口）
- `findAll(pagination?, options?)` - 分页查询
- `findFirst(options?)` - 根据条件查询第一条记录
- `update(id, data, options?)` - 更新单条记录
- `delete(id)` - 删除单条记录
- `deleteMany(ids)` - 批量删除
- `count(where?)` - 统计数量
- `exists(id)` - 检查记录是否存在
- `createMany(data[], options?)` - 批量创建
- `updateMany(ids, data, options?)` - 批量更新

### Service 层的使用方式

#### ✅ 正确的方式

Service 应该使用 Repository 的方法来组装业务逻辑：

```typescript
@Injectable()
export class OrderService extends BaseCrudService<Order, CreateOrderDto, UpdateOrderDto, 'orders'> {
  constructor(
    repository: OrderRepository,
    i18n: I18nService,
    private readonly userRepository: UserRepository, // 注入其他 Repository
  ) {
    super(repository, i18n);
  }

  // ✅ 使用 Repository 方法
  async getOrderWithUser(orderId: string) {
    const order = await this.repository.findOne(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    
    // ✅ 使用其他 Repository 查询关联数据
    const user = await this.userRepository.findOne(order.userId);
    return { ...order, user };
  }
}
```

#### ❌ 错误的方式

Service 不应该直接使用 Prisma：

```typescript
@Injectable()
export class OrderService extends BaseCrudService<Order, CreateOrderDto, UpdateOrderDto, 'orders'> {
  constructor(
    repository: OrderRepository,
    i18n: I18nService,
    private readonly prisma: PrismaService, // ❌ 不应该注入 PrismaService
  ) {
    super(repository, i18n);
  }

  // ❌ 直接使用 Prisma
  async getOrderWithUser(orderId: string) {
    const order = await this.prisma.order.findUnique({ // ❌ 不应该直接使用 Prisma
      where: { id: orderId },
    });
    const user = await this.prisma.user.findUnique({ // ❌ 不应该直接使用 Prisma
      where: { id: order.userId },
    });
    return { ...order, user };
  }
}
```

### 关联查询的处理

#### SQL JOIN 策略（推荐）

使用 Prisma 的 `include` 在数据库层面进行关联查询：

```typescript
// Repository 自动支持 include
const order = await this.repository.findOne(orderId, {
  include: {
    user: true,
    products: true,
  },
});
```

#### 内存拼接策略

当需要内存拼接时，通过注入其他 Repository 来访问数据：

```typescript
@Injectable()
export class OrderService extends BaseCrudService<Order, CreateOrderDto, UpdateOrderDto, 'orders'> {
  constructor(
    repository: OrderRepository,
    i18n: I18nService,
    private readonly userRepository: UserRepository, // ✅ 注入 UserRepository
    private readonly productRepository: ProductRepository, // ✅ 注入 ProductRepository
  ) {
    super(repository, i18n);
  }

  async findAllWithJoins(pagination?: PaginationParams) {
    // 先查询主表数据
    const result = await this.repository.findAll(pagination);
    
    // ✅ 使用 Repository 查询关联数据
    const userIds = [...new Set(result.data.map(item => item.userId).filter(Boolean))];
    const users = await this.userRepository.findByIds(userIds);
    const userMap = new Map(users.map(u => [u.id, u]));
    
    // 拼接数据
    result.data.forEach(item => {
      item.user = item.userId ? userMap.get(item.userId) || null : null;
    });
    
    return result;
  }
}
```

### 最佳实践

1. **Repository 提供细粒度方法**：每个方法只做一件事，职责单一
2. **Service 组装业务逻辑**：通过调用多个 Repository 方法来组装复杂的业务逻辑
3. **避免 Service 直接使用 ORM**：保持分层清晰，便于测试和维护
4. **扩展 Repository 方法**：当需要新的数据访问模式时，在 Repository 中添加细粒度方法
5. **使用依赖注入**：通过注入其他 Repository 来访问关联数据，而不是直接使用 Prisma

---

## 自动生成方法

### 概述

代码生成器会根据 Schema 中的字段类型，自动为 Repository 生成常用的细粒度方法。这样可以减少重复代码，提高开发效率。

### 自动生成规则

#### 1. status 字段（string 类型）

如果 Schema 中存在 `status` 字段（string 类型），会自动生成：

```typescript
/**
 * 更新状态（根据 status 字段自动生成）
 */
async updateStatus(id: string, status: string): Promise<Order> {
  return this.update(id, { status } as any);
}
```

**使用示例：**
```typescript
// Service 中使用
await this.orderRepository.updateStatus(orderId, 'completed');
```

#### 2. isActive 字段（boolean 类型）

如果 Schema 中存在 `isActive` 字段（boolean 类型），会自动生成：

```typescript
/**
 * 激活记录（根据 isActive 字段自动生成）
 */
async activate(id: string): Promise<User> {
  return this.update(id, { isActive: true } as any);
}

/**
 * 停用记录（根据 isActive 字段自动生成）
 */
async deactivate(id: string): Promise<User> {
  return this.update(id, { isActive: false } as any);
}

/**
 * 切换激活状态（根据 isActive 字段自动生成）
 */
async toggleActive(id: string): Promise<User> {
  const record = await this.findOne(id);
  if (!record) {
    throw new Error('Record not found');
  }
  return this.update(id, { isActive: !(record as any).isActive } as any);
}
```

**使用示例：**
```typescript
// Service 中使用
await this.userRepository.activate(userId);
await this.userRepository.deactivate(userId);
await this.userRepository.toggleActive(userId);
```

#### 3. deletedAt 字段（date 类型）- 软删除

如果 Schema 中存在 `deletedAt` 字段（date 类型），会自动生成软删除相关方法：

```typescript
/**
 * 软删除记录（根据 deletedAt 字段自动生成）
 */
async softDelete(id: string): Promise<Order> {
  return this.update(id, { deletedAt: new Date() } as any);
}

/**
 * 恢复软删除的记录（根据 deletedAt 字段自动生成）
 */
async restore(id: string): Promise<Order> {
  return this.update(id, { deletedAt: null } as any);
}

/**
 * 查询未删除的记录（根据 deletedAt 字段自动生成）
 */
async findActive(options?: { select?: any; include?: any }): Promise<Order[]> {
  return this.findByCondition(
    { deletedAt: null },
    { select: options?.select || this.defaultSelect, include: options?.include }
  );
}
```

**使用示例：**
```typescript
// Service 中使用
await this.orderRepository.softDelete(orderId);
await this.orderRepository.restore(orderId);
const activeOrders = await this.orderRepository.findActive();
```

#### 4. isDeleted 字段（boolean 类型）- 软删除

如果 Schema 中存在 `isDeleted` 字段（boolean 类型），会自动生成软删除相关方法：

```typescript
/**
 * 软删除记录（根据 isDeleted 字段自动生成）
 */
async softDelete(id: string): Promise<Order> {
  return this.update(id, { isDeleted: true } as any);
}

/**
 * 恢复软删除的记录（根据 isDeleted 字段自动生成）
 */
async restore(id: string): Promise<Order> {
  return this.update(id, { isDeleted: false } as any);
}

/**
 * 查询未删除的记录（根据 isDeleted 字段自动生成）
 */
async findActive(options?: { select?: any; include?: any }): Promise<Order[]> {
  return this.findByCondition(
    { isDeleted: false },
    { select: options?.select || this.defaultSelect, include: options?.include }
  );
}
```

#### 5. enabled 字段（boolean 类型）

如果 Schema 中存在 `enabled` 字段（boolean 类型），会自动生成：

```typescript
/**
 * 启用记录（根据 enabled 字段自动生成）
 */
async enable(id: string): Promise<Feature> {
  return this.update(id, { enabled: true } as any);
}

/**
 * 禁用记录（根据 enabled 字段自动生成）
 */
async disable(id: string): Promise<Feature> {
  return this.update(id, { enabled: false } as any);
}
```

**使用示例：**
```typescript
// Service 中使用
await this.featureRepository.enable(featureId);
await this.featureRepository.disable(featureId);
```

### 完整示例

#### Schema 定义

```prisma
model Order {
  id        String   @id @default(uuid())
  orderNumber String @unique
  status    String   @default("pending")  // 自动生成 updateStatus
  isActive  Boolean  @default(true)       // 自动生成 activate/deactivate/toggleActive
  deletedAt DateTime?                      // 自动生成 softDelete/restore/findActive
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### 生成的 Repository

```typescript
@Injectable()
export class OrderRepository extends BaseCrudRepository<Order, any, any> {
  // ... 基础方法

  // 自动生成的方法
  async updateStatus(id: string, status: string): Promise<Order> {
    return this.update(id, { status } as any);
  }

  async activate(id: string): Promise<Order> {
    return this.update(id, { isActive: true } as any);
  }

  async deactivate(id: string): Promise<Order> {
    return this.update(id, { isActive: false } as any);
  }

  async toggleActive(id: string): Promise<Order> {
    const record = await this.findOne(id);
    if (!record) {
      throw new Error('Record not found');
    }
    return this.update(id, { isActive: !(record as any).isActive } as any);
  }

  async softDelete(id: string): Promise<Order> {
    return this.update(id, { deletedAt: new Date() } as any);
  }

  async restore(id: string): Promise<Order> {
    return this.update(id, { deletedAt: null } as any);
  }

  async findActive(options?: { select?: any; include?: any }): Promise<Order[]> {
    return this.findByCondition(
      { deletedAt: null },
      { select: options?.select || this.defaultSelect, include: options?.include }
    );
  }
}
```

#### Service 中使用

```typescript
@Injectable()
export class OrderService extends BaseCrudService<Order, CreateOrderDto, UpdateOrderDto, 'orders'> {
  constructor(
    repository: OrderRepository,
    i18n: I18nService,
  ) {
    super(repository, i18n);
  }

  // ✅ 使用自动生成的方法
  async completeOrder(id: string) {
    return this.repository.updateStatus(id, 'completed');
  }

  async archiveOrder(id: string) {
    await this.repository.deactivate(id);
    await this.repository.softDelete(id);
  }

  async getActiveOrders() {
    return this.repository.findActive();
  }
}
```

### 注意事项

1. **字段名称必须完全匹配**：字段名称必须完全匹配（如 `status`, `isActive`, `deletedAt`, `isDeleted`, `enabled`）
2. **字段类型必须匹配**：字段类型必须匹配（如 `status` 必须是 `string` 类型）
3. **自动生成的方法可以覆盖**：如果自动生成的方法不符合需求，可以在生成的 Repository 中手动覆盖
4. **多个字段可以同时存在**：如果同时存在多个匹配的字段，会生成所有对应的方法

### 扩展自定义方法

如果自动生成的方法不够用，可以在生成的 Repository 中添加自定义方法：

```typescript
@Injectable()
export class OrderRepository extends BaseCrudRepository<Order, any, any> {
  // ... 自动生成的方法

  // 自定义方法
  async findByStatus(status: string): Promise<Order[]> {
    return this.findByCondition({ status });
  }

  async findPendingOrders(): Promise<Order[]> {
    return this.findByCondition({ status: 'pending' });
  }
}
```

---

## 总结

通过使用代码生成器，可以：

- ✅ 提高开发效率：AI 自动生成配置，代码生成器自动生成 CRUD 代码
- ✅ 保证一致性：统一的代码结构和规范
- ✅ 降低错误率：减少人为错误
- ✅ 易于维护：配置文件清晰，代码结构统一
- ✅ 架构清晰：分层明确，职责单一

更多信息请参考 [README.md](./README.md)
