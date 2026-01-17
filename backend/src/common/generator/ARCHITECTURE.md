# CRUD 代码生成器架构说明

## 系统概述

本系统参考 Refine 的设计思想，提供了一个完整的后端 CRUD 代码生成底座。核心思想是**资源定义（Resource Definition）**，通过定义资源的结构和配置，自动生成完整的 CRUD 代码。

## 架构设计

### 代码生成器架构

```
┌─────────────────────────────────────────────────────────┐
│                    CLI / 编程式 API                       │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  CodeGenerator                          │
│  (协调各个生成器，生成完整的 CRUD 代码)                    │
└───┬───────┬───────┬───────┬───────┬───────┬───────────┘
    │       │       │       │       │       │
    ▼       ▼       ▼       ▼       ▼       ▼
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│ DTO  │ │Repo  │ │Service│ │Ctrl  │ │Module│ │I18n  │
│ Gen  │ │Gen   │ │Gen    │ │Gen   │ │Gen   │ │Gen   │
└──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘
    │       │       │       │       │       │
    └───────┴───────┴───────┴───────┴───────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              ResourceDefinition                         │
│  (资源定义：字段、操作、权限等配置)                        │
└───────────────────────┬───────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
┌──────────────┐              ┌──────────────┐
│ Prisma       │              │ 配置文件      │
│ Schema       │              │ (JSON)       │
│ Parser       │              │              │
└──────────────┘              └──────────────┘
```

### 运行时架构（分层架构）

```
┌─────────────────────────────────────────────────────────┐
│                    Controller 层                         │
│  (处理 HTTP 请求、参数验证、权限控制)                       │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                    Service 层                           │
│  (业务逻辑、数据转换、生命周期钩子)                          │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  Repository/DAO 层                        │
│  (数据访问、数据库操作、查询优化)                          │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                    Database                              │
│  (通过 Prisma 访问数据库)                                 │
└─────────────────────────────────────────────────────────┘
```

## 核心组件

### 1. ResourceDefinition（资源定义）

这是系统的核心，类似于 Refine 的 Resource 概念：

```typescript
interface ResourceDefinition {
  name: string;              // 资源名称
  prismaModel: string;       // Prisma 模型
  fields: FieldConfig[];     // 字段配置
  operations?: CrudOperationsConfig;  // 操作配置
  permissions?: PermissionConfig;     // 权限配置
  // ...
}
```

### 2. PrismaSchemaParser（Prisma Schema 解析器）

自动从 Prisma Schema 文件解析模型定义：

- 解析模型名称
- 解析字段类型和属性
- 自动识别验证规则
- 转换为 ResourceDefinition

### 3. CodeGenerator（代码生成器）

协调各个生成器，生成完整的 CRUD 代码：

- DTO 生成器
- Service 生成器
- Controller 生成器
- Module 生成器
- AppModule 更新
- 国际化文件生成

### 4. 各个生成器

#### DtoGenerator
- 生成 Create DTO（包含验证装饰器）
- 生成 Update DTO（继承 Create DTO）

#### RepositoryGenerator
- 生成继承 BaseCrudRepository 的 Repository
- 封装数据访问逻辑
- 生成 defaultSelect 配置

#### ServiceGenerator
- 生成继承 BaseCrudService 的 Service
- 使用 Repository 进行数据访问
- 生成生命周期钩子模板

#### ControllerGenerator
- 使用 baseController 工厂函数生成 Controller
- 配置权限和角色
- 生成标准 CRUD 端点

#### ModuleGenerator
- 生成 NestJS Module
- 配置导入、控制器、提供者（包括 Repository）

## 数据流

### 代码生成流程

```
1. 用户输入（CLI 或编程式）
   ↓
2. 解析资源定义
   - 从 Prisma Schema 解析，或
   - 从配置文件加载，或
   - 手动定义
   ↓
3. 生成代码
   - DTO
   - Repository (DAO)
   - Service
   - Controller
   - Module
   ↓
4. 更新项目文件
   - AppModule
   - 国际化文件
   ↓
5. 完成
```

### 运行时数据流

```
HTTP Request
   ↓
Controller (参数验证、权限检查)
   ↓
Service (业务逻辑、数据转换)
   ↓
Repository (数据访问)
   ↓
Prisma (数据库查询)
   ↓
Database
   ↓
Prisma (返回数据)
   ↓
Repository (返回数据)
   ↓
Service (业务处理)
   ↓
Controller (HTTP Response)
```

## 与 Refine 的对应关系

| Refine 概念 | 本系统实现 | 说明 |
|------------|-----------|------|
| Resource | ResourceDefinition | 资源定义，描述数据模型和操作 |
| Data Provider | BaseCrudService | 统一的数据访问接口 |
| Resource Actions | CrudOperationsConfig | CRUD 操作配置 |
| Access Control | PermissionConfig | 权限和角色配置 |
| Field Types | FieldConfig.type | 字段类型定义 |
| Validation | FieldConfig.validations | 验证规则 |
| Hooks | ResourceDefinition.hooks | 生命周期钩子 |

## 扩展点

### 1. 自定义生成器

可以创建自定义生成器来生成其他类型的代码：

```typescript
class CustomGenerator {
  generate(resource: ResourceDefinition): string {
    // 自定义生成逻辑
  }
}
```

### 2. 自定义字段类型

在 `FieldConfig.type` 中添加新的字段类型，并在生成器中处理。

### 3. 自定义验证规则

在 `ValidationRule` 中添加新的验证类型，并在 DTO 生成器中实现。

### 4. 自定义模板

可以创建自定义模板文件，使用模板引擎（如 Handlebars）来生成代码。

## 设计原则

1. **约定优于配置**：提供合理的默认值，减少配置
2. **可扩展性**：易于添加新的生成器和功能
3. **类型安全**：使用 TypeScript 确保类型安全
4. **可组合性**：各个组件可以独立使用
5. **参考 Refine**：借鉴 Refine 的优秀设计思想

## 未来改进

1. **模板引擎**：使用 Handlebars 或类似工具支持自定义模板
2. **增量生成**：只生成变更的部分
3. **代码格式化**：自动格式化生成的代码
4. **测试生成**：自动生成单元测试和 E2E 测试
5. **API 文档生成**：自动生成 Swagger/OpenAPI 文档
6. **前端代码生成**：参考 Refine，生成前端 CRUD 页面

## 使用建议

1. **优先使用 Prisma Schema 解析**：自动从 Schema 生成，减少手动配置
2. **使用配置文件管理复杂资源**：对于有特殊需求的资源，使用 JSON 配置文件
3. **生成后检查代码**：生成后检查并调整生成的代码
4. **版本控制**：将生成的代码纳入版本控制，但可以忽略模板文件
5. **文档化**：为自定义的资源定义添加注释和文档
