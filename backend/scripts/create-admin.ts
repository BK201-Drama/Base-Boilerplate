/**
 * 创建管理员账号脚本
 * 
 * 使用方法:
 * npx ts-node -r tsconfig-paths/register scripts/create-admin.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// 加载环境变量
config({ path: resolve(__dirname, '../.env') });

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // 检查是否已存在admin用户
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: 'admin' },
          { email: 'admin@amin.com' },
        ],
      },
    });

    if (existingUser) {
      console.log('❌ 管理员账号已存在:');
      console.log(`   ID: ${existingUser.id}`);
      console.log(`   用户名: ${existingUser.username}`);
      console.log(`   邮箱: ${existingUser.email}`);
      console.log('\n如需重置密码，请手动更新数据库或删除现有用户后重新运行此脚本。');
      return;
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash('123456', 10);

    // 创建admin用户
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@amin.com',
        password: hashedPassword,
        nickname: '管理员',
        status: 'active',
      },
    });

    console.log('✅ 管理员账号创建成功!');
    console.log(`   ID: ${admin.id}`);
    console.log(`   用户名: admin`);
    console.log(`   密码: 123456`);
    console.log(`   邮箱: ${admin.email}`);
    console.log(`   昵称: ${admin.nickname}`);
    console.log(`   状态: ${admin.status}`);
  } catch (error) {
    console.error('❌ 创建管理员账号失败:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
