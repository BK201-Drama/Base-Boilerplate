# CRUD 基座快速参考

## 文件位置

```
backend/src/common/
├── services/
│   └── base-crud.service.ts      # 基础 CRUD 服务类
├── controllers/
│   └── base-crud.controller.ts     # 基础 CRUD 控制器类（可选使用）
├── types/
│   └── crud.types.ts              # CRUD 类型定义
└── templates/                      # 代码生成文档
    ├── CRUD_GENERATION_GUIDE.md    # CRUD 生成指南
    ├── QUICK_REFERENCE.md          # 快速参考
    └── SIMPLE_CONTROLLER_GUIDE.md  # 简化 Controller 指南
```

## BaseCrudService 可用方法

### 基础 CRUD 操作

```typescript
// 创建
async create(dto: TCreateDto, options?: CreateOptions): Promise<TModel>

// 分页查询
async findAll(pagination?: PaginationParams, options?: FindManyOptions): Promise<PaginatedResult<TModel>>

// 查询所有（不分页）
async findMany(options?: FindManyOptions): Promise<TModel[]>

// 根据 ID 查询
async findOne(id: string, options?: { select?, include? }): Promise<TModel>

// 根据条件查询第一条
async findFirst(options?: FindManyOptions): Promise<TModel | null>

// 更新
async update(id: string, dto: TUpdateDto, options?: UpdateOptions): Promise<TModel>

// 删除
async remove(id: string): Promise<{ message: string }>

// 批量删除
async removeMany(ids: string[]): Promise<{ message: string; count: number }>
```

### 批量操作

```typescript
// 批量创建
async createMany(data: TCreateDto[]): Promise<{ count: number }>

// 批量更新
async updateMany(ids: string[], data: TUpdateDto): Promise<{ count: number }>
```

### 查询辅助方法

```typescript
// 根据条件分页查询
async findManyWithPagination(where: any, pagination?: PaginationParams): Promise<PaginatedResult<TModel>>

// 根据唯一字段查询
async findByUniqueField(field: string, value: any): Promise<TModel | null>

// 统计数量
async count(where?: any): Promise<number>

// 检查是否存在
async exists(id: string): Promise<boolean>
```

### 生命周期钩子

```typescript
// 创建前处理
protected async beforeCreate(data: TCreateDto): Promise<any>

// 创建后处理
protected async afterCreate(result: TModel): Promise<TModel>

// 更新前处理
protected async beforeUpdate(id: string, data: TUpdateDto): Promise<any>

// 更新后处理
protected async afterUpdate(result: TModel): Promise<TModel>

// 删除前处理
protected async beforeDelete(id: string): Promise<void>
```

## 标准 Service 实现模板

```typescript
@Injectable()
export class {EntityName}Service extends BaseCrudService<
  {EntityName},
  Create{EntityName}Dto,
  Update{EntityName}Dto,
  '{entityNamePlural}'
> {
  protected readonly modelName = '{entityNamePlural}' as const;
  protected readonly defaultPageSize = 10;
  protected readonly defaultSelect = {
    // 字段列表
  } as const;

  constructor(prisma: PrismaService, i18n: I18nService) {
    super(prisma, i18n);
  }

  protected getModelDelegate() {
    return this.prisma.{entityName};
  }
}
```

## 标准 Controller 实现模板

```typescript
@Controller('{routePath}')
@UseGuards(JwtAuthGuard)
export class {EntityName}Controller {
  constructor(private readonly {entityName}Service: {EntityName}Service) {}

  @Post()
  @UseGuards(RolesGuard, PermissionsGuard)
  @Permissions('{entityName}:create')
  create(@Body() dto: Create{EntityName}Dto) {
    return this.{entityName}Service.create(dto);
  }

  @Get()
  @UseGuards(RolesGuard, PermissionsGuard)
  @Permissions('{entityName}:read')
  findAll(@Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
          @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number) {
    return this.{entityName}Service.findAll({ page, limit });
  }

  @Get(':id')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Permissions('{entityName}:read')
  findOne(@Param('id') id: string) {
    return this.{entityName}Service.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Permissions('{entityName}:update')
  update(@Param('id') id: string, @Body() dto: Update{EntityName}Dto) {
    return this.{entityName}Service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Permissions('{entityName}:delete')
  remove(@Param('id') id: string) {
    return this.{entityName}Service.remove(id);
  }
}
```

