/**
 * CRUD Service 模板
 *
 * 使用方法：
 * 1. 将 {EntityName} 替换为实际的实体名称（首字母大写，如 Product）
 * 2. 将 {entityName} 替换为实际的实体名称（首字母小写，如 product）
 * 3. 将 {entityNamePlural} 替换为复数形式（如 products）
 * 4. 根据 Prisma schema 调整 defaultSelect 字段
 * 5. 根据需要实现生命周期钩子方法
 */

import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PrismaService } from '../../prisma/prisma.service';
import { BaseCrudService } from '../services/base-crud.service';
import { Create{EntityName}Dto } from './dto/create-{entityName}.dto';
import { Update{EntityName}Dto } from './dto/update-{entityName}.dto';
import { {EntityName} } from '@prisma/client';

@Injectable()
export class {EntityName}Service extends BaseCrudService<
  {EntityName},
  Create{EntityName}Dto,
  Update{EntityName}Dto,
  '{entityNamePlural}'
> {
  protected readonly modelName = '{entityNamePlural}' as const;
  protected readonly defaultPageSize = 10;
  protected readonly defaultSelect = {
    id: true,
    // TODO: 根据 Prisma schema 添加需要返回的字段
    // 例如：
    // name: true,
    // description: true,
    // createdAt: true,
    // updatedAt: true,
  } as const;

  constructor(prisma: PrismaService, i18n: I18nService) {
    super(prisma, i18n);
  }

  protected getModelDelegate() {
    return this.prisma.{entityName};
  }

  // 可选：实现生命周期钩子
  // protected async beforeCreate(data: Create{EntityName}Dto): Promise<any> {
  //   // 创建前处理，如数据验证、加密等
  //   return data;
  // }

  // protected async afterCreate(result: {EntityName}): Promise<{EntityName}> {
  //   // 创建后处理，如发送通知等
  //   return result;
  // }

  // protected async beforeUpdate(id: string, data: Update{EntityName}Dto): Promise<any> {
  //   // 更新前处理
  //   return data;
  // }

  // protected async afterUpdate(result: {EntityName}): Promise<{EntityName}> {
  //   // 更新后处理
  //   return result;
  // }

  // protected async beforeDelete(id: string): Promise<void> {
  //   // 删除前处理，如检查关联数据
  // }

  // 可选：添加自定义查询方法
  // async findByCustomField(field: string) {
  //   return this.findFirst({
  //     where: { customField: field },
  //   });
  // }
}

