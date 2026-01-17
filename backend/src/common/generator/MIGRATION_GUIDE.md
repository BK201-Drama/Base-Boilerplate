# 迁移指南：从直接使用 Prisma 到 Repository 层

## 概述

系统已升级为分层架构，添加了 Repository/DAO 层。如果你有现有的 Service 代码，需要迁移到新的架构。

## 架构变化

### 旧架构（直接使用 Prisma）

```
Controller -> Service -> PrismaService -> Database
```

### 新架构（使用 Repository）

```
Controller -> Service -> Repository -> PrismaService -> Database
```

## 迁移步骤

### 步骤 1: 创建 Repository

为每个实体创建对应的 Repository：

```typescript
// users.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseCrudRepository } from '../common/repositories/base-crud.repository';
import { User } from '@prisma/client';

@Injectable()
export class UsersRepository extends BaseCrudRepository<User, any, any> {
  protected readonly defaultPageSize = 10;
  protected readonly defaultSelect = {
    id: true,
    username: true,
    email: true,
    nickname: true,
    avatar: true,
    status: true,
    createdAt: true,
    updatedAt: true,
  } as const;

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  protected getModelDelegate() {
    return this.prisma.user;
  }
}
```

### 步骤 2: 更新 Service

修改 Service 使用 Repository 而不是直接使用 Prisma：

**旧代码：**

```typescript
@Injectable()
export class UsersService extends BaseCrudService<
  User,
  CreateUserDto,
  UpdateUserDto,
  'users'
> {
  constructor(prisma: PrismaService, i18n: I18nService) {
    super(prisma, i18n);
  }

  protected getModelDelegate() {
    return this.prisma.user;
  }
}
```

**新代码：**

```typescript
@Injectable()
export class UsersService extends BaseCrudService<
  User,
  CreateUserDto,
  UpdateUserDto,
  'users'
> {
  constructor(
    repository: UsersRepository,  // 使用 Repository
    i18n: I18nService,
  ) {
    super(repository, i18n);  // 传入 Repository
  }

  // 移除 getModelDelegate() 方法，现在由 Repository 处理
}
```

### 步骤 3: 更新 Module

在 Module 中添加 Repository 到 providers：

```typescript
@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [
    UsersRepository,  // 添加 Repository
    UsersService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
```

## 自动迁移

使用代码生成器可以自动生成包含 Repository 层的完整代码：

```bash
npm run generate:crud User -- --from-schema --overwrite
```

这会自动生成：
- DTO
- Repository
- Service（使用 Repository）
- Controller
- Module（包含 Repository）

## 自定义 Repository 方法

如果需要添加自定义查询方法，可以在 Repository 中添加：

```typescript
@Injectable()
export class UsersRepository extends BaseCrudRepository<User, any, any> {
  // ... 基础方法

  /**
   * 根据邮箱查找用户
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.findFirst({
      where: { email },
    });
  }

  /**
   * 根据状态查找用户
   */
  async findByStatus(status: string): Promise<User[]> {
    return this.findMany({
      where: { status },
    });
  }
}
```

然后在 Service 中使用：

```typescript
@Injectable()
export class UsersService extends BaseCrudService<User, CreateUserDto, UpdateUserDto, 'users'> {
  constructor(
    private readonly repository: UsersRepository,  // 需要 private 才能访问自定义方法
    i18n: I18nService,
  ) {
    super(repository, i18n);
  }

  async findByEmail(email: string) {
    return this.repository.findByEmail(email);
  }
}
```

## 优势

使用 Repository 层的优势：

1. **关注点分离**：Service 专注于业务逻辑，Repository 专注于数据访问
2. **易于测试**：可以轻松 mock Repository 进行单元测试
3. **易于切换数据源**：如果需要切换数据库，只需修改 Repository
4. **代码复用**：Repository 可以在多个 Service 中复用
5. **符合 SOLID 原则**：单一职责原则，依赖倒置原则

## 常见问题

### Q: 我需要在 Service 中直接访问 Prisma 怎么办？

A: 可以通过 Repository 访问，或者将 PrismaService 注入到 Service 中（不推荐，破坏了分层）。

### Q: Repository 和 DAO 有什么区别？

A: 在这个系统中，Repository 和 DAO 是同一个概念，都指数据访问层。

### Q: 是否所有 Service 都需要 Repository？

A: 是的，为了保持架构一致性，建议所有 Service 都使用 Repository。

## 示例

查看 `examples/` 目录下的完整示例。

