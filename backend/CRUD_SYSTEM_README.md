# CRUD 代码生成系统

## 概述

本项目提供了一套完整的 CRUD 代码生成系统，可以根据 ER 图或 Prisma Schema 自动生成标准的 CRUD 代码。系统包括：

1. **CRUD 基座** - 通用的基础服务类和控制器类
2. **代码模板** - 标准化的代码模板
3. **Cursor Rules** - AI 代码生成规则
4. **详细文档** - 完整的使用指南

## 系统架构

```
backend/src/common/
├── services/
│   └── base-crud.service.ts          # 基础 CRUD 服务类（核心）
├── controllers/
│   └── base-crud.controller.ts       # 基础 CRUD 控制器类（可选）
├── types/
│   └── crud.types.ts                 # CRUD 类型定义
└── templates/                        # 代码生成模板
    ├── service.template.ts           # Service 模板
    ├── controller.template.ts         # Controller 模板
    ├── dto-create.template.ts        # Create DTO 模板
    ├── dto-update.template.ts        # Update DTO 模板
    ├── module.template.ts            # Module 模板
    ├── CRUD_GENERATION_GUIDE.md      # 详细生成指南
    └── QUICK_REFERENCE.md            # 快速参考

.cursorrules                          # Cursor AI 规则文件
```

## 快速开始

### 方式一：使用 AI 生成（推荐）

1. **提供 ER 图或实体信息给 AI**
   ```
   请根据以下 ER 图信息，为 Product 实体生成完整的 CRUD 代码：

   实体信息：
   - 实体名称: Product
   - 路由路径: products
   - 字段列表:
     - name: String, 必填
     - description: String, 可选
     - price: Decimal, 必填
     - stock: Int, 必填
   ```

2. **AI 会自动参考以下内容生成代码**：
   - `.cursorrules` - 代码生成规则
   - `backend/src/common/templates/` - 代码模板
   - `backend/src/users/` - 参考示例

3. **生成的文件包括**：
   - `dto/create-product.dto.ts`
   - `dto/update-product.dto.ts`
   - `products.service.ts`
   - `products.controller.ts`
   - `products.module.ts`

4. **手动完成**：
   - 在 `app.module.ts` 中注册模块
   - 添加国际化消息

### 方式二：手动使用模板

1. 复制模板文件到目标位置
2. 替换模板中的占位符（`{EntityName}`, `{entityName}` 等）
3. 根据 Prisma Schema 调整字段
4. 实现必要的生命周期钩子

## 核心功能

### BaseCrudService 提供的方法

#### 基础 CRUD
- `create()` - 创建记录
- `findAll()` - 分页查询
- `findMany()` - 查询所有
- `findOne()` - 根据 ID 查询
- `findFirst()` - 根据条件查询第一条
- `update()` - 更新记录
- `remove()` - 删除记录
- `removeMany()` - 批量删除

#### 批量操作
- `createMany()` - 批量创建
- `updateMany()` - 批量更新

#### 查询辅助
- `findManyWithPagination()` - 条件分页查询
- `findByUniqueField()` - 根据唯一字段查询
- `count()` - 统计数量
- `exists()` - 检查是否存在

#### 生命周期钩子
- `beforeCreate()` - 创建前处理
- `afterCreate()` - 创建后处理
- `beforeUpdate()` - 更新前处理
- `afterUpdate()` - 更新后处理
- `beforeDelete()` - 删除前处理

## 使用示例

### 示例 1: 简单实体（无特殊处理）

```typescript
// products.service.ts
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
    price: true,
    createdAt: true,
    updatedAt: true,
  } as const;

  constructor(prisma: PrismaService, i18n: I18nService) {
    super(prisma, i18n);
  }

  protected getModelDelegate() {
    return this.prisma.product;
  }
}
```

### 示例 2: 需要密码加密

```typescript
// users.service.ts
protected async beforeCreate(data: CreateUserDto): Promise<any> {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  return {
    ...data,
    password: hashedPassword,
  };
}
```

### 示例 3: 包含关联数据

