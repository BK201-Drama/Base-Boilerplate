#!/usr/bin/env node

/**
 * Schema 编译 CLI
 * 从 TypeScript 模型定义或 Prisma 文件生成完整的 schema.prisma
 */

import { SchemaCompiler } from './generators/schema-compiler';

async function main() {
  console.log('🚀 开始编译 Schema...\n');
  
  try {
    const compiler = new SchemaCompiler();
    await compiler.compile();
    
    console.log('\n✨ Schema 编译完成！');
    console.log('\n📋 下一步:');
    console.log('1. 检查生成的 schema.prisma');
    console.log('2. 运行: npx prisma generate');
    console.log('3. 运行: npx prisma migrate dev --name update_schema\n');
  } catch (error) {
    console.error('❌ 编译失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
