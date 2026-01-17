# 一行代码创建 CRUD Controller 指南

## 概述

使用 `baseController` 工厂函数，只需一行代码即可创建完整的 CRUD Controller，包含所有标准端点、权限控制和认证。

## 快速开始

### 最简单的用法

```typescript
import { baseController } from '../common/utils/crud-controller.factory';
import { UsersService } from './users.service';

// 一行代码创建 Controller
export const UsersController = baseController('user')(UsersService);
```

这行代码会自动创建：
- **路由路径**: `/users` (自动使用复数形式)
- **权限代码**: `user:create`, `user:read`, `user:update`, `user:delete`
- **标准端点**:
  - `POST /users` - 创建
  - `GET /users` - 分页列表
  - `GET /users/:id` - 详情
  - `PATCH /users/:id` - 更新
  - `DELETE /users/:id` - 删除

### 自定义配置

```typescript
// 配置角色权限
export const UsersController = baseController('user', {
  createRoles: ['admin'],
  deleteRoles: ['admin'],
})(UsersService);

// 自定义路由路径
export const UsersController = baseController('user', {
  path: 'custom-users',
})(UsersService);

// 完整配置
export const UsersController = baseController('user', {
  path: 'users',
  requireAuth: true,
  createRoles: ['admin'],
  updateRoles: [],
  deleteRoles: ['admin'],
})(UsersService);
```

## 完整示例

### 1. 创建 Service（必须）

```typescript
// users.service.ts
import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PrismaService } from '../prisma/prisma.service';
import { BaseCrudService } from '../common/services/base-crud.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';

@Injectable()
export class UsersService extends BaseCrudService<
  User,
  CreateUserDto,
  UpdateUserDto,
  'users'
> {
  protected readonly modelName = 'users' as const;
  protected readonly defaultPageSize = 10;
  protected readonly defaultSelect = {
    id: true,
    username: true,
    email: true,
    createdAt: true,
    updatedAt: true,
  } as const;

  constructor(prisma: PrismaService, i18n: I18nService) {
    super(prisma, i18n);
  }

  protected getModelDelegate() {
    return this.prisma.user;
  }
}
```

### 2. 创建 Controller（一行代码）

```typescript
// users.controller.ts
import { baseController } from '../common/utils/crud-controller.factory';
import { UsersService } from './users.service';

export const UsersController = baseController('user')(UsersService);
```

### 3. 在 Module 中注册

```typescript
// users.module.ts
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
```

## 配置选项

### CrudControllerConfig

```typescript
interface CrudControllerConfig {
  resource: string;           // 资源名称（必填）
  path?: string;             // 路由路径（可选，默认使用 resource 的复数形式）
  requireAuth?: boolean;     // 是否需要认证（默认：true）
  createRoles?: string[];    // 创建操作需要的角色
  updateRoles?: string[];    // 更新操作需要的角色
  deleteRoles?: string[];    // 删除操作需要的角色
}
```

## 使用场景

### 场景 1: 基础 CRUD（无特殊权限要求）

```typescript
export const ProductsController = baseController('product')(ProductsService);
```

### 场景 2: 需要管理员权限

```typescript
export const ProductsController = baseController('product', {
  createRoles: ['admin'],
  deleteRoles: ['admin'],
})(ProductsService);
```

### 场景 3: 自定义路由路径

```typescript
export const ProductsController = baseController('product', {
  path: 'items',  // 路由路径为 /items 而不是 /products
})(ProductsService);
```

### 场景 4: 不需要认证（公开接口）

```typescript
export const PublicController = baseController('public', {
  requireAuth: false,
})(PublicService);
```

## 自动生成的端点

使用 `baseController` 会自动生成以下端点：

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| POST | `/{path}` | `{resource}:create` | 创建记录 |
| GET | `/{path}` | `{resource}:read` | 分页列表（支持 ?page=1&limit=10） |
| GET | `/{path}/:id` | `{resource}:read` | 查询单条记录 |
| PATCH | `/{path}/:id` | `{resource}:update` | 更新记录 |
| DELETE | `/{path}/:id` | `{resource}:delete` | 删除记录 |

## 权限配置

### 权限代码格式

```
{resource}:{action}
```

### 标准权限

- `{resource}:create` - 创建权限
- `{resource}:read` - 读取权限
- `{resource}:update` - 更新权限
- `{resource}:delete` - 删除权限

### 角色配置

```typescript
// 创建和删除需要 admin 角色
export const UsersController = baseController('user', {
  createRoles: ['admin'],
  deleteRoles: ['admin'],
})(UsersService);
```

## 与手动创建 Controller 的对比

### 手动创建（传统方式）

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(RolesGuard, PermissionsGuard)
  @Permissions('user:create')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(RolesGuard, PermissionsGuard)
  @Permissions('user:read')
  findAll(@Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
          @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number) {
    return this.usersService.findAll({ page, limit });
  }

  // ... 其他方法
}
```

### 使用 baseController（一行代码）

```typescript
export const UsersController = baseController('user')(UsersService);
```

**优势**：
- ✅ 代码量减少 90%+
- ✅ 自动配置权限和认证
- ✅ 统一的代码风格
- ✅ 减少错误
- ✅ 易于维护

## 注意事项

1. **Service 必须存在**: 使用 `baseController` 前必须先创建对应的 Service
2. **Service 必须继承 BaseCrudService**: Service 必须继承 `BaseCrudService` 才能使用
3. **权限代码**: 确保权限代码（如 `user:create`）已在权限表中配置
4. **路由路径**: 默认使用 resource 的复数形式，如需自定义请指定 `path` 选项

## 扩展功能

如果需要添加自定义端点，可以：

1. **创建额外的 Controller**: 创建另一个 Controller 处理特殊端点
2. **使用装饰器模式**: 在生成的 Controller 上添加额外的方法（需要手动扩展）

## 示例项目结构

```
backend/src/users/
├── dto/
│   ├── create-user.dto.ts
│   └── update-user.dto.ts
├── users.service.ts          # Service（继承 BaseCrudService）
├── users.controller.ts       # Controller（一行代码）
└── users.module.ts          # Module
```

## 参考资源

- **工厂函数**: `backend/src/common/utils/crud-controller.factory.ts`
- **使用示例**: `backend/src/common/examples/one-line-controller.example.ts`
- **模板文件**: `backend/src/common/templates/controller-simple.template.ts`

