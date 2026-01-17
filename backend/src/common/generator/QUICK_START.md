# CRUD 代码生成器 - 快速开始

## 简介

这是一个参考 Refine 思想设计的后端 CRUD 代码生成底座系统。它可以根据资源定义自动生成完整的 CRUD 代码，包括 DTO、Service、Controller 和 Module。

## 三种使用方式

### 方式 1: 从 Prisma Schema 自动生成（推荐）

这是最简单的方式，自动从 Prisma Schema 解析模型并生成代码：

```bash
npm run generate:crud User -- --from-schema
```

这会：
1. 从 `prisma/schema.prisma` 解析 `User` 模型
2. 自动识别字段类型和验证规则
3. 生成完整的 CRUD 代码

### 方式 2: 使用配置文件

创建资源定义文件 `resources/product.json`：

```json
{
  "name": "product",
  "pluralName": "products",
  "prismaModel": "Product",
  "fields": [
    {
      "name": "name",
      "type": "string",
      "required": true,
      "validations": [
        { "type": "required", "message": "validation.name_required" }
      ]
    },
    {
      "name": "price",
      "type": "number",
      "required": true,
      "validations": [
        { "type": "required", "message": "validation.price_required" },
        { "type": "min", "value": 0 }
      ]
    }
  ],
  "permissions": {
    "resource": "product",
    "createRoles": ["admin"]
  }
}
```

然后运行：

```bash
npm run generate:crud product -- --config resources/product.json
```

### 方式 3: 使用默认配置

快速生成基础 CRUD 代码：

```bash
npm run generate:crud product
```

## 生成的文件结构

```
src/
  product/
    dto/
      create-product.dto.ts      # 创建 DTO
      update-product.dto.ts      # 更新 DTO
    product.repository.ts        # Repository/DAO 层
    product.service.ts           # Service 类
    product.controller.ts         # Controller 类
    product.module.ts            # Module 类
```

## 分层架构

生成器会创建完整的分层架构：

- **Controller 层**：处理 HTTP 请求
- **Service 层**：业务逻辑和生命周期钩子
- **Repository 层**：数据访问（DAO）
- **Database**：通过 Prisma 访问数据库

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

## 常用选项

### 覆盖已存在的文件

```bash
npm run generate:crud product -- --overwrite
```

### 只生成特定文件

在代码中使用：

```typescript
generator.generate(resource, {
  generateDto: true,
  generateService: true,
  generateController: false,  // 不生成 Controller
  generateModule: true,
});
```

## 下一步

生成代码后：

1. **检查生成的文件**：查看 `src/{resource-name}/` 目录
2. **调整 Service**：根据需要实现生命周期钩子
3. **调整 Controller**：添加自定义端点（如果需要）
4. **更新 AppModule**：确保模块已正确导入（如果未自动更新）
5. **测试 API**：运行应用并测试生成的端点

## 示例

查看 `examples/product.resource.json` 了解完整的资源定义示例。

## 更多信息

查看 [README.md](./README.md) 了解详细文档。
