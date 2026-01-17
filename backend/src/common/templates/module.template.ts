/**
 * Module 模板
 *
 * 使用方法：
 * 1. 将 {EntityName} 替换为实际的实体名称（首字母大写，如 Product）
 * 2. 确保导入所有必要的模块
 */

import { Module } from '@nestjs/common';
import { {EntityName}Service } from './{entityName}.service';
import { {EntityName}Controller } from './{entityName}.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [{EntityName}Controller],
  providers: [{EntityName}Service],
  exports: [{EntityName}Service], // 如果其他模块需要使用此服务，则导出
})
export class {EntityName}Module {}
