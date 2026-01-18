# CRUD 代码生成工作流程

本文档说明从产品文档到 CRUD 代码的完整工作流程。

## 工作流程概览

```
┌─────────────────┐
│  产品文档/      │
│  技术文档       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  AI 生成        │
│  resource.json  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  代码生成器     │
│  生成 CRUD 代码 │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  检查与调整     │
│  测试与部署     │
└─────────────────┘
```

## 详细步骤

### 步骤 1: 准备文档

收集以下文档：

1. **产品文档**
   - 实体定义和描述
   - 字段列表及业务规则
   - 权限要求
   - 业务逻辑说明

2. **技术文档**
   - Prisma Schema 定义
   - 数据库表结构
   - API 接口要求
   - 关联关系说明

### 步骤 2: AI 生成 resource.json

使用 AI（如 ChatGPT、Claude、Cursor 等）生成 `resource.json` 配置文件。

**提示词模板：** 参考 [AI_PROMPT_TEMPLATE.md](./AI_PROMPT_TEMPLATE.md)

**示例命令（在 Cursor 中）：**
```
请根据以下文档生成 resource.json：

[粘贴产品文档和技术文档]

参考示例：backend/src/common/generator/examples/product.resource.json
```

### 步骤 3: 保存配置文件

将 AI 生成的配置保存为 JSON 文件：

```bash
# 创建 resources 目录（如果不存在）
mkdir -p resources

# 保存配置文件
# 例如：resources/order.json
```

### 步骤 4: 验证配置（可选）

检查 JSON 格式是否正确：

```bash
# 使用 jq 验证（如果已安装）
cat resources/order.json | jq .

# 或使用 Node.js
node -e "JSON.parse(require('fs').readFileSync('resources/order.json', 'utf-8'))"
```

### 步骤 5: 生成 CRUD 代码

使用代码生成器生成代码：

```bash
# 从配置文件生成
npm run generate:crud order -- --config resources/order.json

# 如果需要覆盖已存在的文件
npm run generate:crud order -- --config resources/order.json --overwrite
```

### 步骤 6: 检查生成的文件

检查生成的文件结构：

```
src/
  order/
    dto/
      create-order.dto.ts
      update-order.dto.ts
    order.repository.ts
    order.service.ts
    order.controller.ts
    order.module.ts
```

### 步骤 7: 调整生成的代码

根据业务需求调整：

1. **Service 层**
   - 实现生命周期钩子（beforeCreate, afterCreate 等）
   - 添加自定义业务逻辑方法

2. **Controller 层**
   - 调整权限配置
   - 添加自定义端点（如果需要）

3. **DTO 层**
   - 调整验证规则
   - 添加自定义验证器

### 步骤 8: 测试

1. **编译检查**
   ```bash
   npm run build
   ```

2. **运行应用**
   ```bash
   npm run start:dev
   ```

3. **测试 API**
   - 使用 Postman 或 curl 测试各个端点
   - 验证权限控制
   - 验证数据验证规则

## 完整示例

### 示例：订单管理模块

**1. 产品文档**
```
订单管理模块
- 订单包含：订单号（唯一）、总金额、用户ID、产品列表
- 权限：管理员可以创建/更新/删除，普通用户只能查看自己的订单
- 业务规则：订单号自动生成，总金额不能为负数
```

**2. 技术文档**
```prisma
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

**3. AI 生成 resource.json**
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
      "includeInCreate": false,
      "includeInUpdate": false,
      "includeInList": true,
      "includeInDetail": true,
      "description": "订单号（自动生成）"
    },
    {
      "name": "totalAmount",
      "type": "number",
      "required": true,
      "includeInCreate": true,
      "includeInUpdate": true,
      "includeInList": true,
      "includeInDetail": true,
      "validations": [
        { "type": "required", "message": "validation.totalAmount_required" },
        { "type": "min", "value": 0, "message": "validation.totalAmount_min" }
      ],
      "description": "订单总金额"
    }
  ],
  "joins": [
    {
      "model": "User",
      "field": "user",
      "includeInList": true,
      "includeInDetail": true,
      "select": ["id", "username", "email"]
    },
    {
      "model": "Product",
      "field": "products",
      "includeInList": true,
      "includeInDetail": true,
      "select": ["id", "name", "price"]
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
    "createRoles": ["admin"],
    "updateRoles": ["admin"],
    "deleteRoles": ["admin"],
    "requireAuth": true
  },
  "defaultPageSize": 20,
  "hooks": {
    "beforeCreate": true
  }
}
```

**4. 生成代码**
```bash
npm run generate:crud order -- --config resources/order.json
```

**5. 调整生成的代码**

在 `order.service.ts` 中实现 `beforeCreate` 钩子：
```typescript
protected async beforeCreate(data: CreateOrderDto): Promise<any> {
  // 自动生成订单号
  return {
    ...data,
    orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };
}
```

## 优势

### 1. 提高开发效率
- AI 自动生成配置，减少手动编写时间
- 代码生成器自动生成 CRUD 代码，减少重复工作

### 2. 保证一致性
- 统一的代码结构和规范
- 统一的权限配置和验证规则

### 3. 降低错误率
- AI 根据文档生成，减少人为错误
- 代码生成器保证代码结构正确

### 4. 易于维护
- 配置文件清晰，易于理解和修改
- 代码结构统一，易于维护

## 注意事项

1. **文档要完整**：确保产品文档和技术文档都完整，AI 才能生成准确的配置
2. **验证生成结果**：生成后要验证配置和代码是否正确
3. **调整业务逻辑**：生成的代码是基础框架，需要根据业务需求调整
4. **测试要充分**：生成后要充分测试，确保功能正常

## 相关文档

- [AI_PROMPT_TEMPLATE.md](./AI_PROMPT_TEMPLATE.md) - AI 提示词模板
- [README.md](./README.md) - 代码生成器文档
- [MULTI_JOIN_GUIDE.md](./MULTI_JOIN_GUIDE.md) - 多表关联配置指南
- [examples/](./examples/) - 示例配置文件
