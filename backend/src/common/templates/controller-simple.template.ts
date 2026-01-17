/**
 * 简化版 CRUD Controller 模板
 *
 * 使用方法：
 * 1. 将 {EntityName} 替换为实际的实体名称（首字母大写，如 Product）
 * 2. 将 {entityName} 替换为实际的实体名称（首字母小写，如 product）
 * 3. 将 {entityNamePlural} 替换为复数形式（如 products）
 * 4. 导入对应的 Service
 * 5. 使用 baseController 工厂函数创建 Controller
 */

import { baseController } from '../common/utils/crud-controller.factory';
import { {EntityName}Service } from './{entityName}.service';

// 方式一：最简单的用法（自动使用复数形式作为路由路径）
export const {EntityName}Controller = baseController('{entityName}')(
  {EntityName}Service,
);

// 方式二：自定义路由路径和权限配置
// export const {EntityName}Controller = baseController('{entityName}', {
//   path: '{entityNamePlural}',
//   createRoles: ['admin'],
//   deleteRoles: ['admin'],
// })({EntityName}Service);

// 方式三：使用 createCrudController 进行更详细的配置
// import { createCrudController } from '../common/utils/crud-controller.factory';
// export const {EntityName}Controller = createCrudController({
//   resource: '{entityName}',
//   path: '{entityNamePlural}',
//   requireAuth: true,
//   createRoles: ['admin'],
//   updateRoles: [],
//   deleteRoles: ['admin'],
// })({EntityName}Service);

