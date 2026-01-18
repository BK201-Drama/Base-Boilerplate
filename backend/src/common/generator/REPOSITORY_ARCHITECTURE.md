# Repository 架构说明

## 架构原则

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

## Repository 层的职责

Repository 层是**对接 ORM 的最小操作粒度的函数集合**，提供细粒度的数据访问方法。

### 核心原则

1. **Repository 只负责数据访问**：提供细粒度的 ORM 操作方法
2. **Service 使用 Repository 组装业务**：Service 层通过调用 Repository 的方法来组装业务逻辑
3. **禁止 Service 直接使用 ORM**：Service 层不应该直接使用 Prisma 或其他 ORM

## BaseCrudRepository 提供的方法

生成的 Repository 继承 `BaseCrudRepository`，自动获得以下细粒度方法：

### 基础 CRUD 方法

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

## Service 层的使用方式

### ✅ 正确的方式

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

### ❌ 错误的方式

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

## 关联查询的处理

### SQL JOIN 策略（推荐）

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

### 内存拼接策略

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

## 代码生成器的改进

### 1. Repository 生成器

生成的 Repository 继承 `BaseCrudRepository`，提供所有细粒度方法：

```typescript
@Injectable()
export class OrderRepository extends BaseCrudRepository<Order, any, any> {
  // 自动获得所有 BaseCrudRepository 的方法
  // 可以在此扩展更多自定义方法
}
```

### 2. Service 生成器

- ✅ 不再直接注入 `PrismaService`
- ✅ 当需要关联查询时，自动注入对应的 Repository
- ✅ 使用 Repository 方法而不是直接使用 Prisma

### 3. 扩展 Repository 方法

如果需要在 Repository 中添加更多细粒度方法，可以在生成的 Repository 中扩展：

```typescript
@Injectable()
export class OrderRepository extends BaseCrudRepository<Order, any, any> {
  // ... 基础方法已由 BaseCrudRepository 提供

  // 扩展自定义细粒度方法
  async findByStatus(status: string) {
    return this.findByCondition({ status });
  }

  async findByUserId(userId: string) {
    return this.findByCondition({ userId });
  }
}
```

## 最佳实践

1. **Repository 提供细粒度方法**：每个方法只做一件事，职责单一
2. **Service 组装业务逻辑**：通过调用多个 Repository 方法来组装复杂的业务逻辑
3. **避免 Service 直接使用 ORM**：保持分层清晰，便于测试和维护
4. **扩展 Repository 方法**：当需要新的数据访问模式时，在 Repository 中添加细粒度方法
5. **使用依赖注入**：通过注入其他 Repository 来访问关联数据，而不是直接使用 Prisma

## 总结

- ✅ Repository 层：提供细粒度的 ORM 操作方法
- ✅ Service 层：使用 Repository 方法组装业务逻辑
- ❌ Service 层：不应该直接使用 Prisma 或其他 ORM

这样的架构确保了：
- 职责清晰：每层只做自己该做的事
- 易于测试：可以轻松 mock Repository
- 易于维护：ORM 变更只影响 Repository 层
- 代码复用：Repository 方法可以在多个 Service 中复用