```typescript
// products.service.ts
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

## 文件结构规范

生成 CRUD 代码时，应遵循以下文件结构：

```
backend/src/{entityName}/
├── dto/
│   ├── create-{entityName}.dto.ts
│   └── update-{entityName}.dto.ts
├── {entityName}.service.ts
├── {entityName}.controller.ts
└── {entityName}.module.ts
```

## 命名规范

| 类型 | 格式 | 示例 |
|------|------|------|
| 实体名称（大写） | {EntityName} | Product |
| 实体名称（小写） | {entityName} | product |
| 复数形式 | {entityNamePlural} | products |
| 路由路径 | {routePath} | products |
| Service | {EntityName}Service | ProductsService |
| Controller | {EntityName}Controller | ProductsController |
| Module | {EntityName}Module | ProductsModule |
| Create DTO | Create{EntityName}Dto | CreateProductDto |
| Update DTO | Update{EntityName}Dto | UpdateProductDto |
| 权限代码 | {entityName}:{action} | product:create |

## 权限配置

### 权限代码格式

```
{entityName}:{action}
```

### 标准权限

- `{entityName}:create` - 创建权限
- `{entityName}:read` - 读取权限
- `{entityName}:update` - 更新权限
- `{entityName}:delete` - 删除权限

### Controller 权限配置示例

```typescript
@Post()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Permissions('product:create')
create(@Body() dto: CreateProductDto) {
  return this.productsService.create(dto);
}
```

## 国际化配置

### 实体消息

在 `i18n/zh/{entityNamePlural}.json` 和 `i18n/en/{entityNamePlural}.json` 中添加：

```json
{
  "not_found": "未找到",
  "deleted_success": "删除成功",
  "batch_deleted_success": "批量删除成功"
}
```

### 验证消息

在 `i18n/zh/validation.json` 和 `i18n/en/validation.json` 中添加：

```json
{
  "name_required": "名称必填",
  "email_invalid": "邮箱格式无效"
}
```

## 代码生成检查清单

生成代码后，请检查：

### DTO
- [ ] 所有必填字段有 `@IsNotEmpty()` 装饰器
- [ ] 所有字段有适当的类型验证
- [ ] 错误消息使用 i18n key
- [ ] Update DTO 继承 Create DTO

### Service
- [ ] 正确继承 `BaseCrudService`
- [ ] `modelName` 使用复数形式
- [ ] `defaultSelect` 包含必要字段
- [ ] `getModelDelegate()` 返回正确模型
- [ ] 实现了必要的生命周期钩子

### Controller
- [ ] 所有端点有权限装饰器
- [ ] 路由路径正确
- [ ] 分页参数正确配置
- [ ] 权限代码格式正确

### Module
- [ ] 正确导入 `PrismaModule`
- [ ] 正确注册 Controller 和 Service
- [ ] 如需导出，已添加到 `exports`

### 集成
- [ ] 在 `AppModule` 中注册
- [ ] 添加了国际化消息
- [ ] 权限代码已配置

## 文档索引

- **详细生成指南**: `backend/src/common/templates/CRUD_GENERATION_GUIDE.md`
- **快速参考**: `backend/src/common/templates/QUICK_REFERENCE.md`
- **基座文档**: `backend/src/common/README.md`
- **Cursor Rules**: `.cursorrules`
- **示例代码**: `backend/src/users/`

## 常见问题

### Q: 如何实现软删除？
A: 重写 `remove` 方法，更新 `deletedAt` 字段而不是删除记录。

### Q: 如何处理多对多关系？
A: 在 DTO 中接收关联 ID 数组，在生命周期钩子中处理关联关系。

### Q: 如何实现数据权限控制？
A: 在查询方法的 `where` 条件中添加权限过滤。

### Q: 如何添加自定义业务逻辑？
A: 在 Service 中添加自定义方法，或重写基类方法。

## 最佳实践

1. **使用模板**: 始终使用提供的模板作为起点
2. **遵循规范**: 严格遵循命名和文件结构规范
3. **类型安全**: 确保所有类型定义正确
4. **权限控制**: 所有端点都要有适当的权限检查
5. **国际化**: 所有用户可见的消息都要支持国际化
6. **代码复用**: 尽量使用基座提供的方法，避免重复代码
7. **文档更新**: 添加新功能时更新相关文档

## 技术支持

如有问题，请参考：
- 示例代码: `backend/src/users/`
- 代码模板: `backend/src/common/templates/`
- Cursor Rules: `.cursorrules`

