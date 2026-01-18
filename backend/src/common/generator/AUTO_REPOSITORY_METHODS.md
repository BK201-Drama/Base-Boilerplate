# Repository 自动生成方法说明

## 概述

代码生成器会根据 Schema 中的字段类型，自动为 Repository 生成常用的细粒度方法。这样可以减少重复代码，提高开发效率。

## 自动生成规则

### 1. status 字段（string 类型）

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

### 2. isActive 字段（boolean 类型）

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

### 3. deletedAt 字段（date 类型）- 软删除

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

### 4. isDeleted 字段（boolean 类型）- 软删除

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

**使用示例：**
```typescript
// Service 中使用
await this.orderRepository.softDelete(orderId);
await this.orderRepository.restore(orderId);
const activeOrders = await this.orderRepository.findActive();
```

### 5. enabled 字段（boolean 类型）

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

## 完整示例

### Schema 定义

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

### 生成的 Repository

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

### Service 中使用

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

## 注意事项

1. **字段名称必须完全匹配**：字段名称必须完全匹配（如 `status`, `isActive`, `deletedAt`, `isDeleted`, `enabled`）
2. **字段类型必须匹配**：字段类型必须匹配（如 `status` 必须是 `string` 类型）
3. **自动生成的方法可以覆盖**：如果自动生成的方法不符合需求，可以在生成的 Repository 中手动覆盖
4. **多个字段可以同时存在**：如果同时存在多个匹配的字段，会生成所有对应的方法

## 扩展自定义方法

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

## 总结

通过根据 Schema 字段自动生成常用方法，可以：
- ✅ 减少重复代码
- ✅ 提高开发效率
- ✅ 保持代码一致性
- ✅ 提供细粒度的数据访问方法

这些自动生成的方法都是基于 Repository 的基础方法（如 `update`, `findByCondition`），确保了架构的清晰性和可维护性。
