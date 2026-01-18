# AI 生成 Resource.json 提示词模板

这个模板帮助 AI 根据产品文档和技术文档生成 `resource.json` 配置文件。

## 使用场景

**工作流程：**
```
产品文档/技术文档 → AI 生成 resource.json → 代码生成器 → CRUD 代码
```

## 提示词模板

### 基础模板

```
请根据以下产品文档和技术文档，生成一个 resource.json 配置文件。

## 产品文档
[粘贴产品文档内容]

## 技术文档
[粘贴技术文档内容，包括 Prisma Schema 等]

## 要求
1. 根据文档中的实体定义，生成完整的 resource.json 配置
2. 确保字段类型、验证规则、权限配置等符合文档要求
3. 如果文档中提到关联关系，请配置 joins 字段
4. 参考以下示例格式：

[粘贴 resource.json 示例]

## 输出
只输出 JSON 格式的 resource.json 配置，不要包含其他说明文字。
```

### 详细模板（推荐）

```
你是一个专业的后端开发助手。请根据提供的产品文档和技术文档，生成一个符合规范的 resource.json 配置文件。

## 产品文档
[粘贴产品需求文档，包括：
- 实体名称和描述
- 字段列表及业务规则
- 权限要求
- 业务逻辑说明
]

## 技术文档
[粘贴技术文档，包括：
- Prisma Schema 定义
- 数据库表结构
- API 接口要求
- 关联关系说明
]

## 配置要求

### 1. 基本信息
- `name`: 资源名称（单数，小写，如 "product"）
- `pluralName`: 复数形式（如 "products"）
- `path`: 路由路径（如 "products"）
- `prismaModel`: Prisma 模型名称（首字母大写，如 "Product"）
- `description`: 资源描述

### 2. 字段配置 (fields)
每个字段需要包含：
- `name`: 字段名称
- `type`: 字段类型（string, number, boolean, date, enum, relation）
- `required`: 是否必填
- `includeInCreate`: 是否在创建时包含
- `includeInUpdate`: 是否在更新时包含
- `includeInList`: 是否在列表查询时包含
- `includeInDetail`: 是否在详情查询时包含
- `validations`: 验证规则数组
- `description`: 字段描述

### 3. 验证规则 (validations)
根据业务需求添加：
- `type`: "required" | "email" | "min" | "max" | "pattern"
- `value`: 验证参数值
- `message`: 错误消息（i18n key，格式：validation.field_name_required）

### 4. 操作配置 (operations)
- `create`: 是否启用创建
- `read`: 是否启用读取
- `update`: 是否启用更新
- `delete`: 是否启用删除
- `list`: 是否启用列表查询
- `batchDelete`: 是否启用批量删除

### 5. 权限配置 (permissions)
- `resource`: 资源名称（用于权限检查）
- `createRoles`: 创建操作需要的角色数组
- `updateRoles`: 更新操作需要的角色数组
- `deleteRoles`: 删除操作需要的角色数组
- `requireAuth`: 是否需要认证（默认：true）

### 6. 多表关联配置 (joins)
如果需要在查询时包含关联表数据，配置 joins：
```json
{
  "joins": [
    {
      "model": "User",
      "field": "user",
      "joinStrategy": "sql",
      "includeInList": true,
      "includeInDetail": true,
      "select": ["id", "username", "email"]
    }
  ]
}
```

### 7. 生命周期钩子 (hooks)
根据业务需求启用：
- `beforeCreate`: 创建前处理
- `afterCreate`: 创建后处理
- `beforeUpdate`: 更新前处理
- `afterUpdate`: 更新后处理
- `beforeDelete`: 删除前处理

### 8. 自定义接口端点 (customEndpoints)
如果需要生成除标准 CRUD 之外的自定义接口，配置 customEndpoints：

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
            "required": false,
            "description": "开始日期"
          },
          {
            "name": "endDate",
            "type": "date",
            "required": false,
            "description": "结束日期"
          }
        ]
      }
    },
    {
      "path": "export",
      "method": "post",
      "description": "导出订单数据",
      "requireAuth": true,
      "roles": ["admin"],
      "permission": "order:export",
      "params": {
        "body": {
          "type": "ExportOrderDto",
          "description": "导出参数"
        }
      }
    },
    {
      "path": "batch-update/:id",
      "method": "patch",
      "description": "批量更新订单状态",
      "serviceMethod": "batchUpdateStatus",
      "requireAuth": true,
      "roles": ["admin"],
      "permission": "order:update",
      "params": {
        "path": [":id"],
        "body": {
          "type": "BatchUpdateOrderDto"
        }
      }
    }
  ]
}
```

