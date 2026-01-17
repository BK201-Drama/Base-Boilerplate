# CRUD 代码生成器

参考 Refine 思想设计的后端 CRUD 代码生成底座系统。

## 架构设计

本系统采用**分层架构**：

```
Controller (控制器层)
    ↓
Service (业务逻辑层)
    ↓
Repository/DAO (数据访问层)
    ↓
Database (数据库)
```

### 各层职责

- **Controller**: 处理 HTTP 请求，参数验证，权限控制
- **Service**: 业务逻辑，数据转换，生命周期钩子
- **Repository/DAO**: 数据访问，数据库操作，查询优化
- **Database**: 数据存储

## 核心概念

### 资源定义（Resource Definition）

类似于 Refine 的 Resource 概念，资源定义描述了数据模型的结构和操作配置：

```typescript
interface ResourceDefinition {
  name: string;              // 资源名称（单数）
  pluralName?: string;       // 资源名称（复数）
  prismaModel: string;       // Prisma 模型名称
  fields: FieldConfig[];      // 字段配置
  operations?: CrudOperationsConfig;  // CRUD 操作配置
  permissions?: PermissionConfig;     // 权限配置
  // ...
}
```

## 快速开始

### 1. 从 Prisma Schema 自动生成

```bash
npm run generate:crud User -- --from-schema
```

这会自动从 `prisma/schema.prisma` 解析 `User` 模型并生成完整的 CRUD 代码。

### 2. 使用配置文件

创建资源定义文件 `resources/user.json`:

```json
{
  "name": "user",
  "pluralName": "users",
  "prismaModel": "User",
  "fields": [
    {
      "name": "username",
      "type": "string",
      "required": true,
      "validations": [
        {
          "type": "required",
          "message": "validation.username_required"
        }
      ]
    },
    {
      "name": "email",
      "type": "string",
      "required": true,
      "validations": [
        {
          "type": "email",
          "message": "validation.email_invalid"
        }
      ]
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
    "resource": "user",
    "createRoles": ["admin"],
    "requireAuth": true
  }
}
```

然后运行：

```bash
npm run generate:crud user -- --config resources/user.json
```

### 3. 使用默认配置

```bash
npm run generate:crud product
```

## 生成的文件

生成器会创建以下文件：

```
src/
  {resource-name}/
    dto/
      create-{resource-name}.dto.ts      # 创建 DTO
      update-{resource-name}.dto.ts      # 更新 DTO
    {resource-name}.repository.ts        # Repository/DAO 层
    {resource-name}.service.ts          # Service 层
    {resource-name}.controller.ts       # Controller 层
    {resource-name}.module.ts           # Module
```

## 分层架构说明

### Repository 层（数据访问层）

Repository 负责与数据库交互，封装所有数据访问逻辑：

```typescript
@Injectable()
export class UserRepository extends BaseCrudRepository<User, any, any> {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  protected getModelDelegate() {
    return this.prisma.user;
  }
}
```

### Service 层（业务逻辑层）

Service 使用 Repository 进行数据访问，处理业务逻辑：

```typescript
@Injectable()
export class UsersService extends BaseCrudService<User, CreateUserDto, UpdateUserDto, 'users'> {
  constructor(
    repository: UserRepository,
    i18n: I18nService,
  ) {
    super(repository, i18n);
  }

  protected async beforeCreate(data: CreateUserDto): Promise<any> {
    // 业务逻辑：密码加密
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return { ...data, password: hashedPassword };
  }
}
```

### Controller 层（控制器层）

Controller 处理 HTTP 请求，调用 Service：

```typescript
export const UsersController = baseController('user', {
  createRoles: ['admin'],
})(UsersService);
```

## 编程式使用

```typescript
import { CodeGenerator, PrismaSchemaParser } from './common/generator';

// 从 Prisma Schema 解析
const parser = new PrismaSchemaParser();
const resource = parser.parseModel('User');

// 生成代码
const generator = new CodeGenerator();
generator.generate(resource, {
  overwrite: false,
  updateAppModule: true,
  generateI18n: true,
});
```

## 字段配置

### 基本字段

```typescript
{
  name: "title",
  type: "string",
  required: true,
  includeInCreate: true,
  includeInUpdate: true,
  includeInList: true,
  includeInDetail: true,
  validations: [
    {
      type: "required",
      message: "validation.title_required"
    },
    {
      type: "min",
      value: 3,
      message: "validation.title_min_length"
    }
  ]
}
```

### 关联字段

```typescript
{
  name: "categoryId",
  type: "relation",
  required: true,
  relation: {
    model: "Category",
    type: "many-to-one",
    includeInQuery: true
  }
}
```

## 生命周期钩子

在资源定义中启用钩子：

```typescript
{
  hooks: {
    beforeCreate: true,
    afterCreate: true,
    beforeUpdate: true,
    afterUpdate: true,
    beforeDelete: true
  }
}
```

生成器会在 Service 中创建对应的钩子方法模板。

## 自定义方法

在资源定义中添加自定义方法：

```typescript
{
  customMethods: [
    "async findByStatus(status: string) { return this.findMany({ where: { status } }); }"
  ]
}
```

## 权限配置

```typescript
{
  permissions: {
    resource: "user",
    createRoles: ["admin"],
    updateRoles: ["admin", "manager"],
    deleteRoles: ["admin"],
    requireAuth: true
  }
}
```

## 高级用法

### 自定义生成选项

```typescript
generator.generate(resource, {
  outputDir: './src',
  overwrite: true,
  generateDto: true,
  generateRepository: true,  // 生成 Repository 层
  generateService: true,
  generateController: true,
  generateModule: true,
  updateAppModule: true,
  generateI18n: true,
});
```

### 批量生成

```typescript
const parser = new PrismaSchemaParser();
const models = parser.parseAllModels();

models.forEach(model => {
  generator.generate(model, {
    updateAppModule: false, // 最后统一更新
  });
});

// 最后更新 AppModule
// ...
```

## 与 Refine 的对应关系

| Refine 概念 | 本系统对应 |
|------------|-----------|
| Resource | ResourceDefinition |
| Data Provider | BaseCrudService + Repository |
| Resource Actions | CrudOperationsConfig |
| Access Control | PermissionConfig |
| Field Types | FieldConfig.type |
| Validation | FieldConfig.validations |

## 最佳实践

1. **优先使用 Prisma Schema 解析**：自动从 Schema 生成，减少手动配置
2. **使用配置文件**：对于复杂资源，使用 JSON 配置文件
3. **启用生命周期钩子**：在需要数据转换或验证时使用
4. **配置权限**：根据业务需求设置角色和权限
5. **生成后检查**：生成代码后检查并调整生成的代码
6. **保持分层清晰**：Controller -> Service -> Repository -> Database

## 示例

查看 `examples/` 目录下的示例配置文件。

## 故障排除

### 问题：生成的文件已存在

使用 `--overwrite` 标志：

```bash
npm run generate:crud user -- --overwrite
```

### 问题：Prisma Schema 解析失败

确保：
1. `prisma/schema.prisma` 文件存在
2. 模型名称正确
3. Schema 语法正确

### 问题：AppModule 更新失败

手动检查 `src/app.module.ts` 并添加导入和模块注册。