## 常用查询模式

### 1. 基础查询

```typescript
// 分页查询
const result = await service.findAll({ page: 1, limit: 10 });

// 查询所有
const all = await service.findMany();

// 根据 ID 查询
const one = await service.findOne('id');
```

### 2. 条件查询

```typescript
// 根据条件查询
const items = await service.findMany({
  where: { status: 'active' },
  orderBy: { createdAt: 'desc' },
});

// 根据条件分页查询
const paginated = await service.findManyWithPagination(
  { status: 'active' },
  { page: 1, limit: 10 }
);
```

### 3. 关联数据查询

```typescript
// 包含关联数据
const item = await service.findOne('id', {
  include: {
    category: true,
    tags: true,
  },
});

// 使用 select 精确控制返回字段
const item = await service.findOne('id', {
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
});
```

### 4. 自定义查询方法

```typescript
// 在 Service 中添加自定义方法
async findByStatus(status: string) {
  return this.findMany({
    where: { status },
    orderBy: { createdAt: 'desc' },
  });
}

async findByDateRange(start: Date, end: Date) {
  return this.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
    },
  });
}
```

## 权限代码规范

格式: `{entityName}:{action}`

- `{entityName}:create` - 创建权限
- `{entityName}:read` - 读取权限
- `{entityName}:update` - 更新权限
- `{entityName}:delete` - 删除权限

示例：
- `product:create`
- `user:read`
- `order:update`

## 国际化消息规范

在 `i18n/zh/{entityNamePlural}.json` 和 `i18n/en/{entityNamePlural}.json` 中添加：

```json
{
  "not_found": "未找到",
  "deleted_success": "删除成功",
  "batch_deleted_success": "批量删除成功"
}
```

在 `i18n/zh/validation.json` 和 `i18n/en/validation.json` 中添加：

```json
{
  "{field}_required": "字段必填",
  "{field}_invalid": "字段格式无效"
}
```

## 命名规范速查

| 类型 | 格式 | 示例 |
|------|------|------|
| EntityName | 首字母大写单数 | Product |
| entityName | 首字母小写单数 | product |
| entityNamePlural | 复数形式 | products |
| routePath | 路由路径（复数） | products |
| Service 类名 | {EntityName}Service | ProductsService |
| Controller 类名 | {EntityName}Controller | ProductsController |
| Module 类名 | {EntityName}Module | ProductsModule |
| Create DTO | Create{EntityName}Dto | CreateProductDto |
| Update DTO | Update{EntityName}Dto | UpdateProductDto |
| 权限代码 | {entityName}:{action} | product:create |

## 快速生成检查清单

- [ ] 创建 DTO 文件（create 和 update）
- [ ] 创建 Service 文件（继承 BaseCrudService）
- [ ] 创建 Controller 文件（标准 CRUD 端点）
- [ ] 创建 Module 文件
- [ ] 在 AppModule 中注册
- [ ] 添加国际化消息
- [ ] 配置权限代码

## 常见问题速查

**Q: 如何实现密码加密？**
A: 在 `beforeCreate` 和 `beforeUpdate` 中处理。

**Q: 如何包含关联数据？**
A: 重写 `findAll` 或 `findOne`，使用 `select` 或 `include`。

**Q: 如何实现软删除？**
A: 重写 `remove` 方法，更新 `deletedAt` 字段而不是删除。

**Q: 如何添加自定义查询？**
A: 在 Service 中添加新方法，使用 `findMany` 或 `findFirst`。

**Q: 如何处理文件上传？**
A: 使用 FilesModule，DTO 中只保存文件路径。

