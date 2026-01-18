# 代码生成器示例文件

本目录包含各种场景的资源定义示例文件，按场景分类组织，方便快速查找和使用。

## 📁 目录结构

```
examples/
├── README.md                          # 本文件 - 示例文件总览和关系绑定功能指南
├── rbac/                              # RBAC权限系统场景
│   ├── user-rbac.resource.json       # 用户资源（包含Role绑定）
│   ├── role-rbac.resource.json       # 角色资源（包含Permission绑定）
│   └── permission-rbac.resource.json # 权限资源
├── ecommerce/                        # 电商系统场景
│   ├── product.resource.json         # 产品资源
│   └── order-product-binding.resource.json # 订单资源（包含Product绑定）
└── content/                          # 内容管理系统场景
    └── article-tag-binding.resource.json # 文章资源（包含Tag绑定）
```

## 🎯 场景说明

### RBAC权限系统 (`rbac/`)

适用于权限管理系统，展示用户、角色、权限之间的多对多关系绑定：

- **user-rbac.resource.json**: User绑定Role的完整示例
- **role-rbac.resource.json**: Role绑定Permission的完整示例
- **permission-rbac.resource.json**: 基础权限资源定义

**使用场景**：权限管理、用户角色分配、角色权限配置

### 电商系统 (`ecommerce/`)

适用于电商平台，展示订单和产品的关联：

- **product.resource.json**: 基础产品资源定义（标准CRUD）
- **order-product-binding.resource.json**: Order绑定Product的示例（包含关联查询）

**使用场景**：订单管理、产品管理、订单产品关联

### 内容管理 (`content/`)

适用于内容管理系统，展示文章和标签的关联：

- **article-tag-binding.resource.json**: Article绑定Tag的示例（包含独立端点）

**使用场景**：文章管理、标签系统、内容分类

## 🚀 快速开始

### 方式1：直接使用示例文件

```bash
# 使用RBAC示例生成User资源
npm run generate:crud -- examples/rbac/user-rbac.resource.json

# 使用电商示例生成Order资源
npm run generate:crud -- examples/ecommerce/order-product-binding.resource.json
```

### 方式2：参考示例创建自己的资源定义

1. 复制对应的示例文件到你的项目
2. 根据你的Prisma Schema修改配置：
   - 修改 `prismaModel` 名称
   - 调整 `fields` 配置
   - 修改 `relationBindings` 中的配置（根据关系类型配置中间表或外键字段）
3. 运行代码生成器

### 方式3：查看详细文档

