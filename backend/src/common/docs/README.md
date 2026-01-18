# CRUD 代码生成器

参考 Refine 思想设计的后端 CRUD 代码生成底座系统。

## 📚 文档导航

- **[快速开始](#快速开始)** - 快速上手使用
- **[完整指南](./GUIDE.md)** - 详细使用指南（工作流程、AI 提示词、架构说明等）

## 架构设计

本系统采用**分层架构**：

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

### 各层职责

- **Controller**: 处理 HTTP 请求，参数验证，权限控制
- **Service**: 业务逻辑，数据转换，生命周期钩子
- **Repository**: 数据访问，数据库操作，查询优化（详见 [完整指南](./GUIDE.md#repository-架构)）
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
  joins?: JoinConfig[];       // 关联查询配置
  customEndpoints?: CustomEndpointConfig[];  // 自定义接口端点
  // ...
}
```

## 快速开始

### 方式 1: 从 Prisma Schema 自动生成（推荐）

```bash
npm run generate:crud User -- --from-schema
```

这会自动从 `prisma/schema.prisma` 解析 `User` 模型并生成完整的 CRUD 代码。

### 方式 2: 使用配置文件（推荐用于复杂场景）

**完整工作流程：** 产品文档 → AI 生成 resource.json → 代码生成器 → CRUD 代码

详细流程请参考 [完整指南](./GUIDE.md#工作流程)

1. **使用 AI 生成配置文件**（参考 [完整指南](./GUIDE.md#ai-提示词模板)）
2. **保存为 JSON 文件**，例如 `resources/order.json`
3. **运行生成器**：

```bash
npm run generate:crud order -- --config resources/order.json
```

### 方式 3: 使用默认配置

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
      update-{resource-name}.dto.ts        # 更新 DTO
    {resource-name}.repository.ts          # Repository 层
    {resource-name}.service.ts             # Service 层
    {resource-name}.controller.ts          # Controller 层
    {resource-name}.module.ts              # Module
```

## 核心功能

### 1. 自动生成 Repository 方法

根据 Schema 字段自动生成常用方法，详见 [完整指南](./GUIDE.md#自动生成方法)：

- `status` 字段 → 生成 `updateStatus()` 方法
- `isActive` 字段 → 生成 `activate()`, `deactivate()`, `toggleActive()` 方法
- `deletedAt` 字段 → 生成 `softDelete()`, `restore()`, `findActive()` 方法
- `enabled` 字段 → 生成 `enable()`, `disable()` 方法

### 2. 多表关联查询

支持配置多个关联表，在查询时自动包含关联数据：

```json
{
  "joins": [
    {
      "model": "User",
      "field": "user",
      "joinStrategy": "sql",  // 或 "memory"
      "includeInList": true,
      "includeInDetail": true,
      "select": ["id", "username", "email"],
      "nested": [  // 支持嵌套关联
        {
          "model": "Role",
          "field": "userRoles",
          "select": ["id", "name"]
        }
      ]
    }
  ]
}
```

### 3. 自定义接口端点

支持生成除标准 CRUD 之外的自定义接口：

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
            "required": false
          }
        ]
      }
    }
  ]
}
```

### 4. 生命周期钩子

在资源定义中启用钩子，生成器会在 Service 中创建对应的钩子方法模板：

```json
{
  "hooks": {
    "beforeCreate": true,
    "afterCreate": true,
    "beforeUpdate": true,
    "afterUpdate": true,
    "beforeDelete": true
  }
}
```

### 5. 权限控制

自动生成权限和角色控制：

```json
{
  "permissions": {
    "resource": "order",
    "createRoles": ["admin"],
    "updateRoles": ["admin", "manager"],
    "deleteRoles": ["admin"],
    "requireAuth": true
  }
}
```

## 字段配置示例

### 基本字段

```json
{
  "name": "title",
  "type": "string",
  "required": true,
  "includeInCreate": true,
  "includeInUpdate": true,
  "includeInList": true,
  "includeInDetail": true,
  "validations": [
    {
      "type": "required",
      "message": "validation.title_required"
    },
    {
      "type": "min",
      "value": 3,
      "message": "validation.title_min_length"
    }
  ]
}
```

### 关联字段

```json
{
  "name": "categoryId",
  "type": "relation",
  "required": true,
  "relation": {
    "model": "Category",
    "type": "many-to-one",
    "includeInQuery": true
  }
}
```

## 示例配置文件

查看 `../generator/examples/` 目录下的示例：

- `product.resource.json` - 基础 CRUD 示例
- `simple-join.resource.json` - 简单关联查询示例
- `multi-join.resource.json` - 复杂多级关联示例
- `custom-endpoints.resource.json` - 自定义接口端点示例

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

## 高级用法

### 自定义生成选项

```typescript
generator.generate(resource, {
  outputDir: './src',
  overwrite: true,
  generateDto: true,
  generateRepository: true,
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
```

## 最佳实践

1. **优先使用 Prisma Schema 解析**：自动从 Schema 生成，减少手动配置
2. **使用 AI 生成配置文件**：对于复杂资源，使用 AI 根据文档生成 resource.json（参考 [完整指南](./GUIDE.md#工作流程)）
3. **启用生命周期钩子**：在需要数据转换或验证时使用
4. **配置权限**：根据业务需求设置角色和权限
5. **生成后检查**：生成代码后检查并调整生成的代码
6. **保持分层清晰**：Controller → Service → Repository → Database（详见 [完整指南](./GUIDE.md#repository-架构)）

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

## 相关文档

- [完整指南](./GUIDE.md) - 包含工作流程、AI 提示词模板、Repository 架构、自动生成方法等详细内容
