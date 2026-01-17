# CRUD 代码生成指南

本指南详细说明如何根据 ER 图或 Prisma Schema 自动生成完整的 CRUD 代码。

## 快速开始

### 1. 分析实体信息

从 ER 图或 Prisma Schema 中提取以下信息：

```typescript
// 示例：Product 实体
{
  entityName: "Product",           // 实体名称（首字母大写）
  entityNameLower: "product",       // 实体名称（首字母小写）
  entityNamePlural: "products",    // 复数形式
  routePath: "products",            // 路由路径
  fields: [
    { name: "name", type: "String", required: true },
    { name: "description", type: "String", required: false },
    { name: "price", type: "Decimal", required: true },
    { name: "stock", type: "Int", required: true },
  ],
  relations: [
    { name: "category", type: "many-to-one", target: "Category" }
  ]
}
```

### 2. 使用模板生成代码

#### 步骤 A: 创建 DTO

**Create DTO** (`dto/create-product.dto.ts`):
```typescript
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty({ message: 'validation.name_required' })
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty({ message: 'validation.price_required' })
  @IsNumber()
  @Min(0)
  price: number;

  @IsNotEmpty({ message: 'validation.stock_required' })
  @IsNumber()
  @Min(0)
  stock: number;
}
```

**Update DTO** (`dto/update-product.dto.ts`):
```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
```

#### 步骤 B: 创建 Service

**Service** (`products.service.ts`):
```typescript
import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PrismaService } from '../prisma/prisma.service';
import { BaseCrudService } from '../common/services/base-crud.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from '@prisma/client';

@Injectable()
export class ProductsService extends BaseCrudService<
  Product,
  CreateProductDto,
  UpdateProductDto,
  'products'
> {
  protected readonly modelName = 'products' as const;
  protected readonly defaultPageSize = 10;
  protected readonly defaultSelect = {
    id: true,
    name: true,
    description: true,
    price: true,
    stock: true,
    createdAt: true,
    updatedAt: true,
  } as const;

  constructor(prisma: PrismaService, i18n: I18nService) {
    super(prisma, i18n);
  }

  protected getModelDelegate() {
    return this.prisma.product;
  }

  // 如果需要包含关联数据，重写 findAll
  async findAll(page: number = 1, limit: number = 10) {
    return super.findAll(
      { page, limit },
      {
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          stock: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
      },
    );
  }
}
```

#### 步骤 C: 创建 Controller

**Controller** (`products.controller.ts`):
```typescript
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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles('admin')
  @Permissions('product:create')
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @UseGuards(RolesGuard, PermissionsGuard)
  @Permissions('product:read')
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    return this.productsService.findAll({ page, limit });
  }

  @Get(':id')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Permissions('product:read')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Permissions('product:update')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles('admin')
  @Permissions('product:delete')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
```

#### 步骤 D: 创建 Module

**Module** (`products.module.ts`):
```typescript
import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
```

#### 步骤 E: 注册到 AppModule

在 `app.module.ts` 中：
```typescript
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    // ... 其他模块
    ProductsModule,
  ],
  // ...
})
export class AppModule {}
```

#### 步骤 F: 添加国际化消息

在 `i18n/zh/products.json`:
```json
{
  "not_found": "产品未找到",
  "deleted_success": "产品删除成功",
  "batch_deleted_success": "批量删除成功"
}
```

在 `i18n/en/products.json`:
```json
{
  "not_found": "Product not found",
  "deleted_success": "Product deleted successfully",
  "batch_deleted_success": "Batch delete successful"
}
```

## 字段类型映射

### Prisma 类型 → DTO 验证装饰器

| Prisma 类型 | DTO 类型 | 验证装饰器 |
|------------|----------|------------|
| String | string | @IsString() |
| Int | number | @IsNumber() |
| Float | number | @IsNumber() |
| Decimal | number | @IsNumber() |
| Boolean | boolean | @IsBoolean() |
| DateTime | string | @IsDateString() |
| Json | any | @IsObject() |
| Enum | string | @IsEnum() |

### 常用验证装饰器组合

```typescript
// 必填字符串
@IsNotEmpty({ message: 'validation.field_required' })
@IsString()
@Length(1, 100)
field: string;

// 可选字符串
@IsOptional()
@IsString()
field?: string;

// 必填数字
@IsNotEmpty({ message: 'validation.field_required' })
@IsNumber()
@Min(0)
@Max(100)
field: number;

// 邮箱
@IsNotEmpty({ message: 'validation.email_required' })
@IsEmail({}, { message: 'validation.email_invalid' })
email: string;

// 枚举
@IsOptional()
@IsEnum(['value1', 'value2', 'value3'])
status?: string;

// 日期
@IsOptional()
@IsDateString()
publishedAt?: string;
```