**配置说明：**
- `path`: 端点路径（相对于资源路径，如 'statistics', 'export', 'custom-action/:id'）
- `method`: HTTP 方法（'get', 'post', 'put', 'patch', 'delete'）
- `description`: 端点描述（可选）
- `serviceMethod`: Service 方法名称（可选，不提供则自动生成）
- `requireAuth`: 是否需要认证（可选，默认继承资源的 requireAuth）
- `roles`: 需要的角色列表（可选）
- `permission`: 需要的权限（格式：'resource:action'，如 'order:export'）
- `params`: 参数配置
  - `path`: 路径参数数组（如 [":id", ":status"]）
  - `query`: 查询参数数组
  - `body`: 请求体参数（仅 POST/PUT/PATCH）

**使用场景示例：**
1. **统计数据接口**：`GET /orders/statistics?startDate=2024-01-01&endDate=2024-12-31`
2. **导出接口**：`POST /orders/export`（带请求体）
3. **批量操作**：`PATCH /orders/batch-update/:id`（带路径参数和请求体）
4. **自定义查询**：`GET /orders/search?keyword=xxx&status=active`

配置后，生成器会自动：
- 在 Service 中生成对应的方法（方法体需要手动实现）
- 在 Controller 中生成对应的端点（包含权限和角色控制）

## 参考示例

参考以下示例文件：
- `examples/product.resource.json` - 基础 CRUD 示例
- `examples/simple-join.resource.json` - 多表关联示例
- `examples/multi-join.resource.json` - 复杂多级关联示例

**注意**：如果技术文档或接口需求中提到了除标准 CRUD 之外的自定义接口（如统计数据、导出、批量操作等），请在 `customEndpoints` 中配置这些接口。

## 输出格式

只输出 JSON 格式的 resource.json 配置，确保：
1. JSON 格式正确，可以解析
2. 所有必填字段都已包含
3. 字段类型与 Prisma Schema 一致
4. 验证规则符合业务需求
5. 权限配置符合安全要求

开始生成：
```

## 使用示例

### 示例 1: 简单实体

**输入：**
```
产品文档：
- 产品管理模块
- 字段：名称（必填）、价格（必填，>=0）、库存（必填，>=0）、状态（枚举：active/inactive）