- **关系绑定功能**：查看本文档的 [关系绑定功能使用指南](#-关系绑定功能使用指南) 章节
- **代码生成器完整文档**：查看 [`../docs/GUIDE.md`](../docs/GUIDE.md)
- **API文档**：查看 [`../docs/README.md`](../docs/README.md)

## 📋 示例文件说明

| 文件 | 场景 | 主要特性 |
|------|------|---------|
| `rbac/user-rbac.resource.json` | RBAC | 多对多绑定、关联查询 |
| `rbac/role-rbac.resource.json` | RBAC | 多对多绑定、关联查询 |
| `rbac/permission-rbac.resource.json` | RBAC | 基础CRUD |
| `ecommerce/product.resource.json` | 电商 | 基础CRUD、字段验证 |
| `ecommerce/order-product-binding.resource.json` | 电商 | 多对多绑定、关联查询 |
| `content/article-tag-binding.resource.json` | 内容 | 多对多绑定、独立端点 |

## ⚠️ 注意事项

1. **Prisma Schema匹配**：
   - 示例文件中的 `prismaModel` 名称必须与你的Prisma Schema中的模型名称一致
   - 字段名称必须与Prisma Schema中的字段名称一致

2. **关系绑定**：
   - **多对多关系**：确保中间表已在Prisma Schema中正确定义，中间表的外键字段名必须与配置中的 `currentModelForeignKey` 和 `relatedModelForeignKey` 一致
   - **一对一/一对多关系**：确保外键字段已在Prisma Schema中正确定义，外键字段名必须与配置中的 `foreignKeyField` 一致
   - 详细配置说明请查看本文档的 [关系绑定功能使用指南](#-关系绑定功能使用指南) 章节

3. **关联查询**：
   - `joins` 配置中的 `field` 名称必须与Prisma Schema中的关联字段名一致
   - 嵌套关联需要确保Prisma Schema中已正确定义

## 📖 关系绑定功能使用指南

### 概述

代码生成器支持自动生成关系绑定操作的代码。当你在Update操作中需要同步处理数据库关系时（一对一、一对多、多对多），这个功能可以大大简化开发工作。

**重要**：绑定功能不局限于多对多关系，支持所有关系类型。根据数据库的实际关系类型，代码生成器会自动生成相应的绑定逻辑。

### 适用场景

这个功能适用于**任何需要关系绑定**的场景（一对一、一对多、多对多）：

| 关系类型 | 场景示例 | 说明 |
|---------|---------|------|
| **一对一** | User ↔ Profile, Order ↔ Invoice | 使用外键字段直接更新 |
| **一对多** | Category ↔ Product, User ↔ Order | 使用外键字段直接更新 |
| **多对多** | User ↔ Role, Order ↔ Product | 通过中间表处理 |

### 功能特性

1. **自动生成Update DTO字段**：在Update DTO中自动添加关系字段
   - 多对多：数组类型（如`roleIds: string[]`）
   - 一对一/一对多：单个ID类型（如`categoryId: string`）
2. **自动处理绑定逻辑**：在Service的`update`方法中根据关系类型自动处理
   - 多对多：通过中间表添加/删除关联
   - 一对一/一对多：直接更新外键字段
3. **可选独立端点**：可以生成独立的绑定/解绑端点

### 配置说明

在资源定义JSON文件中添加`relationBindings`配置：

```json
{
  "name": "user",
  "prismaModel": "User",
  "relationBindings": [
    {
      "field": "userRoles",
      "relatedModel": "Role",
      "junctionModel": "UserRole",
      "currentModelForeignKey": "userId",
      "relatedModelForeignKey": "roleId",
      "dtoFieldName": "roleIds",
      "handleInUpdate": true,
      "generateStandaloneEndpoints": false,
      "description": "用户角色绑定"
    }
  ]
}
```

#### 配置字段详解

| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| `field` | string | ✅ | 在当前模型中的关联字段名（Prisma Schema中定义的字段名） | `"userRoles"` |
| `relatedModel` | string | ✅ | 关联的模型名称（Prisma模型名） | `"Role"` |
| `junctionModel` | string | ✅ | 中间表模型名称（Prisma模型名） | `"UserRole"` |
| `currentModelForeignKey` | string | ✅ | 当前模型在中间表中的外键字段名 | `"userId"` |
| `relatedModelForeignKey` | string | ✅ | 关联模型在中间表中的外键字段名 | `"roleId"` |
| `dtoFieldName` | string | ❌ | Update DTO中的字段名（默认：`relatedModel`的小写形式 + "Ids"） | `"roleIds"` |
| `handleInUpdate` | boolean | ❌ | 是否在Update操作中自动处理绑定（默认：`true`） | `true` |
| `generateStandaloneEndpoints` | boolean | ❌ | 是否生成独立的绑定/解绑端点（默认：`false`） | `false` |
| `description` | string | ❌ | 绑定操作的描述（用于文档） | `"用户角色绑定"` |

### 使用示例

#### 示例1：User绑定Role（RBAC场景）

```json
{
  "name": "user",
  "prismaModel": "User",
  "relationBindings": [
    {
      "field": "userRoles",
      "relatedModel": "Role",
      "junctionModel": "UserRole",
      "currentModelForeignKey": "userId",
      "relatedModelForeignKey": "roleId",
      "dtoFieldName": "roleIds",
      "handleInUpdate": true
    }
  ]
}
```

**完整示例文件**：`rbac/user-rbac.resource.json`

#### 示例2：Order绑定Product（电商场景）

```json
{
  "name": "order",
  "prismaModel": "Order",
  "relationBindings": [
    {
      "field": "orderProducts",
      "relatedModel": "Product",
      "junctionModel": "OrderProduct",
      "currentModelForeignKey": "orderId",
      "relatedModelForeignKey": "productId",
      "dtoFieldName": "productIds",
      "handleInUpdate": true,
      "description": "订单产品绑定"
    }
  ]
}
```

**完整示例文件**：`ecommerce/order-product-binding.resource.json`

#### 示例3：Article绑定Tag（内容管理场景，启用独立端点）

```json
{
  "name": "article",
  "prismaModel": "Article",
  "relationBindings": [
    {
      "field": "articleTags",
      "relatedModel": "Tag",
      "junctionModel": "ArticleTag",
      "currentModelForeignKey": "articleId",
      "relatedModelForeignKey": "tagId",
      "dtoFieldName": "tagIds",
      "handleInUpdate": true,
      "generateStandaloneEndpoints": true,
      "description": "文章标签绑定"
    }
  ]
}
```

**完整示例文件**：`content/article-tag-binding.resource.json`

#### 示例4：Product绑定Category（一对多关系）

```json
{
  "name": "product",
  "prismaModel": "Product",
  "relationBindings": [
    {
      "field": "category",
      "relatedModel": "Category",
      "relationType": "many-to-one",
      "foreignKeyField": "categoryId",
      "dtoFieldName": "categoryId",
      "handleInUpdate": true,
      "description": "产品分类绑定"
    }
  ]
}
```

#### 示例5：User绑定Profile（一对一关系）

```json
{
  "name": "user",
  "prismaModel": "User",
  "relationBindings": [
    {
      "field": "profile",
      "relatedModel": "Profile",
      "relationType": "one-to-one",
      "foreignKeyField": "profileId",
      "dtoFieldName": "profileId",
      "handleInUpdate": true,
      "description": "用户资料绑定"
    }
  ]
}
```

### 生成的代码结构

#### Update DTO

生成的Update DTO会自动包含关系字段：

```typescript
export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roleIds?: string[];  // 自动生成的关系字段
}
```

#### Service方法

生成的Service会自动处理绑定逻辑：

```typescript
async update(id: string, updateDto: UpdateUserDto) {
  // 分离关系绑定字段和普通字段
  const { roleIds, ...updateData } = updateDto as any;
  
  // 先执行基础更新
  const result = await super.update(id, updateData);
  
  // 处理多对多关系绑定
  if (roleIds !== undefined) {
    await this.handleUserRolesBinding(id, roleIds);
  }
  
  return result;
}

// 自动生成的绑定处理方法
private async handleUserRolesBinding(id: string, roleIds: string[]) {
  // 获取当前所有关联记录
  const currentBindings = await this.prisma.userRole.findMany({
    where: { userId: id },
  });

  const currentIds = currentBindings.map(b => b.roleId);
  const newIds = roleIds || [];
  
  // 计算需要添加和删除的关联
  const toAdd = newIds.filter(id => !currentIds.includes(id));
  const toRemove = currentIds.filter(id => !newIds.includes(id));

  // 删除不再需要的关联
  if (toRemove.length > 0) {
    await this.prisma.userRole.deleteMany({
      where: {
        userId: id,
        roleId: { in: toRemove },
      },
    });
  }

  // 添加新的关联
  if (toAdd.length > 0) {
    await this.prisma.userRole.createMany({
      data: toAdd.map(roleId => ({
        userId: id,
        roleId,
      })),
      skipDuplicates: true,
    });
  }
}
```

### API使用示例

#### 方式1：通过Update操作绑定（推荐）

这是最常用的方式，在更新资源的同时处理绑定：

```bash
# 更新用户并绑定角色
PATCH /users/:id
Content-Type: application/json

{
  "nickname": "新昵称",
  "roleIds": ["role-id-1", "role-id-2"]
}

# 更新订单并绑定产品
PATCH /orders/:id
Content-Type: application/json

{
  "status": "processing",
  "productIds": ["product-id-1", "product-id-2", "product-id-3"]
}

# 更新文章并绑定标签
PATCH /articles/:id
Content-Type: application/json

{
  "title": "新标题",
  "tagIds": ["tag-id-1", "tag-id-2"]
}
```

#### 方式2：独立绑定端点（可选）

如果设置了`generateStandaloneEndpoints: true`，会生成独立的绑定/解绑端点：

```bash
# 绑定标签
POST /articles/:id/bind-articleTags
Content-Type: application/json

{
  "tagIds": ["tag-id-1", "tag-id-2"]
}

# 解绑标签
DELETE /articles/:id/unbind-articleTags/:tagId
```

### 工作原理

#### Update操作流程

1. **接收请求**：接收包含关系ID数组的Update DTO
2. **分离字段**：将关系字段和普通字段分离
3. **基础更新**：先执行基础字段的更新
4. **绑定处理**：比较当前绑定和新绑定，自动添加/删除差异

#### 绑定处理逻辑

1. **查询当前绑定**：查询当前所有关联记录
2. **计算差异**：
   - 需要添加的ID = 新ID中不在当前ID中的
   - 需要删除的ID = 当前ID中不在新ID中的
3. **执行操作**：
   - 删除不再需要的关联
   - 添加新的关联（使用`skipDuplicates: true`避免重复）

### 注意事项

#### Prisma Schema要求

- ✅ 中间表必须存在且字段名匹配
- ✅ 外键字段名必须正确配置
- ✅ 关联字段名必须与Prisma Schema中的字段名一致

#### 性能考虑

- ⚡ 绑定操作会在每次Update时执行
- ⚡ 如果关系字段未提供（`undefined`），则不会执行绑定操作
- ⚡ 如果关系字段为空数组（`[]`），会删除所有现有绑定

#### 数据一致性

- 🔒 代码生成器不会验证关联ID是否存在
- 💡 建议在Service的`beforeUpdate`钩子中添加验证逻辑：

```typescript
protected async beforeUpdate(id: string, data: UpdateUserDto): Promise<any> {
  if (data.roleIds) {
    // 验证所有角色ID是否存在
    const roles = await this.prisma.role.findMany({
      where: { id: { in: data.roleIds } },
    });
    
    if (roles.length !== data.roleIds.length) {
      throw new BadRequestException('部分角色ID不存在');
    }
  }
  
  return data;
}
```

### 完整示例文件

参考以下示例文件（按场景分类）：

**RBAC场景** (`rbac/`)：
- `rbac/user-rbac.resource.json` - User资源定义（包含Role绑定）
- `rbac/role-rbac.resource.json` - Role资源定义（包含Permission绑定）
- `rbac/permission-rbac.resource.json` - Permission资源定义

**电商场景** (`ecommerce/`)：
- `ecommerce/order-product-binding.resource.json` - Order资源定义（包含Product绑定）
- `ecommerce/product.resource.json` - Product资源定义

**内容管理场景** (`content/`)：
- `content/article-tag-binding.resource.json` - Article资源定义（包含Tag绑定，启用独立端点）

### 总结

通过配置`relationBindings`，代码生成器可以自动生成处理关系绑定的代码，适用于**任何需要关系绑定**的场景（一对一、一对多、多对多）。

**使用步骤**：
1. ✅ 在资源定义中添加`relationBindings`配置
2. ✅ 根据数据库的实际关系类型配置相应的字段（多对多需要中间表配置，一对一/一对多需要外键字段配置）
3. ✅ 运行代码生成器
4. ✅ 在Update操作中使用关系字段即可

代码生成器会根据关系类型自动处理所有的绑定逻辑，无论是RBAC系统、电商系统还是其他任何关系场景！

## 🔗 相关文档

- [代码生成器完整指南](../docs/GUIDE.md) - 代码生成器的完整使用文档
- [API文档](../docs/README.md) - 代码生成器API参考

## 💡 提示

- 建议先查看对应场景的示例文件，了解配置方式
- 复制示例文件后，根据实际需求修改配置
- 遇到问题可以查看详细文档或参考其他场景的示例
