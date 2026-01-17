# CRUD 抽象层使用指南

本目录提供了通用的 CRUD 抽象层，用于简化后端 CRUD 操作的开发。

## 核心组件

### 1. BaseCrudService

基础 CRUD 服务类，提供通用的 CRUD 操作方法。

#### 使用示例

```typescript
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
    // ... 其他字段
  } as const;

  constructor(prisma: PrismaService, i18n: I18nService) {
    super(prisma, i18n);
  }

  protected getModelDelegate() {
    return this.prisma.user;
  }

  // 可选：重写生命周期钩子
  protected async beforeCreate(data: CreateUserDto): Promise<any> {
    // 创建前处理，如密码加密
    return data;
  }

  protected async afterCreate(result: User): Promise<User> {
    // 创建后处理
    return result;
  }
}
```

#### 可用方法

- `create(dto, options?)` - 创建记录
- `findAll(pagination?, options?)` - 分页查询
- `findMany(options?)` - 查询所有记录（不分页）
- `findOne(id, options?)` - 根据 ID 查询单条记录
- `findFirst(options?)` - 根据条件查询单条记录
- `update(id, dto, options?)` - 更新记录
- `remove(id)` - 删除记录
- `removeMany(ids)` - 批量删除
- `count(where?)` - 统计数量
- `exists(id)` - 检查记录是否存在

#### 生命周期钩子

- `beforeCreate(data)` - 创建前处理
- `afterCreate(result)` - 创建后处理
- `beforeUpdate(id, data)` - 更新前处理
- `afterUpdate(result)` - 更新后处理
- `beforeDelete(id)` - 删除前处理

### 2. BaseCrudController

基础 CRUD 控制器类，提供标准的 CRUD 端点。

#### 使用示例

```typescript
import { Controller } from '@nestjs/common';
import { BaseCrudController } from '../common/controllers/base-crud.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';

@Controller('users')
export class UsersController extends BaseCrudController<User, CreateUserDto, UpdateUserDto>({
  resource: 'user',
  requireAuth: true,
  createRoles: ['admin'],
  updateRoles: [],
  deleteRoles: ['admin'],
}) {
  constructor(protected readonly service: UsersService) {
    super();
  }
}
```

#### 配置选项

- `resource` - 资源名称（用于权限检查）
- `requireAuth` - 是否需要认证（默认：true）
- `createRoles` - 创建操作需要的角色
- `updateRoles` - 更新操作需要的角色
- `deleteRoles` - 删除操作需要的角色
- `enableBatchDelete` - 是否启用批量删除（默认：false）

### 3. 类型定义

#### PaginationParams

```typescript
interface PaginationParams {
  page?: number;
  limit?: number;
}
```

#### PaginatedResult

```typescript
interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

#### FindManyOptions

```typescript
interface FindManyOptions<T> {
  where?: Prisma.Args<T, 'findMany'>['where'];
  select?: Prisma.Args<T, 'findMany'>['select'];
  include?: Prisma.Args<T, 'findMany'>['include'];
  orderBy?: Prisma.Args<T, 'findMany'>['orderBy'];
}
```

## 完整示例

### 1. 创建 Service

```typescript
// users.service.ts
import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PrismaService } from '../prisma/prisma.service';
import { BaseCrudService } from '../common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

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
    nickname: true,
    avatar: true,
    status: true,
    createdAt: true,
    updatedAt: true,
  } as const;

  constructor(prisma: PrismaService, i18n: I18nService) {
    super(prisma, i18n);
  }

  protected getModelDelegate() {
    return this.prisma.user;
  }

  protected async beforeCreate(data: CreateUserDto): Promise<any> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return {
      ...data,
      password: hashedPassword,
    };
  }

  protected async beforeUpdate(id: string, data: UpdateUserDto): Promise<any> {
    const updateData: any = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    return updateData;
  }
}
```

### 2. 创建 Controller

```typescript
// users.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles('admin')
  @Permissions('user:create')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(RolesGuard, PermissionsGuard)
  @Permissions('user:read')
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    return this.usersService.findAll({ page, limit });
  }

  @Get(':id')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Permissions('user:read')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Permissions('user:update')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles('admin')
  @Permissions('user:delete')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
```

## 高级用法

### 自定义查询

```typescript
// 使用自定义 where 条件
const users = await this.usersService.findMany({
  where: {
    status: 'active',
  },
  orderBy: {
    createdAt: 'desc',
  },
});

// 使用自定义 select
const user = await this.usersService.findOne(id, {
  select: {
    id: true,
    username: true,
    userRoles: {
      select: {
        role: true,
      },
    },
  },
});
```

### 重写方法

```typescript
// 重写 findAll 以包含关系数据
async findAll(page: number = 1, limit: number = 10) {
  return super.findAll(
    { page, limit },
    {
      select: {
        id: true,
        username: true,
        userRoles: {
          select: {
            role: true,
          },
        },
      },
    },
  );
}
```

## 注意事项

1. **类型安全**：确保正确设置泛型类型参数
2. **国际化**：错误消息使用 `modelName` 作为 i18n key 前缀
3. **权限控制**：控制器需要手动配置权限装饰器
4. **生命周期钩子**：合理使用生命周期钩子处理业务逻辑
5. **性能优化**：使用 `select` 而不是 `include` 来减少查询字段

## 优势

- ✅ 减少重复代码
- ✅ 统一的 CRUD 接口
- ✅ 类型安全
- ✅ 易于扩展和维护
- ✅ 支持生命周期钩子
- ✅ 支持自定义查询选项