技术文档：
Prisma Schema:
model Product {
  id          String   @id @default(uuid())
  name        String
  price       Float
  stock       Int
  status      String   @default("active")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**AI 应该生成：**
```json
{
  "name": "product",
  "pluralName": "products",
  "path": "products",
  "prismaModel": "Product",
  "description": "产品资源",
  "fields": [
    {
      "name": "name",
      "type": "string",
      "required": true,
      "includeInCreate": true,
      "includeInUpdate": true,
      "includeInList": true,
      "includeInDetail": true,
      "validations": [
        { "type": "required", "message": "validation.name_required" }
      ],
      "description": "产品名称"
    },
    {
      "name": "price",
      "type": "number",
      "required": true,
      "includeInCreate": true,
      "includeInUpdate": true,
      "includeInList": true,
      "includeInDetail": true,
      "validations": [
        { "type": "required", "message": "validation.price_required" },
        { "type": "min", "value": 0, "message": "validation.price_min" }
      ],
      "description": "产品价格"
    },
    {
      "name": "stock",
      "type": "number",
      "required": true,
      "includeInCreate": true,
      "includeInUpdate": true,
      "includeInList": true,
      "includeInDetail": true,
      "validations": [
        { "type": "required", "message": "validation.stock_required" },
        { "type": "min", "value": 0, "message": "validation.stock_min" }
      ],
      "description": "库存数量"
    },
    {
      "name": "status",
      "type": "enum",
      "required": true,
      "defaultValue": "active",
      "enumValues": ["active", "inactive"],
      "includeInCreate": true,
      "includeInUpdate": true,
      "includeInList": true,
      "includeInDetail": true,
      "description": "产品状态"
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
    "resource": "product",
    "requireAuth": true
  },
  "defaultPageSize": 20
}
```

### 示例 2: 带关联的实体

**输入：**
```
产品文档：
- 订单管理
- 订单包含：订单号、总金额、用户信息、产品列表

技术文档：
Prisma Schema:
model Order {
  id          String   @id @default(uuid())
  orderNumber String   @unique
  totalAmount Float
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  products    Product[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**AI 应该生成包含 joins 配置的 resource.json**

### 示例 3: 带自定义接口的实体

**输入：**
```
产品文档：
- 订单管理
- 需要提供：订单列表、订单详情、创建订单、更新订单、删除订单
- 额外接口：订单统计数据、导出订单、批量更新订单状态

技术文档：
Prisma Schema:
model Order {
  id          String   @id @default(uuid())
  orderNumber String   @unique
  totalAmount Float
  status      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

接口需求：
1. GET /orders/statistics - 获取订单统计数据（需要admin角色）
2. POST /orders/export - 导出订单数据（需要admin角色）
3. PATCH /orders/batch-update/:id - 批量更新订单状态（需要admin角色）
```

**AI 应该生成包含 customEndpoints 配置的 resource.json：**
```json
{
  "name": "order",
  "pluralName": "orders",
  "path": "orders",
  "prismaModel": "Order",
  "description": "订单资源",
  "fields": [
    {
      "name": "orderNumber",
      "type": "string",
      "required": true,
      "includeInCreate": true,
      "includeInUpdate": false,
      "includeInList": true,
      "includeInDetail": true,
      "description": "订单号"
    },
    {
      "name": "totalAmount",
      "type": "number",
      "required": true,
      "includeInCreate": true,
      "includeInUpdate": true,
      "includeInList": true,
      "includeInDetail": true,
      "description": "订单总金额"
    },
    {
      "name": "status",
      "type": "string",
      "required": true,
      "includeInCreate": true,
      "includeInUpdate": true,
      "includeInList": true,
      "includeInDetail": true,
      "description": "订单状态"
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
    "resource": "order",
    "requireAuth": true,
    "createRoles": ["user", "admin"],
    "updateRoles": ["admin"]
  },
  "customEndpoints": [
    {
      "path": "statistics",
      "method": "get",
      "description": "获取订单统计数据",
      "requireAuth": true,
      "roles": ["admin"],
      "permission": "order:read",
      "params": {
        "query": [
          {
            "name": "startDate",
            "type": "date",
            "required": false,
            "description": "开始日期"
          },
          {
            "name": "endDate",
            "type": "date",
            "required": false,
            "description": "结束日期"
          }
        ]
      }
    },
    {
      "path": "export",
      "method": "post",
      "description": "导出订单数据",
      "requireAuth": true,
      "roles": ["admin"],
      "permission": "order:export",
      "params": {
        "body": {
          "type": "ExportOrderDto",
          "description": "导出参数"
        }
      }
    },
    {
      "path": "batch-update/:id",
      "method": "patch",
      "description": "批量更新订单状态",
      "serviceMethod": "batchUpdateStatus",
      "requireAuth": true,
      "roles": ["admin"],
      "permission": "order:update",
      "params": {
        "path": [":id"],
        "body": {
          "type": "BatchUpdateOrderDto"
        }
      }
    }
  ]
}
```

## 验证步骤

生成 resource.json 后，建议：

1. **格式验证**：确保 JSON 格式正确
   ```bash
   cat resource.json | jq .
   ```

2. **运行生成器测试**：
   ```bash
   npm run generate:crud test -- --config resource.json --overwrite
   ```

3. **检查生成的文件**：
   - 检查 DTO 是否正确
   - 检查 Service 是否包含必要的逻辑（包括自定义方法）
   - 检查 Controller 权限配置是否正确（包括自定义端点）
   - 检查自定义端点的参数配置是否正确

## 常见问题

### Q: AI 生成的配置缺少某些字段？
A: 在提示词中明确要求包含所有字段，并提供完整的示例。

### Q: 关联关系配置不正确？
A: 确保在技术文档中提供了 Prisma Schema，特别是关联字段的定义。

### Q: 验证规则不符合业务需求？
A: 在产品文档中明确说明业务规则，AI 会根据规则生成验证配置。

### Q: 如何配置自定义接口？
A: 在技术文档中明确列出所有需要的自定义接口（除标准 CRUD 之外），包括：
- 接口路径
- HTTP 方法
- 需要的参数（路径参数、查询参数、请求体）
- 权限要求（角色、权限）
AI 会根据这些信息生成 `customEndpoints` 配置。

## 最佳实践

1. **提供完整的文档**：产品文档和技术文档都要完整
2. **明确业务规则**：特别是验证规则和权限要求
3. **提供参考示例**：让 AI 参考已有的 resource.json 示例
4. **验证生成结果**：生成后运行生成器测试，检查输出
5. **迭代优化**：根据生成结果调整提示词

## 相关文档

- [README.md](./README.md) - 代码生成器完整文档
- [MULTI_JOIN_GUIDE.md](./MULTI_JOIN_GUIDE.md) - 多表关联配置指南
- [examples/](./examples/) - 示例配置文件
