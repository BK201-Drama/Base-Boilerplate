/**
 * CRUD 服务使用示例
 *
 * 这是一个完整的示例，展示如何使用 BaseCrudService 创建自定义服务
 */

import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PrismaService } from '../../prisma/prisma.service';
import { BaseCrudService } from '../services/base-crud.service';
import { User } from '@prisma/client';

// 假设的 DTO
interface CreateExampleDto {
  name: string;
  email: string;
}

interface UpdateExampleDto {
  name?: string;
  email?: string;
}

@Injectable()
export class ExampleCrudService extends BaseCrudService<
  User,
  CreateExampleDto,
  UpdateExampleDto,
  'example'
> {
  protected readonly modelName = 'example' as const;
  protected readonly defaultPageSize = 20;
  protected readonly defaultSelect = {
    id: true,
    name: true,
    email: true,
    createdAt: true,
    updatedAt: true,
  } as const;

  constructor(prisma: PrismaService, i18n: I18nService) {
    super(prisma, i18n);
  }

  protected getModelDelegate() {
    // 返回 Prisma 模型委托器
    // 例如：return this.prisma.user;
    return this.prisma.user; // 这里只是示例
  }

  // 可选：重写生命周期钩子
  protected async beforeCreate(data: CreateExampleDto): Promise<any> {
    // 创建前处理，如数据验证、加密等
    console.log('Before create:', data);
    return data;
  }

  protected async afterCreate(result: User): Promise<User> {
    // 创建后处理，如发送通知等
    console.log('After create:', result);
    return result;
  }

  protected async beforeUpdate(id: string, data: UpdateExampleDto): Promise<any> {
    // 更新前处理
    console.log('Before update:', id, data);
    return data;
  }

  protected async afterUpdate(result: User): Promise<User> {
    // 更新后处理
    console.log('After update:', result);
    return result;
  }

  protected async beforeDelete(id: string): Promise<void> {
    // 删除前处理，如检查关联数据
    console.log('Before delete:', id);
  }

  // 可选：添加自定义方法
  async findByEmail(email: string) {
    return this.findFirst({
      where: { email },
    });
  }

  async findActiveUsers() {
    return this.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
    });
  }
}

