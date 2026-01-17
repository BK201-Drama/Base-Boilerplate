/**
 * 一行代码创建 CRUD Controller 示例
 *
 * 这是最简单的使用方式，只需要一行代码即可创建完整的 CRUD Controller
 */

import { baseController } from '../utils/crud-controller.factory';
import { UsersService } from '../../users/users.service';

// ============================================
// 一行代码创建 Controller
// ============================================
// 这行代码会自动创建包含以下端点的 Controller：
// - POST   /users      - 创建用户
// - GET    /users      - 分页查询用户列表
// - GET    /users/:id  - 查询单个用户
// - PATCH  /users/:id  - 更新用户
// - DELETE /users/:id  - 删除用户
//
// 权限配置：
// - user:create - 创建权限
// - user:read   - 读取权限
// - user:update - 更新权限
// - user:delete - 删除权限
export const UsersController = baseController('user')(UsersService);

// ============================================
// 在 Module 中使用
// ============================================
// import { Module } from '@nestjs/common';
// import { UsersService } from './users.service';
// import { UsersController } from './users.controller';
// import { PrismaModule } from '../prisma/prisma.module';
//
// @Module({
//   imports: [PrismaModule],
//   controllers: [UsersController],  // 直接使用
//   providers: [UsersService],
// })
// export class UsersModule {}

