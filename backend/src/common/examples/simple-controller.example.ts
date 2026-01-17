/**
 * 简化版 CRUD Controller 使用示例
 *
 * 这个示例展示了如何使用 baseController 工厂函数
 * 只需一行代码即可创建完整的 CRUD Controller
 */

import { baseController, createCrudController } from '../utils/crud-controller.factory';
import { UsersService } from '../../users/users.service';

// ============================================
// 方式一：最简单的用法
// ============================================
// 只需要提供资源名称，会自动使用复数形式作为路由路径
// 路由路径：/users
// 权限代码：user:create, user:read, user:update, user:delete
export const UsersController = baseController('user')(UsersService);

// ============================================
// 方式二：自定义路由路径
// ============================================
// 如果路由路径与默认的复数形式不同，可以指定 path
// export const UsersController = baseController('user', {
//   path: 'users',
// })(UsersService);

// ============================================
// 方式三：配置角色权限
// ============================================
// 可以为不同的操作配置不同的角色要求
// export const UsersController = baseController('user', {
//   path: 'users',
//   createRoles: ['admin'],
//   updateRoles: [],
//   deleteRoles: ['admin'],
// })(UsersService);

// ============================================
// 方式四：使用 createCrudController 进行完整配置
// ============================================
// 如果需要更详细的配置，可以使用 createCrudController
// export const UsersController = createCrudController({
//   resource: 'user',
//   path: 'users',
//   requireAuth: true,
//   createRoles: ['admin'],
//   updateRoles: [],
//   deleteRoles: ['admin'],
// })(UsersService);

// ============================================
// 在 Module 中使用
// ============================================
// 在 Module 中直接使用导出的 Controller
// @Module({
//   imports: [PrismaModule],
//   controllers: [UsersController],  // 直接使用
//   providers: [UsersService],
// })
// export class UsersModule {}