## 特殊场景处理

### 场景 1: 密码字段加密

```typescript
protected async beforeCreate(data: CreateUserDto): Promise<any> {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  return {
    ...data,
    password: hashedPassword,
  };
}
```

### 场景 2: 自动生成字段

```typescript
protected async beforeCreate(data: CreateOrderDto): Promise<any> {
  return {
    ...data,
    orderNumber: generateOrderNumber(), // 自动生成订单号
    createdAt: new Date(),
  };
}
```

### 场景 3: 关联数据处理

```typescript
// 包含关联数据
async findAll(page: number = 1, limit: number = 10) {
  return super.findAll(
    { page, limit },
    {
      select: {
        id: true,
        name: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    },
  );
}
```

### 场景 4: 软删除

```typescript
protected async beforeDelete(id: string): Promise<void> {
  // 检查是否可以删除
  const entity = await this.findOne(id);
  if (entity.status === 'locked') {
    throw new BadRequestException('Cannot delete locked entity');
  }
}

// 重写 remove 方法实现软删除
async remove(id: string): Promise<{ message: string }> {
  await this.beforeDelete(id);
  await this.update(id, { deletedAt: new Date() } as any);
  return { message: this.i18n.t(`${this.modelName}.deleted_success`) };
}
```

### 场景 5: 自定义查询方法

```typescript
// 根据状态查询
async findByStatus(status: string) {
  return this.findMany({
    where: { status },
    orderBy: { createdAt: 'desc' },
  });
}

// 根据日期范围查询
async findByDateRange(startDate: Date, endDate: Date) {
  return this.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });
}
```

## 代码生成检查清单

生成代码后，请逐项检查：

### DTO 检查
- [ ] 所有必填字段都有 `@IsNotEmpty()` 装饰器
- [ ] 所有字段都有适当的类型验证装饰器
- [ ] 错误消息使用 i18n key
- [ ] Update DTO 继承 Create DTO 并使用 `PartialType`

### Service 检查
- [ ] 正确继承 `BaseCrudService`
- [ ] `modelName` 使用复数形式
- [ ] `defaultSelect` 包含所有需要返回的字段
- [ ] `getModelDelegate()` 返回正确的 Prisma 模型
- [ ] 实现了必要的生命周期钩子
- [ ] 自定义方法（如有）符合命名规范

### Controller 检查
- [ ] 所有端点都有适当的权限装饰器
- [ ] 路由路径正确
- [ ] 分页参数使用 `ParseIntPipe` 和 `DefaultValuePipe`
- [ ] 权限代码格式正确（`{entityName}:{action}`）

### Module 检查
- [ ] 正确导入 `PrismaModule`
- [ ] 正确注册 Controller 和 Service
- [ ] 如需导出服务，已添加到 `exports`

### 集成检查
- [ ] 在 `AppModule` 中注册了新模块
- [ ] 添加了必要的国际化消息
- [ ] 权限代码已在权限表中配置（如需要）

### 代码质量检查
- [ ] 代码通过 ESLint 检查
- [ ] 代码通过 TypeScript 编译
- [ ] 文件命名符合规范
- [ ] 代码格式符合项目规范

## AI 生成提示词模板

当使用 AI 生成 CRUD 代码时，可以使用以下提示词：

```
请根据以下 ER 图信息，为 {EntityName} 实体生成完整的 CRUD 代码：

实体信息：
- 实体名称: {EntityName}
- 路由路径: {routePath}
- 字段列表:
  {字段列表，包含名称、类型、是否必填}

请按照项目规范生成：
1. Create DTO 和 Update DTO
2. Service 类（继承 BaseCrudService）
3. Controller 类（包含标准 CRUD 端点）
4. Module 类
5. 国际化消息

参考示例：backend/src/users/
参考模板：backend/src/common/templates/
参考规则：.cursorrules
```

## 常见问题

### Q: 如何处理多对多关系？
A: 在 DTO 中接收关联 ID 数组，在 `beforeCreate` 或 `beforeUpdate` 中处理关联关系。

### Q: 如何处理文件上传？
A: 文件上传使用 `FilesModule`，在 DTO 中只保存文件路径或 URL。

### Q: 如何实现复杂的业务逻辑？
A: 在 Service 中添加自定义方法，或重写基类方法。

### Q: 如何实现数据权限控制？
A: 在 `findAll` 或 `findMany` 的 `where` 条件中添加权限过滤。

## 参考资源

- 基座文档: `backend/src/common/README.md`
- 示例实现: `backend/src/users/`
- 代码模板: `backend/src/common/templates/`
- Cursor Rules: `.cursorrules`

